const MM_MARGIN=7, OVERLAP=8;
const FORMATS={
  a4:{label:'A4',w:210,h:297,cols:1,rows:1},
  a3:{label:'A3',w:297,h:420,cols:1,rows:1},
  a2:{label:'A2',w:420,h:594,cols:1,rows:1},
  'a3-tiles':{label:'A3 en 2 hojas A4',w:297,h:210,cols:1,rows:2},
  'a2-tiles':{label:'A2 en 4 hojas A4',w:210,h:297,cols:2,rows:2}
};
const number=(value,digits=2)=>value.toLocaleString('es-PE',{minimumFractionDigits:digits,maximumFractionDigits:digits});
const escape=text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const drawingStyle=`.print-sheet .net-face{fill:white;stroke:none}.print-sheet .glue-tab{fill:#f4f4f4;stroke:#666;stroke-width:.7;stroke-dasharray:1.5 1;vector-effect:non-scaling-stroke}.print-sheet .cut-edge{stroke:#111;stroke-width:1.1;vector-effect:non-scaling-stroke}.print-sheet .fold-edge{stroke:#666;stroke-width:.8;stroke-dasharray:2 1.5;vector-effect:non-scaling-stroke}.print-sheet .vertex-marker{display:none}.print-sheet text{font-family:Arial,sans-serif;fill:#222}.print-sheet .assembly-guide{fill:none;stroke:#a94b00;stroke-width:.2;stroke-dasharray:2 1}.print-sheet .reference-edge{stroke:#111;stroke-width:2;vector-effect:non-scaling-stroke}`;

// Bounds include every glue tab. Searching rotations avoids wasting the long side of the paper.
export function planTemplate(points,referenceLength,formatKey,exactCm=null,layout=null,autoTiles=false){
  let format={...(FORMATS[formatKey]||FORMATS.a4)};
  let tileW=format.w-2*MM_MARGIN,tileH=format.h-2*MM_MARGIN;
  let width=tileW*format.cols-OVERLAP*(format.cols-1),height=tileH*format.rows-OVERLAP*(format.rows-1);
  const pad=2;let best=null;
  const angles=layout?[Number(layout.angle)||0]:Array.from({length:180},(_,i)=>i);
  const tiled=autoTiles&&exactCm!==null&&Number.isFinite(exactCm)&&exactCm>0;
  const exactScale=exactCm*10/referenceLength;
  const orientations=tiled&&format.cols*format.rows===1?[format,{...format,w:format.h,h:format.w}]:[format];
  for(const paper of orientations){
  for(const angle of angles){
    const rad=angle*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad);
    const rotated=points.map(([x,y])=>[x*c-y*s,x*s+y*c]);
    const minX=Math.min(...rotated.map(p=>p[0])),maxX=Math.max(...rotated.map(p=>p[0]));
    const minY=Math.min(...rotated.map(p=>p[1])),maxY=Math.max(...rotated.map(p=>p[1]));
    const tw=paper.w-2*MM_MARGIN,th=paper.h-2*MM_MARGIN;
    const cols=tiled?Math.max(paper.cols,Math.ceil(((maxX-minX)*exactScale+pad*2-OVERLAP-1e-8)/(tw-OVERLAP))):paper.cols;
    const rows=tiled?Math.max(paper.rows,Math.ceil(((maxY-minY)*exactScale+pad*2-OVERLAP-1e-8)/(th-OVERLAP))):paper.rows;
    const pw=tw*cols-OVERLAP*(cols-1),ph=th*rows-OVERLAP*(rows-1);
    const fit=Math.min((pw-pad*2)/(maxX-minX),(ph-pad*2)/(maxY-minY));
    const count=cols*rows,area=pw*ph;
    if(!best||(tiled?(count<best.count||(count===best.count&&area<best.area-1e-6)):fit>best.fit))best={angle,minX,maxX,minY,maxY,fit,count,area,paper:{...paper,cols,rows},tileW:tw,tileH:th,width:pw,height:ph};
  }
  }
  format=best.paper;tileW=best.tileW;tileH=best.tileH;width=best.width;height=best.height;
  // Round down to a hundredth of a centimetre so the stated measurement is the printed one.
  const maxCm=Math.floor(best.fit*referenceLength*10)/100;
  const zoom=layout?Math.max(.1,Math.min(1,Number(layout.zoom)/100||1)):1;
  const edgeCm=exactCm===null?Math.floor(maxCm*zoom*100)/100:exactCm,scale=edgeCm*10/referenceLength;
  const pageLimit=best.count>100;
  const fits=Number.isFinite(scale)&&scale>0&&scale<=best.fit+1e-8&&!pageLimit;
  const drawW=(best.maxX-best.minX)*scale,drawH=(best.maxY-best.minY)*scale;
  const fraction=v=>Math.max(0,Math.min(1,(Number(v)||0)/100));
  const tx=(width-drawW)*(layout?fraction(layout.x):.5)-best.minX*scale,ty=(height-drawH)*(layout?fraction(layout.y):.5)-best.minY*scale;
  return{...format,tileW,tileH,width,height,...best,scale,edgeCm,maxCm,fits,drawW,drawH,pageLimit,autoTiles:tiled,transform:`translate(${tx} ${ty}) scale(${scale}) rotate(${best.angle})`};
}

export function initPrinting({getName,getTemplate,prefix='',referenceLabel='Arista señalada',isActive=()=>!prefix&&location.hash.split('/')[0]==='#imprimir'}){
  const $=selector=>document.querySelector(prefix&&selector.startsWith('#')?`#${prefix}${selector.slice(1)}`:selector);let current=null;
  const root=document.getElementById('printPages')||document.createElement('div');root.id='printPages';if(!root.isConnected)document.body.append(root);
  const pageStyle=document.getElementById('printPageSize')||document.createElement('style');pageStyle.id='printPageSize';if(!pageStyle.isConnected)document.head.append(pageStyle);
  const placement=document.createElement('section');placement.className='print-placement';placement.innerHTML=`<label class="print-placement-toggle"><input id="${prefix}printCustomLayout" type="checkbox"> Personalizar disposición</label><p>Automática: gira y amplía la plantilla para aprovechar el papel. Personalizada: elige el giro y la posición, sin recortar las piezas.</p><div class="print-placement-fields" hidden><label>Giro (°)<input id="${prefix}printRotation" type="number" min="0" max="359" step="1" value="0"></label><label>Tamaño (% del máximo)<input id="${prefix}printZoom" type="number" min="10" max="100" step="1" value="100"></label><label>Posición horizontal<input id="${prefix}printPositionX" type="range" min="0" max="100" value="50"><span>Izquierda ↔ derecha</span></label><label>Posición vertical<input id="${prefix}printPositionY" type="range" min="0" max="100" value="50"><span>Arriba ↔ abajo</span></label><button type="button" class="ghost-btn">Centrar</button></div>`;
  $('#printSummary').before(placement);
  const custom=$('#printCustomLayout'),fields=placement.querySelector('.print-placement-fields');
  const tiling=document.createElement('label');tiling.className='print-exact-tiling';tiling.innerHTML=`<input id="${prefix}printAutoTiles" type="checkbox" checked> Usar las hojas necesarias, sin reducir la medida`;
  placement.before(tiling);$('#printAutoTiles').addEventListener('change',prepare);
  custom.addEventListener('change',()=>{if(custom.checked&&current)$('#printRotation').value=current.plan.angle;prepare()});
  placement.querySelector('button').addEventListener('click',()=>{$('#printPositionX').value=50;$('#printPositionY').value=50;prepare()});
  fields.addEventListener('input',prepare);
  function prepare(){
    const source=getTemplate(),points=[];
    source.querySelectorAll('polygon').forEach(p=>{const values=p.getAttribute('points').trim().split(/[ ,]+/).map(Number);for(let i=0;i<values.length;i+=2)points.push([values[i],values[i+1]])});
    const edge=source.querySelector('.measure-edge')||source.querySelector('line');if(!edge||!points.length)return;
    const referenceLength=Math.hypot(Number(edge.getAttribute('x2'))-Number(edge.getAttribute('x1')),Number(edge.getAttribute('y2'))-Number(edge.getAttribute('y1')));
    const formatKey=$('#printFormat').value,exact=$('#printScale').value==='exact';
    tiling.hidden=!exact;
    fields.hidden=!custom.checked;$('#printZoom').disabled=exact;$('#printZoom').title=exact?'El tamaño lo determina la medida exacta.':'Porcentaje del máximo que cabe con el giro elegido.';
    const layout=custom.checked?{angle:$('#printRotation').value,zoom:$('#printZoom').value,x:$('#printPositionX').value,y:$('#printPositionY').value}:null;
    const plan=planTemplate(points,referenceLength,formatKey,exact?Number($('#printEdgeCm').value):null,layout,exact&&$('#printAutoTiles').checked);
    $('#printEdgeField').hidden=!exact;
    const template=source.cloneNode(true);template.querySelectorAll('.vertex-marker').forEach(n=>n.remove());
    // A glue tab's perimeter is cut; the original edge beneath it is folded.
    template.querySelectorAll('.glue-tab').forEach(tab=>{
      const base=tab.nextElementSibling;
      if(base?.matches('.cut-edge')){base.classList.remove('cut-edge');base.classList.add('fold-edge')}
      const coords=tab.getAttribute('points').trim().split(/\s+/);
      const outline=document.createElementNS('http://www.w3.org/2000/svg','path');
      outline.setAttribute('d',`M${coords[0]} L${coords[3]} L${coords[2]} L${coords[1]}`);
      outline.setAttribute('class','cut-edge');outline.setAttribute('fill','none');
      tab.setAttribute('style','stroke:none');tab.after(outline);
    });
    (template.querySelector('.measure-edge')||template.querySelector('line')).classList.add('reference-edge');
    const name=escape(getName()),mosaic=plan.cols*plan.rows>1;
    const summary=`${referenceLabel}: ${number(plan.edgeCm)} cm · Plantilla: ${number(plan.drawW/10,1)} × ${number(plan.drawH/10,1)} cm · ${plan.cols*plan.rows} hoja${mosaic?'s':''} · ${plan.cols} columna(s) × ${plan.rows} fila(s)${plan.autoTiles?' · Medida exacta, sin reducción':''}`;
    $('#printSummary').textContent=summary;
    $('#printWarning').textContent=plan.fits?'':plan.pageLimit?'Esta medida requiere más de 100 hojas. Reduce la medida o utiliza papel de mayor tamaño.':`Esta medida no cabe o no es válida. El máximo para este montaje es ${number(plan.maxCm)} cm. Introduce una medida positiva o activa «Usar las hojas necesarias».`;
    $('#printWarning').hidden=plan.fits;$('#printNet').disabled=!plan.fits;$('#downloadSvg').disabled=!plan.fits;
    $('#assemblyHelp').hidden=!mosaic;
    $('#assemblyHelp').textContent=`Montaje de ${plan.cols} columna${plan.cols>1?'s':''} × ${plan.rows} filas. Cada hoja: ${number(plan.w/10,1)} × ${number(plan.h/10,1)} cm. Área útil montada: ${number(plan.width/10,1)} × ${number(plan.height/10,1)} cm, descontando márgenes y solapes. En cada unión, recorta el margen blanco de una hoja por la guía naranja y superpón las bandas de 8 mm de ambas hojas. Haz coincidir las cruces; pega las hojas y después recorta la figura. Imprime al 100 %, sin ajustar.`;
    pageStyle.textContent=`@media print{@page{size:${plan.w}mm ${plan.h}mm;margin:0}}`;
    const pages=[];
    for(let row=0;row<(plan.fits?plan.rows:0);row++)for(let col=0;col<plan.cols;col++){
      const index=row*plan.cols+col+1,x=col*(plan.tileW-OVERLAP),y=row*(plan.tileH-OVERLAP);
      const cross=(cx,cy)=>`<path d="M${cx-2} ${cy}h4 M${cx} ${cy-2}v4" fill="none" stroke="#a94b00" stroke-width=".25"/>`;
      let guides='';
      if(mosaic){
        guides=`<rect class="assembly-guide" x="${MM_MARGIN}" y="${MM_MARGIN}" width="${plan.tileW}" height="${plan.tileH}"/>`;
        if(col<plan.cols-1)guides+=`<path class="assembly-guide" d="M${plan.w-MM_MARGIN-OVERLAP} ${MM_MARGIN}v${plan.tileH}"/>`;
        if(row<plan.rows-1)guides+=`<path class="assembly-guide" d="M${MM_MARGIN} ${plan.h-MM_MARGIN-OVERLAP}h${plan.tileW}"/>`;
        // Shared coordinates in the overlap make adjacent printed sheets register exactly.
        for(const cx of [OVERLAP/2,plan.tileW-OVERLAP/2])for(const cy of [OVERLAP/2,plan.tileH-OVERLAP/2])guides+=cross(MM_MARGIN+cx,MM_MARGIN+cy);
      }
      const label=`${name} · ${referenceLabel.toLowerCase()} ${number(plan.edgeCm)} cm${mosaic?` · Fila ${row+1}, columna ${col+1} · ${index}/${plan.cols*plan.rows}`:''}`;
      pages.push(`<article class="print-page" style="width:${plan.w}mm;height:${plan.h}mm"><svg class="print-sheet" xmlns="http://www.w3.org/2000/svg" width="${plan.w}mm" height="${plan.h}mm" viewBox="0 0 ${plan.w} ${plan.h}" role="img" aria-label="${label}"><style>${drawingStyle}</style><defs><clipPath id="tile-${index}"><rect x="7" y="7" width="${plan.tileW}" height="${plan.tileH}"/></clipPath></defs><text x="7" y="4.5" font-size="2.7">${label}</text><g clip-path="url(#tile-${index})"><g transform="translate(${MM_MARGIN-x} ${MM_MARGIN-y})"><g transform="${plan.transform}">${template.innerHTML}</g></g></g>${guides}<g transform="translate(7 ${plan.h-4})"><path d="M0 -1v2 M0 0h50 M50 -1v2" stroke="#111" fill="none" stroke-width=".3"/><text x="54" y="1" font-size="2.7">5 cm · comprobar con regla · imprimir al 100 %</text></g></svg></article>`);
    }
    // Preview and print use separate IDs for their clipping paths.
    root.innerHTML=pages.join('');$('#printPreview').innerHTML=pages.join('').replaceAll('tile-','preview-tile-');
    $('#printPreview').dataset.pages=String(pages.length);
    current={plan,template,summary,name};return current;
  }
  ['#printFormat','#printScale','#printEdgeCm'].forEach(selector=>$(selector).addEventListener('input',prepare));
  $('#printNet').addEventListener('click',()=>{const result=prepare();if(!result?.plan.fits)return;window.print()});
  window.addEventListener('beforeprint',()=>{if(isActive())prepare()});
  $('#downloadSvg').addEventListener('click',()=>{
    const result=prepare();if(!result?.plan.fits)return;const{plan,template,name}=result;
    const svg=`<svg class="print-sheet" xmlns="http://www.w3.org/2000/svg" width="${plan.width}mm" height="${plan.height}mm" viewBox="0 0 ${plan.width} ${plan.height}"><title>${name} · ${referenceLabel.toLowerCase()} ${number(plan.edgeCm)} cm</title><style>${drawingStyle}</style><g transform="${plan.transform}">${template.innerHTML}</g></svg>`;
    const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'})),link=document.createElement('a');link.href=url;link.download=`plantilla-${getName().toLowerCase().replaceAll(' ','-')}-${$('#printFormat').value}.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  return{prepare};
}
