import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
const fingers = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'];
const canonical = new THREE.Matrix4().makeBasis(V(0,0,1), V(-1,0,0), V(0,-1,0));

function ceramic(color, roughness=.4, metalness=.08) {
  return new THREE.MeshStandardMaterial({color,roughness,metalness});
}

function disposeTree(scene) {
  const geometry = new Set(), materials = new Set();
  scene.traverse(o => {
    if(o.geometry) geometry.add(o.geometry);
    if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));
  });
  geometry.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose());
}

function marionette(material,dark) {
  const puppet=new THREE.Group();
  const joint=(x,y,z=0,r=.055)=>{
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),dark);
    mesh.position.set(x,y,z);puppet.add(mesh);return mesh;
  };
  const limb=(x,y,length,radius,rotation=0)=>{
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.92,length,20),material);
    mesh.position.set(x,y,0);mesh.rotation.z=rotation;puppet.add(mesh);return mesh;
  };
  const head=new THREE.Mesh(new THREE.SphereGeometry(.22,36,24),material);head.position.y=.59;puppet.add(head);
  const torso=new THREE.Mesh(new RoundedBoxGeometry(.43,.52,.19,5,.06),material);torso.position.y=.17;puppet.add(torso);
  const pelvis=new THREE.Mesh(new RoundedBoxGeometry(.34,.15,.18,4,.05),dark);pelvis.position.y=-.19;puppet.add(pelvis);
  const upperL=limb(-.31,.18,.36,.06,-.52),upperR=limb(.31,.18,.36,.06,.52);
  joint(-.40,.03);joint(.40,.03);
  const foreL=limb(-.48,-.10,.31,.052,-.30),foreR=limb(.48,-.10,.31,.052,.30);
  const handL=joint(-.53,-.25,0,.065),handR=joint(.53,-.25,0,.065);
  const thighL=limb(-.12,-.39,.38,.07,-.10),thighR=limb(.12,-.39,.38,.07,.10);
  joint(-.14,-.58);joint(.14,-.58);
  const shinL=limb(-.16,-.76,.35,.058,.06),shinR=limb(.16,-.76,.35,.058,-.06);
  const leftFoot=new THREE.Mesh(new RoundedBoxGeometry(.20,.08,.24,3,.03),dark);leftFoot.position.set(-.18,-.96,.05);puppet.add(leftFoot);
  const rightFoot=leftFoot.clone();rightFoot.position.x=.18;puppet.add(rightFoot);
  [-.075,.075].forEach(x=>{const eye=new THREE.Mesh(new THREE.SphereGeometry(.018,14,10),dark);eye.position.set(x,.62,.205);puppet.add(eye);});
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.022,.09,16),material);nose.rotation.x=Math.PI/2;nose.position.set(0,.56,.245);puppet.add(nose);
  const anchors=[new THREE.Object3D(),new THREE.Object3D(),new THREE.Object3D()];
  anchors[0].position.set(-.53,-.20,0);anchors[1].position.set(0,.81,0);anchors[2].position.set(.53,-.20,0);
  anchors.forEach(anchor=>puppet.add(anchor));
  puppet.scale.setScalar(.78);
  const parts=[upperL,upperR,foreL,foreR,handL,handR,thighL,thighR,shinL,shinR,leftFoot,rightFoot,anchors[0],anchors[2]]
    .map(o=>{o.x=o.position.x;o.y=o.position.y;o.rz=o.rotation.z;return o;});
  const [uL,uR,fL,fR,hL,hR,tL,tR,sL,sR,lF,rF,aL,aR]=parts;
  // Limbs dangle and swing from the strings; hand anchors follow the wrists
  // so the two outer strings stay attached to the moving hands.
  // The robot hand drives everything: the puppet trails the hand's motion
  // like a pendulum, and each arm swings when its finger pulls.
  function animate(t,hand){
    const swing=Math.sin(t*.0021+1.2);
    const lag=Math.sin(t*.0011-.9);
    puppet.position.x=hand.x*.9;
    puppet.position.y=-.25+hand.y*.9;
    puppet.rotation.z=lag*.1;puppet.rotation.y=lag*.5;
    uL.rotation.z=uL.rz+swing*.3;uR.rotation.z=uR.rz+Math.sin(t*.0021+3.1)*.3;
    fL.rotation.z=fL.rz+swing*.5;fR.rotation.z=fR.rz+Math.sin(t*.0021+3.1)*.5;
    const dl=swing*.045,dr=Math.sin(t*.0021+3.1)*.045;
    hL.position.set(hL.x-dl*.8,hL.y+Math.abs(dl)*.4,0);hR.position.set(hR.x-dr*.8,hR.y+Math.abs(dr)*.4,0);
    aL.position.set(aL.x-dl*.8,aL.y+Math.abs(dl)*.4,0);aR.position.set(aR.x-dr*.8,aR.y+Math.abs(dr)*.4,0);
    tL.rotation.z=tL.rz+Math.sin(t*.0019)*.2;tR.rotation.z=tR.rz-Math.sin(t*.0019+.9)*.2;
    sL.rotation.z=sL.rz+Math.sin(t*.0019+.5)*.28;sR.rotation.z=sR.rz-Math.sin(t*.0019+1.4)*.28;
    lF.position.x=lF.x+Math.sin(t*.0019+.5)*.07;rF.position.x=rF.x-Math.sin(t*.0019+1.4)*.07;
  }
  return {puppet,anchors,animate};
}

function continuousForearm(model,origin,material) {
  let source;
  model.traverse(o=>{if(o.isSkinnedMesh&&!source)source=o.geometry;});
  if(!source?.index)return null;
  const position=source.attributes.position, edges=new Map(),vertices=new Map();
  const key=i=>[position.getX(i),position.getY(i),position.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
  const indices=source.index.array;
  for(let i=0;i<indices.length;i+=3){
    const tri=[indices[i],indices[i+1],indices[i+2]];
    for(let j=0;j<3;j++){
      const a=tri[j],b=tri[(j+1)%3],ka=key(a),kb=key(b);
      vertices.set(ka,V(position.getX(a),position.getY(a),position.getZ(a)));
      vertices.set(kb,V(position.getX(b),position.getY(b),position.getZ(b)));
      const id=ka<kb?`${ka}|${kb}`:`${kb}|${ka}`;
      const edge=edges.get(id);if(edge)edge.count++;else edges.set(id,{count:1,a:ka,b:kb});
    }
  }
  const open=new Set();edges.forEach(e=>{if(e.count===1){open.add(e.a);open.add(e.b);}});
  const ring=[...open].map(k=>vertices.get(k)).filter(p=>p.y>origin.y-.006)
    .map(p=>p.clone().sub(origin).applyMatrix4(canonical).multiplyScalar(14.4));
  if(ring.length<8)return null;
  const center=ring.reduce((v,p)=>v.add(p),V()).divideScalar(ring.length);
  ring.sort((a,b)=>Math.atan2(a.z-center.z,a.y-center.y)-Math.atan2(b.z-center.z,b.y-center.y));
  const values=[],faces=[],n=ring.length;
  [0,1,2,3,4].forEach(layer=>{
    ring.forEach(p=>{
      const flare=[1,1.01,1.06,1.14,1.22][layer];
      const x=layer===0?p.x:layer===1?p.x-.16:[0,0,-.7,-1.5,-2.4][layer];
      values.push(x,center.y+(p.y-center.y)*flare,center.z+(p.z-center.z)*flare);
    });
  });
  for(let i=0;i<4;i++)for(let j=0;j<n;j++){
    const a=i*n+j,b=(i+1)*n+j,c=(i+1)*n+(j+1)%n,d=i*n+(j+1)%n;
    faces.push(a,b,c,a,c,d);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(values,3));
  geometry.setIndex(faces);geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,material);
}

function setupRig(gltf, mechanical) {
  const model = gltf.scene;
  model.updateMatrixWorld(true);
  const bones = {};
  model.traverse(o=>{ if(o.isBone) bones[o.name]=o; });
  const wrist = bones.wrist;
  if(!wrist) throw new Error('Hand skeleton unavailable');
  const origin = wrist.getWorldPosition(V());
  // WebXR's compact source rig contains sibling joints. Build an anatomical
  // FK hierarchy without changing its bind pose so every finger truly bends.
  fingers.forEach(name=>{
    const suffixes = name==='thumb'
      ? ['metacarpal','phalanx-proximal','phalanx-distal','tip']
      : ['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
    let parent=wrist;
    suffixes.forEach(suffix=>{
      const b=bones[`${name}-${suffix}`];
      if(b){ parent.attach(b); parent=b; }
    });
  });
  model.updateMatrixWorld(true);
  const motion=[];
  Object.values(bones).forEach(b=>{
    const original = b.quaternion.clone();
    const inv=b.getWorldQuaternion(new THREE.Quaternion()).invert();
    const axis=V(0,0,1).applyQuaternion(inv).normalize();
    motion.push({bone:b, original, axis});
  });

  const ivory=ceramic(mechanical?'#b5b8b5':'#e3dfd4',mechanical?.3:.58,mechanical?.36:.02);
  const dark=ceramic('#171e22',.5,.52);
  const pale=ceramic('#d7d8cf',.27,.44);
  const titanium=ceramic('#6c777c',.25,.78);
  const black=ceramic('#131a20',.4,.66);
  model.traverse(o=>{
    if(o.isMesh){
      o.material=mechanical?dark:ivory;
      o.frustumCulled=false;
      if(o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    }
  });
  const mount=new THREE.Group();
  const frame=new THREE.Group(); frame.quaternion.setFromRotationMatrix(canonical);
  frame.scale.setScalar(14.4);
  mount.add(frame);

  function attachWorld(object,bone,position,quaternion) {
    const armature=wrist.parent;
    armature.updateWorldMatrix(true,false);
    object.position.copy(armature.worldToLocal(position.clone()));
    if(quaternion) object.quaternion.copy(armature.getWorldQuaternion(new THREE.Quaternion()).invert()).multiply(quaternion);
    armature.add(object); armature.updateMatrixWorld(true);
    bone.attach(object);
  }

  // A sculpted continuous forearm extends beyond the source model's wrist.
  const armGeometry = new THREE.CylinderGeometry(.29,.40,2.4,48,1,false);
  const smoothArm=!mechanical?continuousForearm(model,origin,ivory):null;
  const arm=smoothArm||new THREE.Mesh(armGeometry,mechanical?pale:ivory);
  if(!smoothArm){arm.rotation.z=-Math.PI/2;arm.scale.z=.76;arm.position.set(-1.38,0,-.015);}
  else armGeometry.dispose();
  mount.add(arm);
  if(mechanical){
    const cuff=new THREE.Mesh(new THREE.CylinderGeometry(.335,.345,.19,48),titanium);
    cuff.rotation.z=Math.PI/2;cuff.scale.z=.78;cuff.position.x=-.14;mount.add(cuff);
    const collar=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.09,48),titanium);
    collar.rotation.z=Math.PI/2;collar.scale.z=.76;collar.position.x=-2.55;mount.add(collar);
    const seam=new THREE.Mesh(new THREE.CylinderGeometry(.349,.349,.035,48),black);
    seam.rotation.z=Math.PI/2;seam.scale.z=.78;seam.position.x=-.25;mount.add(seam);
  }

  // Original coordinates: fingers run along -Y, hand normal along +X.
  // The robot's continuous substrate preserves anatomy, while fitted shells,
  // hinge barrels and tendons make every segment mechanically legible.
  fingers.forEach((finger,fi)=>{
    const names=finger==='thumb'
      ? ['phalanx-proximal','phalanx-distal','tip']
      : ['phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
    for(let i=0;i<names.length-1;i++){
      const a=bones[`${finger}-${names[i]}`], b=bones[`${finger}-${names[i+1]}`];
      if(!a||!b) continue;
      const pa=a.getWorldPosition(V()),pb=b.getWorldPosition(V());
      const direction=pb.clone().sub(pa),len=direction.length();
      const q=new THREE.Quaternion().setFromUnitVectors(V(0,1,0),direction.clone().normalize());
      const radius=(fi===0?.0095:.0086)*(1-i*.13)*(fi===4?.8:1);
      if(mechanical){
        const sleeve=new THREE.Mesh(new RoundedBoxGeometry(radius*1.78,len*.72,radius*1.9,3,radius*.45),pale);
        // Mesh box axes are Y length, X normal, Z finger width.
        const center=pa.clone().lerp(pb,.53); center.x+=.002;
        attachWorld(sleeve,a,center,q);
        const inset=new THREE.Mesh(new RoundedBoxGeometry(radius*.2,len*.48,radius*.56,2,radius*.08),titanium);
        const insetPos=center.clone();insetPos.x+=radius*.9;
        attachWorld(inset,a,insetPos,q);
        const hinge=new THREE.Mesh(new THREE.CylinderGeometry(radius*.79,radius*.79,radius*2.2,20),titanium);
        // Hinge axle perpendicular to finger travel, across the hand.
        const hingeQ=new THREE.Quaternion().setFromUnitVectors(V(0,1,0),V(0,0,1));
        attachWorld(hinge,a,pa,hingeQ);
        const cap=new THREE.Mesh(new THREE.CylinderGeometry(radius*.48,radius*.48,.0015,20),black);
        const capPos=pa.clone(); capPos.z+=radius*1.15;attachWorld(cap,a,capPos,hingeQ);
        // Pair of fine, functional-looking tension conductors along each shell.
        [-1,1].forEach(side=>{
          const tendon=new THREE.Mesh(new THREE.CylinderGeometry(.0008,.0008,len*.68,8),black);
          const pos=center.clone();pos.x-=radius*.55;pos.z+=side*radius*.72;
          attachWorld(tendon,a,pos,q);
        });
      }else if(i===names.length-2){
        // Subtle flush fingernails; no separate toy-like fingertip shapes.
        const nail=new THREE.Mesh(new THREE.SphereGeometry(1,20,10),ceramic('#ebe7dc',.35,.03));
        nail.scale.set(.0013,len*.37,radius*.62);
        const pos=pa.clone().lerp(pb,.52);pos.x+=radius*.84;
        attachWorld(nail,a,pos,q);
      }
    }
  });

  if(mechanical){
    // Fitted dorsal palm plate follows the metacarpal fan. Its smooth shallow
    // convex surface is deliberately a hand shape, never a rectangular box.
    const palmShape=new THREE.Shape();
    palmShape.moveTo(-.026,-.008);
    palmShape.bezierCurveTo(-.025,.015,-.017,.043,-.010,.060);
    palmShape.bezierCurveTo(.005,.066,.027,.060,.033,.041);
    palmShape.bezierCurveTo(.039,.025,.036,.006,.022,-.008);
    palmShape.quadraticCurveTo(.005,-.017,-.026,-.008);
    const plate=new THREE.Mesh(new THREE.ExtrudeGeometry(palmShape,{depth:.003,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.004,bevelThickness:.004,curveSegments:20}),pale);
    // Shape X is source Z, shape Y source -Y; front normal source +X.
    const basis=new THREE.Matrix4().makeBasis(V(0,0,1),V(0,-1,0),V(1,0,0));
    const p=origin.clone();p.x+=.017;p.y-=.013;p.z+=.006;
    attachWorld(plate,wrist,p,new THREE.Quaternion().setFromRotationMatrix(basis));
    for(let i=0;i<3;i++){
      const seam=new THREE.Mesh(new THREE.CylinderGeometry(.00055,.00055,.041,8),titanium);
      const p=origin.clone();p.x+=.025;p.y-=.033;p.z+=(i-1)*.012;
      attachWorld(seam,wrist,p,new THREE.Quaternion());
    }
    const disc=new THREE.Mesh(new THREE.CylinderGeometry(.010,.010,.0035,36),titanium);
    const discPosition=origin.clone();discPosition.x+=.028;discPosition.y-=.029;
    attachWorld(disc,wrist,discPosition,new THREE.Quaternion().setFromUnitVectors(V(0,1,0),V(1,0,0)));
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.0032,.0032,.004,24),pale);
    const pp=discPosition.clone();pp.x+=.003;attachWorld(pin,wrist,pp,new THREE.Quaternion().setFromUnitVectors(V(0,1,0),V(1,0,0)));
  }

  function pose(t,reduced,release=1,flex=null){
    for(const {bone,original,axis} of motion){
      let angle=0;
      const name=bone.name;
      const fi=fingers.findIndex(f=>name.startsWith(f));
      if(fi<0) continue;
      if(mechanical){
        // A loose, anatomical release: the fingers begin softly gathered and
        // relax open as the sphere leaves the hand. No servo chatter or clawing.
        if(name.includes('phalanx-proximal')) angle=fi===0?.14:.10+fi*.025;
        if(name.includes('intermediate')) angle=.16+fi*.035;
        if(name.includes('distal')) angle=.10+fi*.025;
        if(name.includes('metacarpal')) angle=fi===0?-.12:0;
        if(flex&&flex[fi]){
          // Fingers pull the strings: curl each joint a little further.
          if(name.includes('proximal')) angle+=flex[fi]*.8;
          if(name.includes('intermediate')) angle+=flex[fi];
          if(name.includes('distal')) angle+=flex[fi]*.6;
        }
        const held=(1-release)*(fi===0?.10:.16);
        if(name.includes('proximal')) angle+=held;
        if(name.includes('intermediate')) angle+=held*.72;
        if(!reduced && release>.92 && name.includes('proximal')) angle+=Math.sin(t*.32+fi*.45)*.004;
      }else{
        // The lower hand is a relaxed platform rather than a reaching catch.
        if(name.includes('phalanx-proximal')) angle=fi===0?.18:[.24,.20,.24,.32][fi-1];
        if(name.includes('intermediate')) angle=[.18,.15,.19,.27][fi-1]||0;
        if(name.includes('distal')) angle=fi===0?.12:[.10,.09,.12,.17][fi-1];
        if(name.includes('metacarpal')) angle=fi===0?-.05:0;
        if(flex&&flex[fi]){
          if(name.includes('proximal')) angle+=flex[fi]*.8;
          if(name.includes('intermediate')) angle+=flex[fi];
          if(name.includes('distal')) angle+=flex[fi]*.6;
        }
      }
      // The source rig's local bend axis points away from the visible palm.
      // Negating the authored flex angles curls both hands inward naturally.
      bone.quaternion.copy(original).multiply(new THREE.Quaternion().setFromAxisAngle(axis,-angle));
    }
  }
  frame.add(model); model.position.sub(origin);
  return {mount,bones,pose};
}

function fallbackMarkup(){
  return <svg viewBox="0 0 1200 500" aria-hidden="true" style={{width:'100%',height:'100%',display:'block'}}>
    <defs><radialGradient id="puppet-orb"><stop stopColor="#f6f3e9"/><stop offset=".65" stopColor="#d6d6ce"/><stop offset="1" stopColor="#89979f"/></radialGradient>
    <linearGradient id="puppet-limb" x2="1" y2="1"><stop stopColor="#4b5358"/><stop offset=".6" stopColor="#c8cbc6"/><stop offset="1" stopColor="#ede9dd"/></linearGradient></defs>
    <path d="M0 441L246 326Q330 288 392 301L518 278Q541 276 546 287Q549 300 528 308L433 334L488 329Q511 332 505 348L442 376Q386 407 309 404L0 488Z" fill="url(#puppet-limb)"/>
    <path d="M1200 44L922 127Q846 148 806 178L713 205Q694 211 698 224Q702 237 723 231L810 209L752 249Q737 260 747 272Q758 282 778 269L844 237L815 275Q806 289 820 297Q835 303 848 288L895 241Q929 214 950 185L1200 106Z" fill="url(#puppet-limb)"/>
    <g fill="none" stroke="#aebfca" strokeWidth="1" opacity=".65"><path d="M770 196L580 220L552 356"/><path d="M735 207L610 210L610 258"/><path d="M705 220L640 220L668 356"/></g>
    <g transform="translate(610 320)" fill="url(#puppet-orb)" stroke="#68757c" strokeWidth="2">
      <circle cy="-62" r="23"/><rect x="-23" y="-34" width="46" height="55" rx="10"/>
      <path d="M-20-20L-48 8L-58 36M20-20L48 8L58 36M-12 22L-17 66L-20 105M12 22L17 66L20 105" strokeWidth="12" strokeLinecap="round"/>
      <circle cx="-58" cy="36" r="6"/><circle cx="58" cy="36" r="6"/>
    </g>
  </svg>;
}

export default function HandPuppet() {
  const host=useRef(null);
  const [fallback,setFallback]=useState(false);
  useEffect(()=>{
    const node=host.current;if(!node)return;
    let renderer,disposed=false,frame=0,last=0,loaded=false,dirty=true;
    let human,robot;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(30,1,.1,100);camera.position.set(0,.25,12);
    camera.lookAt(0,0,0);
    try{
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setClearColor(0x080b10,0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.87;
      renderer.domElement.setAttribute('aria-hidden','true');
      renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%;outline:0;opacity:0';
      node.appendChild(renderer.domElement);
    }catch{setFallback(true);return;}
    const pmrem=new THREE.PMREMGenerator(renderer);
    const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);
    scene.environment=env.texture;scene.environmentIntensity=.36;room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight('#dbe9ff','#44403b',1.0));
    const key=new THREE.DirectionalLight('#fff8e8',2.2);key.position.set(-3,5,6);scene.add(key);
    const rim=new THREE.DirectionalLight('#b4d4eb',3.1);rim.position.set(4,1,-3);scene.add(rim);
    const fill=new THREE.DirectionalLight('#b4c7db',.8);fill.position.set(-5,-2,3);scene.add(fill);
    const puppetMaterial=new THREE.MeshPhysicalMaterial({color:'#6aa8ee',roughness:.54,metalness:.04,clearcoat:.12,clearcoatRoughness:.5,emissive:'#2f6bb5',emissiveIntensity:.25});
    const puppetDark=ceramic('#3b78c4',.42,.32);
    const figure=marionette(puppetMaterial,puppetDark);scene.add(figure.puppet);
    const bounce=new THREE.PointLight('#ebeff3',1.1,6,2);bounce.position.set(0,0,1.2);scene.add(bounce);
    const strings=[];
    for(let i=0;i<3;i++){
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(24*3),3));
      const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#dbe3e6',transparent:true,opacity:.84,depthWrite:false,depthTest:false}));
      line.renderOrder=3;
      line.frustumCulled=false;scene.add(line);strings.push(line);
    }
    // ASCII post-process: the WebGL frame is sampled per character cell and
    // redrawn as monochrome glyphs on a 2D overlay.
    const ascii=document.createElement('canvas');
    ascii.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block';
    ascii.setAttribute('aria-hidden','true');node.appendChild(ascii);
    const actx=ascii.getContext('2d'),probe=document.createElement('canvas'),pctx=probe.getContext('2d',{willReadFrequently:true});
    const PUPPET=' .:oO0Q@',RAMP=' .,:;-~=+*?#%@',BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],SUB=3;
    function asciify(){
      const w=node.clientWidth,h=node.clientHeight;if(!w||!h)return;
      const dpr=Math.min(window.devicePixelRatio||1,2);
      const cw=w<620?6:7.5,ch=cw*1.7,cols=Math.ceil(w/cw),rows=Math.ceil(h/ch);
      if(ascii.width!==Math.round(w*dpr)||ascii.height!==Math.round(h*dpr)){ascii.width=Math.round(w*dpr);ascii.height=Math.round(h*dpr);}
      probe.width=cols*SUB;probe.height=rows*SUB;
      pctx.clearRect(0,0,probe.width,probe.height);
      pctx.drawImage(renderer.domElement,0,0,probe.width,probe.height);
      const data=pctx.getImageData(0,0,probe.width,probe.height).data,stride=probe.width*4;
      actx.setTransform(dpr,0,0,dpr,0,0);actx.clearRect(0,0,w,h);
      actx.font=`${Math.round(ch*.95)}px ui-monospace,Menlo,monospace`;actx.textBaseline='top';
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        let sum=0,max=0,cr=0,cb=0,cw2=0;
        for(let sy=0;sy<SUB;sy++)for(let sx=0;sx<SUB;sx++){
          const i=(r*SUB+sy)*stride+(c*SUB+sx)*4;
          const v=(data[i]*.3+data[i+1]*.59+data[i+2]*.11)*data[i+3]/65025;
          sum+=v;if(v>max)max=v;cr+=data[i]*v;cb+=data[i+2]*v;cw2+=v;
        }
        let v=Math.max(sum/(SUB*SUB),max*.55);
        if(v<.04)continue;
        v=Math.min(1,Math.pow(v,.75)*1.15+(BAYER[(r%4)*4+c%4]/16-.5)*.12);
        // Blue-tinted pixels are the marionette: it gets its own glyph set and the theme's accent blue ink.
        const puppet=cw2>0&&(cb-cr)/cw2>55;
        const set=puppet?PUPPET:RAMP,k=Math.floor(v*(set.length-1));if(k<=0)continue;
        const a=.45+.55*v;
        actx.fillStyle=puppet?`rgba(138,190,244,${Math.min(1,a+.1).toFixed(2)})`:`rgba(226,234,238,${a.toFixed(2)})`;
        actx.fillText(set[k],c*cw,r*ch);
      }
    }
    function resize(){
      dirty=true;
      const {width,height}=node.getBoundingClientRect();if(!width||!height)return;
      renderer.setSize(width,height,false);camera.aspect=width/height;
      const visibleHeight=width<620?7.4:5.5;
      camera.position.z=visibleHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
      camera.updateProjectionMatrix();
      if(human&&robot){
        const compact=width<620;
        human.mount.position.set(compact?-1.85:-2.35,compact?-2.30:-2.20,.04);humanBase.copy(human.mount.position);
        robot.mount.position.set(compact?1.70:2.15,compact?1.40:1.35,-.08);robotBase.copy(robot.mount.position);
      }
      renderer.render(scene,camera);asciify();
    }
    const observer=new ResizeObserver(resize);observer.observe(node);resize();
    const loader=new GLTFLoader();
    Promise.all([loader.loadAsync('/models/right-hand.glb'),loader.loadAsync('/models/right-hand.glb')]).then(([h,r])=>{
      if(disposed){disposeTree(h.scene);disposeTree(r.scene);return;}
      human=setupRig(h,false);robot=setupRig(r,true);
      human.mount.rotation.set(.72,.04,.13);
      robot.mount.rotation.set(-.48,-.10,Math.PI+.14);
      scene.add(human.mount,robot.mount);
      human.pose(0,true);robot.pose(0,true);
      scene.updateMatrixWorld(true);
      loaded=true;dirty=true;resize();
    }).catch(()=>{if(!disposed){renderer.domElement.style.visibility='hidden';ascii.style.visibility='hidden';setFallback(true);}});

    const handPoint=V(),anchorPoint=V(),robotBase=V(2.15,1.35,-.08),humanBase=V(-2.35,-2.20,.04);
    function setString(line,start,end){
      const positions=line.geometry.attributes.position;
      for(let j=0;j<24;j++){
        const u=j/23;
        positions.setXYZ(j,
          THREE.MathUtils.lerp(start.x,end.x,u),
          THREE.MathUtils.lerp(start.y,end.y,u),
          THREE.MathUtils.lerp(start.z,end.z,u));
      }
      positions.needsUpdate=true;
    }
    function render(now){
      if(disposed)return;
      frame=requestAnimationFrame(render);
      if(now-last<1000/30)return;
      if(!loaded&&!dirty)return;
      last=now;
      dirty=false;
      if(loaded){
        const release=1;
        human.pose(0,true,1,[0,1,2,3,4].map(i=>Math.sin(now*.0009+i*.7)*.04));
        robot.pose(0,true,release,[Math.sin(now*.0016+.4)*.22,.1+Math.sin(now*.0021+1.2)*.42,.1+Math.sin(now*.0017)*.42,.1+Math.sin(now*.0021+3.1)*.42,Math.sin(now*.0019+2.2)*.3]);
        human.mount.rotation.z=.13+Math.sin(now*.0008)*.012;
        human.mount.position.y=humanBase.y+Math.sin(now*.0010)*.02;
        robot.mount.rotation.z=Math.PI+.14;
        robot.mount.rotation.y=-.10;
        // Everything is motionless in equilibrium: the puppet's weight is
        // carried by the taut strings and never transfers to the human hand.
        const hx=Math.sin(now*.0011)*.16,hy=Math.sin(now*.0017)*.07;
        robot.mount.position.set(robotBase.x+hx,robotBase.y+hy,robotBase.z);
        robot.mount.rotation.x=-.48+Math.sin(now*.0011)*.05;
        figure.animate(now,{x:Math.sin(now*.0011-.5)*.16,y:Math.sin(now*.0017-.5)*.07});
        scene.updateMatrixWorld(true);
        ['index-finger-tip','middle-finger-tip','ring-finger-tip'].forEach((name,i)=>{
          robot.bones[name].getWorldPosition(handPoint);figure.anchors[i].getWorldPosition(anchorPoint);
          setString(strings[i],handPoint,anchorPoint);
        });
      }
      renderer.render(scene,camera);asciify();
    }
    frame=requestAnimationFrame(render);
    function contextLost(event){event.preventDefault();renderer.domElement.style.visibility='hidden';ascii.style.visibility='hidden';setFallback(true);}
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost',contextLost);
      disposeTree(scene);env.dispose();renderer.dispose();renderer.domElement.remove();ascii.remove();
    };
  },[]);
  return <div ref={host} className="puppet-art" role="img" aria-label="A sculptural marionette hangs from three taut strings beneath a relaxed robotic hand, safely above an open human palm.">{fallback&&<div style={{position:'absolute',inset:0}}>{fallbackMarkup()}</div>}</div>;
}
