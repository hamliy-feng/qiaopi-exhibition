(() => {
'use strict';
const root=document.querySelector('#readerMain'),query=new URLSearchParams(location.search),id=query.get('id')||'';
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!/^QP\d{6}$/.test(id)){root.textContent='侨批编号无效';return;}
const doc=(window.QIAOPI_ARCHIVE_RECORDS||{})[id];
if(!doc){root.textContent='未找到对应档案';return;}
document.title=doc.title+' · 侨批展读';
const img=doc.images||{},parts=img.parts||[],top=parts.filter(x=>x.role!=='topic').slice(0,2),middle=parts.find(x=>x.role==='topic');
const figure=(it,cls)=>'<figure class="'+cls+'"><button type="button" data-image="'+safe(it.src)+'" aria-label="查看原始影像"><img src="'+safe(it.src)+'" alt="'+safe(it.caption||'侨批原件')+'" loading="lazy"></button><figcaption>'+safe(it.caption||'侨批影像')+'</figcaption></figure>';
if(!top.length&&img.main)top.push({src:img.main,caption:'本封侨批原件'});
const introImages='<div class="reader-split">'+top.map(x=>figure(x,'reader-paper-figure')).join('')+'</div>';
const mid=middle?figure(middle,'reader-mid-figure'):img.main?figure({src:img.main,caption:'原始批信影像'},'reader-mid-figure'):'';
const sections=doc.sections||[],midpoint=Math.max(0,Math.floor(sections.length/2)-1);
const text=sections.map((p,i)=>'<div class="reader-paragraphs"><article class="reader-paragraph"><p class="reader-original">'+safe(p.original)+'</p>'+(p.translation?'<p class="reader-translation">'+safe(p.translation)+'</p>':'')+'</article></div>'+(i===midpoint?mid:'')).join('')||mid;
const f=[['原始纪年',doc.date_original],['寄信人',(doc.sender||[]).join('、')],['收信人',(doc.recipient||[]).join('、')],['寄信地',(doc.origin||[]).join(' · ')],['收信地',(doc.destination||[]).join(' · ')],['随批金额',(doc.amounts||[]).map(x=>x.display||x.amount_original||x.currency_original+' '+x.amount).join('、')],['主题',(doc.themes||[]).join('、')]].filter(x=>x[1]);
const info=f.map(x=>'<div class="reader-fact"><dt>'+safe(x[0])+'</dt><dd>'+safe(x[1])+'</dd></div>').join('');
const rel=(doc.relationships||[]).map(x=>'<p>'+safe(x.from)+' → '+safe(x.type)+' → '+safe(x.to)+'</p>').join('');
const prev=doc.prev_id?'<a href="record.html?id='+doc.prev_id+'"><span>← 上一封</span>'+doc.prev_id+'</a>':'<span></span>';
const next=doc.next_id?'<a href="record.html?id='+doc.next_id+'"><span>下一封 →</span>'+doc.next_id+'</a>':'<span></span>';
root.innerHTML='<div class="reader-shell"><section class="reader-cover"><p class="reader-kicker">LETTERS ACROSS THE OCEAN · '+id+'</p><h1>'+safe(doc.title)+'</h1><p class="reader-meta">'+[doc.year,(doc.origin||[]).join(' · '),(doc.destination||[]).join(' · ')].filter(Boolean).map(x=>'<span>'+safe(x)+'</span>').join('')+'</p><p class="reader-intro">'+safe(doc.intro)+'</p></section>'+
introImages+text+
'<section class="reader-evidence"><h2>这封信的档案信息</h2><dl class="reader-facts">'+info+'</dl>'+(rel?'<h2 style="margin-top:35px">信中人物关系</h2><div class="reader-relations">'+rel+'</div>':'')+
'<p class="reader-sources">侨批 '+id+'　<button type="button" class="reader-source-link" data-image="'+safe(img.main)+'">查看原始影像 ↗</button></p></section>'+
'<nav class="reader-pager">'+prev+next+'</nav></div>';
const dialog=document.querySelector('#readerImageDialog'),image=document.querySelector('#readerImage'),stage=document.querySelector('#readerImageStage');
let zoom=1,dx=0,dy=0,start=null;const update=()=>image.style.transform='translate('+dx+'px,'+dy+'px) scale('+zoom+')';
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-image]');if(!b)return;image.src=b.dataset.image;zoom=1;dx=0;dy=0;update();dialog.showModal();});
document.querySelector('#readerImageClose').onclick=()=>dialog.close();
stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.min(6,Math.max(.5,zoom+(e.deltaY<0?.2:-.2)));update()},{passive:false});
stage.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,dx,dy};stage.setPointerCapture(e.pointerId)});
stage.addEventListener('pointermove',e=>{if(!start)return;dx=start.dx+e.clientX-start.x;dy=start.dy+e.clientY-start.y;update()});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stage.addEventListener(ev,()=>start=null));
})();