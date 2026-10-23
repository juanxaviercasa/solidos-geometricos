import {initPrinting} from './printing.js';
export function initRoundPrinting(getState){
 const page=document.createElement('main');page.className='resource-page';page.dataset.resourcePage='imprimir-redondos';page.hidden=true;
 page.innerHTML='<header class="resource-header"></header><div class="resource-content"><a id="roundPrintBack" href="#redondos">← Volver al cuerpo redondo</a><p id="roundPrintDescription"></p><div class="round-print-options"><label>Papel<select id="rpprintFormat"><option value="a4">A4</option><option value="a3">A3</option><option value="a2">A2</option><option value="a3-tiles">A3 en 2 hojas A4</option><option value="a2-tiles">A2 en 4 hojas A4</option></select></label><label>Tamaño<select id="rpprintScale"><option value="fit">Máximo que cabe</option><option value="exact">Radio exacto en cm</option></select></label><label id="rpprintEdgeField" hidden>Radio (cm)<input id="rpprintEdgeCm" type="number" min="0.1" step="0.01" value="3"></label></div><p id="rpprintSummary"></p><p id="rpprintWarning" role="alert"></p><p id="rpassemblyHelp"></p><p>Línea continua: cortar. Discontinua: doblar pestañas. Imprime al 100 %, sin ajustar a página y sin encabezados ni pies del navegador. Comprueba la barra de 5 cm con una regla.</p><div class="round-print-actions"><button id="rpprintNet" class="primary-btn">Imprimir plantilla</button><button id="rpdownloadSvg" class="ghost-btn">Descargar SVG</button></div><div id="rpprintPreview"></div><svg id="roundPrintSource" hidden></svg></div>';
 document.body.append(page);let type='cylinder';const names={cylinder:'Cilindro',cone:'Cono',sphere:'Esfera por gajos (aproximación)'};
 const workshop=initPrinting({prefix:'rp',referenceLabel:'Radio',isActive:()=>location.hash.startsWith('#imprimir-redondos'),getName:()=>names[type],getTemplate:()=>document.getElementById('roundPrintSource')});
 function prepare(){
  const state=getState()||{type:'cylinder',r:3,h:6,unit:'cm'};type=state.type;const r=1,h=state.h/state.r,g=Math.hypot(r,h),tab=.1,points=[];let shapes='';
  const polygon=(p,cls='net-face')=>{points.push(...p);shapes+=`<polygon class="${cls}" points="${p.map(p=>p.join(',')).join(' ')}"/>`};
  const line=(a,b,cls='cut-edge')=>{shapes+=`<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`};
  function outline(p){polygon(p);for(let i=0;i<p.length;i++)line(p[i],p[(i+1)%p.length])}
  function circle(cx,cy){const p=Array.from({length:180},(_,i)=>[cx+Math.cos(i*Math.PI/90),cy+Math.sin(i*Math.PI/90)]);if(type==='cone'){polygon(p);for(let i=0;i<p.length;i++)line(p[i],p[(i+1)%p.length],'fold-edge')}else outline(p)}
  if(type==='cylinder'){
   const w=2*Math.PI;polygon([[0,0],[w,0],[w,h],[0,h]]);line([0,0],[0,h]);line([0,0],[w,0],'fold-edge');line([0,h],[w,h],'fold-edge');line([w,0],[w,h],'fold-edge');
   polygon([[w,0],[w+tab,.05],[w+tab,h-.05],[w,h]]);line([w,0],[w+tab,.05]);line([w+tab,.05],[w+tab,h-.05]);line([w+tab,h-.05],[w,h]);
   for(let i=0;i<24;i++){const a=i*w/24,b=(i+1)*w/24;for(const [y,s] of [[0,-1],[h,1]]){const p=[[a,y],[a+.025,y+s*tab],[b-.025,y+s*tab],[b,y]];polygon(p);for(let j=0;j<3;j++)line(p[j],p[j+1])}}
   circle(1,-1.35);circle(1,h+1.35);
  }else if(type==='cone'){
   const angle=2*Math.PI/g,n=180,arc=Array.from({length:n+1},(_,i)=>[g*Math.sin((i/n-.5)*angle),g*Math.cos((i/n-.5)*angle)]);polygon([[0,0],...arc]);line([0,0],arc[0]);for(let i=0;i<n;i++)line(arc[i],arc[i+1]);
   const end=arc.at(-1),normal=[end[1]/g*tab,-end[0]/g*tab];polygon([[0,0],[normal[0],normal[1]],[end[0]+normal[0],end[1]+normal[1]],end]);line([0,0],end,'fold-edge');line([0,0],normal);line(normal,[end[0]+normal[0],end[1]+normal[1]]);line([end[0]+normal[0],end[1]+normal[1]],end);
   // Separate base with radial glue tabs, placed beyond the sector bounds.
   const cy=g+1.4;circle(0,cy);for(let i=0;i<24;i++){const a=i*Math.PI/12,b=(i+1)*Math.PI/12,p=[[Math.cos(a),cy+Math.sin(a)],[(1+tab)*Math.cos(a+.02),cy+(1+tab)*Math.sin(a+.02)],[(1+tab)*Math.cos(b-.02),cy+(1+tab)*Math.sin(b-.02)],[Math.cos(b),cy+Math.sin(b)]];polygon(p);for(let j=0;j<3;j++)line(p[j],p[j+1]);line(p[0],p[3],'fold-edge')}
  }else{
   for(let k=0;k<12;k++){
    const cx=k*(Math.PI/6+.16),edge=Array.from({length:81},(_,i)=>{const lat=(i/80-.5)*Math.PI;return [Math.PI/12*Math.cos(lat),lat]});
    // Right edge is split into cuts and creases; never cut across a tab base.
    const left=edge.map(([x,y])=>[cx-x,y]);for(let i=0;i<left.length-1;i++)line(left[i],left[i+1]);
    polygon([...edge.map(([x,y])=>[cx+x,y]),...left.toReversed()]);
    const at=v=>{const lat=(v-.5)*Math.PI;return [cx+Math.PI/12*Math.cos(lat),lat]},out=v=>.08*Math.cos((v-.5)*Math.PI);let end=0;
    const curve=(a,b,cls)=>{const p=Array.from({length:9},(_,i)=>at(a+(b-a)*i/8));for(let i=0;i<8;i++)line(p[i],p[i+1],cls)};
    for(let j=0;j<12;j++){const a=.055+j*.89/12,b=a+.89/12-.009,p=at(a),q=at(b);curve(end,a,'cut-edge');curve(a,b,'fold-edge');const p2=[p[0]+out(a),p[1]+.008],q2=[q[0]+out(b),q[1]-.008];polygon([p,p2,q2,q]);line(p,p2);line(p2,q2);line(q2,q);end=b}curve(end,1,'cut-edge');
   }
  }
  shapes+='<line class="measure-edge" x1="0" y1="0" x2="1" y2="0" opacity="0"/>';
  document.getElementById('roundPrintSource').innerHTML=shapes;
  document.getElementById('roundPrintBack').href=`#redondos/${type}`;
  document.getElementById('roundPrintDescription').textContent=type==='sphere'?'Doce gajos aproximados con pestañas segmentadas en un solo lado de cada unión. Dobla las pestañas hacia dentro y pega cada una bajo el borde liso del gajo siguiente; la última unión cierra con el primero. Deja secar por etapas. La esfera no tiene desarrollo plano exacto; el radio indicado es nominal y el montaje puede deformarse.':'Plantilla con pestañas de pegado. Conserva las proporciones del cuerpo del laboratorio. Recorta las piezas, curva la superficie lateral y pega las pestañas por dentro para cerrar las bases.';
  const cm=state.r*(state.unit==='mm'?.1:state.unit==='m'?100:1);document.getElementById('rpprintEdgeCm').value=Number(cm.toPrecision(8));workshop.prepare();
 }
 return {prepare};
}
