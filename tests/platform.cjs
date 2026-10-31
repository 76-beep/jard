const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements={};let stopped=0,scanStopped=0,decodeCallback;
const input=value=>({value,focus(){}});
const form={elements:{operation:input('RO-1001'),barcode:input(''),qty:input(1),location:input('A1'),note:input('')}};
elements['#scanForm']=form;elements['#cameraStatus']={textContent:''};elements['#cameraStart']={disabled:false};elements['#cameraArea']={hidden:true};elements['#barcodeVideo']={pause(){},srcObject:null};elements['#toast']={textContent:'',style:{}};
const stream={getTracks:()=>[{stop(){stopped++}}]};
class MockFormData{constructor(form){this.form=form}get(k){return this.form.elements[k]?.value}}
const context=vm.createContext({structuredClone,crypto:require('node:crypto').webcrypto,TextEncoder,Uint8Array,FormData:MockFormData,localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},document:{querySelector:s=>elements[s]||null,addEventListener(){}},window:{addEventListener(){},ZXingBrowser:{BrowserMultiFormatReader:class{async decodeFromStream(s,v,cb){decodeCallback=cb;return {stop(){scanStopped++}}}}}},navigator:{mediaDevices:{getUserMedia:async()=>stream},vibrate(){}},setTimeout:()=>0,console});
context.ZXingBrowser=context.window.ZXingBrowser;
for(const file of ['app.js','enhancements.js','platform.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8').replace(/^render\(\);$/gm,''),context);
const run=s=>vm.runInContext(s,context);
(async()=>{
run('db.plan=0');assert.equal(run('operationBalance()'),0);assert.throws(()=>run('assertOperationCredit()'));
assert.equal(run('addonPrice(1)'),50);assert.equal(run('addonPrice(2)'),70);assert.throws(()=>run('addonPrice(3)'));
run("db.addonRequests.push({id:'ADD-TEST',quantity:2,amount:70,status:'pending'});approveAddon('ADD-TEST','approved')");assert.equal(run('operationBalance()'),2);
assert.throws(()=>run("approveAddon('ADD-TEST','approved')"));assert.equal(run('db.addonCredits'),2);
run("db.ops.push({id:'closed',status:'closed',staff:[],supervisor:'x'});");assert.equal(run('operationBalance()'),1);
run('db.planLimits[0].users=4');assert.throws(()=>run('assertUserSlot()'));run('db.planLimits[0].users=5');run('assertUserSlot()');
run("db.platformRole='security'");assert.equal(run("canPlatform('subscriptions')"),false);assert.equal(run("canPlatform('security')"),true);assert.throws(()=>run("approveAddon('ADD-TEST','approved')"));
assert.throws(()=>run('validateLimits(0,2)'));assert.equal(run('currentLimits().operations'),2);
run("db.role='employee';selected='RO-1001';attachScan()");await run('startCamera()');assert.equal(stopped,0);assert.equal(scanStopped,0);
decodeCallback({getText:()=> '00123'});assert.equal(form.elements.barcode.value,'00123');decodeCallback({getText:()=> '99999'});assert.equal(form.elements.barcode.value,'00123');
assert.equal(stopped,0);assert.equal(scanStopped,0);form.elements.qty.value=6;form.onsubmit({preventDefault(){}});assert.equal(form.elements.barcode.value,'');assert.equal(run('db.logs.at(-1).qty'),6);assert.equal(stopped,0);assert.equal(scanStopped,0);assert.equal(run('scanLocked'),false);
run('stopCamera()');assert.equal(stopped,1);assert.equal(scanStopped,1);
console.log('Platform and continuous-scanner checks passed: quotas, immutable consumption, user slots, addon pricing/idempotency, staff scopes, barcode lock, save without camera teardown, and cleanup.');
})().catch(e=>{console.error(e);process.exit(1)});
