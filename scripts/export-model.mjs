import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--enable-webgl','--use-angle=swiftshader']});
const page=await browser.newPage({acceptDownloads:true});
await page.goto(process.env.VIEWER_URL||'http://localhost:5173/');
await page.waitForFunction(()=>window.__LUNA_READY__===true);
const downloadEvent=page.waitForEvent('download');
await page.evaluate(async()=>{
  const {GLTFExporter}=await import('/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
  const model=window.__LUNA_VIEWER__.luna.clone(true);model.position.set(0,0,0);model.rotation.set(0,0,0);model.userData={character:'Luna',description:'Original anime moon swordswoman'};
  const buffer=await new GLTFExporter().parseAsync(model,{binary:true});
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buffer],{type:'model/gltf-binary'}));a.download='luna.glb';a.click();
});
const download=await downloadEvent;await download.saveAs('artifacts/luna.glb');console.log('Exported artifacts/luna.glb');await browser.close();
