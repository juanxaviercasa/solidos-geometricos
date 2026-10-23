let precision='2';
export function setPrecision(value){precision=['0','1','2','3','4','6','12'].includes(String(value))?String(value):'2'}
export function displayNumber(value){return new Intl.NumberFormat('es-PE',{useGrouping:false,minimumFractionDigits:Number(precision),maximumFractionDigits:Number(precision)}).format(value)}
export function numericInput(value){const text=value.toFixed(Number(precision));return value>0&&Number(text)===0?value.toExponential(Number(precision)):text}
export function mathNumber(value){return displayNumber(value).replace(/,/g,'{,}')}
