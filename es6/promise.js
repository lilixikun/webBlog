//promise 新建后就会执行
let promise = new Promise(function (resolve, reject) {
    console.log("promise");
    resolve();
})

promise.then(function () {
    console.log("resolve");
})

console.log("hi");
//promise
//hi
//resolve

const getJson = function (url) {
    const promise = new Promise((resolve, reject) => {

        const handle = function () {
            if (this.status === 200) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText))
            }
        }

        const client = new XMLHttpRequest();
        client.open('GET', url);
        client.onreadystatechange = handle;
        client.responseType = "json";
        client.setRequestHeader('Accept', 'application/json');
        client.send();
    })

    return promise;
}

getJson("http://www.baidu.com").then(data => console.log(data), err => console.log(err))

//finaly 实现
Promise.prototype.myFinaly = function (callback = function () { }) {
    const p = this.constructor;
    p.then(value => p.resolve(callback()).then(() => value),
        reason => p.reject(callback()).then(() => { throw Error(reason) })
    )
}

const p = Promise.race([
    fetch("http://www.baidu.com"),
    new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error("timeout"))
        }, 2000);
    })
]).catch(err => console.log(err))
p.then(console.log("111")).catch(err => console.log(err))


const resolve=Promise.resolve(42);
const reject=Promise.reject(-1);
await Promise.allSettled([resolve,reject]).then(result=>console.log(result))
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]



