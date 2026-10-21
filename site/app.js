/* portfolio behaviour: copy email */
(function(){
  document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(b.dataset.email); const t=b.textContent; b.textContent='Copied'; document.getElementById('live').textContent='Email address copied'; setTimeout(()=>{b.textContent=t;},1800);}
    catch(e){location.href='mailto:'+b.dataset.email;}
  }));
})();
