import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-angle=swiftshader']});
const page=await browser.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const results=[];
for(const [label,width,height] of [['desktop-short',1280,720],['mobile-small',320,568],['mobile',390,844],['desktop',1440,1000]]){
  await page.setViewportSize({width,height});
  await page.goto('http://localhost:5173/');
  await page.waitForFunction(()=>window.__LUNA_READY__);
  await page.waitForTimeout(900);
  const result=await page.evaluate(async()=>{
    const {Vector3,Box3}=await import('/node_modules/three/build/three.module.js');
    const {camera,luna}=window.__LUNA_VIEWER__;
    const box=new Box3().setFromObject(luna),screen=[];
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
      const p=new Vector3(x,y,z).project(camera);screen.push({x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2});
    }
    const projectedBottom=Math.max(...screen.map(p=>p.y)),projectedTop=Math.min(...screen.map(p=>p.y));
    return {toolbarTop:document.querySelector('.controls').getBoundingClientRect().top,projectedBottom,projectedTop,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert(result.projectedBottom<result.toolbarTop-10,`${label}: complete model clears toolbar (${result.projectedBottom} vs ${result.toolbarTop})`);
  assert(result.projectedTop>60,`${label}: head clears header`);
  assert(!result.overflow);
  await page.screenshot({path:`artifacts/luna-${label}-fixed.png`});
  if(width===320){
    await page.getByRole('button',{name:'肖像',exact:true}).click();await page.waitForTimeout(1200);
    assert.equal(await page.locator('.intro').evaluate(el=>getComputedStyle(el).visibility),'hidden','Mobile portrait hides overlapping text');
    await page.screenshot({path:'artifacts/luna-mobile-portrait-fixed.png'});
    await page.getByRole('button',{name:'全身',exact:true}).click();await page.waitForTimeout(1200);
    assert.equal(await page.locator('.intro').evaluate(el=>getComputedStyle(el).visibility),'visible','Full body restores intro');
  }
  results.push({label,width,height,...result});
}
assert.equal(errors.length,0);
await writeFile('artifacts/short-screen-verification.json',JSON.stringify({result:'passed',results,errors},null,2));
console.log(JSON.stringify(results,null,2));await browser.close();
