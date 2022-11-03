
function stringify (value) {
  if (value) {
    if (value instanceof RegExp) {
      return value.toString();
    } else if (value instanceof Function) {
      return value.toString();
    } else if (value instanceof Map) {
      return `new Map(${JSON.stringify([...value.entries()])})`;
    } else if (value instanceof Array || value instanceof Object) {
      return JSON.stringify(value);
    } else if(typeof value == 'string') {
      return `"${value}"`;
    } else{
      return `${value}`;
    }
  } else if (typeof value == 'string'){
    return '""';
  } else if (typeof value !== 'undefined') return value + '';
}

module.exports = {stringify};