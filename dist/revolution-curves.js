export const curveKinds=['oblique','parabola','wave','bezier','trace','ellipse'];
export function sampledCurveProfile(kind,r,h,b,points=[]){
 let curve,closed=kind==='ellipse',equation='';const n=320;
 if(kind==='trace'||kind==='bezier'){
  if(points.length<2||points.length>40||points.some(p=>p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>200)))throw Error('Usa de 2 a 40 puntos x,y finitos entre −200 y 200.');
  if(kind==='bezier'&&points.length!==4)throw Error('Una Bézier cúbica requiere cuatro puntos: inicio, dos controles y final.');
 }
 if(kind==='trace'){curve=points;equation='\\text{Trazo poligonal abierto: segmentos entre puntos consecutivos}'}
 else if(kind==='bezier'){curve=Array.from({length:n+1},(_,i)=>{const t=i/n,s=1-t;return [0,1].map(k=>s*s*s*points[0][k]+3*s*s*t*points[1][k]+3*s*t*t*points[2][k]+t*t*t*points[3][k])});equation='B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3'}
 else if(kind==='ellipse'){if(b<=r)throw Error('Para esta elipse exterior, la distancia de su centro al eje debe superar el semieje horizontal.');curve=Array.from({length:n+1},(_,i)=>{const t=2*Math.PI*i/n;return [b+r*Math.cos(t),h/2*Math.sin(t)]});equation='x(t)=b+r\\cos t,\\quad y(t)=\\frac h2\\sin t'}
 else {curve=Array.from({length:n+1},(_,i)=>{const t=i/n;return [b+r*(kind==='oblique'?t:kind==='parabola'?t*t:.6+.4*Math.sin(2*Math.PI*t)),h*(t-.5)]});equation=kind==='oblique'?'x(t)=b+rt,\\quad y(t)=h(t-\\frac12)':kind==='parabola'?'x(t)=b+rt^2,\\quad y(t)=h(t-\\frac12)':'x(t)=b+r(0.6+0.4\\sin(2\\pi t)),\\quad y(t)=h(t-\\frac12)'}
 // Reject self-crossings/retracing: Pappus cannot count overlapping sweeps as union area.
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=0;i<curve.length-1;i++)for(let j=i+2;j<curve.length-1;j++){
  if(closed&&i===0&&j===curve.length-2)continue;const a=curve[i],bb=curve[i+1],c=curve[j],d=curve[j+1];
  if(Math.max(a[0],bb[0])+1e-9<Math.min(c[0],d[0])||Math.max(c[0],d[0])+1e-9<Math.min(a[0],bb[0])||Math.max(a[1],bb[1])+1e-9<Math.min(c[1],d[1])||Math.max(c[1],d[1])+1e-9<Math.min(a[1],bb[1]))continue;
  if(cross(a,bb,c)*cross(a,bb,d)<=0&&cross(c,d,a)*cross(c,d,bb)<=0)throw Error('El trazo se cruza o se superpone. Corrige los puntos para obtener una curva simple.');
 }
 let length=0,mx=0,my=0;for(let i=0;i<curve.length-1;i++){const a=curve[i],c=curve[i+1],l=Math.hypot(c[0]-a[0],c[1]-a[1]);if(l<1e-10)throw Error('No repitas puntos consecutivos.');length+=l;mx+=l*(a[0]+c[0])/2;my+=l*(a[1]+c[1])/2}
 const area=closed?Math.PI*r*h/2:0,lx=mx/length,ly=my/length;
 return {curve,region:closed?curve.slice(0,-1):curve,hasRegion:closed,area,cx:closed?b:lx,cy:closed?0:ly,length,lx,ly,volume:closed?2*Math.PI*b*area:0,surface:2*Math.PI*lx*length,equation,numeric:true};
}
