const isFunction = fn => typeof fn === "function";
//等待状态
const PADDING = "padding";
//成功
const SUCCESS = "success";
//失败
const ERROR = "error";

class Promise {
    constructor(fun = function () { }) {

        //初始化state
        this.state = PADDING;
        //成功的值
        this.value = undefined;
        //失败的原因
        this.reason = undefined;

        //但是当resolve在setTomeout内执行，then时state还是pending等待状态 我们就需要在then调用的时候，
        //将成功和失败存到各自的数组，一旦reject或者resolve，就调用它们
        // 成功存放的数组
        this.onResolvedCallbacks = [];
        // 失败存放法数组
        this.onRejectedCallbacks = [];

        let resolv = (value) => {
            if (this.state === PADDING) {
                this.state = SUCCESS;
                this.value = value;
                this.onResolvedCallbacks.forEach(fn => fn());
            }
        };

        let reject = (reason) => {
            if (this.state === PADDING) {
                this.state = ERROR;
                this.reason = reason;
                this.onRejectedCallbacks.forEach(fn => fn());
            }
        }

        try {
            fun(resolv, reject);
        } catch (error) {
            reject(error);
        }
    }


    // 解决链式 回调 返回一个 promise 
    /**
     * promise.then().then()
     * @param {*} onFulfilled 
     * @param {*} onRejected 
     * 必须异步执行
     */
    then(onFulfilled, onRejected) {

        //判断是否是函数
        onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value;

        //如果不是函数直接抛错
        onRejected = isFunction(onRejected) ? onRejected : err => { throw err };

        let promise2 = new Promise((resolv, reject) => {
            if (this.state === SUCCESS) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolv, reject);
                    } catch (error) {
                        reject(error)
                    }
                }, 0);

            }

            if (this.state === ERROR) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.reason);
                        resolvePromise(promise2, x, resolv, reject);
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }

            if (this.state === PADDING) {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolv, reject);
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                });

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.reason);
                            resolvePromise(promise2, x, resolv, reject);
                        } catch (error) {
                            reject(error)
                        }
                    }, 0);
                })
            }
        })
        return promise2;
    }

    catch(fun) {
        this.then(null, fun);
    }
}


function resolvePromise(promise2, x, resolv, reject) {
    if (promise2 === x) {
        return reject(new TypeError("相互引用"))
    }

    //防止多次调用
    let called;

    if (x !== null && (typeof (x) === "function" || typeof (x) === "object")) {
        try {
            let then = x.then;
            if (typeof (then) === "function") {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(promise2, y, resolv, reject)
                }, err => {
                    if (called) return;
                    called = true;
                    reject(err);
                })
            } else {
                //直接返回
                resolv(x);
            }
        } catch (error) {
            if (called) return;
            called = true;
            reject(error);
        }
    } else {
        resolv(x);
    }
}


Promise.prototype.race = function (promises) {
    return new Promise((resolv, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolv, reject);
        }
    })
}

Promise.prototype.all = function (promises) {
    //把结果拼接到一个数组
    let i = 0;
    let values = [];

    function processValue(index, value, resolv) {
        i++;
        values[index] = value
        if (i === promises.length) {
            resolv(values)
        }
    }

    return new Promise((resolv, reject) => {
        for (let i = 0; i < array.length; i++) {
            promises[i].then(value => {
                processValue(index, value, resolv)
            }, reject)
        }
    })
}