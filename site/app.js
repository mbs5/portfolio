/* portfolio behaviour: copy email */
(function(){
  document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(b.dataset.email); const t=b.textContent; b.textContent='Copied'; document.getElementById('live').textContent='Email address copied'; setTimeout(()=>{b.textContent=t;},1800);}
    catch(e){location.href='mailto:'+b.dataset.email;}
  }));
})();

/* stickers: smooth scroll to the project, then a tangerine ripple on arrival so the eye lands on the right card */
(function(){
  const ping=(el)=>{el.classList.remove('ping');void el.offsetWidth;el.classList.add('ping');setTimeout(()=>el.classList.remove('ping'),3800);};
  const target=(hash)=>{const el=document.querySelector(hash);if(!el)return null;return el.matches('.proj')?el:(el.querySelector('.plate')||el);};
  document.querySelectorAll('a.stk[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const el=target(a.getAttribute('href'));if(!el)return;e.preventDefault();
    history.replaceState(null,'',a.getAttribute('href'));
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    let done=false;const go=()=>{if(done)return;done=true;ping(el);};
    if('onscrollend' in window&&!reduce){addEventListener('scrollend',go,{once:true});setTimeout(go,1400);}else setTimeout(go,reduce?50:700);
  }));
  if(location.hash){const el=target(location.hash);if(el)setTimeout(()=>ping(el),500);}
})();
