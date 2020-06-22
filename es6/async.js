import { spawn } from "child_process";

//async 函数就是将 Generator 函数的 * 替换成 async ,将yield 替换成await

//async函数对 Generator 函数的改进，体现在以下四点
// 1.内置执行器 ：Generator 函数的执行必须靠执行器，所以才有了co模块，而async函数自带执行器
// 2.更好的语义 :async和await，比起星号和yield，语义更清楚了。async表示函数里有异步操作，await表示紧跟在后面的表达式需要等待结果。
// 3.更广的适用性 :async函数的await命令后面，可以是 Promise 对象和原始类型的值
// 4.返回值是 Promise ：async函数的返回值是 Promise 对象，这比 Generator 函数的返回值是 Iterator 对象方便多了

//async 多种申明方式

//函数申明
async function foo() { }
//函数表达式
const foo = async function () { }
//对象的方法
let obj = { async foo() { } }
obj.foo().then()

//箭头函数
const asy = async () => { };

//async 函数内部返回一个promise函数
async function f() {
    return 'hello word!'
    //内部抛错
    throw new Error("err")
}
f().then(
    vl => console.log(vl),
    err => console.log(err)
);

//await命名
//正常情况下，await命令后面是一个 Promise 对象，返回该对象的结果。如果不是 Promise 对象，就直接返回对应的值。

async function f() {
    //等同于f
    //return 123
    return await 123;
}

//await命令后面的 Promise 对象如果变为reject状态，则reject的参数会被catch方法的回调函数接收到。
async function f() {
    await Promise.reject('err');
    await Promise.resolve(123) //不会执行
}

//错误处理
//如果await后面的异步操作出错，那么等同于async函数返回的 Promise 对象被reject
async function f() {
    await new Promise((resolve, reject) => {
        throw new Error('error');
    })
}
f().then().catch(err => console.log(err))//error

//async 函数执行原理

async function fn(asgs) {

}

//等同于
function fn(args) {
    return spawn(function* () {

    })
}

function spawn(gen) {
    return new Promise((resolve, reject) => {
        const g = gen();
        function step(nextF) {
            let next
            try {
                next = nextF.next();
            } catch (err) {
                reject(err);
            }
            if (next.done) {
                resolve(next.value)
            }
            Promise.resolve(next.value).then(function (v) {
                step(function () {
                    return g.next(v)
                })
            }, function (e) {
                step(function () {
                    return g.throw(e)
                })
            })
        }
        step(function () {
            return g.next(undefined)
        })
    })
}

