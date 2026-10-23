import katex from 'katex';
const math=s=>katex.renderToString(s,{displayMode:true,throwOnError:false});
const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:3}).format(Math.abs(n)<1e-10?0:n);
export function initRevolutionReferences(){
 const root=document.createElement('section');root.className='rev-coordinate-reference';root.hidden=true;document.getElementById('revStudio').after(root);let signature='';
 return {update(profile,mode,kind,visible){root.hidden=!visible;if(!visible)return;const key=JSON.stringify([profile.curve,mode,profile.cx,profile.cy]);if(key===signature)return;signature=key;
  const points=mode==='volume'?(profile.originalRegion||profile.region):(profile.originalCurve||profile.curve),smooth=points.length>40;
  const entries=smooth?[0,Math.floor((points.length-1)/4),Math.floor((points.length-1)/2),Math.floor(3*(points.length-1)/4),points.length-1]:points.map((_,i)=>i);
  root.innerHTML=`<h3>Referencias cartesianas del generador inicial</h3><p>Coordenadas (x, y) en centímetros en el plano inicial z = 0. El eje de giro es la recta x = 0. A y B identifican los extremos de una curva abierta; un contorno cerrado no tiene dos extremos distintos.</p><div class="rev-reference-table"><table><thead><tr><th>Punto</th><th>x (cm)</th><th>y (cm)</th></tr></thead><tbody>${entries.map(i=>`<tr><th>${i===0?'A / ':i===points.length-1?'B / ':''}P${i+1}${smooth?' (muestra)':''}</th><td>${fmt(points[i][0])}</td><td>${fmt(points[i][1])}</td></tr>`).join('')}<tr><th>G: centroide ${mode==='volume'?'del área':'de la curva'}</th><td>${fmt(mode==='volume'?profile.cx:profile.lx)}</td><td>${fmt(mode==='volume'?profile.cy:profile.ly)}</td></tr></tbody></table></div><p>d = |x<sub>G</sub>| = ${fmt(mode==='volume'?profile.cx:profile.lx)} cm. Es la distancia perpendicular de G al eje, no una longitud medida a ojo.</p><div>${math('\\ell_{AB}=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}')}</div><p>La fórmula anterior da la distancia recta entre dos puntos. Para una línea quebrada suma las longitudes de sus segmentos. Para una curva, la distancia entre extremos no es su longitud:</p><div>${math('L=\\int_a^b\\sqrt{[x\prime(t)]^2+[y\prime(t)]^2}\\,dt')}</div>${smooth?'<p>La tabla muestra cinco muestras, no todos los puntos de cálculo. Consulta la ecuación o los controles del generador; las muestras aisladas no definen toda la curva.</p>':''}${profile.equation?math(profile.equation):''}`;
  const axis=profile.axisX||0,originalX=mode==='volume'?(profile.originalCX??profile.cx):(profile.originalLX??profile.lx);
  root.querySelector('p').textContent=`Coordenadas originales (x, y) en cm, plano inicial z = 0. Eje de giro: x = ${fmt(axis)}. El origen cartesiano O no se mueve con el eje. A y B indican extremos de un trazo abierto; un contorno cerrado no tiene extremos distintos.`;
  root.querySelector('tbody tr:last-child td').textContent=fmt(originalX);
  root.querySelector('.rev-reference-table').nextElementSibling.innerHTML=`d = |x<sub>G</sub> − a| = |${fmt(originalX)} − (${fmt(axis)})| = ${fmt(Math.abs(originalX-axis))} cm.`;
  root.querySelectorAll(':scope > div')[2].innerHTML=math('L=\\int_{t_0}^{t_1}\\sqrt{(dx/dt)^2+(dy/dt)^2}\\,dt');
 }};
}
