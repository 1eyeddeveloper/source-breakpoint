# source-breakpoint
A Javascript utility module to help track source variables with just one inline function.

## Usage

A little convention is required to utilize the stalker module. Within a function scope, simply set up all variables you need to track into a reconstruction class. Use the reconstruction class with the stalker_init() and stalker() functions only to track the changes in these variables.

Example: [basic.js](./basic.js):

```js
const {stalker, stalker_init, scopeinspect} = require('./breakpoint.js');
function tester(){
  let edit, update, val = 'production', temp;
  /* To monitor variables, as above, create a reconstruction class like this */
  class Recon extends Map{
    static id = tester;/* id = enclosing function */
    constructor() {
      super();
      this.edit = edit, this.update = update, this.val = val, this.temp = temp;
    }
  }
  const REF = stalker_init(Recon); /* initialize scope */
  ;stalker(Recon, REF); /* use this snippet as a breakpoint. call it at intervals */

  edit = { state: true, value: 'groups'}, update = null; ;stalker(Recon, REF);
  val = edit.value, temp = new Map();
  temp.set('holidays', {event: 'Christmas'}); ;stalker(Recon, REF);
};
tester = scopeinspect(tester);

tester(); /* source breakpoint tokens monitor variable changes within tester function */
```

Example [nestedscope.js_](./nestedscope.js):

```js
const {stalker, stalker_init, scopeinspect} = require('./sorce-breakpoint');
scopeinspect(
function (){
  let edit, update, val = 'production', temp;
  class Recon extends Map{
    static id = {newname: 'parent'};/* id is basically object with newname property */
    constructor() {
      super();
      this.edit = edit, this.update = update, this.val = val, this.temp = temp;
    }
  }
  const REF = stalker_init(Recon); ;stalker(Recon, REF);

  function nesttest(){
    let edit, date = new Date().toDateString(), post = { title: 'Hello World' };
    class Recon extends Map{
      static id = nesttest;
      constructor(){
        super();
        this.edit = edit, this.date = date, this.post = post
      }
    }
    const REF = stalker_init(Recon); ;stalker(Recon, REF);
    edit = true; post.date = date; ;stalker(Recon, REF); /* edit variable here masks parent scopes edit variable */
    val = 'development', update = 'v1.2.1'; ;stalker(Recon, REF); /* stalker tracks all scoped vars */
  }
  nesttest = scopeinspect(nesttest);

  edit = { state: true, value: 'groups'}, update = null; ;stalker(Recon, REF);
  val = edit.value, temp = new Map();
  temp.set('holidays', {event: 'Christmas'}); ;stalker(Recon, REF);

  nesttest(); /* test tracking of variable masking */

  edit.state = false; ;stalker(Recon, REF); /* verify masking */
})();

```

