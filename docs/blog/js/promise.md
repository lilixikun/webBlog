# Promise

promise 肯定是一个类

- 由于 **new Promise((resolve, reject)=>{})** 所以传入一个参数（函数）**executor**
- executor里面有两个参数，一个叫resolve（成功），一个叫reject（失败）。
- 由于resolve和reject可执行，所以都是函数，我们用let声明。

```js
class MyPromise {
    constructor(executor) {
        // 成功
        let resolve = () => { }
        // 失败 
        let reject = () => { }
        // 立即执行
        executor(resolve, reject)
    }
}
```

## 解决基本状态

**Promise** 规定有三种状态

- pending（等待态）为初始态，并可以转化为fulfilled（成功态）和rejected（失败态）
- 成功时，不可转为其他状态，且必须有一个不可改变的值（value）
- 失败时，不可转为其他状态，且必须有一个不可改变的原因（reason）
- **new Promise((resolve, reject)=>{resolve(value)})** resolve为成功，接收参数value，状态改变为 **fulfilled**,不可再次改变。
- **new Promise((resolve, reject)=>{reject(reason)})** reject为失败，接收参数reason，状态改变为 **rejected** ,不可再次改变。
- 若是 **executor** 函数报错 直接执行 **reject()**;

因此代码如下 :

```js

//定义promise 三种状态  
const PADDING = "padding"; //初始状态
const FULFILLED = "fulfilled";  //成功态
const REJECTED = "rejected";  //失败 

class MyPromise {
    constructor(executor) {

        // 初始状态为等待
        this.state = PADDING;
        // 成功的值
        this.value = undefined
        // 失败的原因
        this.reason = undefined

        // 成功
        let resolve = value => {
            if (this.state === PADDING) {
                this.state = FULFILLED
                this.value = value
            }
        }
        // 失败 
        let reject = reason => {
            if (this.state === PADDING) {
                this.state = REJECTED
                this.reason = reason
            }
        }

        // 如果 executor 执行出错,直接执行 reject
        try {
            // 立即执行
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }
}

```

## then 方法

**Promise有一个叫做then的方法，里面有两个参数：onFulfilled,onRejected,成功有成功的值，失败有失败的原因**

- 当状态 state 为 **fulfilled** ,执行 onFulfilled 方法,传入 this.value。当状态 state 为 **rejected**,则执行onRejected，传入this.reason

```js
// then 方法 有两个参数onFulfilled onRejected
then(onFulfilled, onRejected) {
    // 状态为fulfilled，执行onFulfilled，传入成功的值
    if (this.state === FULFILLED) {
        onFulfilled(this.value)
    }
    // 状态为rejected，执行onRejected，传入失败的原因
    if (this.state === REJECTED) {
        onRejected(this.reason)
    }
}
```

OK 至此,一个基础版的 Promise 就算是完成了, 我们来进行简单的测试一下

```js
// 正常执行 
let pro = new MyPromise((resolve, reject) => {
    let a = 1;
    resolve(a)
})

pro.then((res) => {
    console.log(res);

}, err => {
    console.log(err);

})
```

这时正常输出 a = 1

当执行 **reject('error')** 时, 
这时输出 'error'

## 异步实现

**当resolve在setTomeout内执行，then时state还是pending等待状态 我们就需要在then调用的时候，将成功和失败存到各自的数组，一旦reject或者resolve，就调用它们**

类似于发布订阅，先将then里面的两个函数储存起来，由于一个promise可以有多个then，所以存在同一个数组内。

```js
// 多个then的情况
let p = new MyPromise();
p.then();
p.then();

```

成功或者失败时，forEach调用它们

```js
const PADDING = "padding"; //初始状态
const FULFILLED = "fulfilled";  //成功态
const REJECTED = "rejected";  //失败 

class MyPromise{
  constructor(executor){
    this.state = PADDING;
    this.value = undefined;
    this.reason = undefined;
    // 成功存放的数组
    this.onResolvedCallbacks = [];
    // 失败存放法数组
    this.onRejectedCallbacks = [];
    let resolve = value => {
      if (this.state === PADDING) {
        this.state = FULFILLED;
        this.value = value;
        // 一旦resolve执行，调用成功数组的函数
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    };
    let reject = reason => {
      if (this.state === PADDING) {
        this.state = REJECTED;
        this.reason = reason;
        // 一旦reject执行，调用失败数组的函数
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    };
    try{
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onFulfilled,onRejected) {
    if (this.state === FULFILLED) {
      onFulfilled(this.value);
    };
    if (this.state === REJECTED) {
      onRejected(this.reason);
    };
    // 当状态state为pending时
    if (this.state === PADDING) {
      // onFulfilled传入到成功数组
      this.onResolvedCallbacks.push(()=>{
        onFulfilled(this.value);
      })
      // onRejected传入到失败数组
      this.onRejectedCallbacks.push(()=>{
        onRejected(this.reason);
      })
    }
  }
}
```

至此，一个简单基础版的 promise 算是完成了

## 解决链式调用

常常用到 **new Promise().then().then()**,这就是链式调用，用来解决回调地狱

- 为了达成链式，我们默认在第一个then里返回一个promise, 就是在then里面返回一个新的promise,称为promise2：promise2 = new Promise((resolve, reject)=>{})
- 将这个promise2返回的值传递到下一个then中
- 如果返回一个普通的值，则将普通的值传递给下一个then中

当我们在第一个then中return了一个参数（参数未知，需判断）。这个return出来的新的promise就是onFulfilled()或onRejected()的值

规定onFulfilled()或onRejected()的值，即第一个then返回的值，叫做x，判断x的函数叫做resolvePromise

- 首先，要看x是不是promise。
- 如果是promise，则取它的结果，作为新的promise2成功的结果
- 如果是普通值，直接作为promise2成功的结果
- 所以要比较x和promise2
- resolvePromise的参数有promise2（默认返回的promise）、x（我们自己return的对象）、resolve、reject
- resolve和reject是promise2的


```js
class Promise{
  constructor(executor){
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    };
    let reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    };
    try{
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onFulfilled,onRejected) {
    // 声明返回的promise2
    let promise2 = new Promise((resolve, reject)=>{
      if (this.state === 'fulfilled') {
        let x = onFulfilled(this.value);
        // resolvePromise函数，处理自己return的promise和默认的promise2的关系
        resolvePromise(promise2, x, resolve, reject);
      };
      if (this.state === 'rejected') {
        let x = onRejected(this.reason);
        resolvePromise(promise2, x, resolve, reject);
      };
      if (this.state === 'pending') {
        this.onResolvedCallbacks.push(()=>{
          let x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        })
        this.onRejectedCallbacks.push(()=>{
          let x = onRejected(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        })
      }
    });
    // 返回promise，完成链式
    return promise2;
  }
}

```

## 完成resolvePromise函数

判断 x

- x 不能是null
- x 是普通值 直接resolve(x)
- x 是对象或者函数（包括promise），let then = x.then 2、当x是对象或者函数（默认promise）
- 声明了then
- 如果取then报错，则走reject()
- 如果then是个函数，则用call执行then，第一个参数是this，后面是成功的回调和失败的回调
- 如果成功的回调还是pormise，就递归继续解析 3、成功和失败只能调用一个 所以设定一个called来防止多次调用

```js
function resolvePromise(promise2, x, resolve, reject){
  // 循环引用报错
  if(x === promise2){
    // reject报错
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  // 防止多次调用
  let called;
  // x不是null 且x是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+规定，声明then = x的then方法
      let then = x.then;
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') { 
        // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // resolve的结果依旧是promise 那就继续解析
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      // 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}

```

## 解决其他问题

规定onFulfilled,onRejected都是可选参数，如果他们不是函数，必须被忽略

- onFulfilled返回一个普通的值，成功时直接等于 value => value
- onRejected返回一个普通的值，失败时如果直接等于 value => value，则会跑到下一个then中的onFulfilled中，所以直接扔出一个错误reason => throw err
- 规定onFulfilled或onRejected不能同步被调用，必须异步调用。我们就用setTimeout解决异步问题
- 如果onFulfilled或onRejected报错，则直接返回reject()

```js

//定义promise 三种状态  
const PADDING = "padding"; //初始状态
const FULFILLED = "fulfilled";  //成功态
const REJECTED = "rejected";  //失败 

class MyPromise {
    constructor(executor) {

        // 初始状态为等待
        this.state = PADDING;
        // 成功的值
        this.value = undefined
        // 失败的原因
        this.reason = undefined

        // 成功存放的数组
        this.onResolvedCallbacks = []
        // 失败存放法数组
        this.onRejectedCallbacks = [];

        // 成功
        let resolve = value => {
            if (this.state === PADDING) {
                this.state = FULFILLED
                this.value = value
                // 一旦resolve执行，调用成功数组的函数
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }
        // 失败 
        let reject = reason => {
            if (this.state === PADDING) {
                this.state = REJECTED
                this.reason = reason
                // 一旦reject执行，调用失败数组的函数
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        // 如果 executor 执行出错,直接执行 reject
        try {
            // 立即执行
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    // then 方法 有两个参数onFulfilled onRejected
    then(onFulfilled, onRejected) {
        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;

        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };


        let promise2 = new MyPromise((resolve, reject) => {
            // 状态为fulfilled，执行onFulfilled，传入成功的值
            if (this.state === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }

            // 状态为rejected，执行onRejected，传入失败的原因
            if (this.state === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }

            // 当状态为pending 时
            if (this.state === PADDING) {
                // onFulfilled传入到成功数组
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })

                // onRejected传入到失败数组
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
            }
        })
        // 返回promise，完成链式
        return promise2
    }
}
```

## 实现catch和resolve、reject、race、all方法

```js
//resolve方法
MyPromise.resolve = function (value) {
    return new MyPromise((resolve, reject) => {
        resolve(value)
    })
}

//reject方法
MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => {
        reject(reason)
    })
}


//race方法 
MyPromise.race = function (promises) {
    return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)

        }
    })
}

//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
MyPromise.all = function (promises) {
    let arr = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                arr[i] = data;
                index++
                if (index === promises.length) {
                    resolve(arr)
                }
            }, reject)
        }
    })
}
```

## 使用 promises-aplus-tests 测试

通过 promises-aplus-tests 可以测试我们实现的 Promise 类是否满足 Promise/A+ 规范。
进行测试之前，需要为 promises-aplus-tests 提供一个 deferred 的钩子：

```js
MyPromise.deferred = function () {
    const defer = {}
    defer.promise = new MyPromise((resolve, reject) => {
        defer.resolve = resolve
        defer.reject = reject
    })
    return defer
}

try {
    module.exports = MyPromise
} catch (e) {
}
```

安装并运行测试：

```js 
npm install promises-aplus-tests -D
npx promises-aplus-tests promise.js
```

代码地址  [手写Promise](https://github.com/LiLixikun/Blog-example/blob/master/packages/js/promise.js)