// import {foo} from './a';
// console.log('b.mjs');
// console.log(foo);
// export let bar = 'bar';


// a.js
import {bar} from './b';
console.log('a.mjs');
console.log(bar());
const foo = function(){
    return 'foo'
};
export {foo};

// b.js
import {foo} from './a';
console.log('b.mjs');
console.log(typeof foo);
function bar() { return 'bar' }
export {bar};

// bable-node a.js 执行结果
b.mjs
undefined
a.mjs
bar