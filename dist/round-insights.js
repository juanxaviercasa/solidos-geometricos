import * as THREE from 'three';

const common=[['center','Centro',0x343e55],['radius','Radio',0xef7256],['diameter','Diámetro',0xc34b98]];
const spherical=[['axis','Eje y polos',0x5173d1],['equator','Ecuador',0xd19b16],['meridian','Meridiano',0x7254ce],['section','Sección circular',0xd6a621],['chord','Cuerda y arco',0xe67938],['hemisphere','Hemisferio',0x427ad1],['cap','Casquete esférico',0xe2a334],['zone','Zona y segmento',0x8b65cc],['lune','Huso esférico',0xe67f36],['wedge','Cuña esférica',0xd65a92],['sector','Sector esférico',0x39978a]];
export function roundElements(type){return [...common,...(type==='sphere'?spherical:[['height','Altura',0x5173d1],['generator','Generatriz',0x8c61ce],['axis','Eje',0x5378b8],['section','Sección circular',0xd6a621]])]}
export function sphericalMeasures(r,section=30,lower=-30,angle=60){
 const y=r*section/100,bottom=r*Math.min(lower,section)/100,alpha=angle*Math.PI/180,height=r-y,rho=Math.sqrt(Math.max(0,r*r-y*y)),zoneHeight=y-bottom;
 return {y,bottom,alpha,height,rho,zoneHeight,capArea:2*Math.PI*r*height,capVolume:Math.PI*height*height*(r-height/3),luneArea:2*r*r*alpha,wedgeVolume:2*r*r*r*alpha/3,zoneArea:2*Math.PI*r*zoneHeight,segmentVolume:Math.PI*(r*r*zoneHeight-(y*y*y-bottom*bottom*bottom)/3),sectorVolume:2*Math.PI*r*r*height/3,chord:2*r*Math.sin(alpha/2),arc:r*alpha};
}
export function roundInsight(type,id,r,h,section,lower,angle){
 const s=sphericalMeasures(r,section,lower,angle),pi=Math.PI,g=Math.hypot(r,h),sphere=type==='sphere';
 const item=(name,value,power,formula,substitute)=>({name,value,power,formula,substitute});
 const facts={
  center:['Centro',sphere?'El punto O está a la misma distancia r de todos los puntos de la superficie esférica.':'El punto O señala el centro de la base inferior; no es el centro de todo el cuerpo.',[]],
  radius:['Radio','El segmento rojo une el centro con la superficie; no atraviesa toda la figura.',[item('Radio',r,1,'r=\\frac d2',`r=\\frac{${2*r}}2`)]],
  diameter:['Diámetro','Une dos puntos opuestos pasando por el centro. En cilindros y conos corresponde al diámetro de la base.',[item('Diámetro',2*r,1,'d=2r',`d=2(${r})`)]],
  axis:['Eje y polos',sphere?'Los polos son los extremos del diámetro vertical elegido. El eje es una recta de referencia; la esfera no tiene un eje privilegiado.':'El eje pasa por el centro de la base y es perpendicular a ella.',[item(sphere?'Distancia entre polos':'Longitud interior del eje',sphere?2*r:h,1,sphere?'d=2r':'L=h',sphere?`d=2(${r})`:`L=${h}`)]],
  equator:['Ecuador','Circunferencia máxima perpendicular al eje elegido. Su plano pasa por O. La circunferencia es el borde; el círculo es la región plana interior.',[item('Longitud del ecuador',2*pi*r,1,'P=2\\pi r',`P=2\\pi(${r})`),item('Área del círculo máximo',pi*r*r,2,'A=\\pi r^2',`A=\\pi(${r})^2`)]],
  meridian:['Meridiano','Se destaca una circunferencia máxima que contiene el eje. Sus dos semicircunferencias entre polos son meridianos opuestos.',[item('Longitud de un meridiano (semicircunferencia)',pi*r,1,'L=\\pi r',`L=\\pi(${r})`)]],
  chord:['Cuerda y arco','La cuerda es un segmento recto entre dos puntos; el arco naranja sigue la superficie sobre el ecuador. α se convierte a radianes para calcular su longitud. Para α > 180° el arco seleccionado es el mayor.',[item('Longitud de la cuerda',s.chord,1,'c=2r\\sin\\frac\\alpha2',`c=2(${r})\\sin\\left(\\frac{${angle}^\\circ}{2}\\right)`),item('Longitud del arco elegido',s.arc,1,'L=r\\alpha_{\\mathrm{rad}}',`L=(${r})\\frac{${angle}\\pi}{180}`)]],
  hemisphere:['Hemisferio','Un plano por el centro divide la esfera en dos mitades. La superficie curva y la base circular se contabilizan por separado.',[item('Área curva',2*pi*r*r,2,'A_c=2\\pi r^2',`A_c=2\\pi(${r})^2`),item('Área total, incluyendo base',3*pi*r*r,2,'A_T=3\\pi r^2',`A_T=3\\pi(${r})^2`),item('Volumen',2*pi*r*r*r/3,3,'V=\\frac23\\pi r^3',`V=\\frac23\\pi(${r})^3`)]],
  cap:['Casquete esférico','La superficie sobre el corte es el casquete; el sólido que queda sobre ese plano es el segmento de una base. H = r − y es su altura, no la altura de toda la esfera. El área curva no incluye el disco del corte.',[item('Altura del casquete',s.height,1,'H=r-y',`H=${r}-(${s.y})`),item('Área curva del casquete',s.capArea,2,'A=2\\pi rH',`A=2\\pi(${r})(${s.height})`),item('Volumen del segmento de una base',s.capVolume,3,'V=\\pi H^2\\left(r-\\frac H3\\right)',`V=\\pi(${s.height})^2\\left(${r}-\\frac{${s.height}}3\\right)`)]],
  zone:['Zona y segmento esférico','Dos planos paralelos delimitan la zona sobre la superficie y el segmento dentro del cuerpo. Su altura es H = y₂ − y₁. El área de la zona no incluye las bases planas.',[item('Altura de la zona',s.zoneHeight,1,'H=y_2-y_1',`H=(${s.y})-(${s.bottom})`),item('Área de la zona',s.zoneArea,2,'A=2\\pi rH',`A=2\\pi(${r})(${s.zoneHeight})`),item('Volumen entre los planos',s.segmentVolume,3,'V=\\pi\\left[r^2(y_2-y_1)-\\frac{y_2^3-y_1^3}{3}\\right]',`V=\\pi\\left[(${r})^2(${s.zoneHeight})-\\frac{(${s.y})^3-(${s.bottom})^3}{3}\\right]`)]],
  lune:['Huso esférico','Es una porción de superficie entre dos meridianos que se encuentran en los polos. El ángulo α determina qué fracción de la superficie completa ocupa. El huso tiene área, no volumen.',[item('Área del huso',s.luneArea,2,'A_h=\\frac{\\alpha^\\circ}{360^\\circ}4\\pi r^2',`A_h=\\frac{${angle}}{360}4\\pi(${r})^2`)]],
  wedge:['Cuña esférica','Es la parte del volumen entre dos semiplanos que contienen el eje. Su cara curva es un huso. α es el ángulo diedro elegido entre esos semiplanos; no es un diedro entre caras de un poliedro.',[item('Volumen de la cuña',s.wedgeVolume,3,'V_c=\\frac{\\alpha^\\circ}{360^\\circ}\\frac43\\pi r^3',`V_c=\\frac{${angle}}{360}\\frac43\\pi(${r})^3`),item('Área de su cara curva',s.luneArea,2,'A_h=\\frac{\\alpha^\\circ}{360^\\circ}4\\pi r^2',`A_h=\\frac{${angle}}{360}4\\pi(${r})^2`)]],
  sector:['Sector esférico','Se forma con los radios que parten de O y llegan al casquete. Lo delimita una superficie cónica y el casquete; no se confunde con el segmento cortado por un plano.',[item('Volumen del sector',s.sectorVolume,3,'V_s=\\frac23\\pi r^2H',`V_s=\\frac23\\pi(${r})^2(${s.height})`)]],
  height:['Altura','La altura es perpendicular a la base. No es una generatriz inclinada.',[item('Altura',h,1,'h=h',`h=${h}`)]],
  generator:['Generatriz',type==='cone'?'Une el vértice del cono con un punto del borde de su base. Se obtiene con Pitágoras.':'En un cilindro recto la generatriz es paralela al eje y mide lo mismo que la altura.',[item('Generatriz',type==='cone'?g:h,1,type==='cone'?'g=\\sqrt{r^2+h^2}':'g=h',type==='cone'?`g=\\sqrt{(${r})^2+(${h})^2}`:`g=${h}`)]]
 };
 if(id==='section'){
  const y=sphere?s.y:section/100*h/2,rho=sphere?s.rho:type==='cone'?r*(.5-y/h):r;
  return {title:'Sección circular',text:'El plano amarillo es perpendicular al eje. y se mide desde el centro del cuerpo, con signo. El radio ρ del corte no es siempre el radio r de la esfera o de la base.',items:[item('Radio del corte',rho,1,sphere?'\\rho=\\sqrt{r^2-y^2}':type==='cone'?'\\rho=r\\left(\\frac12-\\frac yh\\right)':'\\rho=r',sphere?`\\rho=\\sqrt{(${r})^2-(${y})^2}`:type==='cone'?`\\rho=(${r})\\left(\\frac12-\\frac{${y}}{${h}}\\right)`:`\\rho=${r}`),item('Área del círculo del corte',pi*rho*rho,2,'A=\\pi\\rho^2',`A=\\pi(${rho})^2`)]};
 }
 const [title,text,items]=facts[id]||facts.radius;return {title,text,items};
}

export function drawRoundElements(group,state,R,H){
 const visible=state.elements,type=state.type,sphere=type==='sphere',baseY=sphere?0:-H/2;
 const labelPixels=30*(Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reading-scale'))||1);
 const mat=(color,opacity=.85)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});
 function path(points,color,closed=false){const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const ink=new THREE.Color(color).multiplyScalar(.62);const line=new (closed?THREE.LineLoop:THREE.Line)(geometry,new THREE.LineBasicMaterial({color:ink,depthTest:false}));line.renderOrder=9;group.add(line)}
 function dot(p,color){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.04,12,8),mat(color,1));mesh.position.set(...p);mesh.material.depthTest=false;mesh.renderOrder=10;group.add(mesh)}
 function label(text,p,color){
  const c=document.createElement('canvas'),ctx=c.getContext('2d');ctx.font='bold 42px Arial';
  c.width=Math.max(88,Math.ceil(ctx.measureText(text).width)+44);c.height=76;
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);
  ctx.strokeStyle='#172033';ctx.lineWidth=4;ctx.strokeRect(2,2,c.width-4,c.height-4);
  ctx.fillStyle=new THREE.Color(color).multiplyScalar(.55).getStyle();ctx.fillRect(5,5,6,c.height-10);
  ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#101827';ctx.fillText(text,c.width/2+2,39);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,toneMapped:false}));
  sprite.position.set(...p);sprite.scale.set(c.width/76*.3,.3,1);sprite.renderOrder=20;
  const world=new THREE.Vector3(),cameraSpace=new THREE.Vector3(),viewport=new THREE.Vector2();
  sprite.onBeforeRender=(renderer,scene,camera)=>{
   sprite.getWorldPosition(world);cameraSpace.copy(world).applyMatrix4(camera.matrixWorldInverse);renderer.getSize(viewport);
   const height=2*Math.abs(cameraSpace.z)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*labelPixels/Math.max(1,viewport.y);
   sprite.scale.set(height*c.width/76,height,1);
  };
  group.add(sprite);
 }
 const measure=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:state.decimals??2}).format(n);
 function dashed(a,b,color){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);const l=new THREE.Line(g,new THREE.LineDashedMaterial({color,dashSize:.09,gapSize:.055,depthTest:false}));l.computeLineDistances();l.renderOrder=8;group.add(l)}
 function plane(points,color,opacity=.12){const positions=[];for(let i=1;i<points.length-1;i++)positions.push(...points[0],...points[i],...points[i+1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const mesh=new THREE.Mesh(g,mat(color,opacity));mesh.renderOrder=4;group.add(mesh);path(points,color,true)}
 function cutPlane(level,color,name){const q=R*1.13;plane([[-q,level,-q],[q,level,-q],[q,level,q],[-q,level,q]],color);label(name,[q,level,q*.8],color)}
 function dimension(a,b,text,color){path([a,b],color);for(const p of [a,b])path([[p[0]-.09,p[1],p[2]],[p[0]+.09,p[1],p[2]]],color);label(text,[(a[0]+b[0])/2+.26,(a[1]+b[1])/2,(a[2]+b[2])/2],color)}
 function segment(a,b,color,text){path([a,b],color);const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);if(direction.length()>1e-8){const rod=new THREE.Mesh(new THREE.CylinderGeometry(R*.009,R*.009,direction.length(),10),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(.55),depthTest:false}));rod.position.copy(from.add(to).multiplyScalar(.5));rod.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());rod.renderOrder=9;group.add(rod)}dot(a,color);dot(b,color);if(text)label(text,b.map((v,i)=>v+(i===1?.2:0)),color)}
 function circle(radius,y,color){path(Array.from({length:120},(_,i)=>[radius*Math.cos(i*Math.PI/60),y,radius*Math.sin(i*Math.PI/60)]),color,true)}
 function disk(radius,y,color,opacity=.55){const mesh=new THREE.Mesh(new THREE.CircleGeometry(Math.max(radius,1e-6),96),mat(color,opacity));mesh.rotation.x=-Math.PI/2;mesh.position.y=y;mesh.renderOrder=3;group.add(mesh);circle(radius,y,color)}
 function patch(start,length,thetaStart,thetaLength,color){const mesh=new THREE.Mesh(new THREE.SphereGeometry(R*1.003,80,48,start,length,thetaStart,thetaLength),mat(color,.86));mesh.renderOrder=2;group.add(mesh)}
 function fan(points,color,opacity=.38){const positions=[];for(let i=0;i<points.length-1;i++)positions.push(0,0,0,...points[i],...points[i+1]);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const mesh=new THREE.Mesh(g,mat(color,opacity));mesh.renderOrder=3;group.add(mesh)}
 const pi=Math.PI,y=state.section/100*(sphere?R:H/2),rho=sphere?Math.sqrt(Math.max(0,R*R-y*y)):type==='cone'?R*(.5-y/H):R;
 if(visible.has('center')){dot([0,baseY,0],0x343e55);label('O',[.15,baseY+.12,.1],0x343e55)}
 if(visible.has('radius'))segment([0,baseY,0],[R,baseY,0],0xef7256,'r');
 if(visible.has('diameter'))segment([0,baseY,-R],[0,baseY,R],0xc34b98,'d');
 if(visible.has('height')&&!sphere)segment([0,-H/2,0],[0,H/2,0],0x5173d1,'h');
 if(visible.has('generator')&&!sphere)segment([R,-H/2,0],[type==='cone'?0:R,H/2,0],0x8c61ce,'g');
 if(visible.has('axis')){segment([0,sphere?-R:-H/2,0],[0,sphere?R:H/2,0],0x5173d1,sphere?'N':'eje');if(sphere)label('S',[0,-R-.15,0],0x5173d1)}
 if(visible.has('section')){disk(rho,y,0xd6a621);segment([0,y,0],[rho,y,0],0xac7b06,'ρ')}
 if(!sphere)return;
 const construction=['cap','sector','zone','hemisphere','wedge','lune'].some(id=>visible.has(id));
 if(construction){dashed([0,-R*1.18,0],[0,R*1.18,0],0x536a98);dot([0,0,0],0x343e55);label('O',[-.16,.12,0],0x343e55);label('eje',[0,R*1.22,0],0x536a98);circle(R,0,0x8794af)}
 if(visible.has('equator'))circle(R*1.005,0,0xd19b16);
 if(visible.has('meridian'))path(Array.from({length:120},(_,i)=>[0,R*Math.cos(i*pi/60),R*Math.sin(i*pi/60)]),0x7254ce,true);
 if(visible.has('hemisphere')){patch(0,2*pi,0,pi/2,0x427ad1);disk(R,0,0x427ad1,.25);cutPlane(0,0x427ad1,'plano por O')}
 const theta=Math.acos(y/R);
 if(visible.has('cap')||visible.has('sector')){patch(0,2*pi,0,theta,visible.has('sector')?0x39978a:0xe2a334);circle(rho,y,0xb77b10);cutPlane(y,0xb77b10,'plano de corte');dot([0,y,0],0xb77b10);label('C',[0,y-.15,0],0xb77b10);path([[0,y,0],[rho,y,0]],0xb77b10);label(`ρ = ${measure(state.r*rho/R)} ${state.unit}`,[rho*.58,y+.16,0],0xb77b10);path([[.13,y,0],[.13,y+.13,0],[0,y+.13,0]],0xb77b10);segment([0,0,0],[rho,y,0],0xef7256);label('r', [rho*.5,y*.5,.14],0xef7256);
  const x=R*1.05,z=R*.15;dashed([0,R,0],[x,R,z],0xb77b10);dashed([0,y,0],[x,y,z],0xb77b10);dimension([x,y,z],[x,R,z],`H = ${measure(state.r*(1-y/R))} ${state.unit}`,0xb77b10);
  if(visible.has('cap'))disk(rho,y,0xe2a334,.3);
  if(visible.has('sector')){fan(Array.from({length:97},(_,i)=>[rho*Math.cos(i*pi/48),y,rho*Math.sin(i*pi/48)]),0x39978a,.6);for(const sign of [-1,1])path([[0,0,0],[sign*rho,y,0]],0x237f74)}
 }
 if(visible.has('zone')){const low=R*Math.min(state.lower,state.section)/100,thetaLow=Math.acos(low/R);patch(0,2*pi,theta,thetaLow-theta,0x8b65cc);disk(rho,y,0x8b65cc,.3);disk(Math.sqrt(Math.max(0,R*R-low*low)),low,0x8b65cc,.3);cutPlane(y,0x8b65cc,'y₂');cutPlane(low,0x8b65cc,'y₁');dimension([R*1.1,low,0],[R*1.1,y,0],`H = ${measure(state.r*(y-low)/R)} ${state.unit}`,0x7651b8)}
 const alpha=state.angle*pi/180,start=3*pi/4-alpha/2,point=(phi,theta=pi/2)=>[-R*Math.cos(phi)*Math.sin(theta),R*Math.cos(theta),R*Math.sin(phi)*Math.sin(theta)];
 if(visible.has('lune')||visible.has('wedge')){
  const color=visible.has('wedge')?0xd65a92:0xe67f36;patch(start,alpha,0,pi,color);
  for(const [i,phi] of [start,start+alpha].entries()){const arc=Array.from({length:97},(_,i)=>point(phi,i*pi/96));path(arc,color);if(visible.has('wedge'))fan(arc,color);const p=point(phi);plane([[0,-R*1.1,0],[p[0]*1.13,-R*1.1,p[2]*1.13],[p[0]*1.13,R*1.1,p[2]*1.13],[0,R*1.1,0]],i?0x7155bb:0x387eaa,.13);label(`plano ${i+1}`,[p[0]*.9,R*.68,p[2]*.9],i?0x7155bb:0x387eaa);path([[0,0,0],p],0x8f6710)}
  cutPlane(0,0x8996ad,'corte perpendicular');
  const arc=Array.from({length:97},(_,i)=>point(start+i*alpha/96).map(x=>x*.47));fan(arc,0xffd34d,.9);path(arc,0x8f6710);path([[0,0,0],arc[0]],0x8f6710);path([[0,0,0],arc.at(-1)],0x8f6710);label(`α = ${measure(state.angle)}°`,point(start+alpha/2).map((x,i)=>x*.7+(i===1?.15:0)),0x8f6710);
 }
 if(visible.has('chord')){const a=point(start),b=point(start+alpha);segment(a,b,0xe67938,'c');path(Array.from({length:97},(_,i)=>point(start+i*alpha/96)),0xe67938)}
}
