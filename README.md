# source-breakpoint
A Javascript utility module to help track source variables with just one inline function.

## Usage

A little convention is required to utilize the stalker module. Within a function scope, simply set up all variables you need to track into a reconstruction class. Use the reconstruction class with only the stalker_init() and stalker() functions to track the changes in these variables.

Example: [basic.js](./basic.js):

```js
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
tester();; stalker();
/* Always follow every function call with a stalker call for best reports. We omit the arguments to the stalker call, as they are not defined in the toplevel scope */
```

Example [nestedscope.js_](./nestedscope.js):

```js
const { stalker, stalker_init } = require('./breakpoint.js');
let edit, update;
/* declare all variables local to this scope inorder of appearance within Recon constructor */
class Recon {
  constructor(vars) {
    vars.edit = edit, vars.update = update, vars.val = val, vars.temp = temp;
  }
}
const REF = stalker_init(Recon);

//lvl 1 scope encapsulation with new function declaration
function nesttest() {
  let edit, date = new Date().toDateString();
  //declare all variables within this scope within Recon, and in order of appearance
  class Recon {
    constructor(vars) {
      vars.edit = edit, vars.date = date, vars.post = post
    }
  }
  const REF = stalker_init(Recon);; stalker(Recon, REF);

  edit = true;; stalker(Recon, REF); /* edit variable here masks parent scopes' edit variable */
  val = 'development', update = 'v1.2.1';; stalker(Recon, REF); /* stalker tracks all scoped vars */
  //stalker can track newly created variables (see similar case below)
  let post = { title: 'Hello World' };; stalker(Recon, REF);
  post.date = date;; stalker(Recon, REF);

  //lvl 2 scope encapsulation with new function declaration within lvl 1 scope
  function func2() {
    let date = 'nodate', big = 'BiGi';
    class Recon {
      constructor(vars) {
        vars.date = date, vars.big = big;
      }
    }
    const REF = stalker_init(Recon);; stalker(Recon, REF);

    edit = { good: "Muffins" }; date = 'somedate';; stalker(Recon, REF);
  }
  func2();
  date += 'good';; stalker(Recon, REF);
}

edit = { state: true, value: 'groups' }, update = null;; stalker(Recon, REF);
//so far as Recon is delacred as indicated, stalker can track newly created variables like val
let val = 'production', temp;; stalker(Recon, REF);
val = edit.value, temp = new Map();
temp.set('holidays', { event: 'Christmas' });; stalker(Recon, REF);

/* test tracking of variable masking */
nesttest();

edit.state = false;; stalker(Recon, REF); /* verify masking */

/* the stalker module can now track any level of function declaration nesting, as demonstarated with nesttest and func2 levels of nesting */
```

