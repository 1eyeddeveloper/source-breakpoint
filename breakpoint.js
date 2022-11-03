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

  
  let count = 0; let Gid, mainlength;
  function preparename(fname){
    if(fname.includes('/') || fname.includes('\\')) fname = 'anonymous' + count++;
    fname += '()';
    return fname;
  }
  /* funtion init helps initialize awareness of function scope */
  function init(Recon, stalker_ref, fullname){
    scopename.name_ = stalker_ref.name_ = fullname;/* use symbol */
    if(fullname){
      console.log(`\n------------  ${fullname} started running  ------------`);
    }
    let nest = [...Recon.id];
    let inner = nest.join(''), outer = (nest.shift(), nest.join(''));
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
  const scope = {}; const scopename = {};
  function stalker_init(Recon) {
    if(!Recon){
      Recon = class extends Map{}; Recon.id = Gid = ['G'];
    }else if(!Gid){
      throw new Error('You must first initialize toplevel scope with an empty call to stalker_init');
    } 
    
    let stalker_ref = new Recon();
    let inscope = '';
    Object.keys(stalker_ref).forEach(key => {
      inscope += `${key}: ${stringify(stalker_ref[key])}, `;
      if (stalker_ref[key]) {
        stalker_ref = LOGGER.deepsaveobjaddr(stalker_ref, stalker_ref[key], key);
        if (stalker_ref[key] instanceof Object && !(stalker_ref[key] instanceof Function) && !(stalker_ref[key] instanceof Map)) {
          stalker_ref[key] = deepclone(stalker_ref[key], key)
        }
      }
    });
    //prepare name and id for non-toplevel scopes
    let parse = new Error().stack.trim().split("at "); 
    let arr = parse[2].trim().split(' '); 
    let stackname = '';
    if(Recon.id){
      mainlength = parse.length;
    }else{
      if(mainlength == parse.length){
        Recon.id = Gid;
      }else{
        stackname = preparename(arr[0]);
      }
    }
    if(!Recon.id){
      let str = arr.pop();
      str = str.trim().split('js:').pop().replace(")", '');
      let id = [str, ...Gid];//works for js scripts not html scripts and mjs scripts
      Recon.id = id;
    }
    init(Recon, stalker_ref, stackname);
    if(inscope) console.log('variables encountered in scope: (', inscope, ')')
    return stalker_ref;
  };

  /* deleted the scopeinspect function. it wrongly supposed that a function scope is encountered when the function is called. */

  /* applies LOGGER.watchvarchanges on each property of the reconstruction object both for current scope, and ancestor scopes  */
  function stalker(Recon, stalker_ref) {
    if(!Recon){
      Recon = class extends Map{}; Recon.id = ['G'];
      stalker_ref = new Recon();
    }
    let stackname = '';
    if(stackname = scopename.name_){
      if(stackname !== stalker_ref.name_){
        console.log(`------------  ${stackname} stopped running  ------------\n`);
        scopename.name_ = stalker_ref.name_;
        /* wont work for anonymous functions since they share same name */
      };
    }
    let recon = new Recon();
    //after reconstruction...
    Object.keys(recon).forEach(varname => {
      LOGGER.watchvarchanges(recon, stalker_ref, varname);
    });
    let nest = [...Recon.id];
    let outer = (nest.shift(), nest.join(''));
    if (outer) {
      let x = scope[outer];
      for (const [recon, stalker_ref] of x) {
        let r = new recon();
        Object.keys(r).forEach(varname => {
          LOGGER.watchvarchanges(r, stalker_ref, varname);
        });
      }
    }
  }
  module.exports = { stalker, stalker_init };
})();
