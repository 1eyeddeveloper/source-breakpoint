(function () {
  const LOGGER = {};
  LOGGER.stringify = function (value) {
    if (value) {
      if (value instanceof RegExp) {
        return value.toString();
      } else if (value instanceof Function) {
        return value.toString();
      } else if (value instanceof Map) {
        return `new Map(${JSON.stringify([...value.entries()])})`;
      } else if (value instanceof Array || value instanceof Object) {
        return JSON.stringify(value);
      } else {
        return `${value}`;
      }
    } else if (typeof value !== 'undefined') return value + '';/* stringify null values */
  }

  /* getnestedobj,  a function to which fetches a deeply nested property of an object, when passed the object(parentobj) and a string format of property hierarchy(nestedkey) to the target property with format: '[prop1][prop2][prop3]'  */
  LOGGER.getnestedobj = function (parentobj, nestedkey) {
    if (typeof nestedkey == 'undefined') return 'report complete!';
    if (nestedkey === '') return parentobj;
    let obj;
    nestedkey.slice(1).replace(/\]/ig, '').split('[').forEach(x => {
      if (!obj) { obj = parentobj[x]; return; };
      obj = obj[x];
    })
    return obj;
  }
  /* deepcloneobj takes a targetobj and iterates its properties deeply until it has cloned the entirety of the object, of which it returns the cloned object. */
  LOGGER.deepcloneobj = function(targetobj) {
    if (!(targetobj instanceof Object)) { return targetobj }; let emptyobject;
    /* clones arrays, objects and maps */
    if (targetobj instanceof Array) {
      emptyobject = () => new Array();
    } else if (targetobj instanceof Map) {
      let mapstruct = JSON.stringify([...targetobj]);
      emptyobject = () => new Map(JSON.parse(mapstruct));
    } else {
      emptyobject = () => new Object()
    };
    let copy = Object.assign(emptyobject(), targetobj)
    let index = 0, a = targetobj, b = copy, a_keys = Object.keys(a), scope = '', arr = [], saveindex = {};
    while (a instanceof Object) {
      for (; index !== a_keys.length; index++) {
        let prop = a_keys[index];
        if (a[prop] instanceof Object) {
          if (a[prop] instanceof Array) {
            emptyobject = () => new Array();
          } else if (a[prop] instanceof Map) {
            let mapstruct = JSON.stringify([...a[prop]]);
            emptyobject = () => new Map(JSON.parse(mapstruct));
          } else {
            emptyobject = () => new Object()
          };
          b[prop] = Object.assign(emptyobject(), a[prop]);
          saveindex[scope] = index; arr.push(scope);
          scope += `[${prop}]`; index = -1; a = a[prop], b = b[prop]; a_keys = Object.keys(a); continue;
        }
      };
      scope = arr[arr.length - 1]; index = saveindex[scope] + 1; a = STALK_KIT.getnestedobj(targetobj, scope), b = STALK_KIT.getnestedobj(copy, scope); a_keys = Object.keys(a); arr.pop();
    }
    return copy;
  }
})();
