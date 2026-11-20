import React,{useEffect,useRef} from 'react'
export function Pointer(){
 const layer=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const mq=matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)')
  const root=layer.current!, [dot,ring,...trail]=Array.from(root.children) as HTMLElement[]
  let x=0,y=0,rx=0,ry=0,frame=0,on=false,last=0,spark=0,card:HTMLElement|null=null,magnet:HTMLElement|null=null
  const position=(el:HTMLElement,px:number,py:number)=>{el.style.left=px+'px';el.style.top=py+'px'}
  const animate=()=>{rx+=(x-rx)*.22;ry+=(y-ry)*.22;position(ring,rx,ry);if(on&&Math.abs(x-rx)+Math.abs(y-ry)>.2)frame=requestAnimationFrame(animate);else frame=0}
  const hide=()=>{on=false;root.hidden=true;document.body.classList.remove('custom-pointer');cancelAnimationFrame(frame);frame=0;card?.style.removeProperty('transform');magnet?.style.removeProperty('transform');card=null;magnet=null}
  const move=(e:PointerEvent)=>{
   const el=e.target as HTMLElement
   if(!mq.matches||!(el instanceof Element)||el.closest('dialog,input,select,textarea,[contenteditable=true]')){hide();return}
   x=e.clientX;y=e.clientY;if(!on){rx=x;ry=y}on=true;root.hidden=false;document.body.classList.add('custom-pointer');position(dot,x,y)
   const active=el.closest('button,a,summary,.card'),newCard=el.closest<HTMLElement>('.card'),btn=el.closest<HTMLElement>('.primary')
   root.classList.toggle('active',!!active);ring.textContent=el.closest('.course')?(el.closest('button')?'Add':'View'):''
   if(card!==newCard)card?.style.removeProperty('transform');card=newCard
   if(card){const b=card.getBoundingClientRect(),dx=x-b.left,dy=y-b.top;card.style.setProperty('--mx',dx+'px');card.style.setProperty('--my',dy+'px');card.style.transform='perspective(1100px) rotateX('+(-(dy/b.height-.5)*2)+'deg) rotateY('+((dx/b.width-.5)*2)+'deg)'}
   if(magnet!==btn)magnet?.style.removeProperty('transform');magnet=btn
   if(btn){const b=btn.getBoundingClientRect();btn.style.transform='translate('+((x-b.left-b.width/2)*.035)+'px,'+((y-b.top-b.height/2)*.07)+'px)'}
   if(performance.now()-last>90){last=performance.now();const s=trail[spark++%trail.length];position(s,x,y);s.animate([{opacity:.45,transform:'scale(1)'},{opacity:0,transform:'translateY(5px) scale(.2)'}],{duration:360})}
   if(!frame)frame=requestAnimationFrame(animate)
  }
  document.addEventListener('pointermove',move);document.documentElement.addEventListener('pointerleave',hide);mq.addEventListener('change',hide)
  return()=>{hide();document.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',hide);mq.removeEventListener('change',hide)}
 },[])
 return <div ref={layer} className="pointer" hidden aria-hidden="true"><i/><b/>{Array.from({length:5},(_,i)=><u key={i}/>)}</div>
}
