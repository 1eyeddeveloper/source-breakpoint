//node.js
const {stalker, stalker_init} = require('./breakpoint.js');

function tester(){
  let edit, update, val = 'production', temp;
  /* To monitor variables, as above, create a reconstruction class like this */
  class Recon{
    constructor(vars) {
      vars.edit = edit, vars.update = update, vars.val = val, vars.temp = temp;
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

/* source breakpoint tokens monitor variable changes within tester function */
tester();