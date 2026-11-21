import { quote } from "../../src/data/pricing.js";
import { TEST_MODE } from "../../src/config.js";

const json = (data, status = 200) => Response.json(data, {status,headers:{"Cache-Control":"no-store"}});
const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
const boundedId = (id, prefix) => typeof id === "string" && new RegExp("^"+prefix+"_[a-zA-Z0-9]{1,80}$").test(id);
const hex = value => Uint8Array.from(value.match(/../g), pair=>parseInt(pair,16));

/** Fetch-compatible core for Vercel, Netlify and Cloudflare adapters. */
export async function paymentRequest(route, request, env) {
  if (request.method !== "POST") return json({error:"Use POST."},405);
  if (TEST_MODE || !env.RAZORPAY_KEY_SECRET || !env.RAZORPAY_KEY_ID || /REPLACE/.test(env.RAZORPAY_KEY_ID)) return json({preview:true},503);
  const raw = await request.text();
  if (raw.length > 8192) return json({error:"Request too large."},413);
  let data;
  try { data=JSON.parse(raw); } catch { return json({error:"Invalid JSON."},400); }
  if (!object(data)) return json({error:"Invalid request."},400);
  const headers = { Authorization:"Basic "+btoa(env.RAZORPAY_KEY_ID+":"+env.RAZORPAY_KEY_SECRET), "Content-Type":"application/json" };
  const remote = async (path, options={}) => {
    const response = await fetch("https://api.razorpay.com/v1/"+path,{headers,...options,signal:AbortSignal.timeout(12000)});
    if (!response.ok) throw Error("Payment service unavailable.");
    return response.json();
  };
  try {
    if (route === "create-order") {
      if (Object.keys(data).length !== 1 || !Array.isArray(data.items) || !data.items.length || data.items.some(item=>!object(item) || Object.keys(item).some(key=>!["id","quantity"].includes(key)))) return json({error:"Send only product IDs and quantities."},400);
      let order;
      try { order = quote(data.items); } catch { return json({error:"Invalid cart items."},400); }
      const notes = {app:"amrit-education",subtotal:String(order.subtotal),gst:String(order.gst),fee:String(order.fee)};
      // Razorpay notes preserve the authoritative price and quantity at time of purchase.
      for (const line of order.lines) notes[line.id] = line.quantity+","+line.unit;
      const result = await remote("orders",{method:"POST",body:JSON.stringify({amount:order.total,currency:"INR",receipt:crypto.randomUUID(),notes})});
      return json({order_id:result.id,amount:result.amount,currency:result.currency,key_id:env.RAZORPAY_KEY_ID});
    }
    if (route !== "verify-payment") return json({error:"Unknown endpoint."},404);
    const {order_id, payment_id, signature} = data;
    if (!boundedId(order_id,"order") || !boundedId(payment_id,"pay") || !/^[0-9a-f]{64}$/i.test(signature)) return json({error:"Invalid verification details."},400);
    const order = await remote("orders/"+order_id);
    if (order.notes?.app !== "amrit-education" || order.currency !== "INR") return json({error:"Unknown order."},400);
    const encoder=new TextEncoder();
    const key=await crypto.subtle.importKey("raw",encoder.encode(env.RAZORPAY_KEY_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
    const verified=await crypto.subtle.verify("HMAC",key,hex(signature),encoder.encode(order.id+"|"+payment_id));
    if (!verified) return json({error:"Payment signature could not be verified."},400);
    const payment=await remote("payments/"+payment_id);
    if (payment.order_id !== order.id || payment.currency !== "INR" || payment.amount !== order.amount || payment.status !== "captured") return json({error:"Payment capture is pending. Check verification again before making another payment."},409);
    const {products}=await import("../../src/data/products.js");
    const lines=products.filter(p=>order.notes[p.id]).map(p=>{
      const [quantity,unit]=order.notes[p.id].split(",").map(Number);
      return {id:p.id,name:p.name,quantity,unit,amount:quantity*unit};
    });
    return json({order_id:order.id,payment_id,simulation:false,summary:{lines,subtotal:Number(order.notes.subtotal),gst:Number(order.notes.gst),fee:Number(order.notes.fee),total:order.amount}});
  } catch { return json({error:"The payment service is unavailable. Please retry."},502); }
}

export function nodeRoute(route) {
  return async function handler(req,res) {
    const request=new Request("https://localhost/api/"+route,{method:req.method,...(["GET","HEAD"].includes(req.method)?{}:{body:typeof req.body==="string"?req.body:JSON.stringify(req.body??{})})});
    const response=await paymentRequest(route,request,process.env);
    res.status(response.status).setHeader("Cache-Control","no-store");
    res.json(await response.json());
  };
}
