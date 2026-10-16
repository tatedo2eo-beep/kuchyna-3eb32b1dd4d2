/* Picture loading: start fetching lazy images well before they scroll into view, give on-screen ones high priority,
   and show a soft theme-coloured placeholder that fades into the image. Image files themselves are never changed. */
(function(){
  const io='IntersectionObserver' in window?new IntersectionObserver(function(es){
    for(const e of es){if(!e.isIntersecting)continue;const im=e.target;io.unobserve(im);
      if(e.boundingClientRect.top<innerHeight&&e.boundingClientRect.bottom>0)im.fetchPriority='high';
      if(im.loading==='lazy')im.loading='eager';}
  },{rootMargin:'1600px 0px'}):null;
  function tidy(im){if(!im.className)im.removeAttribute('class');}
  function done(im){im.classList.remove('ph');tidy(im);if(im.dataset.ilw){im.classList.add('ldin');setTimeout(function(){im.classList.remove('ldin');tidy(im);},450);}}
  function prep(im){im.dataset.il='1';
    if(!(im.complete&&im.naturalWidth)){im.dataset.ilw='1';im.classList.add('ph');
      im.addEventListener('load',function(){done(im);},{once:true});
      im.addEventListener('error',function(){im.classList.remove('ph');tidy(im);},{once:true});}
    if(io&&!im.complete)io.observe(im);else if(!io&&im.loading==='lazy')im.loading='eager';}
  let q=false;
  function scan(){q=false;const l=document.querySelectorAll('img:not([data-il])');for(let i=0;i<l.length;i++)prep(l[i]);}
  function later(){if(!q){q=true;requestAnimationFrame(scan);}}
  new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});
  later();
})();
