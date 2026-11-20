import React, {createContext,useContext,useEffect,useRef,useState} from "react";
import type {FormEvent,ReactNode} from "react";
import {products} from "./data/products.js";
import {quote} from "./data/pricing.js";
import {WHATSAPP_NUMBER,RAZORPAY_KEY_ID,TEST_MODE,GST_RATE} from "./config";
import "./commerce.css";

type Item={id:string;quantity:number};
type Summary=ReturnType<typeof quote>;
type Receipt={order_id:string;payment_id:string;simulation:boolean;summary:Summary};
type Verification={order_id:string;payment_id:string;signature:string};
type Cart={items:Item[];change:(items:Item[])=>void;add:(id:string,qty:number)=>void;open:()=>void};
const CART="amrit.cart.v1", RECEIPT="amrit.receipt.v1", PENDING="amrit.verify.v1";
const Context=createContext<Cart|null>(null);
const useCart=()=>useContext(Context)!;
const money=(paise:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:2}).format(paise/100);
function read(key:string,local=false) {
  try {return JSON.parse((local?localStorage:sessionStorage).getItem(key)||"null");} catch {return null;}
}
function save(key:string,value:unknown,local=false) {
  try {(local?localStorage:sessionStorage).setItem(key,JSON.stringify(value));} catch { /* In-memory cart and receipt remain available. */ }
}
function loadCart():Item[]{
  const raw=read(CART,true);
  if (!Array.isArray(raw)) return [];
  const cleaned:Item[]=[];
  for(const item of raw){
    try {quote([item]); if(!cleaned.some(i=>i.id===item.id))cleaned.push({id:item.id,quantity:item.quantity});} catch { /* Removed products are unavailable for purchase. */ }
  }
  return cleaned;
}

function Modal({children,onClose,title,drawer=false}:{children:ReactNode;onClose:()=>void;title:string;drawer?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const dialog=ref.current!;
    const prior=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog.showModal();
    return ()=>{dialog.close();document.body.style.overflow=overflow;prior?.focus();};
  },[]);
  return <dialog ref={ref} aria-label={title} className={"cm-modal "+(drawer?"cm-drawer":"")} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current) {const b=ref.current!.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)onClose();}}}>
    <div className="cm-heading"><h2>{title}</h2><button type="button" className="cm-x" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}
  </dialog>;
}
export function CartProvider({children}:{children:ReactNode}){
  const [items,setItems]=useState<Item[]>(loadCart);
  const [drawer,setDrawer]=useState(false);
  useEffect(()=>{
    const sync=(e:StorageEvent)=>{if(e.key===CART || e.key===null)setItems(loadCart());};
    window.addEventListener("storage",sync);return ()=>window.removeEventListener("storage",sync);
  },[]);
  const change=(next:Item[])=>{save(CART,next,true);setItems(next);};
  const add=(id:string,qty:number)=>{
    const product=products.find(p=>p.id===id);
    if(!product || product.price===null) return;
    const next=items.filter(item=>item.id!==id);
    const amount=(items.find(item=>item.id===id)?.quantity||0)+qty;
    change([...next,{id,quantity:Math.min(product.group==="flagship"?1:5,amount)}]);
    setDrawer(true);
  };
  return <Context.Provider value={{items,change,add,open:()=>setDrawer(true)}}>{children}
    {drawer&&<Modal title="Your cart" drawer onClose={()=>setDrawer(false)}><CartContents drawer onExplore={()=>setDrawer(false)}/></Modal>}
  </Context.Provider>;
}
export function CartButton(){
  const {items,open}=useCart();
  const count=items.reduce((sum,p)=>sum+p.quantity,0);
  return <button className="cm-cart-button" onClick={open} aria-label={`Open cart, ${count} items`}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8.5 9V6a3.5 3.5 0 1 1 7 0v3"/></svg><span>Cart</span><b aria-live="polite">{count}</b></button>;
}
export function Buy({id,children,className=""}:{id:string;children?:ReactNode;className?:string}){
  const {add}=useCart();
  const [qty,setQty]=useState(1);
  const p=products.find(p=>p.id===id);
  if(!p)return null;
  if(p.price===null)return <a className={className||"cm-buy"} href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello, I would like to enquire about "+p.name+".")}`}>{children||"Enquire"} <span aria-hidden="true">↗</span></a>;
  return <>{p.group==="specialty"&&<label className="cm-module-price">{money(p.price*100)} · Qty <Qty value={qty} label={"Quantity for "+p.name} onChange={setQty}/></label>}<button type="button" className={className||"cm-buy"} data-cursor="Add" onClick={()=>add(id,qty)}>{children||"Add to Cart"}</button></>;
}
function Qty({value,label,onChange}:{value:number;label:string;onChange:(n:number)=>void}){
  return <select className="cm-qty" value={value} aria-label={label} onChange={e=>onChange(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select>;
}
function Totals({summary}:{summary:Summary}){
  return <dl className="cm-totals"><div><dt>Subtotal</dt><dd>{money(summary.subtotal)}</dd></div><div><dt>GST ({GST_RATE}%)</dt><dd>{money(summary.gst)}</dd></div>
    {summary.fee>0&&<div><dt>Convenience fee</dt><dd>{money(summary.fee)}</dd></div>}<div className="cm-total"><dt>Total</dt><dd>{money(summary.total)}</dd></div></dl>;
}
function OrderSummary({summary}:{summary:Summary}){
  return <><ul className="cm-summary">{summary.lines.map(line=><li key={line.id}><span>{line.name}<small>Qty {line.quantity} · {money(line.unit)} each</small></span><strong>{money(line.amount)}</strong></li>)}</ul><Totals summary={summary}/></>;
}
function EmptyCart({onExplore}:{onExplore?:()=>void}){
  return <div className="cm-empty"><p>Your cart is empty.</p><a className="cm-primary" href="/#courses" onClick={onExplore}>Explore courses <span aria-hidden="true">→</span></a></div>;
}
function CartContents({drawer=false,onExplore}:{drawer?:boolean;onExplore?:()=>void}){
  const {items,change}=useCart();
  if(!items.length)return <EmptyCart onExplore={onExplore}/>;
  const summary=quote(items);
  return <><ul className="cm-lines">{summary.lines.map(line=><li key={line.id}><div><h3>{line.name}</h3><small>{money(line.unit)} each</small><div className="cm-line-actions">{products.find(p=>p.id===line.id)?.group==="flagship"?<small>Qty 1</small>:<Qty label={"Quantity for "+line.name} value={line.quantity} onChange={n=>change(items.map(i=>i.id===line.id?{...i,quantity:n}:i))}/>}
    <button type="button" className="cm-text" aria-label={"Remove "+line.name} onClick={()=>change(items.filter(i=>i.id!==line.id))}>Remove</button></div></div><strong>{money(line.amount)}</strong></li>)}</ul><Totals summary={summary}/><a className="cm-primary cm-full" href="/checkout">Proceed to Checkout <span aria-hidden="true">→</span></a>{drawer&&<a className="cm-secondary" href="/cart">View full cart</a>}</>;
}
type RazorResponse={razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
type RazorOptions={key:string;order_id:string;amount:number;currency:string;name:string;theme:{color:string};prefill:{name:string;email:string;contact:string};handler:(response:RazorResponse)=>void;modal:{ondismiss:()=>void}};
declare global {interface Window { Razorpay?:new(options:RazorOptions)=>{open:()=>void;on:(event:string,callback:()=>void)=>void}; }}
async function loadGateway(){
  if(window.Razorpay)return;
  await new Promise<void>((resolve,reject)=>{
    const script=document.createElement("script");
    const timer=setTimeout(()=>{script.remove();reject(Error("Gateway timed out."));},18000);
    script.src="https://checkout.razorpay.com/v1/checkout.js";
    script.onload=()=>{clearTimeout(timer);resolve();};
    script.onerror=()=>{clearTimeout(timer);script.remove();reject(Error("Gateway unavailable."));};
    document.head.appendChild(script);
  });
}
let memoryReceipt:Receipt|null=null;
function Checkout(){
  const {items,change}=useCart();
  const [preview,setPreview]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [pending,setPending]=useState<Verification|null>(()=>read(PENDING));
  const summary=quote(items);
  const finish=(receipt:Receipt)=>{
    memoryReceipt=receipt;save(RECEIPT,receipt);save(PENDING,null);change([]);
    history.pushState(null,"","/success");window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const verify=async(details:Verification)=>{
    setPending(details);save(PENDING,details);setBusy(true);
    try {
      const res=await fetch("/api/verify-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(details),signal:AbortSignal.timeout(18000)});
      const receipt=await res.json();
      if(!res.ok || !receipt.summary)throw Error();
      finish(receipt);
    }catch{setMessage("Your payment confirmation is pending. Retry verification before making another payment. Payment ID "+details.payment_id+".");}
    finally{setBusy(false);}
  };
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(busy)return;
    const form=new FormData(e.currentTarget);
    if(!String(form.get("name")).trim()||!String(form.get("city")).trim()){setMessage("Enter your full name and city.");return;}
    setMessage("");setBusy(true);
    try{
      if(TEST_MODE||RAZORPAY_KEY_ID.includes("REPLACE")){setPreview(true);setBusy(false);return;}
      let res:Response;
      try{res=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items}),signal:AbortSignal.timeout(18000)});}
      catch{setPreview(true);setBusy(false);return;}
      if([404,405].includes(res.status)||!res.headers.get("content-type")?.includes("application/json")){setPreview(true);setBusy(false);return;}
      const order=await res.json();
      if(order.preview){setPreview(true);setBusy(false);return;}
      if(!res.ok||!order.order_id||order.amount!==summary.total||order.key_id!==RAZORPAY_KEY_ID)throw Error();
      await loadGateway();
      const Razorpay=window.Razorpay;
      if(!Razorpay)throw Error();
      const gateway=new Razorpay({key:order.key_id,order_id:order.order_id,amount:order.amount,currency:order.currency,name:"Amrit Astro Technical",theme:{color:"#C8963E"},
        prefill:{name:String(form.get("name")).trim(),email:String(form.get("email")).trim(),contact:String(form.get("phone")).trim()},
        handler:result=>{void verify({order_id:order.order_id,payment_id:result.razorpay_payment_id,signature:result.razorpay_signature});},
        modal:{ondismiss:()=>{setBusy(false);setMessage("Checkout closed. Your cart is saved for another try.");}}});
      gateway.on("payment.failed",()=>setMessage("Payment failed. Please retry in the checkout window."));gateway.open();
    }catch{setMessage("We could not open secure checkout. Please try again.");setBusy(false);}
  };
  if(pending)return <div className="cm-panel"><h2>Verify your payment</h2><p>{message||"Check the status of your previous payment."}</p><button className="cm-primary" disabled={busy} onClick={()=>void verify(pending)}>{busy?"Checking…":"Retry verification"}</button></div>;
  if(!items.length)return <EmptyCart/>;
  return <div className="cm-columns"><form onSubmit={submit} className="cm-panel cm-form"><h2>Buyer details</h2>
    <label>Full name<input name="name" autoComplete="name" required maxLength={100}/></label>
    <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
    <label>Phone<input name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={24} required title="Enter a phone number with 7 to 15 digits." onInput={e=>{const i=e.currentTarget;const n=i.value.replace(/\D/g,"").length;i.setCustomValidity(n>=7&&n<=15&&/^[+() .0-9-]+$/.test(i.value)?"":"Enter a phone number with 7 to 15 digits.");}}/></label>
    <label>City<input name="city" autoComplete="address-level2" required maxLength={100}/></label>
    <label className="cm-check"><input type="checkbox" required/>I am 18 years of age or older</label>
    <label className="cm-check"><input type="checkbox" required/><span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>, <a href="/refund-policy" target="_blank" rel="noreferrer">Refund Policy</a>, and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span></label>
    <button type="submit" className="cm-primary" disabled={busy}>{busy?"Opening secure checkout…":"Pay "+money(summary.total)+" securely with Razorpay"}</button>
    {TEST_MODE&&<small>Preview checkout · No real charge</small>}{message&&<p role="status">{message}</p>}
    </form><aside className="cm-panel"><h2>Order summary</h2><OrderSummary summary={summary}/></aside>
    {preview&&<Modal title="Simulated payment" onClose={()=>setPreview(false)}><p className="cm-mode">TEST MODE — Simulated Payment (No Real Charge)</p><p>Live checkout opens Razorpay with your order and buyer details once payment keys and endpoints are configured.</p>
      <h3>Order payload</h3><pre>{JSON.stringify({items},null,2)}</pre><p className="cm-total">Simulated total <strong>{money(summary.total)}</strong></p>
      <button className="cm-primary" onClick={()=>{const ref=crypto.randomUUID();finish({order_id:"demo_order_"+ref,payment_id:"demo_pay_"+ref,simulation:true,summary});}}>Complete simulated payment</button></Modal>}
  </div>;
}
function Success(){
  const receipt:Receipt|null=memoryReceipt||read(RECEIPT);
  if(!receipt?.summary?.lines)return <div className="cm-panel"><p>No receipt is available in this browser session.</p><a href="/#courses">Explore courses →</a></div>;
  return <div className="cm-panel cm-receipt"><h2>{receipt.simulation?"Simulation complete":"Payment confirmed"}</h2>{receipt.simulation&&<p className="cm-mode">TEST MODE — Simulated Payment (No Real Charge)</p>}<dl className="cm-ids"><dt>Order ID</dt><dd>{receipt.order_id}</dd><dt>Payment ID</dt><dd>{receipt.payment_id}</dd></dl><OrderSummary summary={receipt.summary}/><a href="/#courses">Back to courses →</a></div>;
}
export function CommercePage(){
  const [path,setPath]=useState(location.pathname.replace(/\/$/,""));
  useEffect(()=>{const sync=()=>{setPath(location.pathname.replace(/\/$/,""));window.scrollTo(0,0);};window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync);},[]);
  const checkout=path==="/checkout",success=path==="/success";
  return <section className="cm-page"><a className="cm-back" href="/#courses">← Back to courses</a><h1>{checkout?"Checkout":success?"Your receipt":"Your cart"}</h1>{checkout?<Checkout/>:success?<Success/>:<div className="cm-panel"><CartContents/></div>}</section>;
}
