const mapname = require('./reconfig');


/* deepcloneobj takes a targetobj and iterates its properties deeply until it has cloned the entirety of the object, of which it returns the cloned object. */
function deepcloneobj(targetobj, varname) {
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
    scope = arr[arr.length - 1]; index = saveindex[scope] + 1; a = LOGGER.getnestedobj(targetobj, scope), b = LOGGER.getnestedobj(copy, scope); a_keys = Object.keys(a); arr.pop();
  }
  return copy;
}

module.exports = deepcloneobj;