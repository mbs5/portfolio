/* portfolio behaviour: emblem engraving, brand switcher, expandable cards, copy email, mobile CTA, reveal fallback */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Braille engraving that resolves into the emblem (Atkinson dither, 1-bit) */
  const em=[...document.querySelectorAll('.emblem')].find(e=>getComputedStyle(e).display!=='none');
  document.querySelectorAll('.emblem').forEach(e=>{if(e!==em)e.classList.add('resolved');});
  if(em){
    const img=$('img',em), pre=$('pre',em);
    const run=()=>{
      if(reduced){em.classList.add('resolved');return;}
      try{
        const cols=em.classList.contains('emblem-s')?24:58, w=cols*2, h=cols*4; // braille cell = 2x4 dots, square overall at 1:2 cell ratio
        const c=document.createElement('canvas'); c.width=w; c.height=h;
        const ctx=c.getContext('2d',{willReadFrequently:true});
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        const d=ctx.getImageData(0,0,w,h).data, lum=new Float32Array(w*h);
        for(let i=0;i<w*h;i++){const l=(.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2])/255; lum[i]=Math.min(1,Math.max(0,(l-.5)*1.25+.5));}
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,o=lum[i],q=o<.5?0:1;lum[i]=q;const e=(o-q)/8;
          for(const [dx,dy] of [[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]]){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<w&&ny<h)lum[ny*w+nx]+=e;}}
        const BITS=[[1,8],[2,16],[4,32],[64,128]]; let s='';
        for(let y=0;y<h;y+=4){for(let x=0;x<w;x+=2){let code=0x2800;for(let r=0;r<4;r++)for(let k=0;k<2;k++)if(lum[(y+r)*w+x+k]<.5)code|=BITS[r][k];s+=String.fromCharCode(code);}s+='\n';}
        pre.textContent=s;
        // size the glyph grid to the box
        const fit=()=>{const box=em.getBoundingClientRect().width; pre.style.fontSize=(box/cols*1.0)+'px'; pre.style.lineHeight='1';};
        fit(); addEventListener('resize',fit,{passive:true});
        setTimeout(()=>em.classList.add('resolved'),1500);
      }catch(e){em.classList.add('resolved');}
    };
    if(img.complete&&img.naturalWidth)run(); else img.addEventListener('load',run,{once:true}); img.addEventListener('error',()=>em.classList.add('resolved'),{once:true});
  }

  /* 2. StoreKit brand switcher */
  const sw=$('.switcher');
  if(sw){
    const tabs=$$('.tab',sw), imgs=$$('.stage img',sw), tok=$('.tokens',sw), open=$('.sw-open',sw), name=$('.sw-name',sw);
    const pick=(i,focus)=>{tabs.forEach((t,j)=>{t.setAttribute('aria-selected',j===i);t.tabIndex=j===i?0:-1;}); imgs.forEach((m,j)=>{if(j===i&&m.dataset.src){m.src=m.dataset.src;delete m.dataset.src;} m.classList.toggle('on',j===i);});
      const t=tabs[i];
      tok.innerHTML=`<b>/* ${t.dataset.name}, ${t.dataset.note} */</b>\n:root {\n  --c-brand-500: <span class="v">${t.dataset.rgb}</span>;  <b>/* sampled from the live store */</b>\n}\n<b>/* usage: bg-brand-500/20, text-brand-500 */</b>`;
      open.href=t.dataset.url; name.textContent=t.dataset.name; if(focus)t.focus(); const nx=imgs[(i+1)%imgs.length]; if(nx.dataset.src){nx.src=nx.dataset.src;delete nx.dataset.src;}};
    tabs.forEach((t,i)=>{t.addEventListener('click',()=>pick(i)); t.addEventListener('keydown',e=>{const n=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i-1+tabs.length)%tabs.length:null; if(n!==null){e.preventDefault();pick(n,true);}});});
    pick(0);
    if(!reduced){let i=0,timer=setInterval(()=>{if(sw.matches(':hover,:focus-within'))return; i=(i+1)%tabs.length; pick(i);},3800); sw.addEventListener('click',()=>clearInterval(timer),{once:true});}
  }

  /* 3. Expandable cards (APG accordion, multi-open, hash deep links) */
  const setOpen=(card,on,push=true)=>{const btn=$('h3 button',card), panel=$('.panel',card); btn.setAttribute('aria-expanded',on);
    if(on){panel.hidden=false; requestAnimationFrame(()=>panel.setAttribute('data-open',''));}
    else{panel.removeAttribute('data-open'); const done=()=>{if(btn.getAttribute('aria-expanded')!=='true')panel.hidden=true;}; reduced?done():panel.addEventListener('transitionend',done,{once:true});}
    if(push)history.replaceState(null,'',on?'#'+card.id:location.pathname+location.search);};
  $$('.card').forEach(card=>{const btn=$('h3 button',card); btn.addEventListener('click',()=>setOpen(card,btn.getAttribute('aria-expanded')!=='true'));});
  const fromHash=()=>{const c=document.getElementById(location.hash.slice(1)); if(c&&c.classList.contains('card')){setOpen(c,true,false); c.scrollIntoView({block:'start'});}};
  addEventListener('hashchange',fromHash); fromHash();
  const first=$('.card'); if(first&&!location.hash)setOpen(first,true,false);

  /* 4. Copy email */
  $$('.copy').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.dataset.email); const t=b.textContent; b.textContent='Copied'; $('#live').textContent='Email address copied'; setTimeout(()=>{b.textContent=t;},1800);}catch(e){location.href='mailto:'+b.dataset.email;}}));

  /* 5. Mobile CTA bar: hide while the hero CTAs or the contact section are on screen */
  const bar=$('.ctabar'); if(bar){document.body.classList.add('has-bar'); let heroVis=true, contactVis=false; const upd=()=>bar.classList.toggle('show',!heroVis&&!contactVis);
    new IntersectionObserver(([e])=>{heroVis=e.isIntersecting||e.boundingClientRect.top>0;upd();},{threshold:0}).observe($('#more'));
    new IntersectionObserver(([e])=>{contactVis=e.isIntersecting;upd();},{threshold:.1}).observe($('#contact'));}

  /* 6. Reveal fallback for browsers without scroll-driven animations */
  if(!CSS.supports('animation-timeline: view()')&&!reduced){
    $$('.reveal').forEach(el=>{el.style.opacity='0';el.style.transform='translateY(14px)';el.style.transition='opacity .8s cubic-bezier(.23,1,.32,1),transform .8s cubic-bezier(.23,1,.32,1)';});
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='none';io.unobserve(e.target);}}),{threshold:.12});
    $$('.reveal').forEach(el=>io.observe(el));
  }

  })();
