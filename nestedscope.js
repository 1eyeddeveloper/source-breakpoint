const { stalker, stalker_init } = require('./breakpoint.js');
// stalker_init();/* first empty initalize */
let edit, update, val = 'production', temp;
class Recon extends Map {
  constructor() {
    super();
    this.edit = edit, this.update = update, this.val = val, this.temp = temp;
  }
}
/* you are at liberty to track variables in toplevel scope, and you will still have to initialize the usual way with the reconstruction object *///hopefully obsolete
const REF = stalker_init(Recon);
; stalker(Recon, REF);
// (function(){console.log(new Error().stack.trim().split("at "))})();
// console.log(new Error().stack.trim().split("at ")[2].trim().split(' '))

function nesttest() {
  let edit, date = new Date().toDateString(), post = { title: 'Hello World' };
  class Recon extends Map {
    constructor() {
      super();
      this.edit = edit, this.date = date, this.post = post
    }
  }
  // console.log(new Error().stack.trim().split("at "))
  // console.log(new Error().stack.trim().split("at ")[2].trim().split(' '))
  const REF = stalker_init(Recon);; stalker(Recon, REF);
  edit = true; post.date = date;; stalker(Recon, REF); /* edit variable here masks parent scopes edit variable */
  val = 'development', update = 'v1.2.1';; stalker(Recon, REF); /* stalker tracks all scoped vars */
  function func2(){
    let date = 'nodate', big = 'BiGi';
    class Recon extends Map{
      constructor() {
        super();
        this.date = date, this.big = big;
      }
    }
    const REF = stalker_init(Recon);; stalker(Recon, REF);
    edit = {fuck: "Fucker"}; date = 'somedate';; stalker(Recon, REF);
  }
  func2();
  date+='good';; stalker(Recon, REF);
}

edit = { state: true, value: 'groups' }, update = null;; stalker(Recon, REF);
val = edit.value, temp = new Map();
temp.set('holidays', { event: 'Christmas' });; stalker(Recon, REF);

/* test tracking of variable masking */
nesttest();

edit.state = false;; stalker(Recon, REF); /* verify masking */

/* the stalker module can now track any level of function declaration nesting */