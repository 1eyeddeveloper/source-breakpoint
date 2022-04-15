# source-breakpoint
A Javascript utility module to help track source variables with just one inline function.

## Usage

A little convention is required to utilize the stalker module. Within a function scope, simply set up all variables you need to track into a reconstruction class. Use the reconstruction class with the stalker_init() and stalker() functions only to track the changes in these variables.

Example: [basic.js](./basic.js):

```js
//node.js
const {stalker, stalker_init} = require('./breakpoint.js');
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
```

Example [nestedscope.js_](./nestedscope.js):

```js
//node.js
const { stalker, stalker_init } = require('./breakpoint.js');
let edit, update, val = 'production', temp;
class Recon extends Map {
  static id = ['a']; /* id is an array of strings reflecting ids of scopes the function has access to. 1st entry reflects current id, succeding entries reflect ids for succeding higher scopes respectively */
  constructor() {
    super();
    this.edit = edit, this.update = update, this.val = val, this.temp = temp;
  }
}
const REF = stalker_init(Recon);; stalker(Recon, REF);

function nesttest() {
  let edit, date = new Date().toDateString(), post = { title: 'Hello World' };
  class Recon extends Map {
    static id = ['b', 'a'];/* id has 2 entries: the 1st is the id of this scope, the 2nd is the id of the parent scope */
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

nesttest(); /* test tracking of variable masking */

edit.state = false;; stalker(Recon, REF); /* verify masking */
```

