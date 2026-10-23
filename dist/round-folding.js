import * as THREE from 'three';

// Cylinder and cone lateral surfaces preserve their intrinsic lengths during
// bending. Sphere gores are explicitly a non-isometric teaching approximation.
export class RoundFolding {
 constructor(){this.group=new THREE.Group();this.parts=[];this.progress=0;this.type='cylinder'}
 dispose(){this.group.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});this.group.clear();this.parts=[]}
 configure(type,r,h){
  this.dispose();Object.assign(this,{type,r,h,scale:4/Math.max(2*r,type==='sphere'?2*r:h)});
  if(type==='sphere'){
   for(let gore=0;gore<12;gore++){this.surface(6,48,(u,v,t)=>{
    const lat=(v-.5)*Math.PI,local=(u-.5)*2*Math.PI/12,lon=(gore+.5)*2*Math.PI/12+local;
    const x0=(gore-5.5)*(2*Math.PI*r/12+r*.16)+r*Math.cos(lat)*local;
    return [THREE.MathUtils.lerp(x0,r*Math.cos(lat)*Math.sin(lon),t),THREE.MathUtils.lerp(r*lat,r*Math.sin(lat),t),t*r*Math.cos(lat)*Math.cos(lon)];
   },gore%2?0x80cdb9:0x5bbaa4);
   const face=this.parts.at(-1);for(let j=0;j<12;j++){const a=.055+j*.89/12,b=a+.89/12-.009;this.tab(face,[1,a],[1,b],(v)=>.08*r*Math.cos((v-.5)*Math.PI));}}
  }else if(type==='cylinder'){
   this.surface(100,1,(u,v,t)=>{const s=(u-.5)*2*Math.PI*r,k=t/r;return [t<1e-7?s:Math.sin(k*s)/k,(v-.5)*h,t<1e-7?0:(1-Math.cos(k*s))/k]},0x9585ea);
   const side=this.parts.at(-1);this.tab(side,[1,0],[1,1],()=>.1*r);
   side.boundary=[[0,0],[0,1]];side.edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
   for(let i=0;i<24;i++)for(const v of [0,1])this.tab(side,[i/24,v],[(i+1)/24,v],()=>.1*r);
   for(const sign of [-1,1])this.disk((u,v,t)=>{const angle=u*2*Math.PI,beta=t*Math.PI/2;return [r*v*Math.sin(angle),sign*(h/2+r*(1+v*Math.cos(angle))*Math.cos(beta)+.35*r*(1-t)),r*(1+v*Math.cos(angle))*Math.sin(beta)]},sign===1?0xffc266:0x84cdbb);
  }else{
   const g=Math.hypot(r,h),alphaEnd=Math.asin(r/g),theta=2*Math.PI*r/g;
   this.surface(100,20,(u,v,t)=>{const alpha=THREE.MathUtils.lerp(Math.PI/2,alphaEnd,t),phi=(u-.5)*theta/Math.sin(alpha),s=g*v;return [s*Math.sin(alpha)*Math.sin(phi),-s*Math.sin(alpha)*Math.cos(phi),s*Math.cos(alpha)]},0xf5ae75);
   const side=this.parts.at(-1);this.tab(side,[1,.015],[1,1],()=>.1*r);
   side.boundary=[[0,0],...Array.from({length:101},(_,i)=>[i/100,1])];side.edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(side.boundary.length*3),3));this.group.remove(side.edgeLine);this.group.add(new THREE.Line(side.edgeGeometry,side.edgeLine.material));
   this.disk((u,v,t)=>{const alpha=THREE.MathUtils.lerp(Math.PI/2,alphaEnd,t),beta=t*Math.PI,angle=u*2*Math.PI;return [r*v*Math.sin(angle),-g*Math.sin(alpha)-r*(1+v*Math.cos(angle))*Math.cos(beta)-.4*r*(1-t),g*Math.cos(alpha)+r*(1+v*Math.cos(angle))*Math.sin(beta)]},0x8fcfbd);
   const base=this.parts.at(-1);for(let i=0;i<24;i++)this.tab(base,[i/24,1],[(i+1)/24,1],()=>.1*r);
  }
  this.update(this.progress);
 }
 tab(parent,a,b,width){
  const point=(u,v,t)=>{
   const s=.035*v+(1-.07*v)*u,pv=[THREE.MathUtils.lerp(a[0],b[0],s),THREE.MathUtils.lerp(a[1],b[1],s)];
   const p=new THREE.Vector3(...parent.point(...pv,t)),p0=new THREE.Vector3(...parent.point(...a,t)),p1=new THREE.Vector3(...parent.point(...b,t));
   const tangent=p1.sub(p0).normalize();
   const epsilon=.0001,du=new THREE.Vector3(...parent.point(pv[0]+epsilon,pv[1],t)).sub(p),dv=new THREE.Vector3(...parent.point(pv[0],pv[1]+epsilon,t)).sub(p),normal=du.cross(dv).normalize();
   const outward=normal.clone().cross(tangent).normalize();
   // Choose the outside of the parameter-domain boundary, regardless of winding.
   const inner= new THREE.Vector3(...parent.point(THREE.MathUtils.clamp(pv[0],.001,.999),THREE.MathUtils.clamp(pv[1],.001,.999),t)).sub(p);
   if(outward.dot(inner)>0)outward.negate();
   const offset=width(pv[1])*v;
   return p.addScaledVector(outward,offset*Math.cos(t*Math.PI/2)).addScaledVector(normal,-offset*Math.sin(t*Math.PI/2)).toArray();
  };
  this.surface(8,1,point,0xf4e6ba);const part=this.parts.at(-1);part.isTab=true;
  // The attached edge is a crease, not a cutting line.
  part.boundary=[[0,0],[0,1],...Array.from({length:8},(_,i)=>[(i+1)/8,1]),[1,0]];part.edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(part.boundary.length*3),3));
  this.group.remove(part.edgeLine);part.edgeLine=new THREE.Line(part.edgeGeometry,part.edgeLine.material);this.group.add(part.edgeLine);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9*3),3));const crease=new THREE.Line(g,new THREE.LineDashedMaterial({color:0x453c35,dashSize:.045,gapSize:.025}));this.group.add(crease);part.crease=crease;
 }
 surface(nx,ny,point,color){
  const positions=new Float32Array((nx+1)*(ny+1)*3),indices=[];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,d,a,d,c)}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setIndex(indices);
  const material=new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,roughness:.65,metalness:.02,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const mesh=new THREE.Mesh(geometry,material);this.group.add(mesh);
  const boundary=[];for(let i=0;i<=nx;i++)boundary.push([i/nx,0]);for(let j=1;j<=ny;j++)boundary.push([1,j/ny]);for(let i=nx-1;i>=0;i--)boundary.push([i/nx,1]);for(let j=ny-1;j>0;j--)boundary.push([0,j/ny]);
  const edgeGeometry=new THREE.BufferGeometry();edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(boundary.length*3),3));const edgeLine=new THREE.LineLoop(edgeGeometry,new THREE.LineBasicMaterial({color:0x514775}));this.group.add(edgeLine);
  this.parts.push({nx,ny,point,geometry,edgeGeometry,boundary,edgeLine,mesh});
 }
 disk(point,color){this.surface(80,6,point,color);const part=this.parts.at(-1);part.boundary=Array.from({length:80},(_,i)=>[i/80,1]);part.edgeGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(80*3),3))}
 update(progress){
  this.progress=THREE.MathUtils.clamp(progress,0,1);this.group.rotation.x=this.type==='cone'?this.progress*Math.PI/2:0;
  for(const {nx,ny,point,geometry,edgeGeometry,boundary,crease,isTab,mesh,edgeLine} of this.parts){
   const show=!isTab||this.progress===0;mesh.visible=show;edgeLine.visible=show;if(crease)crease.visible=show;
   const attr=geometry.attributes.position;for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const p=point(i/nx,j/ny,this.progress);attr.setXYZ(j*(nx+1)+i,...p.map(x=>x*this.scale))}attr.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();geometry.computeBoundingBox();
   const edges=edgeGeometry.attributes.position;boundary.forEach(([u,v],i)=>edges.setXYZ(i,...point(u,v,this.progress).map(x=>x*this.scale)));edges.needsUpdate=true;edgeGeometry.computeBoundingSphere();edgeGeometry.computeBoundingBox();
   if(crease){const attr=crease.geometry.attributes.position;for(let i=0;i<=8;i++)attr.setXYZ(i,...point(i/8,0,this.progress).map(x=>x*this.scale));attr.needsUpdate=true;crease.computeLineDistances();crease.geometry.computeBoundingSphere();crease.geometry.computeBoundingBox()}
  }
  this.group.updateMatrixWorld(true);
  this.bounds=new THREE.Box3();
  for(const part of this.parts)if(part.mesh.visible)this.bounds.union(part.geometry.boundingBox.clone().applyMatrix4(part.mesh.matrixWorld));
  return this.bounds;
 }
}
