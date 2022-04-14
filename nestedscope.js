const {stalker, stalker_init} = require('./breakpoint.js');
(function (){
  let edit, update, val = 'production', temp;
  class Recon extends Map{
    static id = ['a']; /* id is an array of strings reflecting ids of scopes the function has access to. 1st entry reflects current id, succeding entries reflect ids for succeding higher scopes respectively */
    constructor() {
      super();
      this.edit = edit, this.update = update, this.val = val, this.temp = temp;
    }
  }
  const REF = stalker_init(Recon); ;stalker(Recon, REF);

  function nesttest(){
    let edit, date = new Date().toDateString(), post = { title: 'Hello World' };
    class Recon extends Map{
      static id = ['b', 'a'];/* id has 2 entries: the 1st is the id of this scope, the 2nd is the id of the parent scope */
      constructor(){
        super();
        this.edit = edit, this.date = date, this.post = post
      }
    }
    const REF = stalker_init(Recon); ;stalker(Recon, REF);
    edit = true; post.date = date; ;stalker(Recon, REF); /* edit variable here masks parent scopes edit variable */
    val = 'development', update = 'v1.2.1'; ;stalker(Recon, REF); /* stalker tracks all scoped vars */
  }

  edit = { state: true, value: 'groups'}, update = null; ;stalker(Recon, REF);
  val = edit.value, temp = new Map();
  temp.set('holidays', {event: 'Christmas'}); ;stalker(Recon, REF);

  nesttest(); /* test tracking of variable masking */

  edit.state = false; ;stalker(Recon, REF); /* verify masking */
})();