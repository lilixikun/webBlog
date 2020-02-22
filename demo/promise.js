const isFunction = fn => typeof fn === "function";

//定义promise 三种状态  
const PADDING = "padding"; //初始状态
const FULFILLED = "fulfilled";  //成功态
const REJECTED = "rejected";  //失败 

class MyPromise {
    constructor(executor = function () { }) {

        //初始值 state 为等待状态
        this.state = PADDING;
        //成功的值
        this.value = undefined;
        //失败的原因
        this.reason = undefined;

        // 成功存放的数组
        this.onResolvedCallbacks = [];
        // 失败存放法数组
        this.onRejectedCallbacks = [];

        //成功  接收一个值并把状态改变成 fulfilled
        let resolvue = (value) => {
            if (this.state === PADDING) {
                // resolve调用后，state转化为成功态
                this.state = FULFILLED;
                // 储存成功的值
                this.value = value;
                // 一旦resolve执行，调用成功数组的函数
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };

        //失败
        let reject = (reason) => {
            if (this.state === PADDING) {
                // reject调用后，state转化为失败态
                this.state = REJECTED;
                // 储存失败的值
                this.reason = reason;
                // 一旦reject执行，调用失败数组的函数
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        };

        //如果函数执行失败,直接执行 reject
        try {
            //立即执行
            executor(resolvue, reject);
        } catch (error) {
            reject(error)
        }
    }

    //Promise有一个叫做then的方法，里面有两个参数：onFulfilled,onRejected,成功有成功的值，失败有失败的原因
    //当状态state为fulfilled，则执行onFulfilled，传入this.value。
    //当状态state为rejected，则执行onRejected，传入this.reason

    //onFulfilled,onRejected如果他们是函数，则必须分别在fulfilled，rejected后被调用，
    //value或reason依次作为他们的第一个参数
    then(onFulfilled, onRejected) {

        //onFulfilled返回一个普通的值，成功时直接等于 value => value
        //onRejected返回一个普通的值，失败时如果直接等于 value => value，则会跑到下一个then中的onFulfilled中，所以直接扔出一个错误reason => throw err
        //2、秘籍规定onFulfilled或onRejected不能同步被调用，必须异步调用。我们就用setTimeout解决异步问题
        //如果onFulfilled或onRejected报错，则直接返回reject()

        // onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
        onFulfilled = typeof (onFulfilled) === "function" ? onFulfilled : value => value;

        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
        onRejected = typeof (onRejected) === 'function' ? onRejected : err => { throw err };
        //申明返回的promise2
        let promise2 = new MyPromise((resolve, reject) => {

            if (this.state === FULFILLED) {
                //异步
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        // resolvePromise函数，处理自己return的promise和默认的promise2的关系
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error)
                    }
                }, 0);

            }

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

            //解决异步

            // 当resolve在setTomeout内执行，then时state还是pending等待状态 我们就需要在then调用的时候，
            //将成功和失败存到各自的数组，一旦reject或者resolve，就调用它们

            //类似于发布订阅，先将then里面的两个函数储存起来，由于一个promise可以有多个then，所以存在同一个数组内
            // 当状态state为pending时
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


        //返回一个promise 完成链式
        return promise2;
    }

    catch(fun) {
        return this.then(null, fun)
    }
}

//我门常常用到new Promise().then().then(),这就是链式调用，用来解决回调地狱
function resolvePromise(promise2, x, resolve, reject) {

    /**
     * 判断x
        Otherwise, if x is an object or function,Let then be x.then
        x 不能是null
        x 是普通值 直接resolve(x)
        x 是对象或者函数（包括promise），let then = x.then
        2、当x是对象或者函数（默认promise）
        声明了then
        如果取then报错，则走reject()
        如果then是个函数，则用call执行then，第一个参数是this，后面是成功的回调和失败的回调
        如果成功的回调还是pormise，就递归继续解析
        3、成功和失败只能调用一个 所以设定一个called来防止多次调用
     * 
     */

    //循环引用报错
    if (x === promise2) {
        return reject(new TypeError('Chaining cycle detected for promise'));
    }

    //防止多次调用
    let called;
    if (x !== x && (typeof x === "object" || typeof x === "function")) {
        try {
            //A+规定 申明 then=x.then
            let then = x.then;
            // 如果then 是函数 默认就是promiose
            if (typeof (then) === "function") {
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
                resolve(x)
            }
        } catch (error) {
            // 也属于失败
            if (called) return;
            called = true;
            // 取then出错了那就不要在继续执行了
            reject(error);
        }
    } else {
        resolve(x)
    }
}


//resolve方法
MyPromise.resolve = function (val) {
    return new MyPromise((resolve, reject) => {
        resolve(val)
    })
}

//reject方法
MyPromise.reject = function (err) {
    return new MyPromise((resolve, reject) => {
        reject(err)
    })
}

//race方法
MyPromise.race = function (promise) {
    return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promise.length; i++) {
            promise[i].then(resolve, reject);
        }
    })
}

//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
MyPromise.all = function (promises) {
    let values = [];

    let i = 0;
    function processData(index, data, resolve) {
        values[index] = data;
        i++;
        if (i == promises.length) {
            resolve(values);
        };
    };
    return new MyPromise((resolve, reject) => {


        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                processData(i, data, resolve)
            }, reject)

        }
    })
}