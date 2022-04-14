const {stalker, stalker_init} = require('./breakpoint.js');
//node.js
function tester(){
  let edit, update, val = 'production', temp;
  /* To monitor variables, as above, create a reconstruction class like this */
  class Recon extends Map{
    static id = ['a'];/* give current scope an id passed as one string entry in an array */
    constructor() {
      super();
      this.edit = edit, this.update = update, this.val = val, this.temp = temp;
    }
  }
  const REF = stalker_init(Recon); /* initialize scope */
  ;stalker(Recon, REF); /* use this snippet as a breakpoint. call it at intervals */

  edit = { state: true, value: 'groups'}, update = null; ;stalker(Recon, REF);
  val = edit.value, temp = new Map();
  edit.value = new Map(); ;stalker(Recon, REF);
  edit.value.set('happy', 'holidays');
  temp.set('holidays', {event: 'Christmas'}); ;stalker(Recon, REF);
};

tester(); /* source breakpoint tokens monitor variable changes within tester function */
