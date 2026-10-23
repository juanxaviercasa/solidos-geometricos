import katex from 'katex';
import { mathNumber } from './number-format.js';
const math=expression=>`<div class="geometry-math">${katex.renderToString(expression,{throwOnError:false,displayMode:true})}</div>`;
const num=x=>Number(x.toFixed(6)).toString();
const exact={
 cube:{diameter:'\\sqrt{3}',circumradius:'\\frac{\\sqrt{3}}{2}',inradius:'\\frac12',midradius:'\\frac{\\sqrt2}{2}'},
 tetra:{diameter:'1',circumradius:'\\frac{\\sqrt6}{4}',inradius:'\\frac{\\sqrt6}{12}',midradius:'\\frac{\\sqrt2}{4}'},
 octa:{diameter:'\\sqrt2',circumradius:'\\frac{\\sqrt2}{2}',inradius:'\\frac{\\sqrt6}{6}',midradius:'\\frac12'},
 ico:{diameter:'\\frac{\\sqrt{10+2\\sqrt5}}{2}',circumradius:'\\frac{\\sqrt{10+2\\sqrt5}}4',inradius:'\\frac{\\sqrt3(3+\\sqrt5)}{12}',midradius:'\\frac{1+\\sqrt5}{4}'},
 dode:{diameter:'\\frac{\\sqrt3(1+\\sqrt5)}2',circumradius:'\\frac{\\sqrt3(1+\\sqrt5)}4',inradius:'\\frac{\\sqrt{250+110\\sqrt5}}{20}',midradius:'\\frac{3+\\sqrt5}4'}
};
export function insightFormula({analysis,key,mode,index,metric,a,h,unit}){
 const scale=a/analysis.referenceLength,box=(title,body)=>`<details class="geometry-derivation" data-formula-mode="${mode}" open><summary>${title}</summary><div class="formula-body">${body}<p><a href="#glosario">Consultar palabras y símbolos →</a></p><a href="#medidas">Calcular desde otro dato →</a></div></details>`;
 if(mode==='diagonals'){
  const V=analysis.vertices.size,A=analysis.edges.size,faceTerms=new Map();analysis.faces.forEach(f=>faceTerms.set(f.vertices.length,(faceTerms.get(f.vertices.length)||0)+1));
  return box('Cómo se calcula',`<p>Primero cuenta todos los pares de vértices; resta las aristas y las diagonales que pertenecen a una cara.</p>${math('D_f=\\sum_{\\text{caras}}\\frac{n(n-3)}2')}${math(`D_f=${[...faceTerms].map(([n,count])=>`${count}\\cdot\\frac{${n}(${n}-3)}2`).join('+')}=${analysis.facialDiagonals}`)}${math('D_e=\\frac{V(V-1)}2-A-D_f')}${math(`D_e=\\frac{${V}(${V}-1)}2-${A}-${analysis.facialDiagonals}=${analysis.diagonals.length}`)}<p>n: lados de una cara; V: vértices; A: aristas. Este conteo no depende de la arista.</p>`);
 }
 if(mode==='dihedral'){
  const item=analysis.diedros[index%analysis.diedros.length],p=item.faces[0].vertices.length,q=analysis.vertexAngles[0].faces.length;
  const dot=item.faces[0].normal.dot(item.faces[1].normal),platonic=['cube','tetra','octa','ico','dode'].includes(key);
  const ratio=Math.cos(Math.PI/q)/Math.sin(Math.PI/p);
  return box('Fórmula del diedro',platonic?`<p>p cuenta los lados de cada cara; q cuenta las caras que se reúnen en un vértice. Para evitar una fórmula demasiado ancha, calculamos primero el valor auxiliar t.</p>${math(`p=${p},\\quad q=${q}`)}${math('t=\\frac{\\cos(\\pi/q)}{\\sin(\\pi/p)}')}${math(`t\\approx ${num(ratio)}`)}${math('\\delta=2\\arcsin(t)')}${math(`\\delta\\approx ${mathNumber(item.angle)}^\\circ`)}<p>La función usa radianes y el resultado se convierte a grados. t es un número auxiliar, no otra medida. El diedro no cambia al ampliar el sólido.</p>`:`<p>n₁ y n₂ son las normales exteriores de las caras vecinas. Primero calculamos el número auxiliar t; después obtenemos el diedro.</p>${math('t=\\frac{\\mathbf n_1\\cdot\\mathbf n_2}{\\|\\mathbf n_1\\|\\|\\mathbf n_2\\|}')}${math(`t\\approx ${num(dot)}`)}${math('\\delta=\\pi-\\arccos(t)')}${math(`\\delta\\approx ${mathNumber(item.angle)}^\\circ`)}<p>La fórmula está en radianes; para mostrar grados se convierte el resultado. Las normales son flechas perpendiculares a las caras. t no tiene unidades.</p>`);
 }
 if(mode==='vertexAngle'){
  const item=analysis.vertexAngles[index%analysis.vertexAngles.length],m=item.faces.length,values=[];
  analysis.edges.forEach(edge=>{if(analysis.vertices.get(edge.a).distanceTo(item.vertex)>1e-5&&analysis.vertices.get(edge.b).distanceTo(item.vertex)>1e-5)return;if(edge.faces.length===2)values.push(Math.PI-Math.acos(Math.max(-1,Math.min(1,edge.faces[0].normal.dot(edge.faces[1].normal)))))});
  return box('Fórmula del ángulo sólido',`<p>La sección esférica tiene m lados. Sumamos los diedros interiores en el valor S y restamos el término correspondiente.</p>${math(`m=${m}`)}${math('S=\\sum_{i=1}^{m}\\delta_i')}${math(`S\\approx ${num(values.reduce((sum,value)=>sum+value,0))}\\;\\mathrm{rad}`)}${math('\\Omega=S-(m-2)\\pi')}${math(`\\Omega\\approx ${mathNumber(item.omega)}\\;\\mathrm{sr}`)}<p>Para un triedro: Ω = δ₁ + δ₂ + δ₃ − π. Para convertir un diedro en grados a radianes, multiplica por π/180. Este ángulo no depende del tamaño.</p>`);
 }
 const options=mode==='distance'?(analysis.parallel.length?analysis.parallel:analysis.altitude?[analysis.altitude]:[]):analysis.lengths[metric]||[];
 const item=options[index%Math.max(1,options.length)];if(!item)return box('Por qué no hay fórmula aquí','<p>Una cara triangular no tiene diagonales. Cambia de longitud para ver otro cálculo.</p>');
 const coefficient=item.distance/analysis.referenceLength,value=item.distance*scale;
 let expression='',reason='',symbol='L';
 if(mode==='distance'){
  symbol='d';const r=analysis.lengths.inradius;
  if(analysis.parallel.length&&r.length===1){expression=exact[key]?.inradius?`2\\left(${exact[key].inradius}\\right)a`:`${num(coefficient)}a`;reason='Las caras opuestas están a igual distancia r del centro: d = r + r = 2r.'}
  else if(key==='triPrism'||key==='hexPrism'){
   const base=item.faces?.every(face=>Math.abs(face.normal.y)>.99);expression=base?'h':'\\sqrt3\\,a';reason=base?'Las dos bases paralelas de un prisma recto están separadas por la altura h.':'En el prisma hexagonal regular, dos caras laterales opuestas distan el doble de la apotema del hexágono.';
  }else if(key==='tetra'){expression='\\frac{\\sqrt6}{3}a';reason='No hay caras paralelas: la altura del tetraedro va desde un vértice hasta la cara opuesta.'}
 }else{
  expression=exact[key]?.[metric]?`\\left(${exact[key][metric]}\\right)a`:'';
  if(metric==='diameter'){symbol='D';reason='Compara las distancias entre todos los pares de vértices y toma la mayor. No siempre coincide con 2R.';if(key==='triPrism')expression='\\sqrt{a^2+h^2}';if(key==='hexPrism')expression='\\sqrt{4a^2+h^2}'}
  if(metric==='faceDiagonal'){const face=item.faces[0],n=face.vertices.length,s=face.vertices[0].distanceTo(face.vertices[1]);let k=2;for(let j=2;j<=Math.floor(n/2);j++)if(Math.abs(Math.sin(j*Math.PI/n)/Math.sin(Math.PI/n)-item.distance/s)<1e-4)k=j;
   expression=key.endsWith('Prism')&&n===4&&Math.abs(face.normal.y)<.99?'\\sqrt{a^2+h^2}':`a\\frac{\\sin(${k}\\pi/${n})}{\\sin(\\pi/${n})}`;reason=`En una cara regular de n lados: dₖ = a·sen(kπ/n)/sen(π/n). Aquí n = ${n}; k cuenta cuántos lados separan los extremos. En una cara rectangular de un prisma se usa Pitágoras.`;
  }
  if(metric==='circumradius'){symbol='R';reason='Radio circunscrito: aplica la distancia euclídea desde el centro a un vértice.';if(key==='triPrism')expression='\\sqrt{\\frac{a^2}{3}+\\frac{h^2}{4}}';if(key==='hexPrism')expression='\\sqrt{a^2+\\frac{h^2}{4}}'}
  if(metric==='inradius'){symbol='r';reason='Distancia perpendicular del centro al plano de la cara. Si cambia entre caras, no hay un único radio inscrito centrado aquí.';if(key==='triPrism'||key==='hexPrism')expression=Math.abs(item.faces[0].normal.y)>.99?'\\frac h2':key==='triPrism'?'\\frac{\\sqrt3}{6}a':'\\frac{\\sqrt3}{2}a'}
  if(metric==='midradius'){symbol='\\rho';reason='Es la distancia del centro a la recta de la arista, usando su proyección perpendicular. Solo se llama radio medio común si todas coinciden.'}
 }
 const substitute=formula=>formula.replace(/(\\[A-Za-z]+)|[ah]/g,(token,command)=>command||`(${num(token==='a'?a:h)})`);
 let body=`<p>${reason}</p>`;
 if(expression){body+=math(`${symbol}=${expression}`)+math(`${symbol}=${substitute(expression)}\\approx ${mathNumber(value)}\\;\\mathrm{${unit}}`)}
 else{
  const P=item.a.clone().divideScalar(analysis.referenceLength),Q=item.b.clone().divideScalar(analysis.referenceLength),diff=Q.clone().sub(P);
  body+=math('L=\\|Q-P\\|=\\sqrt{(x_Q-x_P)^2+(y_Q-y_P)^2+(z_Q-z_P)^2}')+math(`\\frac{P}{a}=(${P.toArray().map(num).join(',')})`)+math(`\\frac{Q}{a}=(${Q.toArray().map(num).join(',')})`)+math(`L=a\\sqrt{(${num(diff.x)})^2+(${num(diff.y)})^2+(${num(diff.z)})^2}`)+math(`L\\approx ${num(coefficient)}\\,(${num(a)})\\approx ${mathNumber(value)}\\;\\mathrm{${unit}}`);
  if(metric==='inradius')body+=math('r=\\frac{|\\mathbf n\\cdot(O-F)|}{\\|\\mathbf n\\|}')+'<p>F es un punto de la cara y n una normal a su plano.</p>';
  if(metric==='midradius')body+=math('\\rho=\\frac{\\|(O-U)\\times(W-U)\\|}{\\|W-U\\|}')+'<p>U y W son los extremos de la arista.</p>';
  if(mode==='distance')body+=math('d=\\frac{|c_2-c_1|}{\\|\\mathbf n\\|}')+'<p>Para los planos paralelos n·X = c₁ y n·X = c₂, esta fórmula da la separación perpendicular.</p>';
  body+='<p>Las coordenadas se expresan en unidades de arista a y proceden de la construcción del sólido; los decimales son aproximaciones. O representa el centro.</p>';
 }
 return box('Fórmula y sustitución',body);
}

export function solveKnown({definition,value,height,baseEdge}){
 if(!Number.isFinite(value)||value<=0)throw Error('Introduce un dato mayor que cero.');
 if(definition.solve)return definition.solve(value,height,baseEdge);
 return{a:Math.pow(value/definition.factor,1/definition.power),h:height};
}
