// Decorative portada imagery is separate from the exact interactive models.
export function initHomePresentation(){
 const home=document.querySelector('[data-resource-page="inicio"]');
 const hero=home.querySelector('.solids-hero');
 const heading=home.querySelector('.resource-heading');
 heading.querySelector('h1').innerHTML='La geometría<br><em>cobra forma.</em>';
 hero.innerHTML='<div class="home-hero-copy"><div class="home-hero-heading"></div><p>Gira un sólido. Despliega sus caras. Descubre de dónde salen sus medidas.</p><div class="home-hero-actions"><a class="home-primary" href="#laboratorio">Explorar en 3D <span aria-hidden="true">↗</span></a><a class="home-secondary" href="#espacio">Entender los ángulos →</a></div><div class="home-topics"><span>Modelos interactivos</span><span>Fórmulas paso a paso</span><span>Plantillas para construir</span></div></div><figure class="home-hero-art"><img src="./assets/solidos-estudio.png" width="1536" height="1024" alt="Ilustración de estudio con un poliedro violeta, un cono coral, un cilindro verde, una esfera y un cubo amarillo" fetchpriority="high" decoding="async"><figcaption>Del plano al espacio: observa, experimenta y comprende.</figcaption></figure>';
 hero.querySelector('.home-hero-heading').append(heading);
 home.querySelector('.resource-header').hidden=true;
 const modules=home.querySelector('.solids-modules');
 modules.insertAdjacentHTML('beforebegin','<div class="home-section-heading"><div><span class="eyebrow">ELIGE TU PUNTO DE PARTIDA</span><h2>Tres maneras de explorar el espacio</h2></div><p>Una misma geometría. Distintas formas de descubrirla.</p></div>');
 const drawings=[
  '<ellipse cx="170" cy="178" rx="116" ry="12" fill="#6b50be" opacity=".13"/><path d="M70 62 144 30 210 66 136 103Z" fill="#c6b7ff"/><path d="M70 62V143L136 181V103Z" fill="#8c70e7"/><path d="M136 103 210 66V145L136 181Z" fill="#6244b7"/><path d="M70 62 144 30 210 66V145L136 181 70 143Z M70 62 136 103 210 66 M136 103V181" fill="none" stroke="#482a99" stroke-width="2" stroke-linejoin="round"/><path d="M232 152 264 90 298 152Z" fill="#ffad83" stroke="#da7956" stroke-width="2"/><path d="M232 152 266 169 298 152M264 90 266 169" fill="none" stroke="#da7956" stroke-width="2"/>',
  '<ellipse cx="172" cy="178" rx="120" ry="12" fill="#3d8c80" opacity=".14"/><path d="M55 70V153C55 178 131 178 131 153V70" fill="#82c5b3" stroke="#3a8d7e" stroke-width="2"/><ellipse cx="93" cy="70" rx="38" ry="15" fill="#cae8d9" stroke="#3a8d7e" stroke-width="2"/><path d="M150 159 188 45 226 159" fill="#ffb090" stroke="#d77859" stroke-width="2"/><ellipse cx="188" cy="159" rx="38" ry="12" fill="#ef9675" stroke="#d77859" stroke-width="2"/><circle cx="259" cy="124" r="39" fill="url(#home-sphere)"/><defs><radialGradient id="home-sphere" cx="30%" cy="25%"><stop stop-color="#ffefb9"/><stop offset=".55" stop-color="#f2cf76"/><stop offset="1" stop-color="#c59c42"/></radialGradient></defs>',
  '<ellipse cx="170" cy="178" rx="116" ry="12" fill="#ca8250" opacity=".12"/><path d="M169 162 65 100 165 43Z" fill="#c6b7ff" fill-opacity=".8" stroke="#7f63cd" stroke-width="2"/><path d="M169 162 165 43 278 100Z" fill="#ffd49f" fill-opacity=".8" stroke="#c88b4b" stroke-width="2"/><path d="M169 162 165 43" stroke="#5e459b" stroke-width="4"/><path d="M169 133 146 119Q164 105 190 119Z" fill="#f5aa42" fill-opacity=".8" stroke="#bd7620" stroke-width="2"/><path d="M115 128 167 99 223 128 169 159Z" fill="#fff" fill-opacity=".3" stroke="#a894c5" stroke-dasharray="5 4"/><circle cx="169" cy="162" r="4" fill="#5e459b"/>'
 ];
 modules.querySelectorAll('.solid-module').forEach((card,index)=>{
  const svg=card.querySelector('svg');svg.setAttribute('viewBox','0 0 340 210');svg.innerHTML=drawings[index];
  const visual=document.createElement('div');visual.className=`home-module-art home-art-${index}`;svg.before(visual);visual.append(svg);
 });
}
