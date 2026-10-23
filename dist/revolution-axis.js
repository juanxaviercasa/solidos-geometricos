export function relativeToAxis(profile,axis){
 if(!Number.isFinite(axis))throw Error('El eje debe tener una posición finita.');
 const all=[...profile.curve,...profile.region],distances=all.map(p=>p[0]-axis),lo=Math.min(...distances),hi=Math.max(...distances);
 if(lo< -1e-8&&hi>1e-8)throw Error('El eje atraviesa la figura. Pappus‑Guldin no se aplica directamente: mueve el eje fuera de su interior.');
 const side=hi<=1e-8?-1:1,convert=points=>points.map(([x,y])=>[Math.max(0,side*(x-axis)),y]);
 const lx=Math.abs(profile.lx-axis),cx=Math.abs(profile.cx-axis);
 return {...profile,curve:convert(profile.curve),region:convert(profile.region),lx,cx,surface:2*Math.PI*lx*profile.length,volume:2*Math.PI*cx*profile.area,axisX:axis,axisSide:side,originalCurve:profile.curve,originalRegion:profile.region,originalLX:profile.lx,originalCX:profile.cx};
}
