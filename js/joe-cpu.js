// Joe AI, CPU path: llama.cpp compiled to WebAssembly (wllama, MIT) for laptops without usable WebGPU.
// Same message protocol as js/joe-worker.js, so joe.js treats both engines the same way.
// The model file comes from Hugging Face once and is cached by wllama in the browser (Origin Private File System).
// wllama runs the model in its own worker, so the page stays smooth; multi-thread when the page is cross-origin isolated, otherwise single-thread.
import { Wllama, LoggerWithoutDebug } from 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/esm/index.js';
const WASM={default:'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/src/wasm/wllama.wasm'};
export const URLS={'qwen1.5b-q4km':'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf'};
export function make(){
  const w={onmessage:null,onerror:null};let ll=null,loaded=null,ctl=null;
  const post=o=>{try{w.onmessage&&w.onmessage({data:o});}catch(e){console.warn('[joe cpu]',e);}};
  const inst=()=>ll||(ll=new Wllama(WASM,{logger:LoggerWithoutDebug,parallelDownloads:3}));
  async function cached(model){try{const cm=inst().cacheManager;const n=await cm.getNameFromURL(URLS[model]);return (await cm.getSize(n))>0;}catch(e){return false;}}
  async function load(model){
    if(loaded===model&&ll&&ll.isModelLoaded())return post({type:'ready',model});
    const was=await cached(model);
    await inst().loadModelFromUrl(URLS[model],{n_ctx:8192,n_gpu_layers:0,useCache:true,
      progressCallback:({loaded:l,total:t})=>post({type:'progress',model,progress:t?Math.min(0.99,l/t):0,text:was?'load':'download'})});
    loaded=model;post({type:'ready',model,threads:ll.isMultithread()?'multi':'single'});
  }
  w.postMessage=async m=>{m=m||{};
    try{
      if(m.cmd==='cached')post({type:'cached',id:m.id,model:m.model,cached:await cached(m.model)});
      else if(m.cmd==='load')await load(m.model);
      else if(m.cmd==='unload'){if(ll){try{await ll.exit();}catch(e){}ll=null;}loaded=null;post({type:'unloaded'});}
      else if(m.cmd==='chat'){
        await load(m.model);ctl=new AbortController();let full='';
        const it=await ll.createChatCompletion({messages:m.messages,stream:true,temperature:m.temperature??0.7,top_p:0.9,max_tokens:m.max_tokens||300,abortSignal:ctl.signal});
        try{for await(const c of it){const d=c.choices&&c.choices[0]&&c.choices[0].delta&&c.choices[0].delta.content||'';if(d){full+=d;post({type:'delta',id:m.id,text:full});}}}
        catch(e){if(!(ctl.signal.aborted))throw e;}
        post({type:'done',id:m.id,text:full,stopped:ctl.signal.aborted});ctl=null;
      }
      else if(m.cmd==='abort'){ctl&&ctl.abort();}
    }catch(e){post({type:'error',id:m.id,cmd:m.cmd,error:String(e&&e.message||e)});}
  };
  w.terminate=()=>{if(ll)ll.exit().catch(()=>{});};
  setTimeout(()=>post({type:'hello'}),0);
  return w;
}
