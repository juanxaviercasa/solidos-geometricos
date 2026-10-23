export function downloadBlob(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export function exportCanvas(canvas,name){const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;const ctx=copy.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,copy.width,copy.height);ctx.drawImage(canvas,0,0);copy.toBlob(blob=>{if(blob)downloadBlob(blob,name)},'image/png')}
export function installCanvasPresentation(container,viewport,onResize){
 const bar=document.createElement('div');bar.className='canvas-presentation-bar';bar.innerHTML='<button type="button" aria-expanded="false">⚙ Controles</button><button type="button">Salir ⛶</button>';
 const drawer=document.createElement('div');drawer.className='canvas-presentation-drawer';drawer.hidden=true;container.append(drawer,bar);let entries=[];
 bar.children[0].addEventListener('click',()=>{drawer.hidden=!drawer.hidden;bar.children[0].setAttribute('aria-expanded',String(!drawer.hidden));bar.children[0].textContent=drawer.hidden?'⚙ Controles':'Ocultar controles'});
 bar.children[1].addEventListener('click',()=>document.exitFullscreen());
 document.addEventListener('fullscreenchange',()=>{
  if(document.fullscreenElement===container){
   container.classList.add('canvas-presentation');viewport.classList.add('canvas-presentation-viewport');drawer.hidden=true;bar.children[0].setAttribute('aria-expanded','false');bar.children[0].textContent='⚙ Controles';
   entries=[...container.children].filter(n=>n!==viewport&&n!==drawer&&n!==bar).map(node=>{const marker=document.createComment('presentation-control');node.before(marker);drawer.append(node);return {node,marker}});
  }else if(entries.length){for(const {node,marker} of entries){marker.replaceWith(node)}entries=[];container.classList.remove('canvas-presentation');viewport.classList.remove('canvas-presentation-viewport')}
  requestAnimationFrame(()=>onResize?.());
 });
}
