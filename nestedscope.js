const { stalker, stalker_init } = require('./breakpoint.js');
stalker_init();/* first empty initalize */
let edit, update, val = 'production', temp;
class Recon extends Map {
  constructor() {
    super();
    this.edit = edit, this.update = update, this.val = val, this.temp = temp;
  }
}
/* you are at liberty to track variables in toplevel scope, and you will still have to initialize the usual way with the reconstruction object */
const REF = stalker_init(Recon);
; stalker(Recon, REF);

function nesttest() {
  let edit, date = new Date().toDateString(), post = { title: 'Hello World' };
  class Recon extends Map {
    constructor() {
      super();
      this.edit = edit, this.date = date, this.post = post
    }
  }
  const REF = stalker_init(Recon);; stalker(Recon, REF);
  edit = true; post.date = date;; stalker(Recon, REF); /* edit variable here masks parent scopes edit variable */
  val = 'development', update = 'v1.2.1';; stalker(Recon, REF); /* stalker tracks all scoped vars */
}

edit = { state: true, value: 'groups' }, update = null;; stalker(Recon, REF);
val = edit.value, temp = new Map();
temp.set('holidays', { event: 'Christmas' });; stalker(Recon, REF);

/* test tracking of variable masking */
nesttest();

edit.state = false;; stalker(Recon, REF); /* verify masking */

//I think this is false. I have to re-evaluate.
/* 
stalker can only track first level nesting correctly. more that one level nest of scope will return incomplete reports. Consider the illustrated main.js script below, stalker will fail to report changes to some of the variables that func2 can access, specifically variables declared within func1.
### main.js ###
--------toplevel scope----------
//some code
function func1(){--------1st level nest----------
  //some code
  function func2(){--------2nd level nest----------
    //some code
  }
  func2();
};
func1();

 */