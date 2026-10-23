import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { FoldingNet } from './folding.js';
import { initPrinting } from './printing.js';
import { analyzeSolid, createInsight } from './geometry-insights.js';
import { solidChallenges, contextualTheory } from './learning-context.js';
import { insightFormula, solveKnown } from './geometry-formulas.js';
import katex from 'katex';
import { initGlossary } from './glossary.js';
import { displayNumber, numericInput, setPrecision, mathNumber } from './number-format.js';
import { initAppearance, fitKnownQuantity } from './appearance.js';
import { polarTheory, mountPolarLesson } from './polar-learning.js';
import { initRoundSolids } from './round-solids.js';
import { initHomePresentation } from './home-presentation.js';
import { initRoundPrinting } from './round-printing.js';
import { createRevolutionPage, initRevolution } from './revolution.js';
import {exportRenderedImage,exportNetImage} from './polyhedron-images.js';
const openGlossaryTerm=initGlossary();
let customPrismSides=9;
const prismN=()=>currentKey==='triPrism'?3:currentKey==='hexPrism'?6:customPrismSides;

const PHI=(1+Math.sqrt(5))/2;
const solids={
  ico:{name:'Icosaedro',full:'Icosaedro regular',family:'Platónios',type:'Sólido platónico',glyph:'◢',faces:20,vertices:12,edges:30,face:'Triángulos equiláteros',atVertex:'5 caras se encuentran',dihedral:'138,19°',symmetry:'Icosaédrica',area:'5√3 · a²',volume:'5(3+√5)/12 · a³',intro:'Veinte triángulos forman una superficie casi esférica. Es el sólido platónico con mayor número de caras.',geometry:'icosa',color:0x675ae8,net:'tri20'},
  dode:{name:'Dodecaedro',full:'Dodecaedro regular',family:'Platónios',type:'Sólido platónico',glyph:'⬟',faces:12,vertices:20,edges:30,face:'Pentágonos regulares',atVertex:'3 caras se encuentran',dihedral:'116,57°',symmetry:'Icosaédrica',area:'3√(25+10√5) · a²',volume:'(15+7√5)/4 · a³',intro:'Doce pentágonos regulares crean una de las formas más elegantes y simétricas de la geometría.',geometry:'dodeca',color:0xff876c,net:'pent12'},
  cube:{name:'Cubo',full:'Hexaedro regular',family:'Platónios',type:'Sólido platónico',glyph:'◇',faces:6,vertices:8,edges:12,face:'Cuadrados',atVertex:'3 caras se encuentran',dihedral:'90°',symmetry:'Octaédrica',area:'6a²',volume:'a³',intro:'Seis cuadrados congruentes forman el poliedro más familiar. Su red puede organizarse de 11 maneras distintas.',geometry:'cube',color:0x20bfa8,net:'cube'},
  octa:{name:'Octaedro',full:'Octaedro regular',family:'Platónios',type:'Sólido platónico',glyph:'◆',faces:8,vertices:6,edges:12,face:'Triángulos equiláteros',atVertex:'4 caras se encuentran',dihedral:'109,47°',symmetry:'Octaédrica',area:'2√3 · a²',volume:'√2/3 · a³',intro:'Ocho triángulos se unen de cuatro en cuatro. Es el poliedro dual del cubo.',geometry:'octa',color:0xf1b93f,net:'tri8'},
  tetra:{name:'Tetraedro',full:'Tetraedro regular',family:'Platónios',type:'Sólido platónico',glyph:'△',faces:4,vertices:4,edges:6,face:'Triángulos equiláteros',atVertex:'3 caras se encuentran',dihedral:'70,53°',symmetry:'Tetraédrica',area:'√3 · a²',volume:'√2/12 · a³',intro:'El poliedro regular más sencillo: cuatro caras, cuatro vértices y seis aristas.',geometry:'tetra',color:0xe75373,net:'tri4'},
  triPrism:{name:'Prisma triangular',full:'Prisma triangular regular',family:'Prismas',type:'Prisma',glyph:'▱',faces:5,vertices:6,edges:9,face:'2 triángulos + 3 rectángulos',atVertex:'3 caras se encuentran',dihedral:'90° y 60°',symmetry:'Prismática',area:'(√3/2)a² + 3ah',volume:'(√3/4)a²h',intro:'Dos triángulos paralelos y congruentes unidos por tres rectángulos. Ideal para comprender las bases de un prisma.',geometry:'triPrism',color:0x4b9dea,net:'triPrism'},
  hexPrism:{name:'Prisma hexagonal',full:'Prisma hexagonal regular',family:'Prismas',type:'Prisma',glyph:'⬡',faces:8,vertices:12,edges:18,face:'2 hexágonos + 6 rectángulos',atVertex:'3 caras se encuentran',dihedral:'90° y 120°',symmetry:'Prismática',area:'3√3a² + 6ah',volume:'(3√3/2)a²h',intro:'Sus dos bases hexagonales quedan unidas por seis caras laterales rectangulares.',geometry:'hexPrism',color:0x25a999,net:'hexPrism'},
  cuboct:{name:'Cuboctaedro',full:'Cuboctaedro',family:'Arquimedianos',type:'Sólido arquimediano',glyph:'✦',faces:14,vertices:12,edges:24,face:'8 triángulos + 6 cuadrados',atVertex:'2 triángulos y 2 cuadrados',dihedral:'125,26°',symmetry:'Octaédrica',area:'(6+2√3)a²',volume:'5√2/3 · a³',intro:'Un sólido semirregular que combina cuadrados y triángulos con el mismo lado.',geometry:'cuboct',color:0x9b68e7,net:'mixed'},
  truncOct:{name:'Octaedro truncado',full:'Octaedro truncado',family:'Arquimedianos',type:'Sólido arquimediano',glyph:'✧',faces:14,vertices:24,edges:36,face:'8 hexágonos + 6 cuadrados',atVertex:'2 hexágonos y 1 cuadrado',dihedral:'125,26°',symmetry:'Octaédrica',area:'6(1+2√3)a²',volume:'8√2 · a³',intro:'Se obtiene al cortar cada vértice de un octaedro. Puede llenar el espacio mediante copias idénticas.',geometry:'truncOct',color:0xff7a69,net:'mixed'},
  truncCube:{name:'Cubo truncado',full:'Cubo truncado',family:'Arquimedianos',type:'Sólido arquimediano',glyph:'✹',faces:14,vertices:24,edges:36,face:'8 triángulos + 6 octágonos',atVertex:'1 triángulo y 2 octágonos',dihedral:'135°',symmetry:'Octaédrica',area:'2(6+6√2+√3)a²',volume:'(21+14√2)/3 · a³',intro:'Al recortar las ocho esquinas de un cubo aparecen triángulos y octágonos regulares.',geometry:'truncCube',color:0xf3b346,net:'mixed'}
};

const familyOrder={Platónios:['ico','dode','cube','octa','tetra'],Prismas:['triPrism','hexPrism'],Arquimedianos:['cuboct','truncOct','truncCube']};
solids.customPrism={...solids.hexPrism,name:'Prisma configurable',full:'Prisma recto de base regular de 9 lados',geometry:'customPrism',faces:11,vertices:18,edges:27,face:'2 bases de 9 lados + 9 rectángulos',intro:'Configura el número de lados de las dos bases regulares. Puedes cambiar la altura independientemente.',dihedral:'90° y 140°'};
familyOrder.Prismas.push('customPrism');
let currentKey='ico',viewMode='solid',spaceMode='3d',autoRotate=false,guideStep=0,challengeStep=0,score=0,answered=false,hasSelectedSolid=false;
let edgeLength=4,prismHeight=6,currentUnit='cm';
let insightMode=null,insightIndex=0;
let quickCheckIndex=0;
const panelCollapsed={'3d':false,'2d':false};
let netView={x:0,y:0,scale:1,rotation:0},netLayers={faces:true,vertices:false,edges:true,measure:true};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Navigation belongs to the viewer header, never to a hideable information panel.
const viewerNavigation=document.createElement('div');viewerNavigation.className='viewer-navigation';viewerNavigation.setAttribute('aria-label','Controles permanentes del visualizador');
$('.stage-banner').classList.add('viewer-header');$('.stage-actions').classList.add('viewer-actions');$('.stage-actions .view-switch').classList.add('viewer-tabs');
$('.stage-actions').prepend(viewerNavigation);
viewerNavigation.append($('#controls3d'),$('#controls2d'));
$('#controls3d').setAttribute('aria-label','Navegar por la vista 3D');
$('#controls2d').setAttribute('aria-label','Navegar y plegar el desarrollo 2D');
$('#controls2d').prepend($('.net-nav-controls'));
$('#controls2d').append($('#netFullscreenBtn'));
const imageDownload=document.createElement('button');imageDownload.type='button';imageDownload.className='ghost-btn';imageDownload.id='downloadPolyImage';imageDownload.textContent='↓ Imagen PNG';imageDownload.title='Descargar la figura a color, sin menús ni paneles';$('.stage-actions').append(imageDownload);
const imageMode=document.createElement('label');imageMode.className='image-export-mode';imageMode.innerHTML='<input id="customPolyImage" type="checkbox"> Personalizar imagen';imageMode.title='Desactivado: encuadre automático completo. Activado: conserva el ángulo, giro, posición y zoom de tu vista; lo que quede fuera no saldrá en la imagen.';imageDownload.before(imageMode);
imageDownload.addEventListener('click',async()=>{
 imageDownload.disabled=true;
 const slug=solids[currentKey].name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
 try{
  const personalized=$('#customPolyImage').checked;
  if(spaceMode==='3d')exportRenderedImage(renderer,scene,camera,`${slug}-3d-color.png`,{automatic:!personalized,object:modelGroup});
  else if(foldingNet.progress<=.015)await exportNetImage($('#netSvg'),`${slug}-desarrollo-2d-color.png`,{personalized});
  else exportRenderedImage(foldingNet.renderer,foldingNet.scene,foldingNet.camera,`${slug}-plegado-color.png`,{automatic:!personalized,object:foldingNet.group});
  showToast('Imagen a color preparada para descargar');
 }catch(error){console.error(error);showToast('No se pudo descargar la imagen. Inténtalo de nuevo.')}finally{imageDownload.disabled=false}
});

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,1,.1,100); camera.position.set(4.9,3.4,6.2);
const renderer=new THREE.WebGLRenderer({canvas:$('#polyCanvas'),antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.06; controls.minDistance=3; controls.maxDistance=20; controls.target.set(0,0,0);
let solidAutoFit=true;
controls.addEventListener('start',()=>{solidAutoFit=false});
scene.add(new THREE.HemisphereLight(0xffffff,0x697383,2.5));
const keyLight=new THREE.DirectionalLight(0xffffff,4); keyLight.position.set(4,7,6); keyLight.castShadow=true; scene.add(keyLight);
const rim=new THREE.DirectionalLight(0x7368ff,2); rim.position.set(-5,1,-4); scene.add(rim);
// Keep the entire solid visible: a fixed floor can intersect its vertices.
let modelGroup=new THREE.Group(); scene.add(modelGroup);
const foldingNet=new FoldingNet($('#foldCanvas'));
foldingNet.onProgress=p=>{const pct=Math.round(p*100),flat=p<=.015;$('#foldRange').value=pct;$('#foldPercent').textContent=`${pct}%`;$('#foldStatus').textContent=pct===0?'Red completamente plana':pct===100?'Sólido completamente formado':p<.5?'Las caras se pliegan por sus aristas':'La red se está cerrando sin separar sus caras';updateFoldButton();$('#netSvg').classList.toggle('hidden',!flat);$('#foldCanvas').classList.toggle('hidden-at-flat',flat)};
foldingNet.onStop=updateFoldButton;
function updateFoldButton(){
 const button=$('#foldPlay'),playing=foldingNet.playing,closed=foldingNet.progress>=.999,flat=foldingNet.progress<=.001;
 const label=playing?'Pausar':closed?'Desplegar':flat?'Plegar':'Continuar';
 $('#foldPlayIcon').textContent=playing?'Ⅱ':'▶';$('#foldAction').textContent=label;
 button.setAttribute('aria-label',playing?'Pausar animación':closed?'Desplegar el sólido':flat?'Plegar el desarrollo':'Continuar animación');
 button.setAttribute('aria-pressed',String(playing));
 $$('.net-nav-controls button').forEach(control=>control.disabled=!flat);
}

function uniquePermutations(values){const set=new Set(); const out=[]; const perm=(a,l=0)=>{if(l===a.length){const k=a.join(',');if(!set.has(k)){set.add(k);out.push([...a])}return}for(let i=l;i<a.length;i++){[a[l],a[i]]=[a[i],a[l]];perm(a,l+1);[a[l],a[i]]=[a[i],a[l]]}};perm([...values]);return out}
function signedPoints(base,filter=()=>true){const pts=[];for(const p of uniquePermutations(base)){for(let mask=0;mask<8;mask++){const q=p.map((n,i)=>n===0?0:n*((mask>>i)&1?-1:1));if(filter(q))pts.push(new THREE.Vector3(...q))}}const seen=new Map();pts.forEach(p=>seen.set(p.toArray().join(','),p));return [...seen.values()]}
function geometryFor(type){
  if(type==='cube')return new THREE.BoxGeometry(2.5,2.5,2.5);
  if(type==='tetra')return new THREE.TetrahedronGeometry(1.8,0);
  if(type==='octa')return new THREE.OctahedronGeometry(1.8,0);
  if(type==='dodeca')return new THREE.DodecahedronGeometry(1.75,0);
  if(type==='icosa')return new THREE.IcosahedronGeometry(1.82,0);
  if(type==='triPrism')return new THREE.CylinderGeometry(1/Math.sqrt(3),1/Math.sqrt(3),prismHeight/edgeLength,3,1,false);
  if(type==='hexPrism')return new THREE.CylinderGeometry(1,1,prismHeight/edgeLength,6,1,false);
  if(type==='customPrism'){const r=1/(2*Math.sin(Math.PI/customPrismSides));return new THREE.CylinderGeometry(r,r,prismHeight/edgeLength,customPrismSides,1,false)}
  if(type==='cuboct')return new ConvexGeometry(signedPoints([1,1,0]));
  if(type==='truncOct')return new ConvexGeometry(signedPoints([0,1,2]));
  if(type==='truncCube')return new ConvexGeometry(signedPoints([1,1+Math.SQRT2,1+Math.SQRT2]));
  return new THREE.IcosahedronGeometry(1.8,0);
}
function disposeGroup(){modelGroup.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});scene.remove(modelGroup);modelGroup=new THREE.Group();scene.add(modelGroup)}
function buildModel(){
  disposeGroup(); const d=solids[currentKey],g=geometryFor(d.geometry); g.computeVertexNormals(); g.center();
  modelGroup.userData.analysis=analyzeSolid(g,d.family==='Prismas');modelGroup.userData.prismRatio=prismHeight/edgeLength;
  buildDual();
  const mat=new THREE.MeshPhysicalMaterial({color:d.color,roughness:.32,metalness:.04,clearcoat:.35,clearcoatRoughness:.3,transparent:true,opacity:1,side:THREE.DoubleSide,flatShading:true});
  const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name='surface';modelGroup.add(mesh);
  const edgeMat=new THREE.LineBasicMaterial({color:0x252932,transparent:true,opacity:.72}); const edges=new THREE.LineSegments(new THREE.EdgesGeometry(g,1),edgeMat);edges.name='edges';modelGroup.add(edges);
  const pos=g.attributes.position; const unique=new Map(); for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i);const k=v.toArray().map(n=>n.toFixed(3)).join(',');unique.set(k,v)}
  const dotGeo=new THREE.SphereGeometry(.065,12,8); const dotMat=new THREE.MeshBasicMaterial({color:0xc6ff4a}); const dots=new THREE.Group(); dots.name='dots'; for(const v of unique.values()){const dot=new THREE.Mesh(dotGeo,dotMat);dot.position.copy(v);dots.add(dot)} modelGroup.add(dots);
  const box=new THREE.Box3().setFromObject(modelGroup),size=box.getSize(new THREE.Vector3());const max=Math.max(size.x,size.y,size.z);modelGroup.userData.baseScale=3.9/max;modelGroup.scale.setScalar(modelGroup.userData.baseScale);modelGroup.rotation.set(.12,.35,0);updateGeometryInsights();solidAutoFit=true;resize();
}
function updateViewMode(){const s=modelGroup.getObjectByName('surface'),e=modelGroup.getObjectByName('edges'),v=modelGroup.getObjectByName('dots');if(!s)return;s.visible=viewMode!=='wire';s.material.opacity=insightMode?.16:$('#showDual').checked?.2:viewMode==='xray'?.22:1;s.material.depthWrite=!insightMode&&!$('#showDual').checked&&viewMode!=='xray';e.visible=true;e.material.opacity=viewMode==='xray'?1:viewMode==='wire'?1:.68;v.visible=viewMode==='vertices';}
function buildDual(){
 const analysis=modelGroup.userData.analysis,points=analysis.faces.map(face=>face.normal.clone().divideScalar(face.normal.dot(face.center)));
 // A single homothety puts every dual vertex inside every original half-space.
 let ratio=0;analysis.faces.forEach(face=>{const d=face.normal.dot(face.center);points.forEach(p=>ratio=Math.max(ratio,face.normal.dot(p)/d))});points.forEach(p=>p.multiplyScalar(1/ratio));
 const geometry=new ConvexGeometry(points),dual=new THREE.Group();dual.name='dual';dual.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xffa33c,transparent:true,opacity:.26,side:THREE.DoubleSide,depthWrite:false})),new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0xe67a15})));dual.visible=$('#showDual').checked;modelGroup.add(dual);
 const names={cube:'Octaedro',octa:'Cubo',ico:'Dodecaedro',dode:'Icosaedro',tetra:'Tetraedro (autodual)',cuboct:'Dodecaedro rómbico',truncOct:'Tetraquishexaedro',truncCube:'Triakisoctaedro'};
 $('#dualDescription').textContent=`${names[currentKey]||(solids[currentKey].family==='Prismas'?`Bipirámide de base de ${prismN()} lados`:'Dual polar')}: ${solids[currentKey].vertices} caras, ${solids[currentKey].faces} vértices y ${solids[currentKey].edges} aristas. La medida a sigue siendo la del sólido original.`;
}
$('#showDual').addEventListener('change',()=>{const dual=modelGroup.getObjectByName('dual');if(dual)dual.visible=$('#showDual').checked;updateViewMode()});
function fitSolidView(resetRotation=false){
 const viewport=$('#solidViewport'),w=viewport.clientWidth,h=viewport.clientHeight,mesh=modelGroup.getObjectByName('surface');if(!w||!h||!mesh)return;
 if(resetRotation)modelGroup.rotation.set(.12,.35,0);
 mesh.geometry.computeBoundingSphere();
 const radius=mesh.geometry.boundingSphere.radius*modelGroup.scale.x+.08;
 camera.aspect=w/h;camera.updateProjectionMatrix();
 const vertical=THREE.MathUtils.degToRad(camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
 const distance=radius/Math.sin(Math.min(vertical,horizontal)/2)*1.1;
 camera.position.copy(new THREE.Vector3(4.9,3.4,6.2).normalize().multiplyScalar(distance));controls.target.set(0,0,0);controls.maxDistance=Math.max(20,distance*2);controls.update();
}
let previousViewport=null;
function resize(){
 const viewport=$('#solidViewport'),w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;
 const previous=previousViewport;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 if(solidAutoFit)fitSolidView();
 else if(previous&&(previous.w!==w||previous.h!==h)){
  // Preserve relative zoom and orbit, not an obsolete narrow-screen distance.
  const vertical=THREE.MathUtils.degToRad(camera.fov),limit=aspect=>Math.min(vertical,2*Math.atan(Math.tan(vertical/2)*aspect));
  const ratio=Math.sin(limit(previous.w/previous.h)/2)/Math.sin(limit(w/h)/2),offset=camera.position.clone().sub(controls.target).multiplyScalar(ratio);
  camera.position.copy(controls.target).add(offset);controls.maxDistance=Math.max(20,offset.length()*2);controls.update();
 }
 previousViewport={w,h};
}
new ResizeObserver(resize).observe($('#solidViewport'));
function animate(){requestAnimationFrame(animate);controls.update();if(autoRotate&&spaceMode==='3d')modelGroup.rotation.y+=.008;renderer.render(scene,camera)}requestAnimationFrame(animate);

function renderCatalog(family){const list=$('#solidList');list.innerHTML='';const keys=familyOrder[family];$('#familyCount').textContent=family==='Prismas'?'2 ejemplos + uno configurable':`${keys.length} modelos`;$('#prismConfig').hidden=family!=='Prismas';$('#familyExplanation').innerHTML=family==='Platónios'?'Son los cinco platónicos convexos: no falta ninguno. <a href="#glosario/platonicos">¿Por qué solo cinco?</a>':family==='Arquimedianos'?'Tres ejemplos de los 13 arquimedianos. <a href="#glosario/arquimedianos">Conocer la familia →</a>':'Crea tu prisma con una base de n lados.';keys.forEach(key=>{const d=solids[key],node=$('#solidCardTemplate').content.firstElementChild.cloneNode(true);node.dataset.key=key;node.querySelector('.solid-icon').textContent=d.glyph;node.querySelector('b').textContent=d.name;node.querySelector('small').textContent=`${d.faces} caras · ${d.edges} aristas`;node.classList.toggle('active',key===currentKey);node.addEventListener('click',()=>selectSolid(key));list.append(node)})}
$('#prismConfig').addEventListener('submit',event=>{event.preventDefault();const n=Number($('#prismSides').value);if(!Number.isInteger(n)||n<3||n>24){$('#prismConfigError').textContent='Elige un número entero entre 3 y 24.';return}customPrismSides=n;Object.assign(solids.customPrism,{name:`Prisma de ${n} lados`,full:`Prisma recto de base regular de ${n} lados`,faces:n+2,vertices:2*n,edges:3*n,face:`2 bases de ${n} lados + ${n} rectángulos`,dihedral:`90° y ${format(180-360/n)}°`,intro:`Dos bases regulares de ${n} lados y ${n} caras laterales rectangulares.`,atVertex:'3 caras se encuentran'});knownSolid=null;selectSolid('customPrism')});
function selectSolid(key){currentKey=key;const d=solids[key];if(!familyOrder[d.family].includes(key))return;$$('.family-tab').forEach(b=>{b.classList.toggle('active',b.dataset.family===d.family);b.setAttribute('aria-selected',b.dataset.family===d.family)});renderCatalog(d.family);$('#familyLabel').textContent=d.type.toUpperCase();$('#solidTitle').textContent=d.name;$('#infoName').textContent=d.full;$('#infoIntro').textContent=d.intro;$('#miniGlyph').textContent=d.glyph;$('#facesValue').textContent=$('#eqFaces').textContent=d.faces;$('#verticesValue').textContent=$('#eqVertices').textContent=d.vertices;$('#edgesValue').textContent=$('#eqEdges').textContent=d.edges;$('#faceType').textContent=d.face;$('#atVertex').textContent=d.atVertex;$('#dihedral').textContent=d.dihedral;$('#symmetry').textContent=d.symmetry;$('#workshopName').textContent=d.name.toLowerCase();$('#netTitle').textContent=`Red del ${d.name.toLowerCase()}`;$('#heightField').style.display=d.family==='Prismas'?'block':'none';resetNetView(false);buildModel();buildFoldingNet();updateMeasurements();renderLearningNext();if(hasSelectedSolid)showToast(`${d.name}: red conectada y plegado geométrico listos`);hasSelectedSolid=true}

function buildFoldingNet(){const d=solids[currentKey],g=geometryFor(d.geometry),measure=`${format(edgeLength)} ${currentUnit}`,result=foldingNet.setGeometry(g,d.color,measure);g.dispose();if(result.overlapScore>0)console.warn(`La búsqueda de red para ${d.name} conservó ${result.overlapScore} solapamientos.`);renderNet()}

function tri(x,y,s=48,flip=false,cls=''){const h=s*.866;return `<polygon class="${cls}" points="${x},${y+(flip?h:0)} ${x+s},${y+(flip?h:0)} ${x+s/2},${y+(flip?0:h)}"/>`}
function square(x,y,s=54,cls=''){return `<rect class="${cls}" x="${x}" y="${y}" width="${s}" height="${s}"/>`}
function polygonPoints(cx,cy,r,n,rot=-Math.PI/2){return Array.from({length:n},(_,i)=>`${cx+Math.cos(rot+i*Math.PI*2/n)*r},${cy+Math.sin(rot+i*Math.PI*2/n)*r}`).join(' ')}
function netMarkup(type){let m='';if(type==='cube'){[[130,105],[184,105],[238,105],[292,105],[184,51],[184,159]].forEach(p=>m+=square(...p));m+=`<polygon class="tab" points="130,105 118,116 118,147 130,159"/>`;}
  else if(type==='tri4'){m=tri(205,104,80)+tri(125,173,80,true)+tri(205,173,80,true)+tri(285,173,80,true)}
  else if(type==='tri8'){for(let i=0;i<4;i++){m+=tri(102+i*78,122,78,i%2===1);m+=tri(102+i*78,189,78,i%2===0)}}
  else if(type==='tri20'){for(let r=0;r<4;r++)for(let i=0;i<5;i++)m+=tri(62+i*78+(r%2?39:0),45+r*60,78,(i+r)%2===1)}
  else if(type==='pent12'){const centers=[[260,150],[260,70],[336,125],[307,214],[213,214],[184,125],[260,286],[384,204],[136,204],[384,56],[136,56],[260,-8]];centers.forEach(([x,y])=>m+=`<polygon points="${polygonPoints(x,y,47,5)}"/>`)}
  else if(type==='triPrism'){for(let i=0;i<3;i++)m+=`<rect x="${150+i*70}" y="105" width="70" height="105"/>`;m+=tri(150,44,70)+tri(290,210,70,true)}
  else if(type==='hexPrism'){for(let i=0;i<6;i++)m+=`<rect x="${50+i*70}" y="105" width="70" height="105"/>`;m+=`<polygon points="${polygonPoints(85,69,40,6)}"/><polygon points="${polygonPoints(365,246,40,6)}"/>`}
  else {for(let i=0;i<7;i++)m+=`<polygon points="${polygonPoints(80+i*60,150+(i%2?45:-5),34,i%3===0?4:6)}"/>`;}
  return m;
}
function applyNetView(){
  const svg=$('#netSvg'),g=$('#netViewport');if(!g)return;
  const {width,height}=svg.getBoundingClientRect();if(!width||!height)return;
  // Match SVG coordinates to screen pixels, then fit the entire cutting template.
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const bounds=g.getBBox();
  const left=16,right=16,top=16,bottom=16;
  const availableWidth=Math.max(1,width-left-right),availableHeight=Math.max(1,height-top-bottom);
  const fit=Math.min(availableWidth/Math.max(1,bounds.width),availableHeight/Math.max(1,bounds.height));
  const cx=left+availableWidth/2,cy=top+availableHeight/2;
  g.setAttribute('transform',`translate(${cx+netView.x} ${cy+netView.y}) rotate(${netView.rotation}) scale(${fit*netView.scale}) translate(${-bounds.x-bounds.width/2} ${-bounds.y-bounds.height/2})`);
}
function applyNetLayers(){const svg=$('#netSvg');svg.classList.toggle('hide-faces',!netLayers.faces);svg.classList.toggle('hide-vertices',!netLayers.vertices);svg.classList.toggle('hide-edges',!netLayers.edges);svg.classList.toggle('hide-measure',!netLayers.measure);$('#netMeasureCallout').classList.toggle('hidden',!netLayers.measure);$$('[data-net-feature]').forEach(b=>b.classList.toggle('active',netLayers[b.dataset.netFeature]))}
function resetNetView(render=true){netView={x:0,y:0,scale:1,rotation:0};if(render)applyNetView()}
function changeNetZoom(delta){netView.scale=Math.max(.65,Math.min(2.8,netView.scale+delta));applyNetView()}
function renderNet(){const d=solids[currentKey],measure=`${format(edgeLength)} ${currentUnit}`,m=foldingNet.svg(measure);$('#netSvg').innerHTML=`<g id="netViewport">${m}</g>`;$('#workshopSvg').innerHTML=m;$('#netMeasureCalloutValue').textContent=`a = ${measure}`;$('#dimensionChip').textContent=`a = ${measure}`;$('#edgeCalloutText').textContent=`a = ${measure}`;$('#netFacesCount').textContent=d.faces;$('#netVerticesCount').textContent=d.vertices;$('#netEdgesCount').textContent=d.edges;applyNetView();applyNetLayers()}
function switchSpace(mode){spaceMode=mode;$$('[data-space]').forEach(b=>{const active=b.dataset.space===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',active)});$('#view3d').classList.toggle('active',mode==='3d');$('#view2d').classList.toggle('active',mode==='2d');$('#controls3d').classList.toggle('active',mode==='3d');$('#controls2d').classList.toggle('active',mode==='2d');if(mode==='2d')renderNet();renderLearningNext(false);applyPanelState();resize()}

function applyPanelState(){
 $('#solidSecondary').hidden=panelCollapsed['3d'];
 $('#solidExplanation').hidden=!insightMode||panelCollapsed['3d']||spaceMode!=='3d';
 for(const [mode,id] of [['3d','solidPanel'],['2d','netPanel']]){document.getElementById(id).hidden=panelCollapsed[mode];document.getElementById(`view${mode}`).classList.toggle('panel-collapsed',panelCollapsed[mode])}
 const collapsed=panelCollapsed[spaceMode],button=$('#panelToggle');button.textContent=collapsed?'Mostrar panel':'Ocultar panel';button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-controls',spaceMode==='3d'?'solidPanel':'netPanel');
}
$('#panelToggle').addEventListener('click',()=>{panelCollapsed[spaceMode]=!panelCollapsed[spaceMode];applyPanelState()});
function updateGeometryInsights(){
 const analysis=modelGroup.userData.analysis;if(!analysis)return;
 const scale=edgeLength/analysis.referenceLength,options=analysis.parallel.length?analysis.parallel:analysis.altitude?[analysis.altitude]:[];
 const metric=$('#lengthMetric').value,lengthOptions=analysis.lengths[metric]||[],selectedLength=lengthOptions[insightIndex%Math.max(1,lengthOptions.length)];
 const vertexAngle=analysis.vertexAngles[insightIndex%analysis.vertexAngles.length];
 $('#vertexAngleLabel').textContent=vertexAngle.faces.length===3?'Ángulo triedro':'Ángulo poliedro';
 $('#vertexAngleValue').textContent=`${format(vertexAngle.omega)} sr · ${vertexAngle.faces.length} caras`;
 $('#lengthMetricValue').textContent=lengthOptions.length?`${lengthOptions.map(item=>format(item.distance*scale)).filter((v,i,a)=>a.indexOf(v)===i).join(' / ')} ${currentUnit}`:'No tiene';
 const angles=analysis.diedros.map(item=>`${format(item.angle)}°`).join(' / ');
 const distances=options.map(item=>format(item.distance*scale)).join(' / ');
 $$('[data-spatial-count]').forEach(el=>el.textContent=analysis.diagonals.length);
 $$('[data-dihedral-value]').forEach(el=>el.textContent=angles);
 $$('[data-face-distance]').forEach(el=>el.textContent=options.length?`${distances} ${currentUnit}`:'No hay');
 $$('[data-distance-label]').forEach(el=>el.textContent=analysis.parallel.length?'Caras opuestas':'Vértice a cara opuesta');
 $('#dihedral').textContent=angles;
 $$('[data-insight]').forEach(button=>{const active=button.dataset.insight===insightMode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
 const previous=modelGroup.getObjectByName('geometryInsight');if(previous){modelGroup.remove(previous);previous.traverse(object=>{object.geometry?.dispose();object.material?.dispose()})}
 if(insightMode){const group=createInsight(analysis,insightMode,insightIndex,metric);group.name='geometryInsight';modelGroup.add(group)}
 const readout=$('#insightReadout'),next=$('#nextInsight');readout.hidden=!insightMode;$('#solidExplanation').hidden=!insightMode||panelCollapsed['3d']||spaceMode!=='3d';next.hidden=true;
 if(insightMode==='diagonals'){
  const count=analysis.vertices.size,total=count*(count-1)/2;
  readout.innerHTML=`<strong>${analysis.diagonals.length} diagonales espaciales</strong><p>Unen vértices que no comparten una cara. Las caras tienen otras ${analysis.facialDiagonals} diagonales.</p><p>D = ${total} − ${analysis.edges.size} − ${analysis.facialDiagonals} = ${analysis.diagonals.length}.</p>`;
  next.hidden=analysis.diagonals.length<2;next.textContent=`Otro ejemplo (${insightIndex%Math.max(1,analysis.diagonals.length)+1}/${analysis.diagonals.length})`;
 }else if(insightMode==='dihedral'){
  const item=analysis.diedros[insightIndex%analysis.diedros.length];
  readout.innerHTML=`<strong>${format(item.angle)}° · diedro interior</strong><p>La sección tenue es perpendicular a la arista común. El sector amarillo sombreado, entre sus dos radios, representa el ángulo que se mide en ese plano.</p>`;
  next.hidden=analysis.diedros.length<2;next.textContent='Ver otro tipo de diedro';
 }else if(insightMode==='distance'){
  const item=options[insightIndex%Math.max(1,options.length)];
  readout.innerHTML=item?`<strong>${format(item.distance*scale)} ${currentUnit}</strong><p>${analysis.parallel.length?'Distancia perpendicular entre las caras paralelas resaltadas.':'Altura desde el vértice hasta la cara opuesta; este sólido no tiene caras paralelas.'}</p>`:'<p>Este sólido no tiene caras paralelas opuestas.</p>';
  next.hidden=options.length<2;next.textContent='Ver otra distancia';
 }else if(insightMode==='vertexAngle'){
  readout.innerHTML=`<strong>${vertexAngle.faces.length===3?'Triedro':'Ángulo poliedro'} · Ω ≈ ${format(vertexAngle.omega)} sr</strong><p>Se reúnen ${vertexAngle.faces.length} caras en el vértice señalado. La sombrilla esférica representa el ángulo sólido que abarcan sus aristas.</p><p>Se mide en estereorradianes (sr), no en grados de un ángulo plano. Una esfera completa tiene 4π sr. ${vertexAngle.faces.length===3?'En este vértice sí hay un triedro.':'Aquí no es un triedro: concurren más de tres caras.'}</p>`;
  next.hidden=analysis.vertexAngles.length<2;next.textContent=`Otro vértice (${insightIndex%analysis.vertexAngles.length+1}/${analysis.vertexAngles.length})`;
 }else if(insightMode==='length'){
  const names={diameter:'Distancia máxima entre vértices',faceDiagonal:'Diagonal de una cara',circumradius:lengthOptions.length===1?'Radio circunscrito R':'Distancia del centro al vértice',inradius:lengthOptions.length===1?'Radio inscrito r':'Distancia del centro a una cara',midradius:lengthOptions.length===1?'Radio medio ρ':'Distancia del centro a una arista'};
  const descriptions={diameter:'Es la mayor distancia recta entre dos vértices. No siempre pasa por el centro, ni siempre es una diagonal espacial: en el tetraedro coincide con una arista.',faceDiagonal:'Une dos vértices no consecutivos de la misma cara. Se distingue de una diagonal espacial, cuyos extremos no comparten una cara.',circumradius:'El segmento une el centro con un vértice. Si todos los vértices están a la misma distancia, la esfera de referencia pasa por todos ellos.',inradius:'El segmento llega perpendicularmente al plano de una cara. Solo hay una esfera inscrita centrada aquí si esta distancia es igual para todas las caras.',midradius:'El segmento va del centro al punto más próximo de una arista. Si todas las distancias coinciden, la esfera media es tangente a todas las aristas.'};
  readout.innerHTML=selectedLength?`<strong>${names[metric]} ≈ ${format(selectedLength.distance*scale)} ${currentUnit}</strong><p>${descriptions[metric]}</p>${metric==='diameter'?`<p>Hay ${lengthOptions.length} pares de vértices que alcanzan esta longitud máxima.</p>`:lengthOptions.length>1?`<p>Este sólido tiene ${lengthOptions.length} longitudes distintas de este tipo. Cambia de ejemplo para compararlas; la esfera mostrada es solo una referencia para el valor elegido.</p>`:''}`:`<strong>No hay diagonales en estas caras</strong><p>Las caras triangulares no tienen vértices no consecutivos. Escoge otra longitud en el selector.</p>`;
  next.hidden=lengthOptions.length<2;next.textContent=metric==='diameter'?'Otro par más alejado':'Ver otra longitud';
 }
 if(insightMode)readout.insertAdjacentHTML('beforeend',insightFormula({analysis,key:currentKey,mode:insightMode,index:insightIndex,metric,a:edgeLength,h:prismHeight,unit:currentUnit}));
 updateViewMode();
}
function focusAngularInsight(){
 if(insightMode!=='dihedral'&&insightMode!=='vertexAngle')return;
 const analysis=modelGroup.userData.analysis;
 const direction=insightMode==='dihedral'?analysis.diedros[insightIndex%analysis.diedros.length].b.clone().sub(analysis.diedros[insightIndex%analysis.diedros.length].a):analysis.vertexAngles[insightIndex%analysis.vertexAngles.length].vertex.clone().sub(analysis.center);
 direction.applyQuaternion(modelGroup.quaternion).normalize();
 const distance=camera.position.distanceTo(controls.target);
 if(insightMode==='dihedral'&&direction.dot(camera.position)<0)direction.negate();
 controls.target.set(0,0,0);camera.position.copy(direction.multiplyScalar(distance));controls.update();solidAutoFit=false;
 autoRotate=false;$('#autoRotate').textContent='▶';$('#autoRotate').setAttribute('aria-pressed','false');$('#autoRotate').setAttribute('aria-label','Iniciar rotación automática');
}
$$('[data-insight]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.insight;insightMode=spaceMode==='3d'&&insightMode===mode?null:mode;insightIndex=0;panelCollapsed['3d']=false;switchSpace('3d');updateGeometryInsights();focusAngularInsight()}));
$('#nextInsight').addEventListener('click',()=>{insightIndex++;updateGeometryInsights();focusAngularInsight()});
$('#lengthMetric').addEventListener('change',()=>{insightIndex=0;insightMode='length';updateGeometryInsights()});
function renderLearningNext(resetQuestion=true){
 const d=solids[currentKey],flat=spaceMode==='2d';
 $('#learningContext').textContent=`Sólido actual: ${d.name}. Elige un repaso o comprueba lo que ya sabes.`;
 const regular=d.family==='Platónios';
 $('#relatedTheory').href=flat?'#teoria/desarrollos':regular?'#teoria/regulares':'#teoria/fundamentos';
 $('#relatedTheoryTitle').textContent=flat?'¿Cómo se pliega esta plantilla?':regular?'¿Qué hace regular a este sólido?':'¿Cómo se clasifica este poliedro?';
 $('#relatedTheoryDescription').textContent=flat?'Reconoce las caras que se unen y las aristas por las que se dobla.':regular?'Descubre qué comparten sus caras y por qué solo hay cinco sólidos platónicos.':'Distingue las bases, las caras laterales y las familias de poliedros.';
 if(resetQuestion)renderQuickCheck();
}
function renderQuickCheck(){
 const d=solids[currentKey],variants=[
  {label:'aristas',question:`Tiene ${d.faces} caras y ${d.vertices} vértices. ¿Cuántas aristas tiene?`,answer:d.edges,hint:'A = C + V − 2',working:`${d.faces} + ${d.vertices} − 2 = ${d.edges}`},
  {label:'vértices',question:`Tiene ${d.faces} caras y ${d.edges} aristas. ¿Cuántos vértices tiene?`,answer:d.vertices,hint:'V = A + 2 − C',working:`${d.edges} + 2 − ${d.faces} = ${d.vertices}`},
  {label:'caras',question:`Tiene ${d.vertices} vértices y ${d.edges} aristas. ¿Cuántas caras tiene?`,answer:d.faces,hint:'C = A + 2 − V',working:`${d.edges} + 2 − ${d.vertices} = ${d.faces}`}
 ],problem=variants[quickCheckIndex%variants.length];
 $('#quickCheckQuestion').textContent=`${d.name}: ${problem.question}`;
 $('#quickCheckLabel').textContent=`Número de ${problem.label}`;
 $('#quickCheckHint').textContent=`Para este sólido convexo: C + V = A + 2. Despeja: ${problem.hint}.`;
 const form=$('#quickCheck');form.dataset.answer=problem.answer;form.dataset.working=problem.working;form.dataset.label=problem.label;
 $('#quickCheckAnswer').value='';$('#quickCheckAnswer').removeAttribute('aria-invalid');$('#quickCheckFeedback').textContent='';$('#quickCheckFeedback').className='quick-feedback';
 form.querySelector('details').open=false;
}
$('#quickCheck').addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget,correct=Number($('#quickCheckAnswer').value)===Number(form.dataset.answer),feedback=$('#quickCheckFeedback');
 feedback.textContent=`${correct?'Correcto.':'Revisa tu cálculo.'} ${form.dataset.working}. Por tanto, hay ${form.dataset.answer} ${form.dataset.label}.`;
 feedback.className=`quick-feedback ${correct?'correct':'retry'}`;$('#quickCheckAnswer').setAttribute('aria-invalid',String(!correct));
});
$('#quickCheckNext').addEventListener('click',()=>{quickCheckIndex++;renderQuickCheck();$('#quickCheckAnswer').focus({preventScroll:true})});
function format(n){return displayNumber(n)}
const latexFormulas={
  cube:['a^2','4a^2','6a^2','a\\sqrt{2}','a\\sqrt{3}','a^3'],
  tetra:['\\frac{\\sqrt{3}}{4}a^2','\\sqrt{3}a^2','\\sqrt{\\frac{2}{3}}a','\\frac{\\sqrt{6}}{4}a','\\frac{\\sqrt{2}}{12}a^3'],
  octa:['\\frac{\\sqrt{3}}{4}a^2','2\\sqrt{3}a^2','a\\sqrt{2}','\\frac{a}{\\sqrt{2}}','\\frac{\\sqrt{2}}{3}a^3'],
  dode:['\\frac{1}{4}\\sqrt{25+10\\sqrt{5}}a^2','3\\sqrt{25+10\\sqrt{5}}a^2','\\varphi a','\\frac{\\sqrt{3}(1+\\sqrt{5})}{4}a','\\frac{15+7\\sqrt{5}}{4}a^3'],
  ico:['\\frac{\\sqrt{3}}{4}a^2','5\\sqrt{3}a^2','\\frac{\\sqrt{10+2\\sqrt{5}}}{4}a','\\frac{5(3+\\sqrt{5})}{12}a^3'],
  triPrism:['\\frac{\\sqrt{3}}{4}a^2','3ah','2A_b+3ah','\\sqrt{a^2+h^2}','A_bh'],
  hexPrism:['\\frac{3\\sqrt{3}}{2}a^2','6ah','2A_b+6ah','2a','A_bh'],
  cuboct:['a^2','\\frac{\\sqrt{3}}{4}a^2','(6+2\\sqrt{3})a^2','a','\\frac{5\\sqrt{2}}{3}a^3'],
  truncOct:['a^2','\\frac{3\\sqrt{3}}{2}a^2','6(1+2\\sqrt{3})a^2','\\frac{\\sqrt{10}}{2}a','8\\sqrt{2}a^3'],
  truncCube:['\\frac{\\sqrt{3}}{4}a^2','2(1+\\sqrt{2})a^2','2(6+6\\sqrt{2}+\\sqrt{3})a^2','\\frac{\\sqrt{7+4\\sqrt{2}}}{2}a','\\frac{21+14\\sqrt{2}}{3}a^3']
};
function currentFormulas(){if(currentKey!=='customPrism')return latexFormulas[currentKey]||latexFormulas.cube;const n=customPrismSides;return[`\\frac{${n}}{4\\tan(\\pi/${n})}a^2`,`${n}ah`,`2A_b+${n}ah`,'\\sqrt{a^2+h^2}','A_bh']}
function renderMath(){const formulas=currentFormulas();$$('#resultsGrid .math-formula').forEach((el,i)=>katex.render(formulas[i]||'',el,{throwOnError:false,displayMode:true,strict:false}))}
function calculate(key,a,h){
  if(key==='customPrism'){const n=customPrismSides,c=n/(4*Math.tan(Math.PI/n)),base=c*a*a;return{items:[{label:'Área de una base',value:base,power:2},{label:'Área lateral',value:n*a*h,power:2},{label:'Área total',value:2*base+n*a*h,power:2},{label:'Diagonal lateral',value:Math.hypot(a,h),power:1},{label:'Volumen',value:base*h,power:3}],steps:[]}}
  const sq=a*a,cu=sq*a,tri=Math.sqrt(3)/4*sq;
  const table={
    cube:{items:[['Área de una cara',sq,2,'a²'],['Área lateral',4*sq,2,'4a²'],['Área total',6*sq,2,'6a²'],['Diagonal de cara',a*Math.SQRT2,1,'a√2'],['Diagonal espacial',a*Math.sqrt(3),1,'a√3'],['Volumen',cu,3,'a³']],steps:[`A cara = a² = ${format(a)}² = ${format(sq)}`,`A total = 6a² = 6(${format(sq)}) = ${format(6*sq)}`,`V = a³ = ${format(a)}³ = ${format(cu)}`]},
    tetra:{items:[['Área de una cara',tri,2,'√3/4 · a²'],['Área total',Math.sqrt(3)*sq,2,'√3 · a²'],['Altura',Math.sqrt(2/3)*a,1,'√(2/3) · a'],['Radio circunscrito',Math.sqrt(6)/4*a,1,'√6/4 · a'],['Volumen',Math.sqrt(2)/12*cu,3,'√2/12 · a³']],steps:[`A cara = (√3/4)a² = ${format(tri)}`,`A total = 4 · ${format(tri)} = ${format(Math.sqrt(3)*sq)}`,`V = (√2/12)a³ = ${format(Math.sqrt(2)/12*cu)}`]},
    octa:{items:[['Área de una cara',tri,2,'√3/4 · a²'],['Área total',2*Math.sqrt(3)*sq,2,'2√3 · a²'],['Distancia entre opuestos',Math.sqrt(2)*a,1,'a√2'],['Radio circunscrito',a/Math.sqrt(2),1,'a/√2'],['Volumen',Math.sqrt(2)/3*cu,3,'√2/3 · a³']],steps:[`A cara = (√3/4)a² = ${format(tri)}`,`A total = 8 · ${format(tri)} = ${format(2*Math.sqrt(3)*sq)}`,`V = (√2/3)a³ = ${format(Math.sqrt(2)/3*cu)}`]},
    dode:{items:[['Área de una cara',.25*Math.sqrt(25+10*Math.sqrt(5))*sq,2,'¼√(25+10√5)a²'],['Área total',3*Math.sqrt(25+10*Math.sqrt(5))*sq,2,'3√(25+10√5)a²'],['Diagonal pentagonal',PHI*a,1,'φa'],['Radio circunscrito',Math.sqrt(3)*(1+Math.sqrt(5))/4*a,1,'√3(1+√5)a/4'],['Volumen',(15+7*Math.sqrt(5))/4*cu,3,'(15+7√5)a³/4']],steps:[`A pentágono = ¼√(25+10√5)a² = ${format(.25*Math.sqrt(25+10*Math.sqrt(5))*sq)}`,`A total = 12 caras = ${format(3*Math.sqrt(25+10*Math.sqrt(5))*sq)}`,`V = (15+7√5)a³/4 = ${format((15+7*Math.sqrt(5))/4*cu)}`]},
    ico:{items:[['Área de una cara',tri,2,'√3/4 · a²'],['Área total',5*Math.sqrt(3)*sq,2,'5√3 · a²'],['Radio circunscrito',Math.sqrt(10+2*Math.sqrt(5))/4*a,1,'√(10+2√5)a/4'],['Volumen',5*(3+Math.sqrt(5))/12*cu,3,'5(3+√5)a³/12']],steps:[`A triángulo = (√3/4)a² = ${format(tri)}`,`A total = 20 · ${format(tri)} = ${format(5*Math.sqrt(3)*sq)}`,`V = 5(3+√5)a³/12 = ${format(5*(3+Math.sqrt(5))/12*cu)}`]},
    triPrism:{items:[['Área de una base',tri,2,'√3/4 · a²'],['Área lateral',3*a*h,2,'3ah'],['Área total',2*tri+3*a*h,2,'2Ab + 3ah'],['Diagonal lateral',Math.hypot(a,h),1,'√(a²+h²)'],['Volumen',tri*h,3,'Ab · h']],steps:[`A base = (√3/4)a² = ${format(tri)}`,`A lateral = perímetro · h = 3(${format(a)})(${format(h)}) = ${format(3*a*h)}`,`V = Ab · h = ${format(tri)}(${format(h)}) = ${format(tri*h)}`]},
    hexPrism:{items:[['Área de una base',3*Math.sqrt(3)/2*sq,2,'3√3/2 · a²'],['Área lateral',6*a*h,2,'6ah'],['Área total',3*Math.sqrt(3)*sq+6*a*h,2,'2Ab + 6ah'],['Diagonal mayor base',2*a,1,'2a'],['Volumen',3*Math.sqrt(3)/2*sq*h,3,'Ab · h']],steps:[`A base = (3√3/2)a² = ${format(3*Math.sqrt(3)/2*sq)}`,`A lateral = 6ah = 6(${format(a)})(${format(h)}) = ${format(6*a*h)}`,`V = Ab · h = ${format(3*Math.sqrt(3)/2*sq*h)}`]},
    cuboct:{items:[['Área cuadrada',sq,2,'a²'],['Área triangular',tri,2,'√3/4 · a²'],['Área total',(6+2*Math.sqrt(3))*sq,2,'(6+2√3)a²'],['Radio circunscrito',a,1,'a'],['Volumen',5*Math.sqrt(2)/3*cu,3,'5√2/3 · a³']],steps:[`6 cuadrados = 6a² = ${format(6*sq)}`,`8 triángulos = 8(√3/4)a² = ${format(2*Math.sqrt(3)*sq)}`,`A total = ${format((6+2*Math.sqrt(3))*sq)}; V = ${format(5*Math.sqrt(2)/3*cu)}`]},
    truncOct:{items:[['Área cuadrada',sq,2,'a²'],['Área hexagonal',3*Math.sqrt(3)/2*sq,2,'3√3/2 · a²'],['Área total',6*(1+2*Math.sqrt(3))*sq,2,'6(1+2√3)a²'],['Radio circunscrito',Math.sqrt(10)/2*a,1,'√10/2 · a'],['Volumen',8*Math.sqrt(2)*cu,3,'8√2 · a³']],steps:[`6 cuadrados = ${format(6*sq)}`,`8 hexágonos = ${format(12*Math.sqrt(3)*sq)}`,`A total = ${format(6*(1+2*Math.sqrt(3))*sq)}; V = ${format(8*Math.sqrt(2)*cu)}`]},
    truncCube:{items:[['Área triangular',tri,2,'√3/4 · a²'],['Área octagonal',2*(1+Math.SQRT2)*sq,2,'2(1+√2)a²'],['Área total',2*(6+6*Math.SQRT2+Math.sqrt(3))*sq,2,'2(6+6√2+√3)a²'],['Radio circunscrito',.5*Math.sqrt(7+4*Math.SQRT2)*a,1,'½√(7+4√2)a'],['Volumen',(21+14*Math.SQRT2)/3*cu,3,'(21+14√2)a³/3']],steps:[`8 triángulos = ${format(2*Math.sqrt(3)*sq)}`,`6 octágonos = ${format(12*(1+Math.SQRT2)*sq)}`,`A total = ${format(2*(6+6*Math.SQRT2+Math.sqrt(3))*sq)}; V = ${format((21+14*Math.SQRT2)/3*cu)}`]}
  };
  const raw=table[key]||table.cube;return{items:raw.items.map(([label,value,power,formula])=>({label,value,power,formula})),steps:raw.steps};
}
let knownDefinitions=[],knownSolid=null;
function renderFormulaLibrary(refreshOptions=true){
 const analysis=modelGroup.userData.analysis;if(!analysis)return;
 if(refreshOptions){
  const previous=$('#formulaTopic').value,topics=[['diagonals:0','Número de diagonales espaciales'],['vertexAngle:0','Ángulo poliedro en un vértice']];
  analysis.diedros.forEach((item,i)=>topics.push([`dihedral:${i}`,`Diedro interior · ${format(item.angle)}°`]));
  const distances=analysis.parallel.length?analysis.parallel:analysis.altitude?[analysis.altitude]:[];
  distances.forEach((item,i)=>topics.push([`distance:${i}`,`${analysis.parallel.length?'Caras opuestas':'Altura vértice a cara'} · tipo ${i+1}`]));
  const names={diameter:'Máxima distancia entre vértices',faceDiagonal:'Diagonal de cara',circumradius:'Centro a vértice',inradius:'Centro a cara',midradius:'Centro a arista'};
  Object.entries(analysis.lengths).forEach(([kind,options])=>(kind==='diameter'?options.slice(0,1):options).forEach((item,i)=>topics.push([`length:${i}:${kind}`,`${names[kind]} · tipo ${i+1}`])));
  $('#formulaTopic').innerHTML=topics.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
  if(topics.some(([value])=>value===previous))$('#formulaTopic').value=previous;
 }
 const [mode,index,metric]=$('#formulaTopic').value.split(':');
 $('#formulaTopicContent').innerHTML=insightFormula({analysis,key:currentKey,mode,index:Number(index),metric,a:edgeLength,h:prismHeight,unit:currentUnit}).replace('<a href="#medidas">Calcular desde otro dato →</a>','');
}
$('#formulaTopic').addEventListener('change',()=>renderFormulaLibrary(false));
function buildKnownDefinitions(){
 const prism=solids[currentKey].family==='Prismas',unitData=calculate(currentKey,1,1),analysis=modelGroup.userData.analysis;
 const definitions=[{id:'edge',label:'Arista a',power:1,factor:1,forward:()=>edgeLength}];
 if(!prism){
  unitData.items.forEach((item,i)=>definitions.push({id:`result-${i}`,label:item.label,power:item.power,factor:item.value,forward:()=>calculate(currentKey,edgeLength,prismHeight).items[i].value}));
  const names={diameter:'Máxima distancia entre vértices',circumradius:'Centro a vértice',inradius:'Centro a cara',midradius:'Centro a arista',faceDiagonal:'Diagonal de cara'};
  Object.entries(analysis.lengths).forEach(([kind,options])=>{
   // All maximum pairs have the same length; one definition is enough.
   const unique=kind==='diameter'?options.slice(0,1):options;
   unique.forEach((item,i)=>definitions.push({id:`geo-${kind}-${i}`,label:`${names[kind]}${unique.length>1?` · tipo ${i+1}`:''}`,power:1,factor:item.distance/analysis.referenceLength,forward:()=>edgeLength*item.distance/analysis.referenceLength}));
  });
  const distances=analysis.parallel.length?analysis.parallel:analysis.altitude?[analysis.altitude]:[];
  distances.forEach((item,i)=>definitions.push({id:`opposite-${i}`,label:`${analysis.parallel.length?'Distancia entre caras opuestas':'Altura vértice a cara'}${distances.length>1?` · tipo ${i+1}`:''}`,power:1,factor:item.distance/analysis.referenceLength,forward:()=>edgeLength*item.distance/analysis.referenceLength}));
 }else{
  const n=prismN(),c=n/(4*Math.tan(Math.PI/n));
  const span=Math.sin(Math.floor(n/2)*Math.PI/n)/Math.sin(Math.PI/n);
  const needHeight='Usa la altura h que figura debajo como segundo dato independiente. La altura se conserva al resolver.';
  definitions.push(
   {id:'height',label:'Altura h (con arista a conocida)',power:1,formula:'h=X',requirement:'Se conserva la arista a indicada debajo.',forward:()=>prismHeight,solve:x=>({a:edgeLength,h:x})},
   {id:'base',label:'Área de la base',power:2,formula:'A_b=ca^2,\\quad a=\\sqrt{\\frac{A_b}{c}}',forward:()=>c*edgeLength**2,solve:(x,h)=>({a:Math.sqrt(x/c),h})},
   {id:'volume',label:'Volumen (con altura h)',power:3,formula:'V=c a^2h,\\quad a=\\sqrt{\\frac{V}{ch}}',requirement:needHeight,forward:()=>c*edgeLength**2*prismHeight,solve:(x,h)=>({a:Math.sqrt(x/(c*h)),h})},
   {id:'lateral',label:'Área lateral (con altura h)',power:2,formula:`S_L=${n}ah,\\quad a=\\frac{S_L}{${n}h}`,requirement:needHeight,forward:()=>n*edgeLength*prismHeight,solve:(x,h)=>({a:x/(n*h),h})},
   {id:'total',label:'Área total (con altura h)',power:2,formula:`S_T=2ca^2+${n}ah`,extra:`a=\\frac{2S_T}{\\sqrt{(${n}h)^2+8cS_T}+${n}h}`,requirement:needHeight,forward:()=>2*c*edgeLength**2+n*edgeLength*prismHeight,solve:(x,h)=>({a:2*x/(Math.sqrt((n*h)**2+8*c*x)+n*h),h})},
   {id:'diameter',label:'Máxima distancia entre vértices (con h)',power:1,formula:`D^2=(${Number(span.toPrecision(8))}a)^2+h^2,\\quad a=\\frac{\\sqrt{D^2-h^2}}{${Number(span.toPrecision(8))}}`,requirement:`${needHeight} D debe ser mayor que h. El coeficiente es la mayor cuerda de la base dividida entre su lado.`,forward:()=>Math.hypot(span*edgeLength,prismHeight),solve:(x,h)=>{if(x<=h)throw Error('La distancia máxima D debe ser mayor que la altura h.');return{a:Math.sqrt(x*x-h*h)/span,h}}}
  );
  definitions.forEach(def=>{def.prismC=c});
 }
 return definitions;
}
function renderKnownData(resetValue=true){
 requestAnimationFrame(fitKnownQuantity);
 const def=knownDefinitions.find(item=>item.id===$('#knownQuantity').value);if(!def)return;
 $('#knownUnit').textContent=currentUnit+(def.power===2?'²':def.power===3?'³':'');
 const valueLabel=$('label[for="knownValue"]');valueLabel.firstChild.textContent=`${def.label} en `;
 if(resetValue){const raw=def.forward(),input=$('#knownValue');input.value=numericInput(raw);input.dataset.rawValue=String(raw);input.dataset.displayValue=input.value}
 $('#knownRequirement').innerHTML=(def.requirement||(def.id==='edge'?'Escribe cuánto mide la arista. Con ese valor calcularemos las demás medidas.':'Escribe el dato que ya conoces. Buscaremos la arista que produce ese resultado. Un ángulo o el número de caras no indica cuánto mide el sólido.'))+' <a href="#glosario/escala">Ver explicación y símbolos →</a>';
 const expressions=def.formula?[def.formula,...(def.extra?[def.extra]:[])]:[
  `\\underbrace{X}_{\\text{${def.label}}}=${Number(def.factor.toPrecision(8))}a${def.power>1?`^{${def.power}}`:''}`,
  def.power===1?'a=\\frac Xk':def.power===2?'a=\\sqrt{\\frac Xk}':'a=\\sqrt[3]{\\frac Xk}'
 ];
 if(def.prismC&&['base','volume','total'].includes(def.id))expressions.push(`c=\\frac{${prismN()}}{4\\tan(\\pi/${prismN()})}\\approx ${Number(def.prismC.toPrecision(8))}`);
 $('#knownFormula').innerHTML=def.id==='edge'?'<p><a href="#glosario/arista">a significa longitud de la arista.</a> No hace falta despejar una fórmula: ya conoces la arista.</p>':expressions.map(expression=>`<div class="geometry-math">${katex.renderToString(expression,{throwOnError:false,displayMode:true})}</div>`).join('')+`<p>X representa «${def.label}». a es la arista.${!def.formula?` El número ${Number(def.factor.toPrecision(8))} es el coeficiente k de la fórmula; ${def.power===1?'divide el dato por ese número':def.power===2?'divide el dato por ese número y toma la raíz cuadrada':'divide el dato por ese número y toma la raíz cúbica'}.`:def.prismC?' c es el coeficiente del área de la base y h es la altura.':''} <a href="#glosario/coeficiente">Entender los símbolos →</a></p>`;
 $('#knownFeedback').textContent='';
}
function refreshKnownData(){
 const previous=knownSolid===currentKey?$('#knownQuantity').value:'edge';knownDefinitions=buildKnownDefinitions();knownSolid=currentKey;
 $('#knownQuantity').innerHTML=knownDefinitions.map(def=>`<option value="${def.id}">${def.label}</option>`).join('');
 $('#knownQuantity').value=knownDefinitions.some(def=>def.id===previous)?previous:'edge';renderKnownData();
}
$('#knownQuantity').addEventListener('change',()=>renderKnownData());
$('#knownValue').addEventListener('input',()=>{delete $('#knownValue').dataset.rawValue});
$('#precisionSelect').addEventListener('change',()=>{
 const input=$('#knownValue'),typed=!input.dataset.rawValue,saved=input.value;
 setPrecision($('#precisionSelect').value);updateMeasurements();
 $('#measureLab').classList.toggle('high-precision',Number($('#precisionSelect').value)>=6);
 if(typed){input.value=saved;delete input.dataset.rawValue}
 $('#precisionNote').textContent=$('#precisionSelect').value==='12'?'Hasta 12 decimales: sigue siendo una aproximación, no un valor exacto.':'Solo se redondea lo mostrado; el dato automático conserva su precisión interna. Si lo editas, se usa tu valor.';
});
$('#knownDataForm').addEventListener('submit',event=>{
 event.preventDefault();const def=knownDefinitions.find(item=>item.id===$('#knownQuantity').value),input=$('#knownValue'),value=Number(input.dataset.rawValue&&input.value===input.dataset.displayValue?input.dataset.rawValue:input.value);
 try{
  const result=solveKnown({definition:def,value,height:prismHeight,baseEdge:edgeLength});
  if(!Number.isFinite(result.a)||!Number.isFinite(result.h)||result.a<=0||result.h<=0)throw Error('Los datos no forman un sólido válido. Comprueba el dato y la altura.');
  if(result.a<.1||result.h<.1||result.a>1000||result.h>1000)throw Error('Con estos datos, la arista o la altura queda fuera del intervalo admitido: 0,1 a 1000 unidades.');
  $('#edgeInput').value=Number(result.a.toPrecision(12));$('#heightInput').value=Number(result.h.toPrecision(12));updateMeasurements();
  $('#knownFeedback').textContent=`De ${def.label.toLowerCase()} = ${format(value)} ${currentUnit}${def.power===2?'²':def.power===3?'³':''}, se obtiene a = ${format(result.a)} ${currentUnit}${solids[currentKey].family==='Prismas'?` y h = ${format(result.h)} ${currentUnit}`:''}. El modelo y todas las medidas se actualizaron.`;
  if(!def.solve){const x=Number(value.toPrecision(10)),k=Number(def.factor.toPrecision(8)),formula=def.power===1?`a=\\frac{${x}}{${k}}`:def.power===2?`a=\\sqrt{\\frac{${x}}{${k}}}`:`a=\\sqrt[3]{\\frac{${x}}{${k}}}`;$('#knownFeedback').insertAdjacentHTML('beforeend',`<div class="geometry-math">${katex.renderToString(`${formula}\\approx ${mathNumber(result.a)}\\;\\mathrm{${currentUnit}}`,{throwOnError:false,displayMode:true})}</div>`)}
  $('#knownFeedback').dataset.state='success';
 }catch(error){$('#knownFeedback').textContent=error.message;$('#knownFeedback').dataset.state='error'}
});
function updateMeasurements(){
  edgeLength=Math.max(.1,Number($('#edgeInput').value)||.1);prismHeight=Math.max(.1,Number($('#heightInput').value)||.1);currentUnit=$('#unitSelect').value;
  if(solids[currentKey].family==='Prismas'&&Math.abs(modelGroup.userData.prismRatio-prismHeight/edgeLength)>1e-6){buildModel();buildFoldingNet()}
  const data=calculate(currentKey,edgeLength,prismHeight),unit=p=>p===3?`${currentUnit}³`:p===2?`${currentUnit}²`:currentUnit;
  $('#resultsGrid').innerHTML=data.items.map(x=>`<div class="result-card"><span>${x.label.toUpperCase()}</span><strong>${format(x.value)} <small>${unit(x.power)}</small></strong><div class="math-formula" aria-label="Fórmula: ${x.formula}"></div></div>`).join('');
  const formulas=currentFormulas();
  $('#substitutionSteps').innerHTML=data.items.map((item,i)=>{
    const displayNumber=value=>Number(value.toPrecision(10)).toString();
    const substitute=formulas[i].replace(/A_b/g,`(${displayNumber(data.items[0].value)})`).replace(/(\\[A-Za-z]+)|[ah]/g,(token,command)=>command||`(${displayNumber(token==='a'?edgeLength:prismHeight)})`);
    const numeric=format(item.value).replace(/,/g,'{,}');
    const expression=`${substitute} \\approx ${numeric}\\,\\mathrm{${currentUnit}}${item.power>1?`^{${item.power}}`:''}`;
    return `<section class="calculation-step"><h3><span>${i+1}</span>${item.label}</h3><p>Con a = ${format(edgeLength)} ${currentUnit}${currentKey.includes('Prism')?` y h = ${format(prismHeight)} ${currentUnit}`:''}</p><div class="step-math">${katex.renderToString(expression,{throwOnError:false,displayMode:true})}</div></section>`;
  }).join('');
  renderMath();$('#growthBadge').textContent=`a = ${format(edgeLength)} ${currentUnit}`;renderNet();updateGeometryInsights();refreshKnownData();renderFormulaLibrary();
}

$$('.family-tab').forEach(b=>b.addEventListener('click',()=>{const family=b.dataset.family;$$('.family-tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b)});currentKey=familyOrder[family][0];renderCatalog(family);selectSolid(currentKey)}));
$$('.tool-btn').forEach(b=>b.addEventListener('click',()=>{viewMode=b.dataset.view;$$('.tool-btn').forEach(x=>x.classList.toggle('active',x===b));updateViewMode()}));
$$('[data-space]').forEach(b=>b.addEventListener('click',()=>switchSpace(b.dataset.space)));
$('#resetView').addEventListener('click',()=>{solidAutoFit=true;fitSolidView(true)});
function zoomSolid(factor){solidAutoFit=false;const offset=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update()}
$('#solidZoomIn').addEventListener('click',()=>zoomSolid(.8));$('#solidZoomOut').addEventListener('click',()=>zoomSolid(1.25));
renderer.domElement.addEventListener('dblclick',()=>$('#resetView').click());
$('#autoRotate').addEventListener('click',()=>{autoRotate=!autoRotate;const button=$('#autoRotate');button.textContent=autoRotate?'Ⅱ':'▶';button.setAttribute('aria-pressed',String(autoRotate));button.setAttribute('aria-label',autoRotate?'Pausar rotación automática':'Iniciar rotación automática');button.title=button.getAttribute('aria-label')});
$('#foldPlay').addEventListener('click',()=>{foldingNet.toggle();updateFoldButton()});
$('#foldRange').addEventListener('input',e=>{foldingNet.playing=false;foldingNet.update(Number(e.target.value)/100);updateFoldButton()});
$$('[data-net-feature]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.netFeature;netLayers[key]=!netLayers[key];applyNetLayers();const d=solids[currentKey],messages={faces:`${d.name}: ${d.faces} caras ${d.face.toLowerCase()}.`,vertices:`${d.name}: ${d.vertices} vértices al quedar plegado.`,edges:`${d.name}: ${d.edges} aristas; continuas para cortar y punteadas para doblar.`,measure:`La arista coral mide ${format(edgeLength)} ${currentUnit}; todas las aristas tienen la misma longitud.`};$('#foldStatus').textContent=netLayers[key]?messages[key]:`${button.querySelector('span').textContent} ocultos`}));
let netInteractionMode='move';
function setNetInteractionMode(mode){netInteractionMode=mode;$('#netSvg').classList.toggle('rotate-mode',mode==='rotate');[['#netMoveMode','move'],['#netRotateMode','rotate']].forEach(([selector,value])=>{const button=$(selector),active=value===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});$('#foldStatus').textContent=mode==='move'?'Modo mover: arrastra la plantilla por el plano.':'Modo girar: arrastra hacia los lados para rotar la plantilla.'}
$('#netZoomIn').addEventListener('click',()=>changeNetZoom(.16));$('#netZoomOut').addEventListener('click',()=>changeNetZoom(-.16));$('#netMoveMode').addEventListener('click',()=>setNetInteractionMode('move'));$('#netRotateMode').addEventListener('click',()=>setNetInteractionMode('rotate'));$('#netReset').addEventListener('click',()=>{resetNetView();$('#foldStatus').textContent='Desarrollo centrado en su posición inicial'});
const netSvg=$('#netSvg'),netPointers=new Map();let netDrag=null,netMoved=false,netPinch=null;
new ResizeObserver(()=>applyNetView()).observe(netSvg.parentElement);
netSvg.addEventListener('pointerdown',e=>{if(foldingNet.progress>.015)return;netSvg.setPointerCapture(e.pointerId);netPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});netMoved=false;if(netPointers.size===1)netDrag={x:e.clientX,y:e.clientY,startX:netView.x,startY:netView.y,startRotation:netView.rotation};if(netPointers.size===2){const p=[...netPointers.values()];netPinch={distance:Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y),scale:netView.scale}}});
netSvg.addEventListener('pointermove',e=>{if(!netPointers.has(e.pointerId))return;netPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(netDrag&&Math.hypot(e.clientX-netDrag.x,e.clientY-netDrag.y)>4)netMoved=true;if(netPointers.size===2&&netPinch){netMoved=true;const p=[...netPointers.values()],distance=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);netView.scale=Math.max(.65,Math.min(2.8,netPinch.scale*distance/netPinch.distance));applyNetView()}else if(netDrag&&netMoved){const rect=netSvg.getBoundingClientRect();if(netInteractionMode==='rotate')netView.rotation=netDrag.startRotation+(e.clientX-netDrag.x)*.45;else{netView.x=netDrag.startX+(e.clientX-netDrag.x);netView.y=netDrag.startY+(e.clientY-netDrag.y)}applyNetView()}});
const endNetPointer=e=>{netPointers.delete(e.pointerId);if(!netPointers.size){netDrag=null;netPinch=null}};netSvg.addEventListener('pointerup',endNetPointer);netSvg.addEventListener('pointercancel',endNetPointer);
netSvg.addEventListener('wheel',e=>{if(foldingNet.progress>.015)return;e.preventDefault();changeNetZoom(e.deltaY<0?.12:-.12)},{passive:false});
netSvg.addEventListener('click',e=>{if(netMoved||foldingNet.progress>.015)return;$$('#netSvg .selected').forEach(x=>x.classList.remove('selected'));const target=e.target.closest('[data-face],[data-vertex],[data-edge]');if(!target)return;target.classList.add('selected');const d=solids[currentKey];if(target.dataset.face)$('#foldStatus').textContent=`Una de las ${d.faces} caras: ${d.face.toLowerCase()}.`;else if(target.dataset.vertex)$('#foldStatus').textContent=`Punto de la plantilla: al plegar, coincide con uno de los ${d.vertices} vértices.`;else $('#foldStatus').textContent=`Arista señalada: una de las ${d.edges} aristas del sólido; mide ${format(edgeLength)} ${currentUnit}.`});
$$('[data-fullscreen]').forEach(button=>button.addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen?.():$('#laboratorio').requestFullscreen?.()));
$('#copyFormula').addEventListener('click',async()=>{const d=solids[currentKey],values=calculate(currentKey,edgeLength,prismHeight);await navigator.clipboard.writeText(`${d.name}\nArista: ${format(edgeLength)} ${currentUnit}\n${values.items.map(x=>`${x.label}: ${format(x.value)} ${x.power===3?currentUnit+'³':x.power===2?currentUnit+'²':currentUnit}`).join('\n')}\nEuler: ${d.faces} + ${d.vertices} − ${d.edges} = 2`);showToast('Resultados copiados')});

const guideSteps=[
  {title:'Explora con tus manos',text:'Gira el poliedro en cualquier dirección y acerca la cámara. La manipulación espacial te ayuda a construir una imagen mental sólida.',cards:[['Girar','Arrastra sobre el modelo.'],['Acercar','Usa la rueda o pellizca con dos dedos.']]},
  {title:'Identifica sus elementos',text:'Observa caras, vértices y aristas. Activa cada modo de visualización para aislar lo que estás contando.',cards:[['Caras','Son los polígonos que forman la superficie.'],['Aristas y vértices','Las aristas unen caras; los vértices son sus puntos de encuentro.']]},
  {title:'Comprueba a Euler',text:'La ficha calcula C + V − A. En todos los poliedros convexos el resultado es 2.',cards:[['Prueba visual','Cambia de sólido y comprueba que el resultado no varía.'],['Pregunta clave','¿Qué tendría que ocurrir para que dejara de cumplirse?']]},
  {title:'Del espacio al papel',text:'Cambia a Desarrollo 2D para estudiar la red sin mezclarla con el sólido. Imagina qué aristas volverán a tocarse al plegarla.',cards:[['Comparar','Alterna entre Vista 3D y Desarrollo 2D.'],['Construir','Descarga la plantilla desde Taller.']]},
  {title:'Demuestra que lo sabes',text:'Entra a Retos y deduce el sólido a partir de pistas. La retroalimentación explica la propiedad decisiva.',cards:[['Sin memorizar','Relaciona estructura, no solo nombres.'],['Vuelve a explorar','Puedes cerrar el reto y comprobar cualquier pista en 3D.']]}
];
function renderGuide(){const s=guideSteps[guideStep];$('#guideStepLabel').textContent=`PASO ${guideStep+1} DE ${guideSteps.length}`;$('#guideProgress').innerHTML=guideSteps.map((_,i)=>`<i class="${i<=guideStep?'active':''}"></i>`).join('');$('#guideContent').innerHTML=`<div class="guide-hero"><div class="guide-number">${guideStep+1}</div><div class="guide-copy"><h2>${s.title}</h2><p>${s.text}</p></div></div><div class="guide-grid">${s.cards.map(c=>`<div><b>${c[0]}</b><p>${c[1]}</p></div>`).join('')}</div>`;$('#guidePrev').disabled=guideStep===0;$('#guideNext').textContent=guideStep===guideSteps.length-1?'Ir al laboratorio ✓':'Siguiente →'}
$('#guidePrev').addEventListener('click',()=>{guideStep=Math.max(0,guideStep-1);renderGuide()});$('#guideNext').addEventListener('click',()=>{if(guideStep===guideSteps.length-1){navigateTo('laboratorio');return}guideStep++;renderGuide()});

let disposePolarLesson=()=>{};
const theory={
...polarTheory,
basics:`<div class="concept-card"><span class="modal-label">IDEA CENTRAL</span><h2>Un poliedro es una superficie cerrada hecha de polígonos</h2><p>Cada polígono es una <strong>cara</strong>; dos caras se encuentran en una <strong>arista</strong>, y varias aristas coinciden en un <strong>vértice</strong>.</p></div><h3>¿Qué no es un poliedro?</h3><p>Una esfera, un cilindro y un cono tienen superficies curvas. Son cuerpos geométricos, pero no poliedros.</p><h3>Clasificación útil</h3><table class="compare-table"><tr><th>FAMILIA</th><th>CARACTERÍSTICA</th><th>EJEMPLO</th></tr><tr><td>Regulares</td><td>Todas las caras y vértices son equivalentes</td><td>Cubo</td></tr><tr><td>Prismas</td><td>Dos bases paralelas e iguales</td><td>Prisma hexagonal</td></tr><tr><td>Arquimedianos</td><td>Caras regulares de más de un tipo</td><td>Cuboctaedro</td></tr></table>`,
regular:`<div class="concept-card"><span class="modal-label">SOLO EXISTEN CINCO</span><h2>Los sólidos platónicos</h2><p>En un poliedro regular, todas las caras son polígonos regulares congruentes y en cada vértice se reúne exactamente la misma configuración.</p></div><table class="compare-table"><tr><th>SÓLIDO</th><th>CARAS</th><th>CONFIGURACIÓN</th></tr>${familyOrder.Platónios.map(k=>`<tr><td>${solids[k].name}</td><td>${solids[k].faces} ${solids[k].face.toLowerCase()}</td><td>${solids[k].atVertex}</td></tr>`).join('')}</table><h3>¿Por qué no hay más?</h3><p>Los ángulos de las caras que llegan a un vértice deben sumar menos de 360°. Esa condición deja únicamente cinco combinaciones posibles.</p>`,
euler:`<div class="concept-card"><span class="modal-label">UNA REGLA UNIVERSAL</span><h2>Caras + vértices − aristas = 2</h2><p>Leonhard Euler descubrió que todos los poliedros convexos comparten esta relación topológica.</p></div><div class="visual-equation">C + V − A = 2</div><p>En un cubo: 6 + 8 − 12 = 2. Al deformar el cubo sin abrir agujeros ni pegar caras, el resultado se conserva.</p><h3>Úsala para encontrar un dato perdido</h3><p>Si sabes que un prisma tiene 7 caras y 10 vértices: A = C + V − 2 = 7 + 10 − 2 = 15 aristas.</p>`,
angles:`<div class="concept-card"><span class="modal-label">ENTRE DOS CARAS</span><h2>El ángulo diedro mide la apertura de una arista</h2><p>Imagina dos páginas de un libro. La arista es el lomo y el ángulo entre las páginas es un <strong>ángulo diedro</strong>.</p></div><h3>Interpretación</h3><p>Un ángulo de 90° aparece entre dos caras vecinas del cubo. Cuanto más se aproxima a 180°, más “plana” parece la unión.</p><h3>Cómo observarlo</h3><p>Activa Rayos X y gira el sólido hasta mirar casi en la dirección de una arista. Compara la abertura interior entre las dos caras.</p>`,
nets:`<div class="concept-card"><span class="modal-label">3D ↔ 2D</span><h2>Una red plana conserva todas las caras y conexiones</h2><p>Al cortar algunas aristas y abrir las caras sin separarlas obtenemos una plantilla plana que puede volver a plegarse.</p></div><h3>No toda colección de polígonos funciona</h3><p>Las caras deben estar conectadas por las aristas correctas y no pueden superponerse cuando se pliegan. Un cubo tiene exactamente 11 redes distintas.</p><h3>Estrategia para comprobar una red</h3><ol><li>Elige una cara como base.</li><li>Predice qué cara quedará opuesta.</li><li>Marca las aristas que se unirán.</li><li>Simula el plegado desde el centro hacia afuera.</li></ol>`};
function renderTheory(key){disposePolarLesson();disposePolarLesson=()=>{};$$('[data-theory]').forEach(b=>{const active=b.dataset.theory===key;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});$('#theoryContent').innerHTML=theory[key]+(['dual','polar'].includes(key)?'':contextualTheory(solids[currentKey],modelGroup.userData.analysis,key,format,currentUnit,edgeLength));if(['dual','polar'].includes(key))disposePolarLesson=mountPolarLesson(key,{currentAnalysis:modelGroup.userData.analysis,currentName:solids[currentKey].name,format,getExample:example=>{const geometry=geometryFor(solids[example].geometry);geometry.center();const analysis=analyzeSolid(geometry);geometry.dispose();return{analysis,name:solids[example].name}}})}

const generalChallenges=[
 {q:'Tengo 6 caras cuadradas, 8 vértices y todas mis aristas miden lo mismo. ¿Quién soy?',a:'Cubo',opts:['Cubo','Octaedro','Prisma triangular','Dodecaedro'],why:'El cubo es el único sólido regular formado por seis cuadrados.'},
 {q:'En mí se encuentran cinco triángulos equiláteros en cada vértice. Tengo 20 caras.',a:'Icosaedro',opts:['Tetraedro','Icosaedro','Octaedro','Cuboctaedro'],why:'El icosaedro reúne cinco triángulos en cada uno de sus 12 vértices.'},
 {q:'Si tengo 12 caras y 30 aristas, ¿cuántos vértices exige la relación de Euler?',a:'20',opts:['18','20','24','44'],why:'C + V − A = 2, por tanto 12 + V − 30 = 2 y V = 20.'},
 {q:'Mis caras son pentágonos regulares y soy dual del icosaedro.',a:'Dodecaedro',opts:['Octaedro','Dodecaedro','Cubo','Prisma hexagonal'],why:'El dodecaedro tiene 12 pentágonos; al intercambiar caras y vértices se obtiene un icosaedro.'},
 {q:'Tengo dos bases triangulares paralelas y tres caras laterales rectangulares.',a:'Prisma triangular',opts:['Tetraedro','Octaedro','Prisma triangular','Cuboctaedro'],why:'Todo prisma se identifica por sus dos bases congruentes y paralelas.'}
];
let challenges=generalChallenges,challengeSolidKey=null;
function renderChallenge(){answered=false;const c=challenges[challengeStep];$('#challengeContent').innerHTML=`<h2 class="challenge-title">${$('#challengeScope').value==='solid'?'Practica con '+solids[challengeSolidKey].name:'Lee las pistas y deduce'}</h2><div class="challenge-clue"><span>PISTA ${challengeStep+1} DE ${challenges.length}</span><p>${c.q}</p></div><div class="answers">${c.opts.map(o=>`<button class="answer-btn" data-answer="${o}">${o}</button>`).join('')}</div><p class="feedback">Elige una respuesta.</p><div class="challenge-foot"><div class="challenge-dots">${challenges.map((_,i)=>`<i class="${i<challengeStep?'done':''}"></i>`).join('')}</div><button id="nextChallenge" class="primary-btn" disabled>${challengeStep===challenges.length-1?'Ver resultado':'Siguiente →'}</button></div>`;$$('.answer-btn').forEach(b=>b.addEventListener('click',()=>answerChallenge(b)));$('#nextChallenge').addEventListener('click',()=>{if(challengeStep===challenges.length-1){$('#challengeContent').innerHTML=`<div class="concept-card"><span class="modal-label">RETO COMPLETADO</span><h2>${score} de ${challenges.length} respuestas correctas</h2><p>${score===5?'Excelente: conectaste propiedades, conteos y nombres.':'Buen intento. Vuelve al laboratorio, compara los sólidos y repite cuando quieras.'}</p></div><footer><button class="primary-btn" id="retryChallenge">Repetir retos</button></footer>`;$('#scorePill').textContent=`${score}/5`;$('#retryChallenge').addEventListener('click',()=>{score=0;challengeStep=0;renderChallenge()});return}challengeStep++;renderChallenge()})}
function refreshChallengeScope(){
 const personal=$('#challengeScope').value==='solid';
 $('#challengeScope option[value="solid"]').textContent=`${solids[currentKey].name} · cinco retos`;
 if(personal&&challengeSolidKey!==currentKey){challenges=solidChallenges(solids[currentKey],modelGroup.userData.analysis);challengeSolidKey=currentKey;challengeStep=0;score=0;$('#scorePill').textContent='0/5';renderChallenge()}
}
$('#challengeScope').addEventListener('change',()=>{challengeSolidKey=null;challenges=generalChallenges;challengeStep=0;score=0;$('#scorePill').textContent='0/5';if($('#challengeScope').value==='solid')refreshChallengeScope();else renderChallenge()});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-explore-mission]');if(!button)return;
 const mission=button.dataset.exploreMission;
 if(mission==='net'){switchSpace('2d');panelCollapsed['2d']=false;applyPanelState();resetNetView()}
 else {switchSpace('3d');panelCollapsed['3d']=false;applyPanelState();
  if(mission==='vertices'){insightMode=null;viewMode='vertices';$$('.tool-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='vertices'));updateGeometryInsights()}
  else {insightMode=mission;insightIndex=0;updateGeometryInsights()}
 }
 navigateTo('laboratorio');requestAnimationFrame(()=>requestAnimationFrame(()=>$('.stage').scrollIntoView({block:'center'})));
});
function answerChallenge(btn){if(answered)return;answered=true;const c=challenges[challengeStep],ok=btn.dataset.answer===c.a;if(ok)score++;btn.classList.add(ok?'correct':'wrong');if(!ok)$$('.answer-btn').find(b=>b.dataset.answer===c.a)?.classList.add('correct');$('.feedback').innerHTML=`<b>${ok?'¡Correcto!':'Casi.'}</b> ${c.why}`;$('#nextChallenge').disabled=false;$('#scorePill').textContent=`${score}/${challenges.length}`}

const printWorkshop=initPrinting({getName:()=>solids[currentKey].name,getTemplate:()=>$('#workshopSvg')});
const resourceRoutes={theory:'teoria/fundamentos',measure:'medidas',workshop:'imprimir',challenge:'retos',guide:'guia'};
$$('[data-open]').forEach(b=>b.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();navigateTo(resourceRoutes[b.dataset.open])}));
$$('[data-scroll]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'center'})));['edgeInput','heightInput','unitSelect'].forEach(id=>$(`#${id}`).addEventListener('input',updateMeasurements));
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2200)}

const pageLabels={inicio:'Sólidos geométricos',laboratorio:'Laboratorio de poliedros',redondos:'Cuerpos redondos',espacio:'Ángulos en el espacio',teoria:'Teoría de poliedros',medidas:'Medidas y cálculos',imprimir:'Taller de impresión',retos:'Retos de poliedros',guia:'Guía del laboratorio',glosario:'Glosario de geometría',apariencia:'Apariencia y lectura'};
let roundLab;
createRevolutionPage();let revolutionLab;pageLabels.revolucion='Revolución y Pappus‑Guldin';
document.querySelector('.module-navigation').insertAdjacentHTML('beforeend','<a href="#revolucion" data-module="revolucion">Revolución y Pappus</a>');
const roundPrintWorkshop=initRoundPrinting(()=>roundLab?.state);
// Keep the shared credit after pages created dynamically as well as static pages.
document.body.append(document.querySelector('.site-footer'));
pageLabels['imprimir-redondos']='Imprimir cuerpos redondos';
const theoryRoutes={fundamentos:'basics',regulares:'regular',euler:'euler',angulos:'angles',desarrollos:'nets',conjugados:'dual',polares:'polar'};
const measureAnchor=document.createComment('measure-lab-home');$('#measureLab').before(measureAnchor);
const pageScroll=new Map();let activeRoute='laboratorio';
function navigateTo(route){if(!route)return;if(location.hash.slice(1)===route)showCurrentPage();else location.hash=route}
function initPageNavigation(){
 $$('[data-resource-page]').forEach(page=>{
  page.querySelector('.resource-header').innerHTML=`<div class="resource-heading"><span class="eyebrow">GEOMETRÍA ESPACIAL · SISTEMA ZENIT</span><h1 tabindex="-1">${pageLabels[page.dataset.resourcePage]}</h1></div>`;
 });
 document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();navigateTo('inicio');pageScroll.set('inicio',0);window.scrollTo(0,0)});
}
function showCurrentPage(){
 const requested=location.hash.slice(1)||'inicio',parts=requested.split('/');
 const base=Object.hasOwn(pageLabels,parts[0])?parts[0]:'inicio';
 const route=base==='teoria'?`teoria/${Object.hasOwn(theoryRoutes,parts[1])?parts[1]:'fundamentos'}`:base==='redondos'&&['cylinder','cone','sphere'].includes(parts[1])?`redondos/${parts[1]}`:base;
 pageScroll.set(activeRoute,window.scrollY);
 const laboratory=base==='laboratorio';
 if(!laboratory){foldingNet.playing=false;updateFoldButton()}
 // Move the existing calculator so its inputs and listeners remain identical on return.
 if(base==='medidas'){$('#measurePageContent').append($('#measureLab'));$('#measureSolidName').textContent=solids[currentKey].name}
 else measureAnchor.after($('#measureLab'));
 document.querySelector('.app-shell').hidden=!laboratory;
 $$('[data-resource-page]').forEach(page=>{page.hidden=page.dataset.resourcePage!==base});
 document.body.classList.toggle('resource-route',!laboratory);
 document.body.classList.remove('workshop-route');
 if(base==='teoria')renderTheory(theoryRoutes[route.split('/')[1]]);
 else{disposePolarLesson();disposePolarLesson=()=>{}}
 if(base==='retos')refreshChallengeScope();
 if(base==='glosario')openGlossaryTerm(parts[1]);
 if(base==='imprimir'){renderNet();printWorkshop.prepare()}
 if(base==='imprimir-redondos')roundPrintWorkshop.prepare();
 if(base==='redondos'){roundLab??=initRoundSolids();roundLab.activate(parts[1])}else roundLab?.deactivate();
 if(base==='revolucion'){revolutionLab??=initRevolution();revolutionLab.activate(parts[1],roundLab?.state)}else revolutionLab?.deactivate();
 $$('[data-page-nav]').forEach(link=>{if(link.dataset.pageNav===base)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 const module=['inicio','redondos','espacio','revolucion'].includes(base)?base:base==='teoria'&&['angulos','polares','conjugados'].includes(parts[1])?'espacio':'laboratorio';
 $$('[data-module]').forEach(link=>{if(link.dataset.module===module)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 document.title=base==='inicio'?'Sólidos geométricos · Zenit':`${pageLabels[base]} · Sólidos geométricos Zenit`;
 document.querySelector('.site-resources').open=false;
 activeRoute=route;
 if(!laboratory)document.querySelector('[data-resource-page]:not([hidden]) h1').focus({preventScroll:true});
 requestAnimationFrame(()=>{if(laboratory){resize();applyNetView()}if(base!=='glosario'||!parts[1])window.scrollTo(0,pageScroll.get(route)||0)});
}
renderCatalog('Platónios');selectSolid('ico');renderGuide();renderTheory('basics');renderChallenge();resize();
initPageNavigation();
initHomePresentation();
document.querySelector('.solid-classification').insertAdjacentHTML('beforeend','<p><a href="#revolucion">Explorar generación por giro y teoremas de Pappus‑Guldin →</a></p>');
initAppearance(()=>{fitKnownQuantity();resize();applyNetView()});
window.addEventListener('hashchange',showCurrentPage);
showCurrentPage();
