import * as THREE from 'three';

// All character parts are original, editable geometry. +Z is the front of the model.
export function createLuna() {
  const root = new THREE.Group();
  root.name = 'Luna - original moon swordswoman';
  const m = {
    skin: new THREE.MeshStandardMaterial({ color: '#f4d7cc', roughness: .84 }),
    skinShade: new THREE.MeshStandardMaterial({ color: '#c99d9b', roughness: .9 }),
    white: new THREE.MeshStandardMaterial({ color: '#e1e9ee', roughness: .37, metalness: .23 }),
    silver: new THREE.MeshStandardMaterial({ color: '#a8c6d2', roughness: .27, metalness: .72 }),
    trim: new THREE.MeshStandardMaterial({ color: '#667f91', roughness: .38, metalness: .65 }),
    navy: new THREE.MeshStandardMaterial({ color: '#18273d', roughness: .72, metalness: .12 }),
    blue: new THREE.MeshStandardMaterial({ color: '#2d526e', roughness: .65, side: THREE.DoubleSide }),
    lining: new THREE.MeshStandardMaterial({ color: '#7099ac', roughness: .65, side: THREE.DoubleSide }),
    hair: new THREE.MeshStandardMaterial({ color: '#bbcbdc', roughness: .54, metalness: .13 }),
    hairLight: new THREE.MeshStandardMaterial({ color: '#d7e1ea', roughness: .47, metalness: .12 }),
    hairShade: new THREE.MeshStandardMaterial({ color: '#879bb5', roughness: .64 }),
    dark: new THREE.MeshBasicMaterial({ color: '#182335', side: THREE.DoubleSide }),
    eyeWhite: new THREE.MeshBasicMaterial({ color: '#f3f4f3', side: THREE.DoubleSide }),
    iris: new THREE.MeshBasicMaterial({ color: '#438da0', side: THREE.DoubleSide }),
    irisLight: new THREE.MeshBasicMaterial({ color: '#81e1df', side: THREE.DoubleSide }),
    gem: new THREE.MeshStandardMaterial({ color: '#81dce0', emissive: '#2a6573', emissiveIntensity: .6, metalness: .2, roughness: .18 }),
  };
  function mesh(g, mat, pos=[0,0,0], scale=[1,1,1], parent=root) {
    const o=new THREE.Mesh(g,mat);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  }
  function orb(pos,scale,mat=m.skin,parent=root){return mesh(new THREE.SphereGeometry(1,32,24),mat,pos,scale,parent);}
  function line(points,mat=m.silver,r=.012,parent=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,Math.max(16,points.length*8),r,8,false),mat,[0,0,0],[1,1,1],parent);}
  function link(a,b,r1,r2,mat,parent=root){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const o=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),24),mat,av.clone().add(bv).multiplyScalar(.5).toArray(),[1,1,1],parent);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
  function rings(levels,mat,segments=48,parent=root){
    const p=[],uv=[],idx=[];
    levels.forEach(([y,rx,rz,z=0],j)=>{for(let i=0;i<=segments;i++){let a=i/segments*Math.PI*2;p.push(Math.sin(a)*rx,y,Math.cos(a)*rz+z);uv.push(i/segments,j/(levels.length-1));if(j<levels.length-1&&i<segments){let v=j*(segments+1)+i;idx.push(v,v+1,v+segments+1,v+1,v+segments+2,v+segments+1);}}});
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return mesh(g,mat,[0,0,0],[1,1,1],parent);
  }
  function plate(points,depth,mat,parent=root){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.01});return mesh(g,mat,[0,0,0],[1,1,1],parent);}
  function crescent(radius,mat,parent=root){const s=new THREE.Shape();s.absarc(0,0,radius,.28*Math.PI,1.72*Math.PI,false);s.absarc(radius*.4,0,radius*.78,1.65*Math.PI,.35*Math.PI,true);s.closePath();return mesh(new THREE.ExtrudeGeometry(s,{depth:.035,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2}),mat,[0,0,0],[1,1,1],parent);}
  // A swept elliptical strand gives each lock of hair a modeled ridge and pointed tip.
  function strand(points,width,depth,mat=m.hair,parent=root){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),p=[],idx=[],n=36,sides=10;
    for(let j=0;j<=n;j++){const t=j/n,c=curve.getPoint(t),tan=curve.getTangent(t),axis=new THREE.Vector3(0,0,1),side=new THREE.Vector3().crossVectors(tan,axis).normalize(),front=new THREE.Vector3().crossVectors(side,tan).normalize();let taper=Math.pow(Math.sin((t*.94+.045)*Math.PI),.55)*(1-t*.45);if(j===n)taper=.015;for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,v=c.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(front,Math.sin(a)*depth*taper);p.push(v.x,v.y,v.z);if(j<n&&i<sides){let k=j*(sides+1)+i;idx.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,mat,[0,0,0],[1,1,1],parent);
  }

  // Legs, fitted stockings and layered metal boots.
  const legData=[{x:-.245,knee:[-.29,1.52,.09],ankle:[-.34,.39,.12]},{x:.245,knee:[.29,1.5,-.055],ankle:[.37,.37,-.04]}];
  legData.forEach(({x,knee,ankle},i)=>{
    const hip=[x,2.64,0];link(hip,knee,.235,.158,m.skin);orb(knee,[.16,.17,.16],m.skin);link(knee,ankle,.147,.095,m.navy);
    // Thigh-high stockings, with a visible skin gap beneath the skirt.
    const stockingTop=[x+(knee[0]-x)*.24,2.37,knee[2]*.24];
    link(stockingTop,knee,.226,.169,m.navy);
    const top=mesh(new THREE.TorusGeometry(.226,.015,8,48),m.silver,[stockingTop[0],2.37,stockingTop[2]],[1,1,.95]);top.rotation.x=Math.PI/2;
    const shin=plate([[-.095,.04],[-.135,.43],[-.10,.91],[0,1.04],[.10,.91],[.13,.43],[.07,.04]],.045,m.white);shin.position.set(ankle[0],.39,ankle[2]+.07);shin.rotation.z=i?-.06:.035;
    line([[ankle[0],.43,ankle[2]+.136],[ankle[0],.85,ankle[2]+.18],[knee[0],1.39,knee[2]+.17]],m.silver,.016);
    orb([ankle[0],.27,ankle[2]+.12],[.129,.22,.21],m.navy);
    orb([ankle[0],.17,ankle[2]+.23],[.14,.125,.30],m.navy);
    orb([ankle[0],.19,ankle[2]+.32],[.145,.105,.225],m.white);
    mesh(new THREE.BoxGeometry(.24,.06,.43),m.trim,[ankle[0],.065,ankle[2]+.22]);
    const kneePlate=orb([knee[0],knee[1],knee[2]+.125],[.137,.18,.07],m.white);kneePlate.rotation.z=i?-.1:.05;
    orb([knee[0],knee[1]+.02,knee[2]+.192],[.035,.06,.018],m.gem);
  });
  // Hourglass bodice. Curved continuous rings make the torso coherent from every angle.
  rings([[2.45,.34,.235],[2.61,.43,.255],[2.79,.37,.23],[2.99,.285,.19],[3.2,.30,.21],[3.4,.37,.255],[3.58,.395,.255],[3.72,.36,.19],[3.83,.23,.15]],m.navy);
  rings([[3.66,.33,.17],[3.8,.27,.15],[3.95,.16,.12],[4.12,.125,.115]],m.skin);
  rings([[2.82,.35,.24],[3.0,.301,.22],[3.2,.32,.242],[3.4,.389,.276],[3.59,.40,.255],[3.70,.33,.19]],m.white);
  // Sculpted overlapping breastplate, collar and fluted waist panels.
  for(const sign of [-1,1]){
    orb([sign*.176,3.49,.188],[.221,.19,.16],m.white);
    line([[sign*.30,3.67,.15],[sign*.24,3.49,.34],[sign*.13,3.35,.303],[0,3.29,.266]],m.silver,.017);
    line([[sign*.285,3.03,.117],[sign*.223,3.19,.21],[sign*.25,3.33,.263]],m.trim,.009);
    line([[sign*.32,2.86,.12],[sign*.245,3.05,.21],[sign*.17,3.26,.264]],m.silver,.013);
    const collar=plate([[0,0],[.06,.28],[.18,.2],[.20,.03],[.05,-.1]],.035,m.navy);collar.position.set(sign*.06,3.83,.1);collar.scale.x=sign;
  }
  line([[-.28,3.72,.10],[-.19,3.79,.17],[0,3.69,.23],[.19,3.79,.17],[.28,3.72,.1]],m.silver,.024);
  const brooch=crescent(.105,m.silver);brooch.position.set(0,3.49,.346);brooch.rotation.z=-.4;
  orb([0,3.59,.349],[.048,.067,.027],m.gem);
  const belly=plate([[0,.21],[-.08,0],[0,-.18],[.08,0]],.035,m.silver);belly.position.set(0,3.12,.233);
  orb([0,3.14,.289],[.025,.045,.014],m.gem);
  rings([[2.69,.416,.27],[2.78,.39,.26],[2.85,.356,.243]],m.trim);
  const beltGem=plate([[-.1,0],[0,.13],[.1,0],[0,-.13]],.04,m.silver);beltGem.position.set(0,2.76,.275);
  orb([0,2.78,.328],[.043,.065,.025],m.gem);

  // Petal skirt: open front, layered side armor and flowing split coat tails.
  function skirtPanel(a0,a1,length,mat,flare=.23){
    const p=[],idx=[],rows=18,cols=16;for(let j=0;j<=rows;j++){const t=j/rows;for(let i=0;i<=cols;i++){const u=i/cols,a=a0+(a1-a0)*u,r=.38+flare*t+.035*Math.sin(u*Math.PI*4)*t,y=2.7-length*t+.11*Math.sin(u*Math.PI)*t; p.push(Math.sin(a)*r,y,Math.cos(a)*r*.78-.025*t);if(j<rows&&i<cols){const k=j*(cols+1)+i;idx.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const o=mesh(g,mat);for(const u of [0,1]){const pts=[];for(let j=0;j<=16;j++){const t=j/16,a=a0+(a1-a0)*u,r=.38+flare*t;pts.push([Math.sin(a)*r,2.7-length*t,Math.cos(a)*r*.78-.025*t]);}line(pts,m.silver,.011);}return o;
  }
  skirtPanel(.46,1.8,.78,m.blue,.20);skirtPanel(-1.8,-.46,.73,m.blue,.20);
  skirtPanel(1.8,3.1,1.5,m.navy,.32);skirtPanel(3.18,4.48,1.42,m.navy,.32);
  skirtPanel(1.95,2.55,1.30,m.lining,.30);skirtPanel(3.73,4.30,1.22,m.blue,.31);
  for(const sign of [-1,1]){
    const hipArmor=plate([[0,.08],[.20,.02],[.25,-.24],[.12,-.5],[-.03,-.31],[-.07,-.08]],.055,m.white);hipArmor.position.set(sign*.36,2.69,.055);hipArmor.scale.x=sign;hipArmor.rotation.y=sign*.42;hipArmor.rotation.z=sign*.2;
    const frontTab=plate([[0,.05],[.13,-.08],[.13,-.47],[0,-.63],[-.1,-.36],[-.08,-.02]],.038,m.white);frontTab.position.set(sign*.18,2.66,.30);frontTab.scale.x=sign;frontTab.rotation.z=sign*.09;
    line([[sign*.18,2.65,.354],[sign*.22,2.39,.36],[sign*.18,2.12,.351]],m.silver,.013);
  }
  // Relaxed contrapposto arm pose, left hand slightly lifted, right hand holding sword.
  const arms=[{s:-1,sh:[-.39,3.74,0],el:[-.73,3.15,.06],wr:[-.72,2.79,.31]},{s:1,sh:[.39,3.74,0],el:[.76,3.21,.03],wr:[.94,2.82,.17]}];
  arms.forEach(({s,sh,el,wr})=>{
    link(sh,el,.14,.106,m.skin);orb(el,[.113,.12,.112]);link(el,wr,.105,.073,m.navy);
    orb([sh[0]+s*.04,3.73,.015],[.24,.135,.23],m.white).rotation.z=s*-.20;
    const pauldron=plate([[-.14,.05],[.1,.12],[.22,-.03],[.13,-.19],[-.11,-.14]],.07,m.silver);pauldron.position.set(sh[0]+s*.09,3.70,.13);pauldron.scale.x=s;pauldron.rotation.z=-s*.25;
    line([[sh[0]-s*.13,3.79,.15],[sh[0]+s*.1,3.81,.22],[sh[0]+s*.23,3.63,.12]],m.trim,.014);
    const mid=new THREE.Vector3(...el).lerp(new THREE.Vector3(...wr),.58).toArray();link(mid,wr,.12,.084,m.white);
    link(new THREE.Vector3(...mid).lerp(new THREE.Vector3(...wr),.08).toArray(),new THREE.Vector3(...mid).lerp(new THREE.Vector3(...wr),.15).toArray(),.128,.126,m.silver);
    orb([wr[0],wr[1]-.075,wr[2]],[.077,.123,.072],m.skin);
    // Individual fingers and thumb, partly curled around the sword grip.
    for(let f=0;f<4;f++){const x=wr[0]-.052+f*.033,y=wr[1]-.13+(f===0?.025:0),z=wr[2]+.025;link([x,y,z],[x+s*.008,y-.075,z+.016],.018,.013,m.skin);orb([x+s*.008,y-.075,z+.016],[.014,.025,.016]);}
    link([wr[0]-s*.06,wr[1]-.03,wr[2]+.015],[wr[0]-s*.075,wr[1]-.11,wr[2]+.065],.025,.02,m.skin);
  });
  // Face is a shaped, seamless volume with a tapered chin and rounded cheeks.
  link([0,3.95,0],[0,4.31,0],.114,.13,m.skin);
  const head=new THREE.Group();head.position.set(0,4.64,0);root.add(head);
  const hg=new THREE.SphereGeometry(1,64,48);const hp=hg.attributes.position;
  for(let i=0;i<hp.count;i++){let x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);const jaw=y<-.18?1-(Math.abs(y)-.18)*.36:1;hp.setXYZ(i,x*.367*jaw,y*.475,z*.315+(z>0?.034*(1-y*y):0));}hg.computeVertexNormals();
  mesh(hg,m.skin,[0,0,0],[1,1,1],head);
  for(const s of [-1,1]){orb([s*.347,-.035,-.008],[.062,.112,.05],m.skin,head);orb([s*.369,-.027,.02],[.019,.06,.026],m.skinShade,head);}
  // Almond eyes, inset pupils, modeled lashes, brows, nose and soft mouth.
  function eyeShape(s,scale,material,z){
    const shape=new THREE.Shape();shape.moveTo(-.105,0);shape.bezierCurveTo(-.075,.06,.052,.072,.106,.019);shape.bezierCurveTo(.070,-.055,-.051,-.052,-.105,0);
    const o=mesh(new THREE.ShapeGeometry(shape,32),material,[s*.153,-.025,z],[scale,scale,1],head);o.rotation.y=s*.27;o.rotation.z=s*.035;return o;
  }
  for(const s of [-1,1]){
    eyeShape(s,1.13,m.dark,.306);eyeShape(s,1,m.eyeWhite,.310);
    orb([s*.15,-.023,.326],[.044,.061,.014],m.dark,head);
    orb([s*.15,-.027,.34],[.035,.050,.009],m.iris,head);
    orb([s*.15,-.046,.348],[.026,.021,.006],m.irisLight,head);
    orb([s*.15,-.014,.350],[.016,.038,.006],m.dark,head);
    orb([s*.15-.013,.003,.358],[.012,.015,.004],m.eyeWhite,head);
    orb([s*.15+.016,-.048,.358],[.006,.007,.004],m.eyeWhite,head);
    line([[s*.049,-.021,.324],[s*.103,.031,.329],[s*.194,.035,.319],[s*.254,-.008,.294],[s*.284,.015,.274]],m.dark,.012,head);
    line([[s*.07,.11,.298],[s*.15,.133,.306],[s*.238,.102,.279]],m.hairShade,.012,head);
    // Short tapered lashes at the outer corners.
    link([s*.242,.01,.300],[s*.276,.039,.283],.01,.001,m.dark,head);
    orb([s*.205,-.116,.280],[.062,.015,.005],new THREE.MeshBasicMaterial({color:'#e7b5b0',transparent:true,opacity:.40}),head);
  }
  orb([0,-.122,.337],[.026,.049,.035],m.skin,head);
  line([[-.037,-.223,.291],[0,-.218,.302],[.039,-.223,.291]],new THREE.MeshStandardMaterial({color:'#b57e83',roughness:1}),.006,head);
  orb([0,-.237,.292],[.026,.008,.006],m.skinShade,head);
  // Rounded back hair shell, many individually sculpted silver locks.
  const hairCap=mesh(new THREE.SphereGeometry(1,48,32,0,Math.PI*2,0,Math.PI*.58),m.hair,[0,.025,-.025],[.402,.49,.365],head);
  hairCap.rotation.x=-.12;
  orb([0,-.05,-.17],[.38,.45,.24],m.hairShade,head);
  for(let i=0;i<11;i++){
    const a=(i/10-.5)*2.4,x=Math.sin(a)*.33,z=-.18-Math.cos(a)*.15;
    strand([[x,4.93,z],[x*1.27,4.42,z-.05],[x*1.43,3.78,z-.07],[x*1.75,3.12,z-.13],[x*1.89+Math.sin(i)*.10,2.73+(i%3)*.11,z-.02]],.10+(i%3)*.015,.052,i%3===0?m.hairLight:i%3===1?m.hair:m.hairShade);
  }
  // Face-framing locks and swept fringe leave the eyes fully readable.
  strand([[-.09,5.10,.05],[-.24,5.02,.27],[-.30,4.77,.32],[-.32,4.51,.30],[-.24,4.31,.23]],.13,.052,m.hairLight);
  strand([[.02,5.115,.02],[.17,5.06,.25],[.25,4.90,.33],[.30,4.67,.30]],.135,.045,m.hairLight);
  strand([[-.06,5.14,.06],[-.03,5.06,.28],[-.08,4.88,.35],[-.12,4.78,.34]],.105,.042,m.hair);
  strand([[.04,5.15,.05],[.13,5.04,.29],[.12,4.88,.36],[.07,4.80,.35]],.10,.038,m.hairLight);
  for(const s of [-1,1]){
    strand([[s*.29,4.99,.10],[s*.38,4.71,.06],[s*.39,4.28,.13],[s*.45,3.93,.15],[s*.58,3.67,.04]],.115,.06,m.hairLight);
    strand([[s*.36,4.85,-.05],[s*.46,4.43,-.04],[s*.52,4.0,-.05],[s*.48,3.55,-.02],[s*.66,3.23,.06]],.105,.05,m.hair);
    // Silver hair clasp and hanging moon earrings.
    orb([s*.375,4.62,.045],[.055,.13,.07],m.navy);
    line([[s*.35,4.72,.095],[s*.41,4.61,.108],[s*.37,4.52,.10]],m.silver,.016);
    link([s*.365,4.48,.045],[s*.38,4.32,.05],.008,.008,m.silver);
    const e=crescent(.055,m.silver);e.position.set(s*.38,4.30,.05);e.rotation.z=s*.5;
  }
  // Thin moon diadem follows the forehead, with a luminous central stone.
  line([[-.30,4.90,.24],[-.18,4.99,.295],[0,4.96,.345],[.18,4.99,.295],[.30,4.9,.24]],m.silver,.016);
  const crown=crescent(.106,m.silver);crown.position.set(0,5.035,.30);crown.rotation.z=Math.PI/2;
  orb([0,4.977,.368],[.031,.052,.022],m.gem);

  // Slender double-edged sword, a separate real 3D object in her right hand.
  const sword=new THREE.Group();sword.position.set(.95,2.76,.18);sword.rotation.z=.21;root.add(sword);
  const bladeShape=[[0,-.18],[-.105,-.39],[-.095,-1.67],[-.055,-2.06],[0,-2.30],[.09,-1.94],[.13,-.45],[.10,-.30]];
  const blade=plate(bladeShape,.045,m.white,sword);blade.position.z=-.022;
  const fuller=plate([[0,-.36],[-.025,-.51],[-.015,-1.95],[0,-2.15],[.027,-1.92],[.035,-.5]],.009,m.silver,sword);fuller.position.z=.033;
  line([[-.105,-.39,.03],[-.095,-1.67,.03],[-.055,-2.06,.03],[0,-2.30,.03]],m.silver,.009,sword);
  link([0,-.2,0],[0,.20,0],.042,.042,m.navy,sword);
  for(let i=0;i<6;i++){const b=mesh(new THREE.TorusGeometry(.043,.008,6,16),m.silver,[0,-.17+i*.062,0],[1,1,1],sword);b.rotation.x=Math.PI/2;}
  orb([0,.245,0],[.063,.082,.051],m.silver,sword);orb([0,.259,.045],[.027,.04,.014],m.gem,sword);
  line([[-.31,-.29,0],[-.22,-.21,.012],[0,-.24,0],[.22,-.21,.012],[.31,-.29,0]],m.silver,.035,sword);
  const guard=crescent(.16,m.silver,sword);guard.position.set(0,-.24,.035);guard.rotation.z=Math.PI/2;
  orb([0,-.28,.08],[.043,.065,.025],m.gem,sword);
  // A short cloth knot connects the sword to the same costume language.
  strand([[.05,.17,-.01],[.20,.03,-.03],[.19,-.34,-.02],[.29,-.63,-.04]],.037,.009,m.blue,sword);
  strand([[.05,.17,-.01],[.12,-.02,-.04],[.05,-.32,-.02],[.13,-.51,-.05]],.029,.008,m.lining,sword);
  root.userData.materials=m;
  root.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingSphere();}});
  return root;
}
