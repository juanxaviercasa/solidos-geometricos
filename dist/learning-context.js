export function solidChallenges(solid,analysis){
 const options=(answer,alternatives)=>[...new Set([String(answer),...alternatives.map(String)])].slice(0,4).sort((a,b)=>Number(a)-Number(b));
 const diagonal=analysis.diagonals.length,faceDiagonal=analysis.facialDiagonals;
 return[
  {q:`${solid.name} tiene ${solid.faces} caras y ${solid.vertices} vértices. ¿Cuántas aristas exige Euler?`,a:String(solid.edges),opts:options(solid.edges,[solid.edges+2,solid.edges+4,solid.edges-2]),why:`C + V = A + 2. Así, A = ${solid.faces} + ${solid.vertices} − 2 = ${solid.edges}.`},
  {q:`¿Cuántas diagonales espaciales tiene el ${solid.name.toLowerCase()}? No cuentes las diagonales de sus caras.`,a:String(diagonal),opts:options(diagonal,[diagonal+faceDiagonal,diagonal+1,diagonal+2,diagonal+3]),why:`De los ${solid.vertices*(solid.vertices-1)/2} pares de vértices, restamos ${solid.edges} aristas y ${faceDiagonal} diagonales de caras: quedan ${diagonal} diagonales espaciales.`},
  {q:`En el ${solid.name.toLowerCase()}, ¿qué mide un ángulo diedro interior?`,a:'La apertura entre dos caras vecinas',opts:['La apertura entre dos caras vecinas','El ángulo interior de una sola cara','La longitud entre dos vértices','El área total del sólido'],why:'Se mide entre dos caras que comparten una arista, en una sección perpendicular a esa arista. No es el ángulo de un polígono de una cara.'},
  {q:`Si duplicas todas las longitudes del ${solid.name.toLowerCase()}, incluida la altura cuando corresponda, ¿cómo cambia el volumen?`,a:'Se multiplica por 8',opts:['Se multiplica por 2','Se multiplica por 4','Se multiplica por 8','No cambia'],why:'En una ampliación proporcional por 2, las áreas se multiplican por 2² = 4 y los volúmenes por 2³ = 8. En un prisma se duplican tanto la arista como la altura.'},
  {q:`Al desplegar el ${solid.name.toLowerCase()} sin separar sus caras, ¿qué se conserva?`,a:'Las caras y sus medidas',opts:['Las caras y sus medidas','Todos los ángulos diedros','El volumen encerrado','Todas las uniones originales entre aristas'],why:`La plantilla conserva sus ${solid.faces} caras y sus medidas. Se cortan algunas uniones y cambian los diedros; una plantilla plana no encierra el volumen del sólido.`}
 ];
}

export function contextualTheory(solid,analysis,topic,format,unit,edge){
 const diagonal=analysis.diagonals.length,angles=analysis.diedros.map(item=>`${format(item.angle)}°`).join(' y ');
 const descriptions={
  basics:`Cuenta ${solid.faces} caras, ${solid.vertices} vértices y ${solid.edges} aristas. Sus caras son ${solid.face.toLowerCase()}.`,
  regular:solid.family==='Platónios'?`Este es uno de los cinco sólidos platónicos: sus caras son polígonos regulares congruentes y en cada vértice se repite la misma configuración.`:`Este sólido pertenece a la familia de ${solid.family.toLowerCase()}. Compáralo con los platónicos: tener simetría no basta para que todas las caras sean congruentes.`,
  euler:`Con ${solid.faces} caras y ${solid.vertices} vértices: ${solid.faces} + ${solid.vertices} = ${solid.edges} + 2. Ambos lados valen ${solid.faces+solid.vertices}.`,
  angles:`Sus diedros interiores miden ${angles}. Resalta dos caras vecinas y compara la apertura con los ángulos que ves dentro de cada cara.`,
  nets:`Su plantilla está formada por ${solid.faces} caras conectadas. Observa cómo cambian los diedros al plegar, mientras cada cara conserva su forma y sus medidas.`
 };
 const mission=topic==='angles'?'dihedral':topic==='nets'?'net':topic==='euler'?'vertices':'diagonals';
 const labels={dihedral:'Observar el diedro en 3D',net:'Explorar el desarrollo 2D',vertices:'Resaltar los vértices',diagonals:diagonal?'Señalar una diagonal en 3D':'Comprobar por qué no tiene diagonales espaciales'};
 return `<section class="context-example"><span class="eyebrow">APLICA LO QUE LEES</span><h3>Tu ejemplo: ${solid.name}</h3><p>${descriptions[topic]}</p><div class="context-numbers"><span><b>${solid.faces}</b> caras</span><span><b>${solid.vertices}</b> vértices</span><span><b>${diagonal}</b> diagonales espaciales</span></div><p class="context-reference">Arista actual: ${format(edge)} ${unit}. Las diagonales espaciales unen vértices que no comparten una cara.</p><button class="primary-btn" data-explore-mission="${mission}">${labels[mission]} →</button></section>`;
}
