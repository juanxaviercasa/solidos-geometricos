const header=document.querySelector('.site-header'),toggle=header.querySelector('.menu-toggle'),nav=header.querySelector('.module-navigation'),resources=header.querySelector('.site-resources');
function closeMenu(focus=false){header.classList.remove('navigation-open');toggle.setAttribute('aria-expanded','false');toggle.querySelector('.menu-toggle-label').textContent='Menú';toggle.firstElementChild.textContent='☰';resources.open=false;if(focus)toggle.focus()}
function adapt(){
 const links=[...nav.querySelectorAll('a')],ctx=document.createElement('canvas').getContext('2d');
 const linkWidth=links.reduce((sum,a)=>{ctx.font=getComputedStyle(a).font;return sum+ctx.measureText(a.textContent).width},0);
 const brand=header.querySelector('.brand'),style=getComputedStyle(header);
 const brandWidth=Math.max(...[...brand.querySelectorAll('strong,small')].map(e=>{ctx.font=getComputedStyle(e).font;return ctx.measureText(e.textContent).width}))+52;
 const needed=brandWidth+linkWidth+Math.max(0,links.length-1)*20+140+parseFloat(style.paddingLeft)+parseFloat(style.paddingRight)+48;
 // Leave breathing room for the brand and avoid changing mode at a tight fit.
 const compact=innerWidth<Math.max(1200,needed+32);
 if(header.classList.contains('navigation-compact')!==compact){closeMenu();header.classList.toggle('navigation-compact',compact)}
}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';header.classList.toggle('navigation-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('.menu-toggle-label').textContent=open?'Cerrar':'Menú';toggle.firstElementChild.textContent=open?'×':'☰'});
header.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(resources.open||header.classList.contains('navigation-open')))closeMenu(true)});
document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu()});
addEventListener('hashchange',()=>closeMenu());
new ResizeObserver(adapt).observe(header);
new MutationObserver(adapt).observe(document.documentElement,{attributes:true,attributeFilter:['style','data-reading-size']});
new MutationObserver(adapt).observe(nav,{childList:true});
document.fonts.ready.then(adapt);adapt();
