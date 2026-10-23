import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import katex from 'katex';
import { RoundFolding } from './round-folding.js';
import { roundElements, roundInsight, drawRoundElements } from './round-insights.js';

const definitions={cylinder:{name:'Cilindro recto',intro:'Dos bases circulares iguales y paralelas, unidas por una superficie lateral curva.',bases:2},cone:{name:'Cono recto',intro:'Una base circular y una superficie lateral que llega a un vértice. Su eje pasa por el centro de la base.',bases:1},sphere:{name:'Esfera',intro:'Todos los puntos de su superficie están a la misma distancia del centro. No tiene bases, aristas ni vértices.',bases:0}};
const math=s=>`<div class="geometry-math">${katex.renderToString(s,{throwOnError:false,displayMode:true})}</div>`;
export function roundMeasures(type,r,h){const base=Math.PI*r*r,g=Math.hypot(r,h);if(type==='sphere')return[{name:'Diámetro',value:2*r,power:1,formula:'2r'},{name:'Área de la superficie',value:4*base,power:2,formula:'4\\pi r^2'},{name:'Volumen',value:4/3*base*r,power:3,formula:'\\frac43\\pi r^3'}];return[{name:'Área de una base',value:base,power:2,formula:'\\pi r^2'},...(type==='cone'?[{name:'Generatriz',value:g,power:1,formula:'\\sqrt{r^2+h^2}'}]:[]),{name:'Área lateral',value:type==='cone'?Math.PI*r*g:2*Math.PI*r*h,power:2,formula:type==='cone'?'\\pi r g':'2\\pi r h'},{name:'Área total',value:type==='cone'?base+Math.PI*r*g:2*base+2*Math.PI*r*h,power:2,formula:type==='cone'?'\\pi r^2+\\pi r g':'2\\pi r^2+2\\pi r h'},{name:'Volumen',value:base*h/(type==='cone'?3:1),power:3,formula:type==='cone'?'\\frac13\\pi r^2h':'\\pi r^2h'}]}
export function solveRound(type,datum,value,h){if(!Number.isFinite(value)||value<=0)throw Error('Escribe una medida mayor que cero.');switch(datum){case'diameter':return value/2;case'circumference':return value/(2*Math.PI);case'base':return Math.sqrt(value/Math.PI);case'volume':return type==='sphere'?Math.cbrt(3*value/(4*Math.PI)):Math.sqrt(value*(type==='cone'?3:1)/(Math.PI*h));default:return value}}

export function initRoundSolids(){
 const $=id=>document.getElementById(id),state={type:'cylinder',r:3,h:6,unit:'cm',decimals:2,view:'3d',feature:'radius',section:0,rotate:false};
 Object.assign(state,{fold:0,playing:false,direction:1,netTool:'move'});
 Object.assign(state,{elements:new Set(['radius']),angle:60,lower:-30,panelOpen:true,section:30});
 const folding=new RoundFolding();
 $('roundNetFormula').nextElementSibling.id='roundInteractionHint';
 $('roundViewport').insertAdjacentHTML('beforebegin','<div id="roundFoldControls" class="round-fold-controls" hidden><div class="round-net-tools" role="group" aria-label="Manipular el desarrollo"><button id="roundMove" aria-pressed="true">✋ Mover</button><button id="roundTurn" aria-pressed="false">↻ Girar</button></div><button id="roundFoldPlay" class="primary-btn">▶ Plegar</button><label for="roundFoldProgress">Plegado <output id="roundFoldPercent">0 %</output><input id="roundFoldProgress" type="range" min="0" max="100" step="0.1" value="0"></label><label>Velocidad<select id="roundFoldSpeed"><option value="0.5">Lenta</option><option value="1" selected>Normal</option><option value="2">Rápida</option></select></label></div>');
 const banner=document.querySelector('.round-banner'),toolbar=banner.querySelector('.round-toolbar'),tabs=toolbar.querySelector('[role="tablist"]');
 banner.classList.add('viewer-header');toolbar.classList.add('viewer-actions');tabs.classList.add('viewer-tabs');toolbar.append(tabs);toolbar.prepend($('roundFoldControls'));
 const speedField=$('roundFoldSpeed').closest('label');speedField.className='round-speed-control';speedField.htmlFor='roundFoldSpeed';toolbar.insertBefore(speedField,tabs);
 $('roundFoldSpeed').setAttribute('aria-label','Velocidad de animación: giro 3D o plegado 2D');speedField.title='Controla el giro automático en 3D y el plegado en 2D';
 tabs.insertAdjacentHTML('beforebegin','<button id="roundPanelToggle" class="panel-toggle" aria-expanded="true" aria-controls="roundElementPanel">Ocultar panel</button>');
 const layout=document.createElement('div');layout.className='round-visual-layout';$('roundViewport').before(layout);
 layout.innerHTML='<aside id="roundElementPanel" class="round-element-panel" aria-label="Elementos del cuerpo redondo"><span class="eyebrow">EXPLORA EL SÓLIDO</span><h3>Mostrar elementos</h3><p>Activa u oculta cada elemento.</p><div id="roundElementChoices"></div><div id="roundParameterControls"></div><button id="roundClearElements" class="ghost-btn">Ocultar elementos</button></aside>';
 layout.prepend($('roundViewport'));$('roundParameterControls').append($('roundSectionField'));
 const elementHeading=document.createElement('div');elementHeading.className='round-element-heading';
 $('roundElementPanel').prepend(elementHeading);elementHeading.append($('roundElementPanel').querySelector('.eyebrow'),$('roundElementPanel').querySelector('h3'),$('roundElementPanel').querySelector('p'));
 elementHeading.append($('roundClearElements'));
 // Only the figure and its permanent controls enter fullscreen, never lessons.
 const focus=document.createElement('div');focus.id='roundFigureView';focus.className='round-figure-view';
 banner.before(focus);focus.append(banner,$('roundViewport'));
 $('roundParameterControls').insertAdjacentHTML('beforeend','<label id="roundLowerField" hidden>Corte inferior y₁<input id="roundLower" type="range" min="-90" max="90" value="-30" step="1"><output id="roundLowerValue"></output></label><label id="roundAngleField" hidden>Ángulo α<input id="roundAngle" type="range" min="10" max="350" value="60" step="1"><output id="roundAngleValue">60°</output></label>');
 $('roundSectionField').insertAdjacentHTML('beforeend','<output id="roundSectionValue"></output>');
 $('roundSection').value=state.section;
 $('roundFeature').closest('.round-observation').insertAdjacentHTML('afterbegin','<div class="round-insight-heading"><span class="eyebrow">COMPRENDE LO QUE VES</span><h3>Elementos, medidas y fórmulas</h3></div>');
 $('roundCenter').textContent='↺';$('roundCenter').setAttribute('aria-label','Centrar vista');$('roundCenter').title='Centrar vista';
 tabs.insertAdjacentHTML('beforebegin','<a class="round-print-link" href="#imprimir-redondos">✂ Imprimir plegable</a>');
 tabs.insertAdjacentHTML('beforebegin','<a id="roundRevolutionLink" class="round-print-link" href="#revolucion/cylinder">↻ Generación por giro</a>');
 $('roundExplanation').insertAdjacentHTML('afterend','<section class="round-revolution-summary"><h3>¿Cómo se genera por revolución?</h3><p id="roundRevolutionIntro"></p><a id="roundPappusLink" href="#revolucion/cylinder">Ver generatriz, centroide y fórmulas de Pappus‑Guldin →</a></section>');
 const host=$('roundViewport'),canvas=$('roundCanvas'),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,1000),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;
 scene.add(new THREE.HemisphereLight(0xffffff,0x536176,3));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(5,7,6);scene.add(light);
 let group=new THREE.Group(),modelRadius=3,fitDistance=9,relativeZoom=1,active=false,frame=null,lastSize=null;scene.add(group);
 const fmt=n=>new Intl.NumberFormat('es-PE',{useGrouping:false,minimumFractionDigits:state.decimals,maximumFractionDigits:state.decimals}).format(n),raw=n=>Number(n.toPrecision(10)).toString(),unit=p=>state.unit+(p===2?'²':p===3?'³':''),m=n=>fmt(n).replace(/,/g,'{,}');
 function dispose(){group.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(mat=>{mat.map?.dispose();mat.dispose()})});scene.remove(group);group=new THREE.Group();scene.add(group)}
 function line(a,b,color=0xef7256){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);group.add(new THREE.Line(g,new THREE.LineBasicMaterial({color,depthTest:false})));for(const p of [a,b]){const dot=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),new THREE.MeshBasicMaterial({color,depthTest:false}));dot.position.set(...p);group.add(dot)}}
 function ring(radius,y,color=0x4239a4){const points=Array.from({length:97},(_,i)=>new THREE.Vector3(radius*Math.cos(i*Math.PI/48),y,radius*Math.sin(i*Math.PI/48)));group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color})))}
 function fit(reset=false){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();
  const dir=reset?new THREE.Vector3(5,3,6).normalize():camera.position.clone().sub(controls.target).normalize(),right=new THREE.Vector3().crossVectors(camera.up,dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize();
  const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect,vertices=group.children[0]?.geometry?.attributes.position;
  let distance=.1;group.updateMatrixWorld(true);
  if(vertices)for(let i=0;i<vertices.count;i++){const point=new THREE.Vector3().fromBufferAttribute(vertices,i).applyMatrix4(group.children[0].matrixWorld),depth=point.dot(dir);distance=Math.max(distance,depth+Math.abs(point.dot(right))/tanH,depth+Math.abs(point.dot(up))/tanV)}
  const annotations=['section','hemisphere','cap','zone','lune','wedge','sector'].some(id=>state.elements.has(id));fitDistance=distance*(annotations?1.3:1.12);
  controls.target.set(0,0,0);controls.minDistance=modelRadius*.6;controls.maxDistance=fitDistance*6;camera.position.copy(dir.multiplyScalar(fitDistance/relativeZoom));controls.update();
 }
 function resize(){if(!active)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);if(!lastSize||w!==lastSize.w||h!==lastSize.h){if(state.view==='net')frameNet();else fit();lastSize={w,h}}}
 let framingNet=false;
 new ResizeObserver(resize).observe(host);controls.addEventListener('change',()=>{if(!framingNet)relativeZoom=fitDistance/Math.max(.01,camera.position.distanceTo(controls.target))});
 let lastTime=0;
 function animate(time=0){if(!active)return;frame=requestAnimationFrame(animate);const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000)),speed=Number($('roundFoldSpeed').value);lastTime=time;if(state.playing&&state.view==='net'){state.fold=THREE.MathUtils.clamp(state.fold+state.direction*dt*.22*speed,0,1);updateFold();if(state.fold===0||state.fold===1){state.playing=false;syncFoldControls()}}controls.update();if(state.rotate&&state.view==='3d')group.rotation.y+=dt*.42*speed;renderer.render(scene,camera)}
 function build(reset=true){syncPanel();const previousRotation=group.rotation.clone();dispose();if(!reset)group.rotation.copy(previousRotation);const {r,h,type}=state,max=type==='sphere'?2*r:Math.max(2*r,h),scale=4/max,R=r*scale,H=h*scale;
  if(state.view==='net'){folding.progress=state.fold;folding.configure(type,r,h);group.add(folding.group);relativeZoom=1;frameNet(true);resize();return}
  controls.enableDamping=true;
  const geometry=type==='sphere'?new THREE.SphereGeometry(R,64,40):type==='cone'?new THREE.ConeGeometry(R,H,80):new THREE.CylinderGeometry(R,R,H,80);
  const regional=['section','hemisphere','cap','zone','lune','wedge','sector'].some(id=>state.elements.has(id));
  const mesh=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:type==='sphere'?0x219e88:type==='cone'?0xf39c4b:0x675ae8,roughness:.5,transparent:true,opacity:regional?.19:.57,side:THREE.DoubleSide,depthWrite:false}));group.add(mesh);
  if(type!=='sphere'){ring(R,-H/2);if(type==='cylinder')ring(R,H/2)}
  drawRoundElements(group,state,R,H);
  geometry.computeBoundingSphere();modelRadius=geometry.boundingSphere.radius*(regional?1.32:1.08);if(reset){relativeZoom=1;fit(true)}resize();
 }
 function values(){
  const {r,h,type}=state,g=Math.hypot(r,h),data=roundMeasures(type,r,h);
  $('roundRevolutionLink').href=$('roundPappusLink').href=`#revolucion/${type}`;
  $('roundRevolutionIntro').textContent=type==='sphere'?'Un semicírculo gira alrededor de su diámetro: el arco genera la superficie esférica y la región genera el volumen. Sus centroides son diferentes.':type==='cone'?'Un triángulo rectángulo gira alrededor de un cateto: la hipotenusa genera la superficie lateral y la región triangular genera el volumen.':'Un rectángulo gira alrededor de un lado: el lado opuesto genera la superficie lateral y la región rectangular genera el volumen.';
  $('roundResults').innerHTML=data.map(item=>`<section class="result-card"><span>${item.name}</span><strong>${fmt(item.value)} <small>${unit(item.power)}</small></strong>${math(item.formula)}</section>`).join('');
  $('roundSteps').innerHTML=data.map(item=>{const substitute=item.formula.replace(/(\\[A-Za-z]+)|[rgh]/g,(token,command)=>command||`(${raw(token==='r'?r:token==='h'?h:g)})`);return`<section class="calculation-step"><h3>${item.name}</h3>${math(substitute)}${math(`\\approx ${m(item.value)}\\;\\mathrm{${state.unit}}${item.power>1?`^{${item.power}}`:''}`)}</section>`}).join('');
  const insight=roundInsight(type,state.feature,r,h,state.section,state.lower,state.angle);
  $('roundFeatureText').innerHTML=`<h3>${insight.title}</h3><p>${insight.text}</p><p class="round-visibility-status">${state.elements.has(state.feature)?'Visible en el modelo.':'Oculto en el modelo; puedes activarlo en el panel.'}</p>`;
  if(type==='sphere'&&['cap','sector'].includes(state.feature))$('roundFeatureText').insertAdjacentHTML('beforeend','<p><strong>Lee el dibujo:</strong> O es el centro de la esfera; C es el centro del círculo del corte. El plano translúcido corta la esfera; ρ une C con su borde. La cota exterior H mide desde el plano hasta el polo superior. La escuadra en C indica perpendicularidad.</p>');
  if(type==='sphere'&&['lune','wedge'].includes(state.feature))$('roundFeatureText').insertAdjacentHTML('beforeend','<p><strong>Lee el dibujo:</strong> los planos 1 y 2 comparten el eje vertical. El plano horizontal es perpendicular a ese eje; el sector amarillo mide allí la abertura α. Las dos líneas desde O son las trazas de los semiplanos en ese corte. Gira la esfera para comparar la región curva con sus planos límite.</p>');
  $('roundKnownUnit').textContent=unit($('roundKnown').value==='volume'?3:$('roundKnown').value==='base'?2:1);
  $('roundSectionField').hidden=!['section','cap','zone','sector'].some(id=>state.elements.has(id));
  $('roundLowerField').hidden=!state.elements.has('zone');$('roundAngleField').hidden=!['lune','wedge','chord'].some(id=>state.elements.has(id));
  $('roundSectionValue').textContent=`y${state.elements.has('zone')?'₂':''} = ${fmt(state.section/100*(type==='sphere'?r:h/2))} ${state.unit}`;
  $('roundLowerValue').textContent=`y₁ = ${fmt(state.lower/100*r)} ${state.unit}`;$('roundAngleValue').textContent=`${state.angle}°`;
  $('roundSectionFormula').innerHTML=`<div class="round-insight-results">${insight.items.map(item=>`<section class="round-insight-card"><h4>${item.name}</h4><strong>${fmt(item.value)} <small>${unit(item.power)}</small></strong>${math(item.formula)}<details><summary>Sustitución paso a paso</summary>${math(item.substitute)}${math(`\\approx ${m(item.value)}\\;\\mathrm{${state.unit}}${item.power>1?`^{${item.power}}`:''}`)}</details></section>`).join('')}</div>${type==='sphere'?'<p class="round-formula-sources">Referencias: <a href="https://mathworld.wolfram.com/SphericalLune.html" target="_blank" rel="noopener">Huso y cuña</a> · <a href="https://mathworld.wolfram.com/SphericalCap.html" target="_blank" rel="noopener">Casquete y segmento</a> · <a href="https://mathworld.wolfram.com/SphericalSector.html" target="_blank" rel="noopener">Sector esférico</a>.</p>':''}`;
  $('roundFeature').value=state.feature;
  document.querySelectorAll('[data-round-element]').forEach(input=>{input.checked=state.elements.has(input.dataset.roundElement)});
  $('roundExplanation').innerHTML=type==='sphere'?'<p>La esfera no tiene caras planas: no se le asignan los conteos de Euler de un poliedro. Su superficie no puede aplanarse exactamente sin estirar, deformar o cortar en piezas que solo la aproximan.</p>':`<p>Se muestran cuerpos <strong>rectos</strong>: el eje es perpendicular a la base. ${type==='cone'?'El volumen del cono es un tercio del de un cilindro de igual radio y altura. La generatriz se calcula con Pitágoras.':'El volumen se obtiene apilando secciones circulares de área constante: V = área de la base × altura.'}</p>`;
  renderNet();
 }
 function renderNet(){const {type,r,h}=state,g=Math.hypot(r,h);
  $('roundNet').innerHTML=`<p><strong>Cortar:</strong> líneas continuas. <strong>Doblar y pegar:</strong> pestañas claras con base discontinua; van por dentro, bajo el borde de la pieza vecina. Usa «Imprimir plegable» para obtener la escala física.</p><p>${type==='sphere'?'<strong>Aproximación por 12 gajos, no desarrollo plano exacto.</strong> Pestañas segmentadas a un solo lado de cada gajo; pega por etapas y cierra el último con el primero.':type==='cone'?`Sector de radio g = ${fmt(g)} ${state.unit} y ángulo ${fmt(360*r/g)}°. Une la pestaña lateral y después las pestañas del círculo de base.`:`Rectángulo de ancho 2πr = ${fmt(2*Math.PI*r)} ${state.unit} y altura ${fmt(h)} ${state.unit}. Cierra el lateral y pega las bases sobre las pestañas dentadas.`}</p>`;
  $('roundNetFormula').innerHTML=math(type==='sphere'?'\\text{ancho de cada gajo}\\approx\\frac{2\\pi r}{12}\\cos\\varphi':type==='cone'?'g=\\sqrt{r^2+h^2},\\qquad\\theta=360^\\circ\\frac rg':'\\text{ancho}=2\\pi r,\\qquad\\text{alto}=h');
  $('roundNet').insertAdjacentHTML('beforeend','<p>Las pestañas se muestran solo con el desarrollo completamente plano. Durante el plegado y desplegado se ocultan para observar la forma limpia; la impresión siempre las conserva.</p>');
  if(type==='sphere')$('roundNet').insertAdjacentHTML('beforeend','<p>En la fórmula, φ es la latitud: vale 0° en el ecuador y ±90° en los polos. Por eso los gajos son más anchos en el centro y se estrechan hacia sus extremos.</p>');
 }
 function syncFoldControls(){
  $('roundFoldProgress').value=state.fold*100;$('roundFoldPercent').textContent=`${Math.round(state.fold*100)} %`;
  $('roundFoldPlay').textContent=state.playing?'Ⅱ Pausar':state.fold>=1?'▶ Desplegar':state.direction<0&&state.fold>0?'▶ Seguir desplegando':'▶ Plegar';
  $('roundFoldPlay').setAttribute('aria-pressed',String(state.playing));
 }
 function frameNet(reset=false){
  const box=folding.bounds||new THREE.Box3().setFromObject(folding.group),center=box.getCenter(new THREE.Vector3());
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();
  const dir=reset?new THREE.Vector3(0,0,1):camera.position.clone().sub(controls.target).normalize();
  const savedZoom=relativeZoom,tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;
  const right=new THREE.Vector3().crossVectors(camera.up,dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize();
  let distance=.1;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
   const point=new THREE.Vector3(x,y,z).sub(center),depth=point.dot(dir);
   distance=Math.max(distance,depth+Math.abs(point.dot(right))/tanH,depth+Math.abs(point.dot(up))/tanV);
  }
  // Deterministic occupancy for each shape, with no zoom feedback over cycles.
  fitDistance=distance*1.12;framingNet=true;
  try{controls.enableDamping=false;controls.target.copy(center);controls.minDistance=.1;controls.maxDistance=fitDistance*12;
   camera.position.copy(center).addScaledVector(dir,fitDistance/savedZoom);controls.update();
  }finally{relativeZoom=savedZoom;framingNet=false}
 }
 function updateFold(){folding.update(state.fold);frameNet();syncFoldControls()}
 function netTool(tool){state.netTool=tool;controls.enableRotate=state.view==='3d'||tool==='rotate';controls.mouseButtons.LEFT=controls.enableRotate?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN;controls.touches.ONE=controls.enableRotate?THREE.TOUCH.ROTATE:THREE.TOUCH.PAN;$('roundMove').setAttribute('aria-pressed',String(tool==='move'));$('roundTurn').setAttribute('aria-pressed',String(tool==='rotate'));canvas.style.cursor=tool==='move'&&state.view==='net'?'grab':'auto'}
 function setView(view){state.playing=false;state.rotate=false;$('roundRotate').textContent='▶ Girar';$('roundRotate').setAttribute('aria-pressed','false');state.view=view;$('roundViewport').hidden=false;$('roundNet').hidden=view!=='net';$('roundNetFormula').hidden=view!=='net';$('roundFoldControls').hidden=view!=='net';$('roundRotate').hidden=view==='net';$('roundFeature').closest('.round-observation').hidden=view==='net';$('roundInteractionHint').textContent=view==='net'?'Elige Mover o Girar y arrastra. Usa la rueda, pellizca o pulsa + / − para ampliar. Doble clic o Centrar restaura el encuadre. Pulsa Plegar; al terminar, el mismo botón permite Desplegar.':'Arrastra para girar; usa la rueda, pellizca o pulsa + / − para acercar o alejar. Doble clic para centrar.';document.querySelectorAll('[data-round-view]').forEach(b=>{b.classList.toggle('active',b.dataset.roundView===view);b.setAttribute('aria-selected',String(b.dataset.roundView===view));b.textContent=b.dataset.roundView==='3d'?'◈ Vista 3D':'▱ Desarrollo 2D';if(b.dataset.roundView==='net')b.title=state.type==='sphere'?'Aproximación por gajos; no es un desarrollo exacto':'Desarrollo plano plegable'});for(const id of ['roundZoomIn','roundZoomOut','roundCenter','roundRotate'])$(id).disabled=false;netTool(state.netTool);syncFoldControls();build();resize()}
 function selectType(type){
  if(!definitions[type])type='cylinder';state.type=type;state.elements=new Set(['radius']);state.feature='radius';
  $('roundName').textContent=definitions[type].name;$('roundIntro').textContent=definitions[type].intro;$('roundHeightField').hidden=type==='sphere';
  const elements=roundElements(type);
  $('roundFeature').innerHTML=elements.map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
  $('roundFeature').parentElement.firstChild.textContent='Consultar explicación';
  $('roundElementChoices').innerHTML=elements.map(([id,label,color])=>`<label class="round-element-option"><input type="checkbox" data-round-element="${id}" ${id==='radius'?'checked':''}><i aria-hidden="true" style="background:#${color.toString(16).padStart(6,'0')}"></i><span>${label}</span></label>`).join('');
  $('roundKnown').innerHTML=[['radius','Radio'],['diameter','Diámetro'],['circumference',type==='sphere'?'Circunferencia máxima':'Perímetro de la base'],...(type!=='sphere'?[['base','Área de una base']]:[]),['volume','Volumen']].map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
  document.querySelectorAll('[data-round-solid]').forEach(b=>{b.classList.toggle('active',b.dataset.roundSolid===type);if(b.dataset.roundSolid===type)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  $('roundKnownValue').value=raw(state.r);$('roundKnownUnit').textContent=state.unit;$('roundKnownFeedback').textContent='';values();build();
 }
 function syncPanel(){const visible=state.panelOpen&&state.view==='3d';$('roundElementPanel').hidden=!visible;layout.classList.toggle('without-panel',!visible);$('roundPanelToggle').hidden=state.view!=='3d';$('roundPanelToggle').setAttribute('aria-expanded',String(visible));$('roundPanelToggle').textContent=visible?'Ocultar panel':'Mostrar panel'}
 $('roundPanelToggle').addEventListener('click',()=>{state.panelOpen=!state.panelOpen;syncPanel()});
 $('roundElementChoices').addEventListener('change',event=>{const id=event.target.dataset.roundElement;if(!id)return;if(event.target.checked){state.elements.add(id);state.feature=id}else state.elements.delete(id);values();build(false)});
 $('roundClearElements').addEventListener('click',()=>{state.elements.clear();values();build(false)});
 $('roundAngle').addEventListener('input',()=>{state.angle=Number($('roundAngle').value);values();build(false)});
 $('roundLower').addEventListener('input',()=>{state.lower=Math.min(Number($('roundLower').value),state.section);$('roundLower').value=state.lower;values();build(false)});
 function readInputs(){const r=Number($('roundRadius').value),h=Number($('roundHeight').value);if(!Number.isFinite(r)||r<.1||r>1000||!Number.isFinite(h)||h<.1||h>1000){$('roundInputError').textContent='Radio y altura deben estar entre 0,1 y 1000. Se conserva el último modelo válido.';return}$('roundInputError').textContent='';state.r=r;state.h=h;state.unit=$('roundUnit').value;values();build()}
 for(const id of ['roundRadius','roundHeight','roundUnit'])$(id).addEventListener('input',readInputs);
 $('roundFeature').addEventListener('change',()=>{state.feature=$('roundFeature').value;values()});$('roundSection').addEventListener('input',()=>{state.section=Number($('roundSection').value);if(state.lower>state.section){state.lower=state.section;$('roundLower').value=state.lower}values();build(false)});
 $('roundDecimals').addEventListener('change',()=>{state.decimals=Number($('roundDecimals').value);values()});
 $('roundKnown').addEventListener('change',()=>{const power=$('roundKnown').value==='volume'?3:$('roundKnown').value==='base'?2:1;$('roundKnownUnit').textContent=unit(power);$('roundKnownValue').value='';$('roundKnownFeedback').textContent=$('roundKnown').value==='volume'&&state.type!=='sphere'?'Se usará la altura h indicada como segundo dato.':''});
 $('roundKnownForm').addEventListener('submit',event=>{event.preventDefault();try{const datum=$('roundKnown').value,value=Number($('roundKnownValue').value),radius=solveRound(state.type,datum,value,state.h);if(radius<.1||radius>1000)throw Error('El radio calculado debe estar entre 0,1 y 1000.');state.r=radius;$('roundRadius').value=Number(radius.toPrecision(12));values();build();const expressions={radius:'r=X',diameter:'r=\\frac d2',circumference:'r=\\frac{P}{2\\pi}',base:'r=\\sqrt{\\frac{A_b}{\\pi}}',volume:state.type==='sphere'?'r=\\sqrt[3]{\\frac{3V}{4\\pi}}':state.type==='cone'?'r=\\sqrt{\\frac{3V}{\\pi h}}':'r=\\sqrt{\\frac{V}{\\pi h}}'};$('roundKnownFeedback').innerHTML=`<p>Radio obtenido: ${fmt(radius)} ${state.unit}. ${state.type!=='sphere'&&datum==='volume'?`Se conserva h = ${fmt(state.h)} ${state.unit}.`:''}</p>${math(expressions[datum])}`;$('roundKnownFeedback').dataset.state='success'}catch(e){$('roundKnownFeedback').textContent=e.message;$('roundKnownFeedback').dataset.state='error'}});
 document.querySelectorAll('[data-round-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.roundView)));
 function zoom(factor){const offset=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(distance));controls.update()}
 $('roundZoomIn').addEventListener('click',()=>zoom(.8));$('roundZoomOut').addEventListener('click',()=>zoom(1.25));$('roundCenter').addEventListener('click',()=>{relativeZoom=1;if(state.view==='net')frameNet(true);else fit(true)});$('roundRotate').addEventListener('click',()=>{state.rotate=!state.rotate;$('roundRotate').setAttribute('aria-pressed',String(state.rotate));$('roundRotate').textContent=state.rotate?'Ⅱ Pausar':'▶ Girar'});
 $('roundMove').addEventListener('click',()=>netTool('move'));$('roundTurn').addEventListener('click',()=>netTool('rotate'));
 $('roundFoldPlay').addEventListener('click',()=>{if(state.playing)state.playing=false;else{if(state.fold>=1)state.direction=-1;else if(state.fold<=0)state.direction=1;state.playing=true}syncFoldControls()});
 $('roundFoldProgress').addEventListener('input',()=>{state.playing=false;state.fold=Number($('roundFoldProgress').value)/100;if(state.fold===1)state.direction=-1;else if(state.fold===0)state.direction=1;updateFold()});
 canvas.addEventListener('dblclick',()=>{relativeZoom=1;if(state.view==='net')frameNet(true);else fit(true)});
 $('roundFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await focus.requestFullscreen()}catch{ $('roundInteractionHint').textContent='No se pudo abrir pantalla completa. Puedes ampliar la figura con + o con la rueda.' }});
 document.addEventListener('fullscreenchange',()=>{const expanded=document.fullscreenElement===focus;$('roundFullscreen').setAttribute('aria-label',expanded?'Salir de pantalla completa':'Ampliar solo la figura');$('roundFullscreen').title=expanded?'Salir de pantalla completa (Esc)':'Ampliar solo la figura';requestAnimationFrame(()=>{relativeZoom=1;lastSize=null;resize();if(state.view==='net')frameNet(true);else fit(true)})});
 $('roundCheck').addEventListener('change',()=>{$('roundCheckFeedback').textContent=$('roundCheck').value==='third'?'Correcto: Vcono = (1/3)·Vcilindro si tienen el mismo radio y altura.':$('roundCheck').value?'Revisa el factor 1/3 en la fórmula del cono.':''});
 selectType(state.type);
 return{activate(type){if(type&&definitions[type]&&type!==state.type){state.fold=0;state.playing=false;selectType(type)}setView(state.view);if(!active){active=true;lastTime=0;resize();animate()}},deactivate(){active=false;state.playing=false;syncFoldControls();cancelAnimationFrame(frame)},state};
}
