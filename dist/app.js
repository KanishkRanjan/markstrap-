'use strict';
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const slides=$$('.slide');
const slideNotes=[
  'Open with the question, then introduce the marketing lead. They already have expertise and market insight. Their constraint is the effort required to explore another audience, message, or creative direction. The hands establish the division of work: humans provide intent and judgment; agents expand execution capacity. MarkStrap supports both established teams and smaller organizations.',
  'These are external industry findings, not evidence of MarkStrap performance. Adobe surveyed more than 1,600 marketers in 2025. Nielsen surveyed 1,400 marketing professionals, all with annual budgets of at least US$1 million. That makes the Nielsen finding particularly relevant to established teams. The figures describe different challenges and should not be added together.',
  'This is an illustrative model. Three audiences, four messages and three formats make 36 possible creative combinations—not 36 statistically independent experiments. At the selected production-effort assumption, the display shows the total effort to produce them separately. Reuse and batching may lower that effort. Media spend and time to collect meaningful outcomes are excluded. Do not claim that MarkStrap removes the need for real tests.',
  'Introduce MarkStrap as a proposed AI marketing agency with a continuous learning loop. Its distinction is the connection between exploration, production, distribution and evaluation. Simulation ranks hypotheses; the audience supplies the evidence. The user sets the goal, budget and rules and retains approval. This is broader than a short-form video tool.',
  'This walkthrough illustrates intended behavior, not a live backend or connected advertising account. Use the scenario buttons to show the same five stages for a coaching center, tourism board and unbuilt idea. Input adapts to what exists: a brochure, official footage, prototype, link or description. Desired action determines the destination. Avoid requiring a lengthy prompt or a different product mode.',
  'Describe a workflow comparison, not measured customer improvement. For a pilot, compare matched campaign scopes with the existing process. Measure elapsed time to launch, total cost per experiment and result-to-next-test turnaround. Also monitor qualified outcomes and creative quality. Do not promise a percentage improvement before observing it.',
  'Optional technical explanation: source materials feed a structured campaign brief. Specialist agents propose and critique hypotheses using shared campaign memory. Selected concepts enter production and approval, then platform connectors distribute them. Actual response data goes to evaluation and the next experiment. The proposed implementation needs orchestration, a persistent data store, production services and platform/analytics APIs; specific technologies remain to be confirmed.',
  'Close on capacity rather than replacing expertise. Smaller organizations can access a broader set of marketing functions; established teams can extend experimentation capacity. The next validation step is a measured pilot with a real marketing team. Team credentials have deliberately been left out until the actual members and experience are supplied. Invite the judges to revisit the walkthrough or evidence.'
];
let current=0, paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dots=$('#slide-dots'), overviewGrid=$('#overview-grid');
slides.forEach((slide,i)=>{
  const dot=document.createElement('button');dot.setAttribute('aria-label',`Slide ${i+1}: ${slide.dataset.title}`);dot.addEventListener('click',()=>go(i));dots.append(dot);
  const item=document.createElement('button');item.className='overview-item';item.innerHTML=`<span class="mono">${String(i+1).padStart(2,'0')} /</span><strong>${slide.dataset.title}</strong>`;item.addEventListener('click',()=>{$('#overview').close();go(i)});overviewGrid.append(item);
});
function go(index,writeHash=true){
  current=Math.max(0,Math.min(slides.length-1,index));
  slides.forEach((slide,i)=>{const active=i===current;slide.hidden=!active;slide.inert=!active;slide.classList.toggle('active',active);if(active)slide.scrollTop=0});
  $$('#slide-dots button').forEach((b,i)=>{b.classList.toggle('current',i===current);b.classList.toggle('past',i<current);if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  $$('.overview-item').forEach((b,i)=>b.classList.toggle('current',i===current));
  $('#slide-number').textContent=String(current+1).padStart(2,'0');$('#slide-name').textContent=slides[current].dataset.title;
  $('#previous').disabled=current===0;$('#next').disabled=current===slides.length-1;
  $('#notes-text').textContent=slideNotes[current];$('.slide-announcement').textContent=`Slide ${current+1} of ${slides.length}: ${slides[current].dataset.title}`;
  if(writeHash)history.replaceState(null,'',`#${current+1}`);
  window.setTimeout(()=>{if(hands)hands.resize()},40);
}
$('#previous').addEventListener('click',()=>go(current-1));$('#next').addEventListener('click',()=>go(current+1));
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>go(current+1)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.goto))));
$('.brand').addEventListener('click',e=>{e.preventDefault();go(0)});
function toggleNotes(){const panel=$('#notes-panel');panel.hidden=!panel.hidden;$('#notes-toggle').setAttribute('aria-expanded',String(!panel.hidden))}
$('#notes-toggle').addEventListener('click',toggleNotes);$('#notes-close').addEventListener('click',toggleNotes);
$('#overview-toggle').addEventListener('click',()=>$('#overview').showModal());$('#sources-open').addEventListener('click',()=>$('#sources').showModal());
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
$$('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}}));
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{$('#fullscreen').title='Fullscreen is unavailable in this preview; open the presentation in a browser.'}}
$('#fullscreen').addEventListener('click',fullscreen);
document.addEventListener('fullscreenchange',()=>$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
document.addEventListener('keydown',e=>{
  if($('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1)}
  if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}
  if(e.key==='Home'){e.preventDefault();go(0)}if(e.key==='End'){e.preventDefault();go(slides.length-1)}
  if(e.key.toLowerCase()==='f')fullscreen();if(e.key.toLowerCase()==='n')toggleNotes();if(e.key.toLowerCase()==='o')$('#overview').showModal();if(e.key==='Escape'&&!$('#notes-panel').hidden)toggleNotes();
});
let touchStart=null;$('#deck').addEventListener('touchstart',e=>{if(e.target.closest('button,input,a,.journey-shell'))return;touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});$('#deck').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8)go(current+(dx<0?1:-1));touchStart=null},{passive:true});
window.addEventListener('hashchange',()=>{const n=Number(location.hash.slice(1));if(Number.isInteger(n)&&n>=1&&n<=slides.length)go(n-1,false)});
for(let i=0;i<36;i++){const cell=document.createElement('span');cell.style.setProperty('--v',((i*13)%36)+1);$('#possibility-grid').append(cell)}
$('#hours').addEventListener('input',()=>{const h=Number($('#hours').value);$('#hours-label').textContent=`${h} ${h===1?'hour':'hours'}`;$('#effort').innerHTML=`${36*h}<span>h</span>`});

const scenarios={
  coaching:{label:'COACHING CENTER',name:'Admissions for a new course',materials:[['▤','Course brochure'],['▧','Campus photos'],['↗','Admissions page']],description:'Bring the course details, fees, dates, approved testimonials and existing brand materials.',goal:'Qualified enrollment inquiries',meta:['Location + language','Budget + dates','Verified course claims'],concepts:['Small groups. More individual attention.','A clear path from practice to progress.','Meet the teachers behind the course.'],ad:'Your next chapter starts here.',cta:'EXPLORE THE COURSE ↗',destination:'Existing admissions page',action:'Track qualified inquiries, not views alone.',learning:'Compare messages against inquiry quality; propose the next controlled test.'},
  tourism:{label:'TOURISM BOARD',name:'A destination worth discovering',materials:[['▧','Destination footage'],['▤','Official visitor guide'],['↗','Travel information']],description:'Use approved destination imagery, seasonal details, accessibility information and official sources.',goal:'Visits to trip-planning information',meta:['Visitor regions','Campaign season','Official facts only'],concepts:['A slower weekend, closer to nature.','The stories beyond the familiar landmarks.','Your next journey begins with a local guide.'],ad:'Take the road to something different.',cta:'PLAN YOUR VISIT ↗',destination:'Official trip-planning page',action:'Measure visits to useful planning information.',learning:'Compare regional and seasonal responses; adapt the next destination creative.'},
  idea:{label:'UNBUILT IDEA',name:'An idea, before the full build',materials:[['▤','Idea description'],['▣','Prototype screens'],['◈','Brand references']],description:'Start with a description or prototype. Clearly identify what is proposed and what is already available.',goal:'Early-access registrations',meta:['Intended customer','Test budget','Clearly pre-launch'],concepts:['Spend less time planning your next step.','One place for the work scattered everywhere.','Help shape a better way to get started.'],ad:'A better way is taking shape.',cta:'JOIN EARLY ACCESS ↗',destination:'A transparent early-access page',action:'Measure confirmed registrations and follow-up interest.',learning:'Use response patterns to refine the concept; clicks alone do not establish demand.'}
};
let scenario='coaching',step=0;
function renderJourney(){const d=scenarios[scenario];const stage=$('#journey-stage');let html=`<div class="stage-top"><span>${d.label} / ${String(step+1).padStart(2,'0')}</span><span class="demo-tag">ILLUSTRATIVE DEMO</span></div>`;
  if(step===0)html+=`<h3>${d.name}</h3><p>${d.description}</p><div class="material-items">${d.materials.map(m=>`<div class="material-item"><div class="material-icon">${m[0]}</div><span>${m[1]}</span></div>`).join('')}</div><p class="stage-note">Extract the brief from existing materials. Ask only for critical missing information.</p>`;
  if(step===1)html+=`<h3>What should this campaign achieve?</h3><div class="goal-display">${d.goal}</div><div class="goal-meta">${d.meta.map(m=>`<span>${m}</span>`).join('')}</div><p class="stage-note">The desired action determines the journey—not whether the offering is already built.</p>`;
  if(step===2)html+=`<h3>Explore possibilities before production.</h3><p>Agents propose and critique audience–message combinations against the brief.</p>${d.concepts.map((c,i)=>`<div class="concept-row"><span>0${i+1}</span><span>${c}</span><span>${i===0?'SHORTLIST':'ALTERNATIVE'}</span></div>`).join('')}<p class="stage-note">Simulation is a screening tool. These concepts remain hypotheses until tested with real people.</p>`;
  if(step===3)html+=`<h3>One idea. Campaign-ready variations.</h3><div class="creative-preview"><div class="ad-mock"><span class="ad-label">MARKSTRAP / CONCEPT PREVIEW</span><strong>${d.ad}</strong><span class="ad-bottom">${d.cta}</span></div><div class="approval-list"><div><b>✓</b> Video, static and copy variations</div><div><b>✓</b> Adapted to the selected channels</div><div><b>✓</b> Claims and budget visible for approval</div><div><b>→</b> ${d.destination}</div></div></div><p class="stage-note">An illustrative creative preview. No content is generated or published by this presentation.</p>`;
  if(step===4)html+=`<h3>Turn the result into the next question.</h3><p>Publish the approved experiment through connected accounts, then evaluate real responses.</p><div class="signal-grid"><div><span>OBSERVE</span><p>${d.action}</p></div><div><span>NEXT EXPERIMENT</span><p>${d.learning}</p></div></div><p class="stage-note">Keep campaign history. Change one meaningful variable when the test calls for it.</p>`;
  stage.innerHTML=html;$$('[data-scenario]').forEach(b=>{const on=b.dataset.scenario===scenario;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});$$('[data-step]').forEach(b=>{const on=Number(b.dataset.step)===step;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
}
$$('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{scenario=b.dataset.scenario;renderJourney()}));$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{step=Number(b.dataset.step);renderJourney()}));renderJourney();

let hands=null;if(window.initHands){hands=window.initHands($('#hands'));window.addEventListener('resize',()=>hands.resize())}
function applyPause(){document.body.classList.toggle('paused',paused);if(hands)hands.setPaused(paused);$('#motion').textContent=paused?'▷':'Ⅱ';$('#motion').setAttribute('aria-label',paused?'Resume animations':'Pause animations')}
$('#motion').addEventListener('click',()=>{paused=!paused;applyPause()});applyPause();
const orbCanvas=$('#orb-canvas'),ctx=orbCanvas.getContext('2d');let lastOrb=0;const glyphs=' .:+*#%@';
function drawOrb(t){requestAnimationFrame(drawOrb);if(current!==3||document.hidden||t-lastOrb<80)return;if(paused&&lastOrb)return;lastOrb=t;const r=orbCanvas.getBoundingClientRect();if(!r.width)return;const size=Math.round(r.width);if(orbCanvas.width!==size){orbCanvas.width=size;orbCanvas.height=size}ctx.clearRect(0,0,size,size);const cell=5,cx=size/2;ctx.font=`5px monospace`;ctx.textAlign='center';for(let y=0;y<size;y+=cell){for(let x=0;x<size;x+=cell){const nx=(x-cx)/cx,ny=(y-cx)/cx,radius=nx*nx+ny*ny;if(radius>1)continue;const z=Math.sqrt(1-radius),v=(Math.sin(nx*9+ny*5+z*8+t*.0004)+Math.cos(ny*8-t*.0003)+2)/4;ctx.fillStyle=`rgba(${100+v*80},${160+v*70},255,${.1+v*.55})`;ctx.fillText(glyphs[Math.floor(v*(glyphs.length-1))],x,y)}}}
requestAnimationFrame(drawOrb);
go(Math.max(0,Math.min(slides.length-1,(parseInt(location.hash.slice(1),10)||1)-1)),false);
