
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

function resolvePromise(promise2, x, resolve, reject) {
    // 循环引用报错
    if (x === promise2) {
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