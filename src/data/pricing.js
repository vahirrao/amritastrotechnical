import { products } from "./products.js";
import { GST_RATE, GST_INCLUSIVE, CONVENIENCE_FEE } from "../config.js";

/** @param {{id:string,quantity:number}[]} items */
export function quote(items) {
  if (!Array.isArray(items) || items.length > products.length) throw Error("Invalid selection.");
  const seen = new Set();
  const lines = items.map(({id, quantity}) => {
    const p = products.find(product => product.id === id);
    if (!p || p.price === null || seen.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > (p.group === "flagship" ? 1 : 5)) throw Error("Invalid item or quantity.");
    seen.add(id);
    return {id, name:p.name, quantity, unit:Math.round(p.price*100), amount:Math.round(p.price*100)*quantity};
  });
  const merchandise = lines.reduce((sum,line) => sum+line.amount,0);
  const gst = Math.round(merchandise*GST_RATE/(GST_INCLUSIVE ? 100+GST_RATE : 100));
  const subtotal = GST_INCLUSIVE ? merchandise-gst : merchandise;
  const fee = lines.length ? Math.round(CONVENIENCE_FEE*100) : 0;
  return {lines, subtotal, gst, fee, total:subtotal+gst+fee};
}
