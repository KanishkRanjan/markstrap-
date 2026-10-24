import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import BlurText from './components/react-bits/BlurText';
import CountUp from './components/react-bits/CountUp';
import AnimatedContent from './components/react-bits/AnimatedContent';
import './styles.css';
import './hero.css';

const HandPuppet = lazy(() => import('./components/HandPuppet'));

const ADOBE='https://business.adobe.com/blog/71-percent-of-marketers-say-content-demand-to-increase-5x';
const NIELSEN='https://www.nielsen.com/news-center/2025/nielsen-releases-its-2025-annual-marketing-report-looking-at-the-power-of-data-driven-marketing/';
const titles=['The problem','Where it slows down','A question for the room','The evidence','Picture it','The cost of the problem','The solution','Demo flow','What we build first','Before & after','The vision'];
const notes=[
  'Step 1 · Problem. Marketing is not slowed by a lack of ideas. It is slowed by the cost of producing, coordinating, testing, and learning from each idea. Let the hands set the metaphor: a human gives direction, an agent does the work.',
  'Still step 1 · The six bottlenecks. Separate teams and tools. Different assets for every audience, message, channel and format. Handoffs, reviews and approvals. Not enough budget to produce every promising direction. Results scattered across platforms and agencies. Manual interpretation and a new brief before anyone can act again. This is where MarkStrap fits: one shared agentic workflow connecting those stages.',
  'Step 2 · Question for the audience. Pause. Ask the judges: how many ideas have you, or people you know, dropped because marketing felt too hard or too expensive to try? Take a show of hands or a few seconds of silence before moving on.',
  'Step 3 · Evidence. These are 2025 industry survey findings, not MarkStrap results. Adobe surveyed more than 1,600 marketers. Nielsen surveyed 1,400 marketing professionals, all with annual budgets of at least US$1 million. If experienced teams struggle, a first-time founder struggles more. Replace or add local surveys and news stories as you find them.',
  'Step 4 · Visualization. Tell the Priya story slowly, one day at a time. She is a composite, not a real customer, and the scenario is illustrative. The goal is that every judge sees the same painful picture: forty open tabs, one confusing agency quote, one unexplained ad, and a half-empty batch.',
  'Step 5 · Cost of the problem. The 36 variations are an illustration: three audiences multiplied by four messages multiplied by three formats. The 72 hours assumes two production hours for each separate variation. It is not an industry benchmark, and it excludes media spend and analysis. For a beginner, add the weeks of learning before any of this starts.',
  'Step 6 · Solution. MarkStrap is a simple web page. Upload what you already have, answer a few questions, approve a short plan, and watch what people respond to. No marketing vocabulary required. Keep it proposed, not shipped: say what the MVP will do.',
  'Step 7 · Demo flow. Act as the ideal user: a coaching-center owner with only a brochure. Walk through the five steps in order and narrate what the user sees, not what the system does. Keep each step to one sentence. If the live demo fails, this slide is the fallback.',
  'Step 8 · Feature prioritization. Must-haves are what makes the demo journey work end to end. Nice-to-haves are real but later. Say out loud what you are deliberately not building in the hackathon.',
  'Step 9 · Before and after. Contrast the user\'s week before MarkStrap with the same week after. Be honest: no time savings or uplift have been measured yet. The next step is a pilot with a real small team.',
  'Close with the mission: give more ideas a fair test. Restate the question from the start and answer it. Thank the judges and invite questions.'
];

function useReducedMotion(){const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const m=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);return reduced}
function Reveal({children,delay=0,className=''}){return <AnimatedContent container="#snap-main-container" distance={24} duration={0.65} delay={delay} threshold={0.18} once className={className}>{children}</AnimatedContent>}
function Heading({line,second,italic=false,hero=false,reduced=false}){const Tag=hero?'h1':'h2';return <Tag className={hero?'hero-title':'scene-title'}><BlurText as="span" text={line} delay={40} direction="bottom" distance={16} blur={5} stepDuration={reduced?0:0.24} className="heading-line" trigger={reduced?'load':'view'} /><span className={italic?'serif':'title-muted'}>{second}</span></Tag>}
function Kicker({number,children}){return <div className="kicker"><span className="tiny-square"/>{String(number).padStart(2,'0')} / {children}</div>}
function Scene({index,current,children,className=''}){return <section id={`scene-${index+1}`} className={`scene ${className}`} data-active={current===index} aria-label={`${index+1}. ${titles[index]}`}><div className="scene-inner">{children}</div></section>}
// Print artwork re-inked in the theme: white paper becomes transparent and the ink takes the accent blue.
function InkArt({src,className,blank=[],ink=[145,208,255],soft=95,light=0}){
  const ref=useRef(null);
  useEffect(()=>{
    const img=new Image();let dead=false;
    img.onload=()=>{
      const c=ref.current;if(dead||!c)return;
      c.width=img.naturalWidth;c.height=img.naturalHeight;
      const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
      const d=x.getImageData(0,0,c.width,c.height),px=d.data;
      for(let i=0;i<px.length;i+=4){
        const lum=(px[i]+px[i+1]+px[i+2])/3,a=Math.max(0,Math.min(1,light?(lum-light)/soft:(250-lum)/soft));
        px[i]=ink[0];px[i+1]=ink[1];px[i+2]=ink[2];px[i+3]=Math.round(a*255);
      }
      // Source-art captions and watermarks, as pixel boxes [x0,y0,x1,y1].
      for(const [x0,y0,x1,y1] of blank)for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++)px[(yy*c.width+xx)*4+3]=0;
      x.putImageData(d,0,0);
    };
    img.src=src;
    return()=>{dead=true};
  },[src,light,soft]);
  return <canvas ref={ref} className={className} aria-hidden="true"/>;
}
const ButterflyArt=()=><InkArt src="/butterfly.png" className="question-art" blank={[[870,70,1120,215],[1020,1085,1260,1210],[0,1355,280,1412]]}/>;
function Mark(){return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 26V6h5l8 10L24 6h5v20h-6V15l-7 9-7-9v11Z"/></svg>}
function Orb({active,paused}){const ref=useRef(null);useEffect(()=>{let frame=0,last=0;const canvas=ref.current,ctx=canvas.getContext('2d'),glyphs=' .:+*#%@';function draw(t){frame=requestAnimationFrame(draw);if(!active||document.hidden||t-last<80||(paused&&last))return;last=t;const size=Math.round(canvas.getBoundingClientRect().width);if(!size)return;if(canvas.width!==size){canvas.width=size;canvas.height=size}ctx.clearRect(0,0,size,size);const center=size/2;ctx.font='6px monospace';ctx.textAlign='center';for(let y=0;y<size;y+=6){for(let x=0;x<size;x+=6){const nx=(x-center)/center,ny=(y-center)/center,r=nx*nx+ny*ny;if(r>1)continue;const z=Math.sqrt(1-r),v=(Math.sin(nx*9+ny*5+z*8+(paused?0:t*.0004))+Math.cos(ny*8-(paused?0:t*.0003))+2)/4;ctx.fillStyle=`rgba(${90+v*85},${150+v*80},255,${.12+v*.65})`;ctx.fillText(glyphs[Math.floor(v*(glyphs.length-1))],x,y)}}}frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)},[active,paused]);return <canvas ref={ref} aria-hidden="true"/>}

function App(){
  const scroller=useRef(null),currentRef=useRef(0),lock=useRef(0),wheel=useRef({sum:0,time:0,dir:0,used:false});
  const reduced=useReducedMotion();const [current,setCurrent]=useState(0),[paused,setPaused]=useState(reduced),[notesOpen,setNotesOpen]=useState(false),[sourcesOpen,setSourcesOpen]=useState(false);
  const sourcesRef=useRef(null);
  const navigate=useCallback((index,instant=false)=>{const root=scroller.current;if(!root)return;const scenes=root.querySelectorAll('.scene'),next=Math.max(0,Math.min(scenes.length-1,index));lock.current=performance.now()+900;root.scrollTo({top:scenes[next].offsetTop,behavior:instant||reduced?'instant':'smooth'})},[reduced]);

  useEffect(()=>{
    const root=scroller.current;let raf=0;
    function sync(){raf=0;const scenes=[...root.querySelectorAll('.scene')],position=root.scrollTop+root.clientHeight*.42;let index=0;scenes.forEach((s,i)=>{if(s.offsetTop<=position)index=i});if(index!==currentRef.current){currentRef.current=index;setCurrent(index)}const hash=`#${index+1}`;if(location.hash!==hash)history.replaceState(null,'',hash)}
    const onScroll=()=>{if(!raf)raf=requestAnimationFrame(sync)};root.addEventListener('scroll',onScroll,{passive:true});
    const initial=Math.max(0,Math.min(titles.length-1,(parseInt(location.hash.slice(1),10)||1)-1));
    requestAnimationFrame(()=>{navigate(initial,true);sync()});
    const onResize=()=>navigate(currentRef.current,true);window.addEventListener('resize',onResize);
    return()=>{cancelAnimationFrame(raf);root.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onResize)};
  },[navigate]);

  useEffect(()=>{
    const root=scroller.current;
    function onWheel(e){
      if(e.ctrlKey||e.metaKey||e.altKey||sourcesOpen||e.target.closest('.speaker-notes')||window.innerWidth<=800)return;
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      const scene=root.querySelectorAll('.scene')[currentRef.current];
      const inside=root.scrollTop-scene.offsetTop,max=Math.max(0,scene.offsetHeight-root.clientHeight);
      if(max>4&&((e.deltaY>0&&inside<max-4)||(e.deltaY<0&&inside>4)))return;
      e.preventDefault();const now=performance.now();
      const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?root.clientHeight:1),dir=Math.sign(delta);
      const fresh=now-wheel.current.time>180||wheel.current.dir!==dir;
      wheel.current.time=now;wheel.current.dir=dir;
      if(fresh){wheel.current.sum=0;wheel.current.used=false}
      if(now<lock.current||wheel.current.used)return;
      wheel.current.sum+=delta;
      if(Math.abs(wheel.current.sum)>=35){wheel.current.used=true;navigate(currentRef.current+dir);wheel.current.sum=0}
    }
    root.addEventListener('wheel',onWheel,{passive:false});return()=>root.removeEventListener('wheel',onWheel);
  },[navigate,sourcesOpen]);

  const fullscreen=useCallback(async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{/* Native fullscreen can be restricted inside a preview frame. */}},[]);
  useEffect(()=>{function keys(e){if(sourcesOpen||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key)){if(e.target.closest('button,a')&&e.key===' ')return;e.preventDefault();navigate(currentRef.current+(e.shiftKey?-1:1))}if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();navigate(currentRef.current-1)}if(e.key==='Home'){e.preventDefault();navigate(0)}if(e.key==='End'){e.preventDefault();navigate(titles.length-1)}if(e.key.toLowerCase()==='f')fullscreen();if(e.key.toLowerCase()==='n')setNotesOpen(v=>!v);if(e.key.toLowerCase()==='s')setSourcesOpen(true);if(e.key==='Escape')setNotesOpen(false)}document.addEventListener('keydown',keys);return()=>document.removeEventListener('keydown',keys)},[navigate,fullscreen,sourcesOpen]);
  useEffect(()=>{const dialog=sourcesRef.current;if(sourcesOpen&&!dialog.open)dialog.showModal();if(!sourcesOpen&&dialog.open)dialog.close()},[sourcesOpen]);

  return <MotionConfig reducedMotion="user"><div className={`presentation ${paused?'ambient-paused':''}`}>
    <a className="skip-link" href="#scene-1">Skip to presentation</a>
    <header className="presentation-header"><div className="brand"><Mark/><span>markstrap</span><sup>®</sup></div><span className="header-caption mono">HUMAN DIRECTION. CONTINUOUS LEARNING.</span><div className="utility-controls"><button onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume ambient animation':'Pause ambient animation'} title="Ambient motion">{paused?'▷':'Ⅱ'}</button><button onClick={fullscreen} title="Fullscreen · F" aria-label="Toggle fullscreen">⛶</button></div></header>
    <aside className="chapter-rail" aria-label="Presentation progress">{titles.map((title,i)=><span key={title} className={i===current?'current':i<current?'past':''} title={title} aria-current={i===current?'step':undefined}/>)}</aside>
    <main ref={scroller} id="snap-main-container" tabIndex={-1} aria-label="MarkStrap scroll presentation">

      <Scene index={0} current={current} className="hero-scene puppet-hero">
        <div className="hero-frame" aria-hidden="true"><span/><span/><i/><i/></div>
        <Suspense fallback={<div className="puppet-art puppet-loading" aria-hidden="true"><span/></div>}><HandPuppet active={current===0} paused={paused||reduced}/></Suspense>
        <div className="mechanism-label agent-caption mono"><span>AGENT PUPPETEER</span><i/><small>EXECUTION IN MOTION.</small></div>
        <div className="mechanism-label human-caption mono"><span>HUMAN STAGE</span><i/><small>DIRECTION STAYS PRESENT.</small></div>
        <div className="hero-copy"><Kicker number={1}>STEP 1 / THE PROBLEM</Kicker><Heading hero line="Ideas aren’t the bottleneck." second="Testing them is." italic reduced={reduced}/><Reveal delay={0.2}><p className="hero-subtitle">Marketing is not slowed by a lack of ideas. It is slowed by the cost of producing,<br/>{' '}coordinating, testing, and learning from each idea.</p></Reveal></div>
        <div className="hero-persona"><span className="mono label">ONE SHARED WORKFLOW</span><p>Research to results,<br/>no handoffs in between.</p></div>
      </Scene>

      <Scene index={1} current={current} className="bottleneck-scene">
        <InkArt src="/flower.png" className="border-art border-art-right" soft={190}/><InkArt src="/flower.png" className="border-art border-art-left" soft={190}/><Kicker number={2}>STEP 1 / WHERE IT SLOWS DOWN</Kicker><div className="scene-heading"><Heading line="Six places an idea" second="loses its momentum." italic reduced={reduced}/><p className="heading-aside">Cost and coordination turn a quick<br/>idea into a slow, expensive one.</p></div>
        <Reveal><div className="two-column"><div><div className="concept-line"><span>01</span><p>Separate teams and tools<small>Research, strategy, creative, media buying and analytics each live somewhere else.</small></p></div><div className="concept-line"><span>02</span><p>Different assets for everything<small>Every audience, message, channel and format needs its own version.</small></p></div><div className="concept-line"><span>03</span><p>Handoffs, reviews, approvals<small>Brand checks and sign-offs add delay at every step.</small></p></div></div><div><div className="concept-line"><span>04</span><p>Too costly to test it all<small>Teams cannot afford to fully produce every promising direction.</small></p></div><div className="concept-line"><span>05</span><p>Results stay scattered<small>Findings sit across platforms, reports and agencies.</small></p></div><div className="concept-line"><span>06</span><p>Manual restart every time<small>After a campaign, someone interprets results and writes a new brief before anyone can act.</small></p></div></div></div></Reveal>
        <Reveal delay={.1}><div className="architecture-principle"><span className="mono label">WHERE MARKSTRAP FITS</span><p>One shared agentic workflow that connects these disconnected stages.</p></div></Reveal>
      </Scene>

      <Scene index={2} current={current} className="closing-scene question-scene">
        <ButterflyArt/><Kicker number={3}>STEP 2 / A QUESTION FOR THE ROOM</Kicker><div className="closing-copy"><span className="mono label">RAISE A HAND, OR JUST THINK ABOUT IT.</span><Heading line="How many good ideas" second="never get a fair test?" hero italic reduced={reduced}/><Reveal delay={.12}><p>Think of the last idea you dropped, because marketing felt<br/>{' '}too hard, too confusing, or too expensive to try.</p><span className="closing-thought mono">YOU ARE NOT ALONE IN THIS ROOM.</span></Reveal></div>
      </Scene>

      <Scene index={3} current={current} className="evidence-scene">
        <InkArt src="/dragonfly.png" className="border-art dragon-art dragon-right" light={170} soft={70}/><InkArt src="/dragonfly.png" className="border-art dragon-art dragon-left" light={170} soft={70}/><Kicker number={4}>STEP 3 / THE EVIDENCE</Kicker><div className="scene-heading"><Heading line="More to create." second="More to figure out." reduced={reduced}/><p className="heading-aside">The pressure extends to established teams.<br/>A capacity challenge, even with strong expertise.</p></div>
        <div className="evidence-grid">
          {[{number:96,title:'Content demand keeps rising.',text:'Saw demand for content at least double over the preceding two years.',source:'ADOBE · 2025 · 1,600+ MARKETERS',url:ADOBE},{number:56,title:'Resonance remains a challenge.',text:'Named knowing what resonates across platforms as their biggest social-content challenge.',source:'ADOBE · 2025 · SOCIAL CONTENT',url:ADOBE},{number:32,title:'Measurement is still fragmented.',text:'Reported holistic measurement across both digital and traditional media spending.',source:'NIELSEN · 2025 · 1,400 MARKETERS',url:NIELSEN}].map((s,i)=><Reveal key={s.number} delay={i*.09} className="evidence-item"><div className="stat-number"><CountUp to={s.number} duration={reduced?0:1.15} delay={.1}/><span>%</span></div><div className="stat-track"><span style={{width:`${s.number}%`}}/></div><h3>{s.title}</h3><p>{s.text}</p><a href={s.url} target="_blank" rel="noreferrer" className="source-link mono">{s.source} ↗</a></Reveal>)}
        </div><p className="scene-disclaimer mono">EXTERNAL INDUSTRY EVIDENCE · NIELSEN SAMPLE: ANNUAL MARKETING BUDGETS ≥ US$1M · NOT MARKSTRAP RESULTS</p>
      </Scene>

      <Scene index={4} current={current} className="visual-scene">
        <Kicker number={5}>STEP 4 / PICTURE IT</Kicker><div className="two-column cost-layout"><div><Heading line="Meet Priya." second="She has a good idea." italic reduced={reduced}/><Reveal delay={.12}><p className="body-copy">She runs a small coaching center. A new batch starts in six weeks. She has a brochure, a handful of photos, and absolutely no marketing background.</p><p className="cost-question">What does she do<br/>on Monday morning?</p></Reveal></div><Reveal delay={.15}><div className="comparison-table"><div className="comparison-row comparison-header" style={{gridTemplateColumns:'.5fr 1.5fr'}}><span>WHEN</span><span>WHAT HAPPENS</span></div>{[['Monday','Searches “how to market a course.” Forty tabs of ads, funnels and jargon.'],['Thursday','An agency quotes more than the new batch could earn.'],['Week 3','Posts one ad she is unsure about. Two inquiries. She cannot tell why.'],['Week 6','The batch is half empty. The idea was never really tested.']].map(([when,what])=><div key={when} className="comparison-row" style={{gridTemplateColumns:'.5fr 1.5fr'}}><strong>{when}</strong><p>{what}</p></div>)}</div></Reveal></div><p className="scene-disclaimer mono">ILLUSTRATIVE SCENARIO · PRIYA IS A COMPOSITE, NOT A REAL CUSTOMER</p>
      </Scene>

      <Scene index={5} current={current} className="cost-scene">
        <Kicker number={6}>STEP 5 / THE COST OF THE PROBLEM</Kicker><div className="two-column cost-layout"><div><Heading line="Possibilities multiply." second="Capacity doesn’t." reduced={reduced}/><Reveal delay={.12}><p className="body-copy">One modest campaign idea creates a surprisingly large testing space. For someone with no marketing background, every variation also means learning something new.</p><div className="formula"><div><b>3</b><span>audiences</span></div><i>×</i><div><b>4</b><span>messages</span></div><i>×</i><div><b>3</b><span>formats</span></div></div><p className="cost-question">How much of that space<br/>can a first-time marketer afford to explore?</p></Reveal></div><Reveal delay={.15} className="cost-visual"><div className="mini-heading mono"><span>THE EXPLORATION SPACE</span><span>03 × 04 × 03</span></div><div className="pixel-matrix" aria-hidden="true">{Array.from({length:36},(_,i)=><span key={i} style={{'--i':i,'--alpha':.22+((i*13)%36)/48}}/>)}</div><div className="cost-totals"><div><strong><CountUp to={36} duration={1}/></strong><span>creative variations</span></div><div><strong><CountUp to={72} duration={1.2}/><small>h</small></strong><span>illustrative production effort</span></div></div><p className="model-assumption">36 variations × 2 production hours each.</p><p className="small-print">Illustrative arithmetic, not a benchmark. Assumes separate production per variation; reuse may reduce effort. Excludes media spend, observation time, and analysis.</p></Reveal></div>
      </Scene>

      <Scene index={6} current={current} className="solution-scene">
        <Kicker number={7}>STEP 6 / THE SOLUTION</Kicker><div className="two-column solution-layout"><div><Heading line="Just tell us your idea." second="We run the test." italic reduced={reduced}/><Reveal delay={.14}><p className="body-copy">MarkStrap connects research, strategy, creative, testing and results into one shared agentic workflow, behind a simple web page. Upload what you have. No marketing knowledge needed.</p><div className="value-lines"><div><span>01</span><p>Upload what you have.</p></div><div><span>02</span><p>Approve a short, clear plan.</p></div><div><span>03</span><p>See what people respond to.</p></div></div></Reveal></div><Reveal className="orbit-wrapper" delay={.1}><div className="orbit-system"><div className="orbit-ring outer-ring"/><div className="orbit-ring inner-ring"/><div className="orb"><Orb active={current===3} paused={paused||reduced}/><span className="orb-mark">m<small>↗</small></span></div>{['UNDERSTAND','EXPLORE','PRODUCE','LAUNCH','EVALUATE','IMPROVE'].map((label,i)=><span key={label} className={`orbit-label orbit-label-${i}`}>{label}</span>)}</div><div className="orbit-caption mono">SIMULATION SHORTLISTS.<br/>REAL BEHAVIOR TEACHES.</div></Reveal></div><span className="product-status mono">PROPOSED PRODUCT · HACKATHON MVP</span>
      </Scene>

      <Scene index={7} current={current} className="demo-scene">
        <Kicker number={8}>STEP 7 / DEMO FLOW</Kicker><div className="scene-heading"><Heading line="One ideal user." second="Five simple steps." reduced={reduced}/><p className="heading-aside">Priya, her brochure, and one web page.<br/>No marketing words needed.</p></div>
        <div className="two-column"><Reveal className="concept-column">{[['01','Land on the page.','One question: what are you promoting?'],['02','Upload what you have.','A brochure, photos or a link. Nothing to write.'],['03','Check the brief.','MarkStrap shows what it understood. Fix it in a click.'],['04','Pick from a shortlist.','A few campaign ideas, each with a plain-language reason.'],['05','Approve and see results.','Nothing goes out without a yes. Results in simple words.']].map(([n,t,d])=><div key={n} className="concept-line"><span>{n}</span><p>{t}<small>{d}</small></p></div>)}</Reveal><div className="extracted-brief"><Reveal delay={.1}><div className="mini-heading mono"><span>STEP 03 · WHAT PRIYA SEES</span><span>↗</span></div><div className="brief-row"><span>Subject</span><strong>Admissions for a new course</strong></div><div className="brief-row"><span>Outcome</span><strong>Qualified enrollment inquiries</strong></div><div className="brief-row"><span>Boundaries</span><strong>Budget, region, dates, brand rules</strong></div><div className="brief-row"><span>Destination</span><strong>The existing admissions page</strong></div><p className="brief-insight">Familiar materials in.<br/>Only the missing essentials asked.</p></Reveal></div></div><p className="scene-disclaimer mono">ILLUSTRATIVE JOURNEY · PROPOSED PRODUCT EXPERIENCE</p>
      </Scene>

      <Scene index={8} current={current} className="features-scene">
        <Kicker number={9}>STEP 8 / FEATURE PRIORITIZATION</Kicker><div className="scene-heading"><Heading line="Must-haves first." second="Nice-to-haves later." italic reduced={reduced}/><p className="heading-aside">What the MVP needs to make the demo journey<br/>work end to end, and what waits.</p></div>
        <Reveal><div className="two-column"><div><div className="mini-heading mono"><span>MUST-HAVE · MVP</span></div>{[['Idea intake','Upload a brochure, photos or a link'],['Plain-language brief check','Shows what was understood, easy to correct'],['Campaign shortlist with reasons','A few ideas, no jargon, no fake scores'],['Human approval','Nothing is published without a yes'],['Simple results view','What worked, and what to try next']].map(([t,d],i)=><div key={t} className="concept-line"><span>M{i+1}</span><p>{t}<small>{d}</small></p></div>)}</div><div><div className="mini-heading mono"><span>NICE-TO-HAVE · AFTER THE MVP</span></div>{[['Multi-platform publishing','Post to social platforms directly'],['Shared campaign memory','Learnings carried to future campaigns'],['More languages','Local-language briefs and creative'],['Team accounts','Share and approve together'],['Budget auto-tuning','Shift spend to what works']].map(([t,d],i)=><div key={t} className="concept-line"><span>N{i+1}</span><p>{t}<small>{d}</small></p></div>)}</div></div></Reveal><p className="scene-disclaimer mono">PROPOSED SCOPE · NOTHING HERE IS A CLAIM OF A SHIPPED PRODUCT</p>
      </Scene>

      <Scene index={9} current={current} className="comparison-scene">
        <Kicker number={10}>STEP 9 / BEFORE & AFTER</Kicker><div className="scene-heading"><Heading line="Before: guessing." second="After: learning." italic reduced={reduced}/><p className="heading-aside">The same idea, the same person.<br/>A first campaign without the learning curve.</p></div>
        <Reveal><div className="comparison-table"><div className="comparison-row comparison-header"><span>PRIYA&apos;S WEEK</span><span>BEFORE</span><span>WITH MARKSTRAP / PROPOSED</span></div><div className="comparison-row"><strong>Getting started</strong><p>Forty tabs of jargon and no idea where to begin.</p><p>Upload a brochure and answer a few questions.</p></div><div className="comparison-row"><strong>Choosing an idea</strong><p>Pick by gut feel, or pay an agency.</p><p>A short list of ideas, each with a plain reason.</p></div><div className="comparison-row"><strong>Knowing what worked</strong><p>Scattered numbers that nobody explains.</p><p>Results in simple words, and what to try next.</p></div></div></Reveal>
        <Reveal delay={.1}><div className="pilot-measures"><span className="mono label">WHAT A PILOT WILL MEASURE</span><div><strong>Idea → live test</strong><span>Elapsed time</span></div><div><strong>Cost per experiment</strong><span>Production + setup + analysis</span></div><div><strong>Result → next test</strong><span>Iteration turnaround</span></div></div></Reveal><p className="scene-disclaimer mono">EXPECTED WORKFLOW IMPROVEMENTS · NO CUSTOMER UPLIFT OR TIME SAVINGS HAVE BEEN MEASURED</p>
      </Scene>

      <Scene index={10} current={current} className="closing-scene">
        <div className="closing-particles" aria-hidden="true"/><Kicker number={11}>THE VISION</Kicker><div className="closing-copy"><span className="mono label">FROM AN IDEA TO A BETTER NEXT DECISION.</span><Heading line="Give more ideas" second="a fair test." hero italic reduced={reduced}/><Reveal delay={.12}><p>Help small teams access broader marketing capability.<br/>{' '}Help established teams expand their experimentation capacity.</p><div className="closing-brand">markstrap<span>↗</span></div><span className="closing-thought mono">HUMAN INTENT. AGENT EXECUTION. MARKET EVIDENCE.</span></Reveal></div>
      </Scene>
    </main>
    <footer className="presentation-footer"><div className="footer-location"><span className="mono">{String(current+1).padStart(2,'0')}<i> / {String(titles.length).padStart(2,'0')}</i></span><span className="footer-separator"/><span>{titles[current]}</span></div><div className="footer-scroll footer-signature mono">HUMAN INTENT. AGENT EXECUTION. MARKET EVIDENCE.</div><div className="footer-tools mono"><span>N · NOTES</span><button onClick={()=>setSourcesOpen(true)}>S · SOURCES ↗</button></div></footer>
    <div className="overall-progress" style={{width:`${current/(titles.length-1)*100}%`}} aria-hidden="true"/>
    <div className="sr-only" role="status" aria-live="polite">{`${current+1} of ${titles.length}: ${titles[current]}`}</div>
    {notesOpen&&<aside className="speaker-notes"><div className="notes-label mono">SPEAKER NOTES / {String(current+1).padStart(2,'0')}<button onClick={()=>setNotesOpen(false)} aria-label="Close speaker notes">×</button></div><p>{notes[current]}</p><span className="mono tiny">SCROLL OR ↓ TO CONTINUE · N TO CLOSE · F FOR FULLSCREEN</span></aside>}
    <dialog ref={sourcesRef} className="sources-dialog" onCancel={()=>setSourcesOpen(false)} onClose={()=>setSourcesOpen(false)}><div className="dialog-header"><span className="mono label">EVIDENCE & ASSUMPTIONS</span><button onClick={()=>setSourcesOpen(false)} aria-label="Close sources">×</button></div><h2>Make the pitch defensible.</h2><div className="source-articles"><article><span className="mono label">01 / ADOBE · JUNE 2025</span><h3>Content demand and creative uncertainty.</h3><p>Survey of more than 1,600 marketers. 96% saw content demand at least double over two years; 56% cited knowing what resonates across platforms as their biggest social-content challenge.</p><a href={ADOBE} target="_blank" rel="noreferrer">Read the original research ↗</a></article><article><span className="mono label">02 / NIELSEN · MAY 2025</span><h3>Evidence from established marketing teams.</h3><p>Survey of 1,400 global professionals with annual marketing budgets of at least US$1 million. 32% reported holistic measurement across both traditional and digital media spending.</p><a href={NIELSEN} target="_blank" rel="noreferrer">Read the original report ↗</a></article><article><span className="mono label">03 / ASSUMPTIONS & STATUS</span><h3>A proposed product, an illustrative journey.</h3><p>The 36-variation model is arithmetic, not measured customer data. The journey is illustrative; it does not generate or publish campaigns. No backend integrations, validated simulation, customer traction, or performance uplift are claimed.</p></article><article><span className="mono label">04 / COMPONENT CREDITS</span><h3>Built with React Bits.</h3><p>BlurText, AnimatedContent and CountUp are incorporated from React Bits by David Haz, with presentation-specific configuration. Original license notices are included. The animated hand scene uses Three.js and adapted WebXR Input Profiles hand geometry.</p><a href="https://reactbits.dev/" target="_blank" rel="noreferrer">Explore React Bits ↗</a><a href="/react-bits-license.txt" target="_blank" rel="noreferrer">Component license ↗</a><a href="/hand-model-license.txt" target="_blank" rel="noreferrer">Hand model credits ↗</a></article></div></dialog>
  </div></MotionConfig>;
}

createRoot(document.getElementById('root')).render(<App/>);
