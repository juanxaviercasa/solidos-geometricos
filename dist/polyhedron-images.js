import {exportCanvas,downloadBlob} from './canvas-presentation.js';
import * as THREE from 'three';

export function exportRenderedImage(renderer,scene,camera,name,{automatic=false,object=null}={}){
 let exportCamera=camera;
 const rotation=object?.rotation.clone();
 if(automatic&&object){
  object.rotation.set(.12,.35,0);object.updateMatrixWorld(true);
  const sphere=new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere());
  exportCamera=camera.clone();const half=THREE.MathUtils.degToRad(camera.fov)/2,lim=Math.min(half,Math.atan(Math.tan(half)*camera.aspect));
  const distance=sphere.radius/Math.sin(lim)*1.12;exportCamera.position.copy(sphere.center).add(new THREE.Vector3(4.9,3.4,6.2).normalize().multiplyScalar(distance));exportCamera.near=Math.max(.001,(distance-sphere.radius)/10);exportCamera.far=distance+sphere.radius*4;exportCamera.updateProjectionMatrix();exportCamera.lookAt(sphere.center);exportCamera.updateMatrixWorld();
 }
 const ratio=renderer.getPixelRatio(),size=renderer.getSize({set(x,y){this.x=x;this.y=y;return this}});
 const scale=Math.min(3,2400/Math.max(size.x,size.y));
 try{renderer.setPixelRatio(1);renderer.setSize(Math.round(size.x*scale),Math.round(size.y*scale),false);renderer.render(scene,exportCamera);exportCanvas(renderer.domElement,name)}
 finally{if(rotation){object.rotation.copy(rotation);object.updateMatrixWorld(true)}renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);renderer.render(scene,camera)}
}

export async function exportNetImage(source,name,{personalized=false}={}){
 const original=source.querySelector('#netViewport'),group=original.cloneNode(true),bounds=original.getBBox();
 if(!personalized)group.removeAttribute('transform');
 const originals=[original,...original.querySelectorAll('*')],copies=[group,...group.querySelectorAll('*')];
 // Embed computed colors and visibility so the standalone image needs no CSS files.
 originals.forEach((node,i)=>{const style=getComputedStyle(node);for(const key of ['fill','fill-opacity','stroke','stroke-width','stroke-opacity','stroke-dasharray','opacity','display','visibility'])copies[i].style.setProperty(key,style.getPropertyValue(key))});
 const pad=14,view=source.viewBox.baseVal,w=personalized?view.width:bounds.width+pad*2,h=personalized?view.height:bounds.height+pad*2;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('viewBox',personalized?`${view.x} ${view.y} ${w} ${h}`:`${bounds.x-pad} ${bounds.y-pad} ${w} ${h}`);svg.setAttribute('width',String(w));svg.setAttribute('height',String(h));svg.append(group);
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
 try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');const scale=2400/Math.max(w,h);canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('No se pudo crear la imagen');downloadBlob(blob,name)}finally{URL.revokeObjectURL(url)}
}
