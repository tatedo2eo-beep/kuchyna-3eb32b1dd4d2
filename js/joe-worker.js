// Joe AI chat: model runs here, off the main thread, so the site never stutters.
// WebLLM (Apache-2.0) from jsDelivr, pinned. Weights are cached by WebLLM in the browser Cache API
// ("webllm/model"), so they download once per laptop.
import * as webllm from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.86/+esm';
let engine=null,loaded=null,abort=false;
const post=(o)=>self.postMessage(o);
async function cached(model){try{return await webllm.hasModelInCache(model);}catch(e){return false;}}
async function load(model){
  if(loaded===model&&engine)return post({type:'ready',model});
  if(!engine)engine=new webllm.MLCEngine();
  engine.setInitProgressCallback(p=>post({type:'progress',model,progress:p.progress,text:p.text}));
  await engine.reload(model);loaded=model;post({type:'ready',model});
}
self.onmessage=async(ev)=>{const m=ev.data||{};
  try{
    if(m.cmd==='cached'){post({type:'cached',id:m.id,model:m.model,cached:await cached(m.model)});}
    else if(m.cmd==='load'){await load(m.model);}
    else if(m.cmd==='unload'){if(engine){await engine.unload();}loaded=null;post({type:'unloaded'});}
    else if(m.cmd==='chat'){
      abort=false;await load(m.model);
      const chunks=await engine.chat.completions.create({messages:m.messages,stream:true,temperature:m.temperature??0.7,top_p:0.9,max_tokens:m.max_tokens||350,frequency_penalty:0.3});
      let full='';
      for await(const c of chunks){if(abort){try{engine.interruptGenerate();}catch(e){}break;}
        const d=c.choices&&c.choices[0]&&c.choices[0].delta&&c.choices[0].delta.content||'';if(d){full+=d;post({type:'delta',id:m.id,text:full});}}
      post({type:'done',id:m.id,text:full,stopped:abort});
    }
    else if(m.cmd==='abort'){abort=true;}
  }catch(e){post({type:'error',id:m.id,cmd:m.cmd,error:String(e&&e.message||e)});}
};
post({type:'hello'});
