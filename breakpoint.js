const {deepclone, getnestedobj} = require('./cloner.js');
const { stringify } = require('./stringify.js');
/* Usage of the modified map functions, sett, gett, clearr, deletee is for optimization purposes only. The default map functions will work well without side effects, but incur a very little overhead code */
(function () {
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
  function isactualNaN(value) {
    return (typeof value === 'number' && isNaN(value));
  }
  /* compares props of 2 objs which start out identical. Changes detected on the variable obj (recon), are applied to the reference obj (stalker_ref) to keep them synced */
  /* Todo: As of now watchvarchanges don't watch changes of the contents of a Uint8Array. Fix this when it becomes important to do so */
  LOGGER.watchvarchanges = function (recon, stalker_ref, varname) {
    let newvalue = recon[varname], oldvalue = stalker_ref[varname];
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
  const scopeids = new Map();
  function preparename(fname){
    //for a script running on NodeJs, the toplevel stack is called Object.<anonymous> & for script run on html toplevel stack name is empty(''), so only the path to stack is shown.
    //for script running on NodeJS or on html, stack name of anonymous function is empty, so only the path of stack name is shown.
    if(!fname || fname.includes('<anonymous>')) fname = 'anonymous' + count++;
    fname += '()';
    return fname;
  }
  function varsReport(key, val){
    if(typeof val === 'undefined') return `${key};`
    return `${key} = ${stringify(val)};`
  }
  
  const name_ = Symbol(); const sym = Symbol();
  function init(Recon, stalker_ref, fullname){
    if(fullname){
      scopename[name_] = stalker_ref[name_] = fullname;
      console.log(`\n------------  ${fullname} started running  ------------`);
    }
    (stalker_ref[sym] = Object.keys(stalker_ref)).forEach(key=> {
      const value = stalker_ref[key];
      console.log(`created variable ${varsReport(key, value)}`)
      if (value) {
        stalker_ref = LOGGER.deepsaveobjaddr(stalker_ref, value, key);
        if (value instanceof Object && !(value instanceof Function) && !(value instanceof Map)) {
          stalker_ref[key] = deepclone(value, key)
        }
      }
    });
    let nest = [...Recon.id];//redundant?? no, donot change id directly
    let inner = nest.shift(), outer = nest.shift();
    if (!outer) {
      let x = scope[inner] = new Map();
      x.sett(Recon, stalker_ref);
    } else {
      let olx = scope[outer];
      let x = scope[inner] = new Map([...olx]);
      x.sett(Recon, stalker_ref);
    }
  }


  /* The breakpoint functions */
  class Tracker extends Map{ static id = ['1:1']; constructor(){ super() } }
  let Glength = 0; const scope = {}; const scopename = {}; let scopenum = 0;
  function stalker_init(Recon) {
    if(!(Recon instanceof Function)) throw new Error('You must pass a class to stalker_init!')
    let parse = new Error().stack.trim().split("at "), slength = parse.length; 
    let arr = parse[2].trim().split(' '), stackname = false;
    
    let stalker_ref = new Tracker;
    try{ new Recon(stalker_ref) }catch(e){};

    //comprehensive ids to track all levels of nesting
    if(scopenum === 0) Glength = slength;
    let i = slength - Glength, outer = [];
    //scopeids.get may b undefined if user omits stalking some level of nestedscope, hence d loop
    if(i > 0){
      while(!outer.length){
        outer = scopeids.get(i-1) || [];
        --i;
      }
    }
    let oarr = arr.pop().trim().split(':');
    let a = oarr.pop(), b = oarr.pop();
    let inner = (b+":"+a).replace(')', '');
    if(Recon !== Tracker) Recon.id = [inner, ...outer], stackname = preparename(arr[0]);
    scopeids.set(i, Recon.id);
    init(Recon, stalker_ref, stackname); scopenum++;
    return stalker_ref;
  };


  /* applies LOGGER.watchvarchanges on each property of the reconstruction object both for current scope, and ancestor scopes  */
  function stalker(Recon, stalker_ref) {
    if(!stalker_ref) { Recon = Tracker; stalker_ref = stalker_init(Recon) };
    let stackname = scopename[name_];
    if(stackname){
      if(stackname !== stalker_ref[name_]){
        console.log(`------------  ${stackname} stopped running  ------------\n`);
      };
    }
    scopename[name_] = stalker_ref[name_];
    let recon = {}; try{ new Recon(recon) } catch(e){};//recon, go fetch the vars boy!

    //list of all variables so far declared
    let varr = Object.keys(recon);
    //(slice of list of former vars, to get list of new vars)
    varr.slice(stalker_ref[sym].length).forEach(v=> {
      const value = recon[v];
      console.log(`created variable ${varsReport(v, value)}`)
      //update stalker_ref to hold new variables. needed for watchvarchanges
      if (value) {
        stalker_ref = LOGGER.deepsaveobjaddr(stalker_ref, value, v);
        if (value instanceof Object && !(value instanceof Function) && !(value instanceof Map)) {
          stalker_ref[v] = deepclone(value, v)
        }else if(!(value instanceof Object)){
          stalker_ref[v] = deepclone(value, v)
        }
      }
    });
    stalker_ref[sym] = varr;//updated list of tracked variables

    Object.keys(recon).forEach(varname => {
      LOGGER.watchvarchanges(recon, stalker_ref, varname);
    });
    let nest = [...Recon.id];
    let outer = (nest.shift(), nest.shift());
    if (outer) {
      let x = scope[outer];
      for (const [recon, stalker_ref] of x) {
        let r = {}; try{ new recon(r) }catch(e){};
        Object.keys(r).forEach(varname => {
          LOGGER.watchvarchanges(r, stalker_ref, varname);
        });
      }
    }
  }
  module.exports = { stalker, stalker_init };
})();


/* ==========
WHATS NEXT?? 
The next goal is to use a parser invoked via CLI to rewrite scripts and automatically generate the Recon class at the top of every function declaration/scope like for loops, and also follow it with the "REF = stalker_init()" declaration. This further reduces tasks expected of the user. User will now just need to import the stalker module and call it at intervals (without arguments ofcourse, as the Recon and REF arguments will be created and injected during rewrite).

Use a CLI invocation to strip all the source-breakpoint tokens, for when debug-testing is complete and user needs the raw script.
========= */