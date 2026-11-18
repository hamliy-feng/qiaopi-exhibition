/* 离线地图交互。地理底图与邮路坐标独立于展陈文案。 */
(() => {
  const routes=[
  {
    "id": "manila",
    "name": "马尼拉",
    "country": "菲律宾",
    "destination": "石狮",
    "origin": [
      120.9842,
      14.5995
    ],
    "end": [
      118.648,
      24.733
    ],
    "tag": "夫妻通信",
    "title": "马尼拉至泉州石狮",
    "text": "闽南晋江、石狮一带乡民多往吕宋经商做工。此线收录黄清池自马尼拉寄回石狮的战后家书与汇款。",
    "image": "assets/huang_qingchi_qiaopi.png",
    "record": "QP-001",
    "button": "查看航线档案"
  },
  {
    "id": "singapore",
    "name": "新加坡",
    "country": "新加坡",
    "destination": "潮汕",
    "origin": [
      103.8198,
      1.3521
    ],
    "end": [
      116.682,
      23.354
    ],
    "tag": "平安家信",
    "title": "新加坡至潮汕各邑",
    "text": "星洲是近代潮人出洋的核心中转埠头。此线呈现旅新潮籍华侨寄回故里的报安批信与港口影像。",
    "image": "assets/placeholder-2.svg",
    "record": "DEMO-002",
    "button": "查看航线档案"
  },
  {
    "id": "bangkok",
    "name": "曼谷",
    "country": "泰国",
    "destination": "潮汕",
    "origin": [
      100.5018,
      13.7563
    ],
    "end": [
      116.682,
      23.354
    ],
    "tag": "汇款家用",
    "title": "曼谷至潮汕各邑",
    "text": "暹罗华侨以潮州府籍最为众盛，批局网络密集。此线聚焦侨批中的赡家银款与家庭开销安排。",
    "image": "assets/placeholder-3.svg",
    "record": "DEMO-003",
    "button": "查看航线档案"
  },
  {
    "id": "penang",
    "name": "槟城",
    "country": "马来亚",
    "destination": "福建",
    "origin": [
      100.3294,
      5.4141
    ],
    "end": [
      118.648,
      24.733
    ],
    "tag": "女性持家",
    "title": "槟榔屿至闽南侨乡",
    "text": "闽籍华人开发槟城甚早。此线通过往来书信，展现海外谋生者与留守侨眷之间的家务托付。",
    "image": "assets/placeholder-4.svg",
    "record": "DEMO-004",
    "button": "查看航线档案"
  },
  {
    "id": "jakarta",
    "name": "雅加达",
    "country": "印度尼西亚",
    "destination": "梅州",
    "origin": [
      106.8456,
      -6.2088
    ],
    "end": [
      116.123,
      24.289
    ],
    "tag": "子女教育",
    "title": "巴达维亚至嘉应梅州",
    "text": "粤东客籍移民多赴荷属东印度谋生，素重桑梓文教。此线收录海外父兄过问子弟学业与筹措学费的家书。",
    "image": "assets/placeholder-5.svg",
    "record": "DEMO-005",
    "button": "查看航线档案"
  }
];
  const data=window.QIAOPI_MAP,W=data.width,H=data.height;
  const merc=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*180/Math.PI;
  const xy=([lon,lat])=>[(lon-90)*20,(merc(29)-merc(lat))*20];
  const curve=r=>{const a=xy(r.origin),b=xy(r.end),dx=b[0]-a[0],dy=b[1]-a[1];return `M${a} Q${(a[0]+b[0])/2-dy*.2},${(a[1]+b[1])/2+dx*.2} ${b}`;};
  const labels=[['中国',108,26.3,'land-name'],['泰国',99.2,17.9,'country-name'],['越南',107.8,17.2,'country-name'],['菲律宾',125.4,10.9,'country-name'],['马来半岛',102.1,8.8,'region-name'],['苏门答腊',100.3,-1.8,'region-name'],['婆罗洲',114.5,1.3,'region-name'],['爪哇岛',111,-6.5,'region-name'],['南 海',113.5,12.7,'ocean-name'],['太 平 洋',133,20,'ocean-name']];
  let controller=null,selected='manila',zoom=1,panX=0,panY=0,all=true,drag=null;
  const $=s=>document.querySelector(s);
  function template(){return `<div class="container atlas-page"><section class="page-intro"><p class="eyebrow">LETTERS IN MOTION</p><h1 class="page-title">山海邮路：从南洋埠头到闽粤侨乡</h1><p class="page-subtitle">近代华侨依方言与宗族聚居海外，水客与批局网络亦循此延伸。点击地图节点，按侨居地与原籍地检索往来银信。</p></section><div class="atlas-layout"><section class="atlas-map" id="atlasMap" aria-label="侨批邮路地图"><div class="atlas-title"><span>南洋侨埠 · 闽粤侨乡</span><small>LETTERS ACROSS THE OCEAN</small></div><svg id="atlasSvg" viewBox="0 0 ${W} ${H}" aria-label="东南亚与中国东南沿海地图"><defs><pattern id="oceanDots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#b0c6c2" opacity=".25"/></pattern><filter id="routeShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".12"/></filter></defs><rect width="${W}" height="${H}" fill="#e6eeed"/><g id="atlasViewport"><rect width="${W}" height="${H}" fill="url(#oceanDots)"/><g class="graticule">${Array.from({length:9},(_,i)=>95+i*5).map(lon=>`<path d="M${xy([lon,29])} L${xy([lon,-8])}"/>`).join('')}${[-5,0,5,10,15,20,25].map(lat=>`<path d="M${xy([90,lat])} L${xy([140,lat])}"/>`).join('')}</g><g class="coastline">${data.paths.map(d=>`<path d="${d}"/>`).join('')}</g><g class="place-labels">${labels.map(([name,lon,lat,cls])=>{const p=xy([lon,lat]);return `<text x="${p[0]}" y="${p[1]}" class="${cls}">${name}</text>`;}).join('')}</g><g id="atlasRoutes">${routes.map(r=>`<path class="mail-route ${r.id==='manila'?'selected':''}" data-route-line="${r.id}" d="${curve(r)}"/>`).join('')}</g><g id="atlasDestinations">${[['石狮',[118.648,24.733],0,-18],['潮汕',[116.682,23.354],-45,-18],['梅州',[116.123,24.289],-50,-24]].map(([n,c,dx,dy])=>{const p=xy(c);return `<g transform="translate(${p})"><circle class="destination-dot" r="5"/><text class="city-label" x="${dx}" y="${dy}">${n}</text></g>`;}).join('')}</g><g>${routes.map(r=>{const p=xy(r.origin);return `<g class="origin-marker ${r.id==='manila'?'selected':''}" data-atlas-route="${r.id}" transform="translate(${p})" tabindex="0" role="button" aria-label="选择${r.name}至${r.destination}邮路"><circle class="marker-halo" r="15"/><circle class="marker-dot" r="5"/><text class="city-label" x="${r.id==='penang'?-18:16}" y="${r.id==='penang'?-18:6}">${r.name}</text></g>`;}).join('')}</g></g></svg><div class="map-compass" aria-label="北向">N<span>↑</span></div><div class="atlas-tools"><button id="atlasZoomIn" aria-label="放大地图">＋</button><button id="atlasZoomOut" aria-label="缩小地图">−</button><button id="atlasReset" aria-label="地图复位">⌖</button></div><div class="atlas-legend"><span><i class="legend-origin"></i>寄信地</span><span><i class="legend-destination"></i>收信地</span><button id="atlasShowAll" aria-pressed="true">全部邮路</button></div></section><aside class="atlas-sidebar"><div class="atlas-sidebar-heading"><p class="eyebrow">FOLLOW THE LETTERS</p><h2>主要侨批邮路</h2></div><div class="atlas-route-list">${routes.map((r,i)=>`<button class="atlas-choice ${i===0?'active':''}" data-atlas-route="${r.id}" aria-pressed="${i===0}"><span class="route-num">${String(i+1).padStart(2,'0')}</span><span><strong>${r.name}<em>→</em>${r.destination}</strong><small>${r.tag}</small></span><span class="choice-arrow">↗</span></button>`).join('')}</div><div id="atlasDetail" class="atlas-detail"></div><button class="atlas-focus" id="atlasFocus">聚焦这条邮路 <span>⤢</span></button></aside></div></div>`;}
  function paint(){const g=$('#atlasViewport');if(g)g.setAttribute('transform',`translate(${panX} ${panY}) scale(${zoom})`);$('#atlasZoomIn').disabled=zoom>=4;$('#atlasZoomOut').disabled=zoom<=1;}
  function select(id){const r=routes.find(x=>x.id===id);if(!r)return;selected=id;document.querySelectorAll('.atlas-choice').forEach(b=>{b.classList.toggle('active',b.dataset.atlasRoute===id);b.setAttribute('aria-pressed',b.dataset.atlasRoute===id);});document.querySelectorAll('.origin-marker').forEach(b=>b.classList.toggle('selected',b.dataset.atlasRoute===id));document.querySelectorAll('[data-route-line]').forEach(p=>{const active=p.dataset.routeLine===id;p.classList.toggle('selected',active);p.style.opacity=active?'1':all?'.28':'0';});$('#atlasDetail').innerHTML=`<img src="${r.image}" alt="${r.title}"><div><p class="eyebrow">${r.tag}</p><h3>${r.title}</h3><p>${r.text}</p><a class="text-link" href="browse.html#collection?q=${encodeURIComponent(r.country)}">${r.button} <span>→</span></a></div>`;}
  function reset(){zoom=1;panX=0;panY=0;paint();}
  function point(e){const p=new DOMPoint(e.clientX,e.clientY);return p.matrixTransform($('#atlasSvg').getScreenCTM().inverse());}
  function scale(factor,center){const z=Math.max(1,Math.min(4,zoom*factor));const p=center||{x:W/2,y:H/2};panX=p.x-(p.x-panX)*z/zoom;panY=p.y-(p.y-panY)*z/zoom;zoom=z;if(zoom===1){panX=0;panY=0;}paint();}
  function init(){destroy();if(!$('#atlasMap'))return;controller=new AbortController();const opts={signal:controller.signal};const map=$('#atlasMap'),svg=$('#atlasSvg');map.addEventListener('wheel',e=>{e.preventDefault();scale(e.deltaY<0?1.12:1/1.12,point(e));},{...opts,passive:false});svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-atlas-route]'))return;drag={point:point(e),x:panX,y:panY};svg.setPointerCapture(e.pointerId);},opts);svg.addEventListener('pointermove',e=>{if(!drag)return;const p=point(e);panX=drag.x+p.x-drag.point.x;panY=drag.y+p.y-drag.point.y;paint();},opts);for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,()=>drag=null,opts);document.querySelectorAll('[data-atlas-route]').forEach(b=>{b.addEventListener('click',()=>select(b.dataset.atlasRoute),opts);if(b.tagName.toLowerCase()==='g')b.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select(b.dataset.atlasRoute);}},opts);});$('#atlasZoomIn').addEventListener('click',()=>scale(1.35),opts);$('#atlasZoomOut').addEventListener('click',()=>scale(1/1.35),opts);$('#atlasReset').addEventListener('click',reset,opts);$('#atlasShowAll').addEventListener('click',()=>{all=!all;$('#atlasShowAll').setAttribute('aria-pressed',all);select(selected);},opts);$('#atlasFocus').addEventListener('click',()=>{const r=routes.find(r=>r.id===selected),a=xy(r.origin),b=xy(r.end),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;zoom=Math.min(3,Math.max(1.2,Math.min((W-250)/(Math.abs(a[0]-b[0])+80),(H-200)/(Math.abs(a[1]-b[1])+80))));panX=W/2-cx*zoom;panY=H/2-cy*zoom;paint();},opts);all=true;reset();select('manila');}
  function destroy(){controller?.abort();controller=null;drag=null;}
  window.QiaopiAtlas={template,init,destroy,select};
})();
