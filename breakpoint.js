const {deepclone, getnestedobj} = require('./cloner.js');
const { stringify } = require('./stringify.js');

const LOGGER = {};
/* deepsaveobjaddr directly saves an object and all its nested props to a map. */
LOGGER.deepsaveobjaddr = function (stalker_ref, datavalue, varname) {
  stalker_ref.sett(varname, datavalue);
  if (!(datavalue instanceof Object)) return stalker_ref;
  let index = 0, a = datavalue, a_keys = Object.keys(a), fullname = varname, scope = '', arr = [], saveindex = {};
  while (a instanceof Object) {
    for (; index !== a_keys.length; index++) {
      let prop = a_keys[index];
      stalker_ref.sett(`${fullname}[${prop}]`, a[prop]);
      if (a[prop] instanceof Object) {
        saveindex[scope] = index; arr.push(scope);
        scope += `[${prop}]`, fullname = varname + scope; index = -1; a = a[prop]; a_keys = Object.keys(a);
        continue;
      }
    };
    scope = arr[arr.length - 1]; fullname = varname + scope; index = saveindex[scope] + 1; a = getnestedobj(datavalue, scope); a_keys = Object.keys(a); arr.pop();
  }
  return stalker_ref;
}

/* compares props of 2 objs which start out identical. Changes detected on the variable obj (recon), are applied to the reference obj (stalker_ref) to keep them synced */
LOGGER.watchvarchanges = function (recon, stalker_ref, varname, nuvars) {
  let newvalue = recon[varname], oldvalue = stalker_ref[varname];
  if(nuvars.includes(varname)) console.log(`created variable ${varsReport(varname, newvalue)}`)

  if (isactualNaN(newvalue) && isactualNaN(oldvalue)) {

  } else if (newvalue instanceof Object && newvalue === stalker_ref.gett(varname)) {
    let fullname = varname, a = oldvalue, b = newvalue, a_keys = Object.keys(a), b_keys = Object.keys(b), scope = '', arr = [], index = a_keys.length - 1, saveindex = {};
    while (a instanceof Object) {
      if (b instanceof Function) {/* Functions are not inspected */
        return;
      } else {
        for (; index >= 0; index--) {/* due to deleting, use desc iteration */
          let prop = a_keys[index];
          if (prop in b) {
            if (b[prop] instanceof Object && b[prop] === stalker_ref.gett(fullname + `[${prop}]`)) {
              saveindex[scope] = index; arr.push(scope);
              scope += `[${prop}]`, fullname = varname + scope; a = a[prop], b = b[prop]; a_keys = Object.keys(a), b_keys = Object.keys(b); index = a_keys.length;
              continue;
            } else {
              if (a[prop] !== b[prop]) {
                let value = stringify(b[prop]);
                console.log(`${fullname}[${prop}] was reassigned value: ${value}`)
                a[prop] = deepclone(b[prop], `${fullname}[${prop}]`); LOGGER.deepsaveobjaddr(stalker_ref, b[prop], `${fullname}[${prop}]`);
              }
            }
          } else {/* if an old prop is nonexistent in new object, it is deleted */
            console.log(`${fullname}[${prop}] = ${stringify(a[prop])} has been deleted!`);
            delete a[prop]; stalker_ref.deletee(`${fullname}[${prop}]`);
          }
        };
        b_keys.forEach(prop => {/* to detect creation of new prop */
          if (!(prop in a)) {
            console.log(`created new property ${fullname}[${prop}] = ${stringify(b[prop])};`);
            a[prop] = deepclone(b[prop], `${fullname}[${prop}]`); LOGGER.deepsaveobjaddr(stalker_ref, b[prop], `${fullname}[${prop}]`)
          }
        });
        /* climb up the object prop nesting when current prop in not an obj  */
        scope = arr[arr.length - 1], fullname = varname + scope; index = saveindex[scope] - 1; a = getnestedobj(oldvalue, scope), b = getnestedobj(newvalue, scope); a_keys = Object.keys(a), b_keys = Object.keys(b); arr.pop();
      }
    }
  } else {
    if (newvalue !== oldvalue) {
      stalker_ref[varname] = deepclone(newvalue, varname);
      stalker_ref = LOGGER.deepsaveobjaddr(stalker_ref, newvalue, varname);
      newvalue = stringify(newvalue);
      console.log(`${varname} was reassigned the value: ${newvalue}`)
    }
  }
}


let count = 0;
function preparename(fname){
  if(!fname || fname.includes('<anonymous>')) fname = 'anonymous' + count++;
  return fname;
}
function varsReport(key, val){
  if(typeof val === 'undefined') return `${key};`
  return `${key} = ${stringify(val)};`
}
function isactualNaN(value) {
  return (typeof value === 'number' && isNaN(value));
}


const runningscope = new Map(); const names = new Map();//potential ancestors

const blocks = {}; const name_ = Symbol(); const sym = Symbol();
function init(Recon, stalker_ref, fullname, id){
  runningscope.sett(Recon, stalker_ref); let check = names.gett(fullname);
  if(!check) names.sett(fullname, [Recon]);
  else if(!check.includes(Recon)) check.push(Recon);
  /* The conditionals are cuz of for loops, also works for recursive functions */
  //todo, isit not better if u use the condiions of when a func stops to know when it starts?
  if(scopename[name_] != fullname){
    blocks[fullname] = new Map();
    console.log(`\n============  ${fullname}() started running  ============`);
  }else {
    //todo multiple loops can exist within a function, u have to track loops with special id
    let myblock = blocks[fullname];
    let b = myblock.gett(id) || myblock.sett(id, {pos: myblock.size, i: 0}).gett(id);
    console.log(
      `\n____________  ${fullname} > block${b.pos} > iteration ${b.i++}  ____________`
    );
  }
  scopename[name_] = stalker_ref[name_] = fullname;
  stalker_ref[sym] = []; stalker(Recon, stalker_ref);//stalk incase some vars already exist
}

class Tracker extends Map{ constructor(){ super() } }
const store = new Map(), scopename = {};
function stalker_init(Rcn) {
  if(!(Rcn instanceof Function))
    throw new Error('You must pass a class as first argument to stalker_init!');
  let stalker_ref = new Tracker;

  let stackarr = new Error().stack.trim().split("at ");
  stackarr.shift(), stackarr.shift();

  let runningstack = stackarr.shift().trim().split(' ')
  let moreinfo = runningstack.pop().split(':');
  let id = (moreinfo.shift(), moreinfo.join(':'));
  
  let funcname = preparename(runningstack.pop()), oldname = store.gett('name');
  store.sett('name', funcname);

  let olstackarr = store.gett('sig'); store.sett('sig', stackarr); 
  if(olstackarr){
    let depth = stackarr.length - olstackarr.length;
    let deepfuncnames = stackarr/* .filter((x,i) => i < depth) */.map(x => x.trim().split(' ')[0]);
    if(depth < 0 || stackarr.slice(depth).join('') != olstackarr.join('')){
      //this condition alone cannot catch when evt handler functions stop, hence the next 2
      console.log(`============  ${oldname}() stopped running  1============\n`);
      /* code deffered due to async operations dont execute on the main callstack, but on some async-stack. I think the length of this async-stack is 1, not sure not tested yet. */
      if(stackarr.length > 1) names.gett(oldname).forEach(r => runningscope.delete(r))
    }else if(oldname.includes('anonymous') && depth == 0) {
      console.log(`============  ${oldname}() stopped running  2============\n`);
      if(stackarr.length > 1) names.gett(oldname).forEach(r => runningscope.delete(r))
    }else if(funcname != oldname && !deepfuncnames.includes(oldname)) {
      console.log(`============  ${oldname}() stopped running  3============\n`);
      if(stackarr.length > 1) names.gett(oldname).forEach(r => runningscope.delete(r))
    }
  }
  
  Rcn.stackarr = stackarr;
  
  init(Rcn, stalker_ref, funcname, id);
  return stalker_ref;
};


/* applies LOGGER.watchvarchanges on each property of the reconstruction object  */
function stalker(Recon, stalker_ref) {
  if(!(Recon instanceof Function) || !(stalker_ref instanceof Tracker)) {
    throw new Error('The first argument to stalker must be a class and second argument must be the recommended REF object.');
  } 
  let funcname = scopename[name_];
  if(funcname !== stalker_ref[name_]){
    console.log(`============  ${funcname}() stopped running  4============\n`);
    names.gett(funcname).forEach(r => runningscope.delete(r))
    scopename[name_] = stalker_ref[name_];
    store.sett('name', stalker_ref[name_]); store.sett('sig', Recon.stackarr);
  };
  
  let recon = {}; try{ new Recon(recon) } catch(e){};//recon, go fetch the vars boy!
  
  let varr = Object.keys(recon);//list of all variables so far declared
  //(slice of list of former vars, to get list of new vars)
  const newvars = varr.slice(stalker_ref[sym].length).map(varname=> {
    const value = recon[varname];
    if (value) {
      stalker_ref = LOGGER.deepsaveobjaddr(stalker_ref, value, varname);
      if (value instanceof Object && !(value instanceof Function) && !(value instanceof Map)) {
        stalker_ref[varname] = deepclone(value, varname)
      }else if(!(value instanceof Object)){
        stalker_ref[varname] = deepclone(value, varname)
      }
    }
    return varname;
  });
  stalker_ref[sym] = varr;//updated list of tracked variables

  varr.forEach(varname => {
    LOGGER.watchvarchanges(recon, stalker_ref, varname, newvars);
  });
  //watch ancestors too.
  for (const [recon, stalker_ref] of runningscope) {
    let r = {}; try{ new recon(r) }catch(e){};
    Object.keys(r).forEach(varname => {
      LOGGER.watchvarchanges(r, stalker_ref, varname, []);
    });
  }
}
module.exports = { stalker, stalker_init };


/* ==========
WHATS NEXT?? 
The next goal is to use a parser invoked via CLI to rewrite scripts and automatically generate the Recon class at the top of every function declaration/scope and also follow it with the "REF = stalker_init(Recon)" declaration. This further reduces tasks expected of the user. User will now just need to import the stalker module and call it at intervals (without arguments ofcourse, as the Recon and REF arguments will be created and injected during rewrite).

Use a CLI invocation to strip all the source-breakpoint tokens, for when debug-testing is complete and user needs the raw script.
========= */