import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const EPS=1e-5;
const key3=v=>`${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;
const edgeKey=(a,b)=>[a,b].sort().join('|');
const cross2=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);

function extractFaces(source){
  const geometry=source.index?source.toNonIndexed():source.clone();
  geometry.computeVertexNormals();
  const p=geometry.attributes.position,groups=[];
  for(let i=0;i<p.count;i+=3){
    const vs=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i+k));
    let n=new THREE.Vector3().subVectors(vs[1],vs[0]).cross(new THREE.Vector3().subVectors(vs[2],vs[0])).normalize();
    const c=vs.reduce((s,v)=>s.add(v),new THREE.Vector3()).multiplyScalar(1/3);
    if(n.dot(c)<0){n.negate();[vs[1],vs[2]]=[vs[2],vs[1]]}
    const plane=n.dot(vs[0]);
    let g=groups.find(x=>Math.abs(x.normal.dot(n)-1)<2e-4&&Math.abs(x.plane-plane)<2e-4);
    if(!g){g={normal:n.clone(),plane,vertices:new Map()};groups.push(g)}
    vs.forEach(v=>g.vertices.set(key3(v),v.clone()));
  }
  geometry.dispose();
  return groups.map((g,id)=>{
    const vertices=[...g.vertices.values()],center=vertices.reduce((s,v)=>s.add(v),new THREE.Vector3()).multiplyScalar(1/vertices.length);
    const u=new THREE.Vector3().subVectors(vertices[0],center).normalize(),v=new THREE.Vector3().crossVectors(g.normal,u).normalize();
    vertices.sort((a,b)=>Math.atan2(new THREE.Vector3().subVectors(a,center).dot(v),new THREE.Vector3().subVectors(a,center).dot(u))-Math.atan2(new THREE.Vector3().subVectors(b,center).dot(v),new THREE.Vector3().subVectors(b,center).dot(u)));
    return{id,normal:g.normal,center,vertices,keys:vertices.map(key3)};
  });
}

function adjacencyFor(faces){
  const edges=new Map();
  faces.forEach(f=>f.keys.forEach((a,i)=>{const b=f.keys[(i+1)%f.keys.length],k=edgeKey(a,b);if(!edges.has(k))edges.set(k,{key:k,a,b,faces:[]});edges.get(k).faces.push(f.id)}));
  const adjacency=faces.map(()=>[]);
  for(const e of edges.values())if(e.faces.length===2){const [a,b]=e.faces;adjacency[a].push({to:b,edge:e});adjacency[b].push({to:a,edge:e})}
  return{edges,adjacency};
}

function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function makeTree(adjacency,rand){
  const n=adjacency.length,root=Math.floor(rand()*n),seen=new Set([root]),tree=[],frontier=adjacency[root].map(x=>({from:root,...x}));
  while(seen.size<n&&frontier.length){const ix=Math.floor(rand()*frontier.length),e=frontier.splice(ix,1)[0];if(seen.has(e.to))continue;seen.add(e.to);tree.push(e);adjacency[e.to].forEach(x=>{if(!seen.has(x.to))frontier.push({from:e.to,...x})})}
  return{root,tree};
}

function rootMap(face){
  const a=face.vertices[0],u=new THREE.Vector3().subVectors(face.vertices[1],a).normalize(),v=new THREE.Vector3().crossVectors(face.normal,u).normalize(),m=new Map();
  face.vertices.forEach((pt,i)=>{const d=new THREE.Vector3().subVectors(pt,a);m.set(face.keys[i],new THREE.Vector2(d.dot(u),d.dot(v)))});return m;
}

function layoutTree(faces,treeSpec){
  const maps=new Map([[treeSpec.root,rootMap(faces[treeSpec.root])]]),children=new Map();treeSpec.tree.forEach(e=>{if(!children.has(e.from))children.set(e.from,[]);children.get(e.from).push(e)});
  const visit=id=>{for(const link of children.get(id)||[]){const parent=faces[id],child=faces[link.to],pm=maps.get(id),A=child.vertices[child.keys.indexOf(link.edge.a)],B=child.vertices[child.keys.indexOf(link.edge.b)],a2=pm.get(link.edge.a),b2=pm.get(link.edge.b);if(!A||!B||!a2||!b2)continue;
      const e3=new THREE.Vector3().subVectors(B,A).normalize(),side3=new THREE.Vector3().crossVectors(child.normal,e3).normalize(),e2=new THREE.Vector2().subVectors(b2,a2).normalize(),side2=new THREE.Vector2(-e2.y,e2.x),parentCent=[...pm.values()].reduce((s,p)=>s.add(p),new THREE.Vector2()).multiplyScalar(1/pm.size),parentSide=Math.sign(cross2(a2,b2,parentCent))||1;
      const raw=child.vertices.map(pt=>{const d=new THREE.Vector3().subVectors(pt,A);return{x:d.dot(e3),y:d.dot(side3)}}),avgY=raw.reduce((s,q)=>s+q.y,0)/raw.length,mult=Math.sign(avgY||1)*-parentSide,cm=new Map();raw.forEach((q,i)=>cm.set(child.keys[i],new THREE.Vector2().copy(a2).addScaledVector(e2,q.x).addScaledVector(side2,q.y*mult)));maps.set(child.id,cm);visit(child.id)} };
  visit(treeSpec.root);return maps;
}

function separated(polyA,polyB){
  const a=polyA.map(p=>p.clone().lerp(polyA.reduce((s,q)=>s.add(q),new THREE.Vector2()).multiplyScalar(1/polyA.length),.025)),b=polyB.map(p=>p.clone().lerp(polyB.reduce((s,q)=>s.add(q),new THREE.Vector2()).multiplyScalar(1/polyB.length),.025));
  for(const poly of [a,b])for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],axis=new THREE.Vector2(-(q.y-p.y),q.x-p.x).normalize();let amin=Infinity,amax=-Infinity,bmin=Infinity,bmax=-Infinity;a.forEach(v=>{const d=v.dot(axis);amin=Math.min(amin,d);amax=Math.max(amax,d)});b.forEach(v=>{const d=v.dot(axis);bmin=Math.min(bmin,d);bmax=Math.max(bmax,d)});if(amax<=bmin+EPS||bmax<=amin+EPS)return true}return false;
}
function overlapScore(faces,maps){let score=0;for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++){const a=faces[i].keys.map(k=>maps.get(i)?.get(k)).filter(Boolean),b=faces[j].keys.map(k=>maps.get(j)?.get(k)).filter(Boolean);if(a.length&&b.length&&!separated(a,b))score++}return score}
function bestLayout(faces,adjacency){const rand=seeded(faces.length*7919),attempts=faces.length>15?900:350;let best=null,bestScore=Infinity;for(let i=0;i<attempts;i++){const tree=makeTree(adjacency,rand),maps=layoutTree(faces,tree),score=overlapScore(faces,maps);if(score<bestScore){best={tree,maps};bestScore=score;if(score===0)break}}return{...best,score:bestScore}}

function normalizeLayout(faces,maps){
  const all=[];faces.forEach(f=>f.keys.forEach(k=>all.push(maps.get(f.id).get(k))));const min=new THREE.Vector2(Infinity,Infinity),max=new THREE.Vector2(-Infinity,-Infinity);all.forEach(p=>{min.min(p);max.max(p)});const center=min.clone().add(max).multiplyScalar(.5),scale=6/Math.max(max.x-min.x,max.y-min.y);faces.forEach(f=>f.keys.forEach(k=>maps.get(f.id).get(k).sub(center).multiplyScalar(scale)));return{min,max,scale}
}

function svgFromLayout(faces,maps,tree,measure){
  const all=[];faces.forEach(f=>f.keys.forEach(k=>all.push(maps.get(f.id).get(k))));const min=new THREE.Vector2(Infinity,Infinity),max=new THREE.Vector2(-Infinity,-Infinity);all.forEach(p=>{min.min(p);max.max(p)});const w=max.x-min.x||1,h=max.y-min.y||1,s=Math.min(430/w,245/h),ox=260-(min.x+max.x)*s/2,oy=150+(min.y+max.y)*s/2,pt=p=>new THREE.Vector2(ox+p.x*s,oy-p.y*s),folds=new Set(tree.tree.map(x=>x.edge.key));let out='';
  faces.forEach((f,fi)=>{const ps=f.keys.map(k=>pt(maps.get(f.id).get(k)));out+=`<polygon class="net-face face-${fi%5}" points="${ps.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}"/>`});
  const drawn=new Set();faces.forEach(f=>f.keys.forEach((a,i)=>{const b=f.keys[(i+1)%f.keys.length],ek=edgeKey(a,b),a2=pt(maps.get(f.id).get(a)),b2=pt(maps.get(f.id).get(b)),fold=folds.has(ek),first=!drawn.has(ek);if(fold&&!first)return;if(!fold&&first){const poly=f.keys.map(k=>pt(maps.get(f.id).get(k))),cent=poly.reduce((sum,p)=>sum.add(p),new THREE.Vector2()).multiplyScalar(1/poly.length),dir=new THREE.Vector2().subVectors(b2,a2),len=dir.length();dir.normalize();let n=new THREE.Vector2(-dir.y,dir.x),mid=a2.clone().add(b2).multiplyScalar(.5);if(n.dot(new THREE.Vector2().subVectors(cent,mid))>0)n.negate();const p1=a2.clone().addScaledVector(dir,len*.16),p2=b2.clone().addScaledVector(dir,-len*.16),q1=p1.clone().addScaledVector(n,Math.min(10,len*.22)),q2=p2.clone().addScaledVector(n,Math.min(10,len*.22));out+=`<polygon class="glue-tab" points="${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${q2.x.toFixed(1)},${q2.y.toFixed(1)} ${q1.x.toFixed(1)},${q1.y.toFixed(1)}"/>`}drawn.add(ek);out+=`<line class="${fold?'fold-edge':'cut-edge'}" x1="${a2.x.toFixed(1)}" y1="${a2.y.toFixed(1)}" x2="${b2.x.toFixed(1)}" y2="${b2.y.toFixed(1)}"/>`;}));
  const first=faces[0],a=pt(maps.get(first.id).get(first.keys[0])),b=pt(maps.get(first.id).get(first.keys[1])),mid=a.clone().add(b).multiplyScalar(.5);out+=`<text class="dimension-text" x="${mid.x.toFixed(1)}" y="${(mid.y-7).toFixed(1)}" text-anchor="middle">a = ${measure}</text>`;return out;
}

export class FoldingNet{
  constructor(canvas){this.canvas=canvas;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.1,100);this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.dampingFactor=.07;this.controls.enablePan=false;this.controls.minDistance=4;this.controls.maxDistance=14;this.controls.addEventListener('start',()=>{this.userOrbit=true});this.scene.add(new THREE.HemisphereLight(0xffffff,0x687082,2.8));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(4,6,8);this.scene.add(light);this.group=new THREE.Group();this.scene.add(this.group);this.progress=0;this.direction=1;this.playing=false;this.layout=null;this.userOrbit=false;this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas.parentElement);this.loop()}
  setGeometry(geometry,color,measure='4 cm'){this.group.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});this.group.clear();const faces=extractFaces(geometry),{edges,adjacency}=adjacencyFor(faces),layout=bestLayout(faces,adjacency),normalization=normalizeLayout(faces,layout.maps);this.layout={faces,edges,adjacency,...layout,measure};const solidScale=normalization.scale;this.parts=[];faces.forEach((f,ix)=>{const flat=f.keys.map(k=>layout.maps.get(f.id).get(k)),solid=f.vertices.map(v=>v.clone().multiplyScalar(solidScale)),positions=[];for(let i=1;i<f.vertices.length-1;i++)positions.push(flat[0].x,flat[0].y,0,flat[i].x,flat[i].y,0,flat[i+1].x,flat[i+1].y,0);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();const c=new THREE.Color(color).offsetHSL((ix%5)*.015,0,(ix%3)*.025),mesh=new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({color:c,roughness:.38,metalness:.02,side:THREE.DoubleSide,flatShading:true,transparent:true,opacity:.96}));const linePos=[];for(let i=0;i<f.vertices.length;i++){const p=flat[i],q=flat[(i+1)%flat.length];linePos.push(p.x,p.y,.012,q.x,q.y,.012)}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(linePos,3));const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x322d64,transparent:true,opacity:.8})),partGroup=new THREE.Group();partGroup.add(mesh,lines);this.group.add(partGroup);
      const p0=new THREE.Vector3(flat[0].x,flat[0].y,0),p1=new THREE.Vector3(flat[1].x,flat[1].y,0),p2=new THREE.Vector3(flat[2].x,flat[2].y,0),s0=solid[0],s1=solid[1],s2=solid[2],sx=new THREE.Vector3().subVectors(p1,p0).normalize(),sz=new THREE.Vector3().subVectors(p1,p0).cross(new THREE.Vector3().subVectors(p2,p0)).normalize(),sy=new THREE.Vector3().crossVectors(sz,sx).normalize(),dx=new THREE.Vector3().subVectors(s1,s0).normalize(),dz=new THREE.Vector3().subVectors(s1,s0).cross(new THREE.Vector3().subVectors(s2,s0)).normalize(),dy=new THREE.Vector3().crossVectors(dz,dx).normalize(),sourceBasis=new THREE.Matrix4().makeBasis(sx,sy,sz),destBasis=new THREE.Matrix4().makeBasis(dx,dy,dz),rotation=new THREE.Matrix4().multiplyMatrices(destBasis,sourceBasis.clone().invert()),targetQuaternion=new THREE.Quaternion().setFromRotationMatrix(rotation),targetPosition=s0.clone().sub(p0.clone().applyQuaternion(targetQuaternion));
      this.parts.push({face:f,flat,solid,mesh,lines,group:partGroup,targetQuaternion,targetPosition})});
    const byId=new Map(this.parts.map(p=>[p.face.id,p])),root=byId.get(layout.tree.root);root.relativeQuaternion=root.targetQuaternion.clone();root.relativePosition=root.targetPosition.clone();root.hinge=null;
    layout.tree.tree.forEach(link=>{const parent=byId.get(link.from),child=byId.get(link.to),parentMatrix=new THREE.Matrix4().compose(parent.targetPosition,parent.targetQuaternion,new THREE.Vector3(1,1,1)),childMatrix=new THREE.Matrix4().compose(child.targetPosition,child.targetQuaternion,new THREE.Vector3(1,1,1)),relativeMatrix=parentMatrix.clone().invert().multiply(childMatrix),scale=new THREE.Vector3();child.relativeQuaternion=new THREE.Quaternion();child.relativePosition=new THREE.Vector3();relativeMatrix.decompose(child.relativePosition,child.relativeQuaternion,scale);const hp=layout.maps.get(parent.face.id).get(link.edge.a);child.hinge=new THREE.Vector3(hp.x,hp.y,0);parent.group.add(child.group)});
    this.progress=0;this.direction=1;this.playing=false;this.userOrbit=false;this.controls.target.set(0,0,0);this.update(0);this.controls.update();this.resize();return{faceCount:faces.length,overlapScore:layout.score}}
  update(value){this.progress=Math.max(0,Math.min(1,value));const t=ease(this.progress),identity=new THREE.Quaternion();this.parts?.forEach(part=>{part.group.quaternion.copy(identity).slerp(part.relativeQuaternion,t);if(part.hinge)part.group.position.copy(part.hinge).sub(part.hinge.clone().applyQuaternion(part.group.quaternion));else part.group.position.copy(part.relativePosition).multiplyScalar(t)});if(!this.userOrbit){this.camera.position.set(mix(0,4.2,t),mix(0,3,t),mix(9,5.8,t));this.camera.lookAt(0,0,0)}this.onProgress?.(this.progress)}
  toggle(){if(!this.playing){if(this.progress<=.001)this.direction=1;else if(this.progress>=.999)this.direction=-1;this.playing=true}else this.playing=false}
  reverse(){this.direction*=-1;this.playing=true}
  svg(measure){return this.layout?svgFromLayout(this.layout.faces,this.layout.maps,this.layout.tree,measure||this.layout.measure):''}
  resize(){const p=this.canvas.parentElement,w=p.clientWidth,h=p.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()}
  loop(){requestAnimationFrame(()=>this.loop());if(this.playing){this.update(this.progress+this.direction*.008);if(this.progress<=0||this.progress>=1){this.playing=false;this.onStop?.()}}this.controls.update();this.renderer.render(this.scene,this.camera)}
}
