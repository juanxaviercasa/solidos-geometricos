import * as THREE from 'three';
import {extractFaces} from './folding.js';

export function analyzeSolid(geometry,isPrism=false){
  const faces=extractFaces(geometry),vertices=new Map(),edges=new Map(),facePairs=new Set();
  const pair=(a,b)=>[a,b].sort().join('|');
  faces.forEach(face=>{
    face.keys.forEach((key,i)=>vertices.set(key,face.vertices[i]));
    for(let i=0;i<face.keys.length;i++)for(let j=i+1;j<face.keys.length;j++)facePairs.add(pair(face.keys[i],face.keys[j]));
    face.keys.forEach((a,i)=>{const b=face.keys[(i+1)%face.keys.length],key=pair(a,b);if(!edges.has(key))edges.set(key,{a,b,faces:[]});edges.get(key).faces.push(face)});
  });
  const keys=[...vertices.keys()],diagonals=[];
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)if(!facePairs.has(pair(keys[i],keys[j])))diagonals.push([vertices.get(keys[i]),vertices.get(keys[j])]);
  const facialDiagonals=faces.reduce((sum,face)=>sum+face.keys.length*(face.keys.length-3)/2,0);
  const diedros=[];
  edges.forEach(edge=>{if(edge.faces.length!==2)return;const angle=180-THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(edge.faces[0].normal.dot(edge.faces[1].normal),-1,1)));
    if(!diedros.some(d=>Math.abs(d.angle-angle)<.01))diedros.push({angle,faces:edge.faces,a:vertices.get(edge.a),b:vertices.get(edge.b)});
  });
  diedros.sort((a,b)=>a.angle-b.angle);
  const parallel=[];
  for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++)if(faces[i].normal.dot(faces[j].normal)<-.99999){
    const distance=Math.abs(faces[i].normal.dot(new THREE.Vector3().subVectors(faces[j].center,faces[i].center)));
    if(!parallel.some(item=>Math.abs(item.distance-distance)<1e-4))parallel.push({distance,faces:[faces[i],faces[j]],a:faces[i].center,b:faces[i].center.clone().addScaledVector(faces[i].normal,-distance)});
  }
  parallel.sort((a,b)=>a.distance-b.distance);
  let altitude=null;
  if(!parallel.length){const face=faces[0],opposite=[...vertices].filter(([key])=>!face.keys.includes(key));if(opposite.length){const b=opposite[0][1],distance=Math.abs(face.normal.dot(new THREE.Vector3().subVectors(b,face.center)));altitude={distance,faces:[face],a:b,b:b.clone().addScaledVector(face.normal,distance)}}}
  const base=isPrism?faces.find(face=>Math.abs(face.normal.y)>.99):faces[0];
  const referenceLength=base.vertices[0].distanceTo(base.vertices[1]);
  const center=[...vertices.values()].reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(1/vertices.size);
  const lengths={diameter:[],circumradius:[],inradius:[],midradius:[],faceDiagonal:[]};
  const addLength=(name,a,b,extra={})=>{const distance=a.distanceTo(b);if(!lengths[name].some(item=>Math.abs(item.distance-distance)<1e-4))lengths[name].push({a:a.clone(),b:b.clone(),distance,...extra})};
  let maximum=0;for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)maximum=Math.max(maximum,vertices.get(keys[i]).distanceTo(vertices.get(keys[j])));
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const a=vertices.get(keys[i]),b=vertices.get(keys[j]);if(Math.abs(a.distanceTo(b)-maximum)<1e-4)lengths.diameter.push({a,b,distance:maximum})}
  vertices.forEach(vertex=>addLength('circumradius',center,vertex));
  faces.forEach(face=>{const distance=face.normal.dot(face.vertices[0].clone().sub(center));addLength('inradius',center,center.clone().addScaledVector(face.normal,distance),{faces:[face]});
    for(let i=0;i<face.vertices.length;i++)for(let j=i+1;j<face.vertices.length;j++)if(j!==i+1&&!(i===0&&j===face.vertices.length-1))addLength('faceDiagonal',face.vertices[i],face.vertices[j],{faces:[face]});
  });
  edges.forEach(edge=>{const a=vertices.get(edge.a),b=vertices.get(edge.b),direction=b.clone().sub(a);const t=THREE.MathUtils.clamp(center.clone().sub(a).dot(direction)/direction.lengthSq(),0,1);addLength('midradius',center,a.clone().addScaledVector(direction,t))});
  Object.values(lengths).forEach(items=>items.sort((a,b)=>a.distance-b.distance));
  const vertexAngles=[];
  for(const [key,vertex]of vertices){
    const incident=faces.filter(face=>face.keys.includes(key));
    const neighbors=[];edges.forEach(edge=>{if(edge.a===key)neighbors.push(vertices.get(edge.b));else if(edge.b===key)neighbors.push(vertices.get(edge.a))});
    const inward=center.clone().sub(vertex).normalize(),u=neighbors[0].clone().sub(vertex);u.addScaledVector(inward,-u.dot(inward)).normalize();const v=new THREE.Vector3().crossVectors(inward,u).normalize();
    const rays=neighbors.map(p=>p.clone().sub(vertex).normalize()).sort((a,b)=>Math.atan2(a.dot(v),a.dot(u))-Math.atan2(b.dot(v),b.dot(u)));
    const sphericalArea=(a,b,c)=>2*Math.atan2(Math.abs(a.dot(new THREE.Vector3().crossVectors(b,c))),1+a.dot(b)+b.dot(c)+c.dot(a));
    let omega=0;for(let i=1;i<rays.length-1;i++)omega+=sphericalArea(rays[0],rays[i],rays[i+1]);
    vertexAngles.push({vertex,faces:incident,rays,omega,inward,radius:Math.min(...neighbors.map(p=>p.distanceTo(vertex)))*.32});
  }
  return{faces,vertices,edges,diagonals,facialDiagonals,diedros,parallel,altitude,referenceLength,center,lengths,vertexAngles};
}

export function createInsight(analysis,mode,index=0,metric='diameter'){
  const group=new THREE.Group(),color=mode==='diagonals'?0xff6f61:mode==='dihedral'?0xffc857:0x20bfa8;
  const line=points=>{const object=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,depthTest:false}));object.renderOrder=12;group.add(object)};
  const facePatch=face=>{const positions=[];for(let i=1;i<face.vertices.length-1;i++)positions.push(...face.vertices[0].toArray(),...face.vertices[i].toArray(),...face.vertices[i+1].toArray());const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28,side:THREE.DoubleSide,depthTest:false,depthWrite:false}));mesh.renderOrder=10;group.add(mesh)};
  const dot=point=>{const radius=analysis.referenceLength*.035;const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,12,8),new THREE.MeshBasicMaterial({color,depthTest:false}));mesh.position.copy(point);mesh.renderOrder=13;group.add(mesh)};
  const patch=(triangles,opacity=.4,name='section-shadow')=>{const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles.flatMap(p=>p.toArray()),3));const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthTest:false,depthWrite:false}));mesh.name=name;mesh.renderOrder=11;group.add(mesh);return mesh};
  if(mode==='diagonals'&&analysis.diagonals.length){const[a,b]=analysis.diagonals[index%analysis.diagonals.length];line([a,b]);dot(a);dot(b)}
  if(mode==='dihedral'&&analysis.diedros.length){const item=analysis.diedros[index%analysis.diedros.length];item.faces.forEach(facePatch);line([item.a,item.b]);
    const mid=item.a.clone().add(item.b).multiplyScalar(.5),axis=item.b.clone().sub(item.a).normalize();
    const directions=item.faces.map(face=>{const direction=face.center.clone().sub(mid);return direction.addScaledVector(axis,-direction.dot(axis)).normalize()});
    const theta=Math.acos(THREE.MathUtils.clamp(directions[0].dot(directions[1]),-1,1)),radius=item.a.distanceTo(item.b)*.4;
    const arc=Array.from({length:33},(_,i)=>mid.clone().addScaledVector(directions[0],radius*Math.sin((1-i/32)*theta)/Math.sin(theta)).addScaledVector(directions[1],radius*Math.sin(i/32*theta)/Math.sin(theta)));
    const triangles=[];for(let i=0;i<arc.length-1;i++)triangles.push(mid,arc[i],arc[i+1]);patch(triangles,.55,'dihedral-sector');line([mid,...arc,mid]);
    // A small transverse patch makes the measurement plane visible without hiding the solid.
    const x=directions[0],y=new THREE.Vector3().crossVectors(axis,x).normalize(),half=radius*1.2;
    const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>mid.clone().addScaledVector(x,a*half).addScaledVector(y,b*half));patch([corners[0],corners[1],corners[2],corners[0],corners[2],corners[3]],.10,'perpendicular-section');
    group.userData.sectionNormal=axis.toArray();group.userData.sectorCenter=mid.toArray();group.userData.angle=item.angle;
  }
  if(mode==='distance'){const options=analysis.parallel.length?analysis.parallel:analysis.altitude?[analysis.altitude]:[];if(options.length){const item=options[index%options.length];item.faces.forEach(facePatch);line([item.a,item.b]);dot(item.a);dot(item.b)}}
  if(mode==='length'){const options=analysis.lengths[metric];if(options?.length){const item=options[index%options.length];item.faces?.forEach(facePatch);line([item.a,item.b]);dot(item.a);dot(item.b);
    if(metric==='circumradius'||metric==='inradius'||metric==='midradius'){
      const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false});const sphere=new THREE.Mesh(new THREE.SphereGeometry(item.distance,32,20),material);sphere.name='reference-sphere';sphere.position.copy(analysis.center);group.add(sphere);
    }
  }}
  if(mode==='vertexAngle'){
    const item=analysis.vertexAngles[index%analysis.vertexAngles.length],{vertex,rays,radius,inward}=item;
    const point=ray=>vertex.clone().addScaledVector(ray,radius),triangles=[];
    for(let i=0;i<rays.length;i++){
      const a=rays[i],b=rays[(i+1)%rays.length];
      patch([vertex,point(a),point(b)],.22,'vertex-face-patch');line([vertex,point(a)]);
      // Project a subdivided triangular fan onto a small sphere centred at the vertex.
      const steps=12,at=(u,v)=>point(inward.clone().multiplyScalar(1-u-v).addScaledVector(a,u).addScaledVector(b,v).normalize());
      for(let row=0;row<steps;row++)for(let col=0;col<steps-row;col++){
        const p=at(row/steps,col/steps),q=at((row+1)/steps,col/steps),r=at(row/steps,(col+1)/steps);triangles.push(p,q,r);
        if(col<steps-row-1)triangles.push(q,at((row+1)/steps,(col+1)/steps),r);
      }
      const boundary=Array.from({length:25},(_,step)=>point(a.clone().lerp(b,step/24).normalize()));line(boundary);
    }
    patch(triangles,.5,'solid-angle-shadow');dot(vertex);group.userData.steradians=item.omega;
  }
  return group;
}
