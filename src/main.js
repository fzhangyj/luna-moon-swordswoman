import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createLuna } from './character.js';
import './style.css';

const host=document.querySelector('#viewer');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:true}); }
catch(error){document.querySelector('#error').hidden=false;document.querySelector('#loading').remove();throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
renderer.domElement.setAttribute('tabindex','0');renderer.domElement.setAttribute('aria-label','露娜三维角色。方向键旋转，拖动旋转，滚轮缩放。');host.append(renderer.domElement);
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2('#0b1119',.026);
const camera=new THREE.PerspectiveCamera(31,innerWidth/innerHeight,.1,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=3.0;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.86;controls.minPolarAngle=.2;controls.enablePan=false;controls.autoRotateSpeed=.6;
const pmrem=new THREE.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=env.texture;pmrem.dispose();
const ambient=new THREE.HemisphereLight('#dbeef6','#31425b',1.5);scene.add(ambient);
const key=new THREE.DirectionalLight('#f7eddf',3.0);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=7;key.shadow.camera.bottom=-1;key.shadow.normalBias=.025;key.shadow.bias=-.0001;key.shadow.radius=4;scene.add(key);
const rim=new THREE.DirectionalLight('#8ec4e4',3.0);rim.position.set(3,5,-4);scene.add(rim);
const fill=new THREE.DirectionalLight('#d5e7f4',1.3);fill.position.set(3,3,4);scene.add(fill);
const luna=createLuna();luna.rotation.y=-.15;scene.add(luna);
// A quiet display plinth grounds the model without becoming a game environment.
const plinth=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.35,.11,96),new THREE.MeshStandardMaterial({color:'#172431',roughness:.54,metalness:.35}));plinth.position.y=-.045;plinth.receiveShadow=true;scene.add(plinth);
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.20,.009,8,128),new THREE.MeshStandardMaterial({color:'#6b94a4',emissive:'#3b5f6e',emissiveIntensity:.3,roughness:.4,metalness:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.014;scene.add(ring);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.23}));ground.rotation.x=-Math.PI/2;ground.position.y=-.105;ground.receiveShadow=true;scene.add(ground);
const marks=new THREE.Group();for(let i=0;i<32;i++){const a=i/32*Math.PI*2,o=new THREE.Mesh(new THREE.BoxGeometry(.008,.002,i%4===0?.065:.026),new THREE.MeshBasicMaterial({color:'#5f7f8b'}));o.position.set(Math.sin(a)*1.14,.016,Math.cos(a)*1.14);o.rotation.y=a;marks.add(o);}scene.add(marks);
let currentView='full',transition=null,lightMode=false;
const viewButtons=[...document.querySelectorAll('[data-view]')];
function framing(view){
  const mobile=innerWidth<600,narrow=innerWidth<900;
  if(view==='portrait')return {position:new THREE.Vector3(.35,4.65,mobile?4.9:4.25),target:new THREE.Vector3(0,4.15,.03)};
  // Frame the complete display inside the space above the toolbar. Pixel-based
  // reservations keep the same foot clearance on a short laptop or phone.
  const top=mobile?82:100;
  const bottom=document.querySelector('.controls').getBoundingClientRect().top-24;
  const availableHeight=Math.max(180,bottom-top);
  const worldHeight=5.45;
  const distance=Math.max(mobile?14.5:narrow?13.3:13.1,worldHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*availableHeight/innerHeight));
  const worldPerPixel=2*distance*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/innerHeight;
  const centerY=(top+bottom)/2;
  const targetY=2.55+(centerY-innerHeight/2)*worldPerPixel;
  const back=view==='detail';
  return {position:new THREE.Vector3(back?-.6:.8,targetY+.66,back?-distance:distance),target:new THREE.Vector3(0,targetY,0)};
}
function setView(view,instant=false){currentView=view;document.querySelector('#app').dataset.view=view;const f=framing(view);viewButtons.forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});if(instant||reducedMotion){camera.position.copy(f.position);controls.target.copy(f.target);controls.update();transition=null;}else transition={from:camera.position.clone(),to:f.position,fromTarget:controls.target.clone(),toTarget:f.target,start:performance.now()};}
setView('full',true);
viewButtons.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
const rotateButton=document.querySelector('#rotate');rotateButton.addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;rotateButton.setAttribute('aria-pressed',String(controls.autoRotate));rotateButton.setAttribute('aria-label',controls.autoRotate?'暂停自动旋转':'开始自动旋转');rotateButton.querySelector('span:last-child').textContent=controls.autoRotate?'暂停旋转':'自动旋转';});
document.querySelector('#reset').addEventListener('click',()=>{controls.autoRotate=false;rotateButton.setAttribute('aria-pressed','false');rotateButton.setAttribute('aria-label','开始自动旋转');rotateButton.querySelector('span:last-child').textContent='自动旋转';setView('full');});
document.querySelector('#background').addEventListener('click',()=>{lightMode=!lightMode;document.body.classList.toggle('light',lightMode);scene.fog.color.set(lightMode?'#d4dfe3':'#0b1119');plinth.material.color.set(lightMode?'#9cb3bd':'#172431');document.querySelector('#background').setAttribute('aria-label',lightMode?'切换为深色背景':'切换为浅色背景');});
controls.addEventListener('start',()=>transition=null);
renderer.domElement.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(event.key))return;
  event.preventDefault();transition=null;
  const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(event.key==='ArrowLeft')spherical.theta-=.09;
  if(event.key==='ArrowRight')spherical.theta+=.09;
  if(event.key==='ArrowUp')spherical.phi-=.09;
  if(event.key==='ArrowDown')spherical.phi+=.09;
  if(event.key==='+'||event.key==='=')spherical.radius*=.9;
  if(event.key==='-')spherical.radius/=.9;
  spherical.phi=THREE.MathUtils.clamp(spherical.phi,controls.minPolarAngle,controls.maxPolarAngle);
  spherical.radius=THREE.MathUtils.clamp(spherical.radius,controls.minDistance,controls.maxDistance);
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();
});
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();setView(currentView,true);}
addEventListener('resize',resize);
let frames=0;
renderer.setAnimationLoop((time)=>{
  if(transition){const t=Math.min(1,(time-transition.start)/900),e=1-Math.pow(1-t,3);camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,e);if(t>=1)transition=null;}
  controls.update();
  // A subtle breath keeps the still character alive, and is disabled for reduced motion.
  if(!reducedMotion)luna.position.y=Math.sin(time*.0011)*.007;
  renderer.render(scene,camera);
  if(++frames===3){document.querySelector('#loading').classList.add('loaded');window.__LUNA_READY__=true;}
});
// Small read-only hooks support meaningful render and camera checks.
window.__LUNA_VIEWER__={scene,camera,controls,renderer,luna,get view(){return currentView;}};
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();document.querySelector('#error').hidden=false;});
addEventListener('pagehide',()=>{controls.dispose();renderer.dispose();env.dispose();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});},{once:true});
