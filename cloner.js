/* this cloner logs map information thanks to mapname */
const mapname = require('./reconfig');

/* getnestedobj,  a function to which fetches a deeply nested property of an object, when passed the object(parentobj) and a string format of property hierarchy(nestedkey) to the target property with format: '[prop1][prop2][prop3]'  */
function getnestedobj(parentobj, nestedkey) {
  if (typeof nestedkey == 'undefined') return 'report complete!';
  if (nestedkey === '') return parentobj;
  let obj;
  nestedkey.slice(1).replace(/\]/ig, '').split('[').forEach(x => {
    if (!obj) { obj = parentobj[x]; return; };
    obj = obj[x];
  })
  return obj;
}

/* deepclone takes a targetobj and iterates its properties deeply until it has cloned the entirety of the object, of which it returns the cloned object. */
function deepclone(targetobj, varname) {
  if (!(targetobj instanceof Object)) { return targetobj }; let emptyobject;
  /* clones arrays, objects and maps */
  let fullname = varname;
  if (targetobj instanceof Uint8Array) {
    emptyobject = new Uint8Array(Array.from(targetobj));
  } else if (targetobj instanceof Array) {
    emptyobject = new Array();
  } else if (targetobj instanceof Map) {
    let mapstruct = JSON.stringify([...targetobj]);
    emptyobject = new Map(JSON.parse(mapstruct));
    if (varname) mapname.sett(targetobj, fullname);
  } else {
    emptyobject = new Object()
  };
  let copy = Object.assign(emptyobject, targetobj)
  let index = 0, a = targetobj, b = copy, a_keys = Object.keys(a), scope = '', arr = [], saveindex = {};
  while (a instanceof Object) {
    for (; index !== a_keys.length; index++) {
      let prop = a_keys[index];
      if (a[prop] instanceof Object) {
        if (a[prop] instanceof Uint8Array) {
          emptyobject = new Uint8Array(Array.from(a[prop]));
        } else if (a[prop] instanceof Array) {
          emptyobject = new Array();
        } else if (a[prop] instanceof Map) {
          let mapstruct = JSON.stringify([...a[prop]]);
          emptyobject = new Map(JSON.parse(mapstruct));
        } else {
          emptyobject = new Object()
        };
        b[prop] = Object.assign(emptyobject, a[prop]);
        saveindex[scope] = index; arr.push(scope);
        scope += `[${prop}]`, fullname = varname + scope;
        index = -1; a = a[prop], b = b[prop]; a_keys = Object.keys(a);

        if (a instanceof Map && varname) mapname.sett(a, fullname);
        continue;
      }
    };
    scope = arr[arr.length - 1]; index = saveindex[scope] + 1; a = getnestedobj(targetobj, scope), b = getnestedobj(copy, scope); a_keys = Object.keys(a); arr.pop();
  }
  return copy;
}

module.exports = { deepclone, getnestedobj };