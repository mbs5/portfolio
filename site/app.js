/* portfolio behaviour: emblem engraving, expandable cards, copy email, mobile CTA, reveal fallback */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Braille engraving that resolves into the mark (desktop only) */
  const em=[...document.querySelectorAll('.emblem')].find(e=>getComputedStyle(e).display!=='none');
  document.querySelectorAll('.emblem').forEach(e=>{if(e!==em)e.classList.add('resolved');});
  if(em){
    const img=$('img',em), pre=$('pre',em);
    const run=()=>{
      if(reduced||em.classList.contains('emblem-s')){em.classList.add('resolved');return;}
      try{
        const cols=58, w=cols*2, h=cols*4;
        const c=document.createElement('canvas'); c.width=w; c.height=h;
        const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
        const d=ctx.getImageData(0,0,w,h).data, lum=new Float32Array(w*h);
        for(let i=0;i<w*h;i++){const l=(.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2])/255; lum[i]=Math.min(1,Math.max(0,(l-.5)*1.25+.5));}
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,o=lum[i],q=o<.5?0:1;lum[i]=q;const e=(o-q)/8;for(const [dx,dy] of [[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]]){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<w&&ny<h)lum[ny*w+nx]+=e;}}
        const BITS=[[1,8],[2,16],[4,32],[64,128]]; let s='';
        for(let y=0;y<h;y+=4){for(let x=0;x<w;x+=2){let code=0x2800;for(let r=0;r<4;r++)for(let k=0;k<2;k++)if(lum[(y+r)*w+x+k]<.5)code|=BITS[r][k];s+=String.fromCharCode(code);}s+='\n';}
        pre.textContent=s;
        const fit=()=>{const box=em.getBoundingClientRect().width; pre.style.fontSize='10px'; const probe=document.createElement('span'); probe.textContent='⠿'.repeat(cols); probe.style.cssText='position:absolute;visibility:hidden;white-space:pre;font:inherit;font-size:10px'; pre.appendChild(probe); const adv=probe.getBoundingClientRect().width/cols/10; probe.remove(); const fs=box/cols/(adv||0.6); pre.style.fontSize=fs+'px'; pre.style.lineHeight=(box/(h/4))/fs+'';};
        fit(); addEventListener('resize',fit,{passive:true});
        setTimeout(()=>em.classList.add('resolved'),1500);
      }catch(e){em.classList.add('resolved');}
    };
    if(img.complete&&img.naturalWidth)run(); else img.addEventListener('load',run,{once:true}); img.addEventListener('error',()=>em.classList.add('resolved'),{once:true});
  }

  /* 2. Expandable cards (APG accordion, multi-open, hash deep links) */
  const setOpen=(card,on,push=true)=>{const btn=$('h3 button',card), panel=$('.panel',card); btn.setAttribute('aria-expanded',on);
    if(on){panel.hidden=false; requestAnimationFrame(()=>panel.setAttribute('data-open',''));}
    else{panel.removeAttribute('data-open'); const done=()=>{if(btn.getAttribute('aria-expanded')!=='true')panel.hidden=true;}; reduced?done():panel.addEventListener('transitionend',done,{once:true});}
    if(push)history.replaceState(null,'',on?'#'+card.id:location.pathname+location.search);};
  $$('.card').forEach(card=>{const btn=$('h3 button',card); btn.addEventListener('click',()=>setOpen(card,btn.getAttribute('aria-expanded')!=='true'));});
  const fromHash=()=>{const c=document.getElementById(location.hash.slice(1)); if(c&&c.classList.contains('card')){setOpen(c,true,false); c.scrollIntoView({block:'start'});}};
  addEventListener('hashchange',fromHash); fromHash();
  const first=$('.card'); if(first&&!location.hash)setOpen(first,true,false);

  /* 3. Copy email */
  $$('.copy').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.email); const t=b.textContent; b.textContent='Copied'; $('#live').textContent='Email address copied'; setTimeout(()=>{b.textContent=t;},1800);}catch(e){location.href='mailto:'+b.dataset.email;}}));

  /* 4. Mobile CTA bar: show after the first two sections, hide on the contact block */
  const bar=$('.ctabar'); if(bar){document.body.classList.add('has-bar'); let early=true, contactVis=false; const upd=()=>bar.classList.toggle('show',!early&&!contactVis);
    new IntersectionObserver(([e])=>{early=e.isIntersecting||e.boundingClientRect.top>0;upd();},{threshold:0}).observe($('#operations'));
    new IntersectionObserver(([e])=>{contactVis=e.isIntersecting;upd();},{threshold:0,rootMargin:'0px 0px -40% 0px'}).observe($('#contact'));}

  /* 5. Reveal fallback for browsers without scroll-driven animations */
  if(!CSS.supports('animation-timeline: view()')&&!reduced){
    $$('.reveal').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(14px)';el.style.transition='opacity .8s cubic-bezier(.23,1,.32,1),transform .8s cubic-bezier(.23,1,.32,1)';});
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='none';io.unobserve(e.target);}}),{threshold:.12});
    $$('.reveal').forEach(el=>io.observe(el));
  }
})();
