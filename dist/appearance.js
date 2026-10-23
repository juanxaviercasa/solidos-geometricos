const defaults={size:'normal',font:'manrope',accent:'violet',theme:'light'};
const fonts={manrope:'Manrope, system-ui, sans-serif',arial:'Arial, Helvetica, sans-serif',verdana:'Verdana, Geneva, sans-serif',georgia:'Georgia, serif'};
const colors={violet:['#5141cc','#efedff','#bcb4ed'],blue:['#1753a5','#eaf2ff','#a8c3ee'],green:['#176b4b','#e7f6ef','#a3d2be'],orange:['#95430d','#fff1e7','#e9bd9d']};
export function initAppearance(onChange){
 let state={...defaults};try{const saved=JSON.parse(localStorage.getItem('zenit-appearance')||'{}');for(const key of Object.keys(defaults))if(typeof saved[key]==='string')state[key]=saved[key]}catch{}
 const $=id=>document.getElementById(id);
 function apply(){
  if(!['normal','large','classroom'].includes(state.size))state.size='normal';if(!fonts[state.font])state.font='manrope';if(!colors[state.accent])state.accent='violet';if(!['light','dark'].includes(state.theme))state.theme='light';
  document.documentElement.dataset.readingSize=state.size;document.documentElement.style.setProperty('--reading-scale',{normal:1,large:1.2,classroom:1.4}[state.size]);document.documentElement.style.setProperty('--reading-font',fonts[state.font]);
  const [accent,soft,border]=colors[state.accent];document.documentElement.style.setProperty('--violet',state.theme==='dark'?{violet:'#b6aaff',blue:'#8dbbff',green:'#83dab3',orange:'#ffc28e'}[state.accent]:accent);document.documentElement.style.setProperty('--violet-soft',state.theme==='dark'?'#283443':soft);document.documentElement.style.setProperty('--accent-line',border);
  for(const key of ['--violet','--violet-soft'])document.body.style.setProperty(key,document.documentElement.style.getPropertyValue(key));
  document.body.classList.toggle('dark',state.theme==='dark');$('themeToggle').textContent=state.theme==='dark'?'☀':'☾';
  for(const key of Object.keys(defaults))$('appearance-'+key).value=state[key];
  try{localStorage.setItem('zenit-appearance',JSON.stringify(state))}catch{}
  requestAnimationFrame(onChange);
 }
 for(const key of Object.keys(defaults))$('appearance-'+key).addEventListener('change',event=>{state[key]=event.target.value;apply()});
 $('appearanceReset').addEventListener('click',()=>{state={...defaults};apply();$('appearanceStatus').textContent='Se restauró la apariencia original.'});
 $('themeToggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';apply()});apply();
}
export function fitKnownQuantity(){const select=document.getElementById('knownQuantity');if(!select?.selectedOptions.length)return;const canvas=document.createElement('canvas'),context=canvas.getContext('2d');context.font=getComputedStyle(select).font;select.style.setProperty('--selected-width',`${Math.ceil(context.measureText(select.selectedOptions[0].textContent).width)+46}px`)}
