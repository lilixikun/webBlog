# EventLoop

在说 EventLoop 之前我们先看一道题

```js
setTimeout(() => {
    console.log(111);
}, 1000);

while (true) {
    console.log(22);
}
```

**console.log(111)** 永远都不会输出, 因为 **javaScript** 是单线程

## 单线程

JavaScript是单线程单并发语言

- 什么是单线程 ?
  
主程序只有一个线程，即同一时间片断内其只能执行单个任务。

- JS 为什么选择单线程 ?

JavaScript的主要用途是与用户互动，以及操作DOM,如果一个线程是执行删除操作,一个线程是改变操作，那么就会出问题。 因此决定了它只能是单线程，否则会带来很复杂的同步问题。

- 单线程意味着什么 ?
  
单线程就意味着，同一时间只能执行一个任务, 所有任务都需要排队,前一个任务结束,才会执行后一个任务。如果前一个任务耗时很长，后一个任务就需要一直等着。这就会导致IO操作（耗时但cpu闲置）时造成性能浪费的问题。

- 如何解决单线程带来的性能问题

答案是 **异步** !,主线程完全可以不管IO操作，暂时挂起处于等待中的任务，先运行排在后面的任务。等到IO操作返回了结果，再回过头，把挂起的任务继续执行下去。于是，所有任务可以分成两种，一种是同步任务（synchronous），另一种是异步任务（asynchronous）


## JavaScript 内存
- 堆

堆表示一大块非结构化的内存区域，对象，数据被存放在堆中

- 栈

栈在javascript中又称执行栈，调用栈，是一种后进先出的数组结构 。
Javascript 有一个 主线程（main thread）和 调用栈(或执行栈call-stack)，主线各所有的任务都会被放到调用栈等待主线程执行。
JS调用栈采用的是后进先出的规则，当函数执行的时候，会被添加到栈的顶部，当执行栈执行完成后，就会从栈顶移出，直到栈内被清空。

- 队列 

队列即任务队列Task Queue，是一种先进先出的一种数据结构。在队尾添加新元素，从队头移除元素。主要作用:存放异步任务与定时任务


## JavaScript 代码执行机制

- 所有同步任务都在主线程的栈中执行
- 主线程之外，还存在一个 **任务队列**（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。
- 一旦 **栈** 中的所有同步任务执行完毕，系统就会读取"任务队列"，选择出需要首先执行的任务（由浏览器决定，并不按序）。

## 事件循环

主线程从 **任务队列** 中读取事件,主线程不断重复上面的第三步 这个过程是循环不断的，所以整个的这种运行机制又称为 Event Loop（事件循环）,是解决javaScript单线程运行阻塞的一种机制

## 异步任务

异步任务 又分为 **宏任务** 和 **微任务**

### **macrotask** 

宏任务有以下几种:

- **script全部代码**
- **setTimeout**, 
- **setInterval**,
- **setImmediate**（Node环境）, 
- **requestAnimationFrame**,
- **I/O**, 
- **postMessage**，**MessageChannel**
- **UI rendering**


### **microtask** 

微任务 有以下几种：

- **process.nextTick**（Node环境）, 
- **Promise.then**, 
- **MutationObserver**


在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 宏任务 的队列中取出第一个任务，执行完毕后取出 微任务 队列中的所有任务顺序执行；之后再取 宏任务，周而复始，直至两个队列的任务都取完。


## 浏览器中的EventLoop

![bsEventLoop](/js/bsEventLoop.png)


浏览器中的EventLoop 还是比较正常，没那么多稀奇古怪的东西

## Node中EventLoop

首先这张图不用多说，libuv 的架构图

![libvu](/js/libuv.png)

再来看几个特殊的API

```js
setTimeout(function () {
    console.log(1);
}, 0);
setImmediate(function () {
    console.log(2);
});
process.nextTick(() => {
    console.log(3);
});
new Promise((resovle, reject) => {
    console.log(4);
    resovle(4);
}).then(function () {
    console.log(5);
});
console.log(6);
```

在Node执行依次打印 4-6-3-5-1-2

### 初识libvu

在Node.js 启动时，创建了一个类似 **while(true)** 的循环体，每次执行一次循环体称为一次 **tick**。每个tick的过程就查看是否有事件等待处理，如果有，则取出事件及其相关的回调函数并执行，然后执行下一次 tick。它的执行逻辑时，先询问事件观察者当前是否有任务需要执行? **观察者**回答 **有**，于是取出A执行，A是否有回调函数？如果有(如果没有则继续询问当前是否有任务需要执行)，则取出回调函数并执行(注意:回调函数的执行基本都是异步的，可能不止一个回调)，执行完回调后通过某种方式通知调用者，我执行完了，并把执行结果给你，主函数不需要不断询问回调函数执行结果，回调函数会以通知的方式告知调用者我执行完了，而这个过程主线程并不需要等待回调函数执行完成，它会继续向前执行，直到**观察者**回答没有了，线程结束。

事件循环是一个典型的生产者、消费者模型。**异步IO**、**网络请求**等则是事件的生产者，源源不断为Node提供不同类型事件，这些事件被传到观察者那里，事件则从观察者那里取出事件并处理。

### 什么是观察者

![tick](/js/tick.png)


### 位置

process.nextTick 在 EventLoop 的位置

![nextTick](/js/nextTick.png)


setImmediate 在 EventLoop 的位置

![nextTick](/js/setImmediate.png)


## 七个阶段

事件循环分下面七个阶段

1. <font color='red'>update_time</font> 为了获取一下系统时间，以保证之后的timer有个计时的标，避免过多的系统调用影响性能。

2. <font color='red'>timers</font> 要检查是否有到期的 timer，也就是 setTimeout/setInterval 这种类型的timer

3. <font color='red'>I/O callbacks(epool，kqueue,IOCP)</font> I/O 异步事件的回调，比如网络I/O,比如文件读取I/O，当这些I/O动作都结束的时候调用

4. <font color='red'>idle、prepare</font> 这个阶段内部做一些动作，如果节点处于 avtibe 状态，每次事件循环都会被执行 nexttick

5. <font color='red'>I/O poll阶段</font> 调用各个平台提供的io多路复用接口，最多dengdai timeout 事件，记录 timoeout 自己维护状态，在适当的条件下进行阻塞

6. <font color='red'>check</font> 执行 setImmediate 操作

7. <font color='red'>close callbacks</font> 关闭 I/0的动作，比如文件描述符的关闭，链接断开等等


## 总结

![eventLoop1](/js/eventLoop1.png)

![eventLoop2](/js/eventLoop2.png)


## 练习
说了那么多概念,还是来点 题目来练习下

```js
setTimeout(()=>{
   console.log(1) 
},0)
let a=new Promise((resolve)=>{
    console.log(2)
    resolve()
}).then(()=>{
   console.log(3) 
}).then(()=>{
   console.log(4) 
})
console.log(5) 

```

以此输出 2,5,3,4,1

> tip
> 
>Promise中的executor是一个立即执行的函数,then 才属于 微任务

```js
new Promise((resolve,reject)=>{
    console.log("promise1")
    resolve()
}).then(()=>{
    console.log("then11")
    new Promise((resolve,reject)=>{
        console.log("promise2")
        resolve()
    }).then(()=>{
        console.log("then21")
    }).then(()=>{
        console.log("then23")
    })
}).then(()=>{
    console.log("then12")
})

```

promise1,then11,promise2,then21,then12,then23

```js

new Promise((resolve,reject)=>{
    console.log("promise1")
    resolve()
}).then(()=>{
    console.log("then11")
    return new Promise((resolve,reject)=>{
        console.log("promise2")
        resolve()
    }).then(()=>{
        console.log("then21")
    }).then(()=>{
        console.log("then23")
    })
}).then(()=>{
    console.log("then12")
})

```

> Promise的第二个then相当于是挂在新Promise的最后一个then的返回值上。

promise1,then11,promise2,then21,then23,then12

```js
new Promise((resolve,reject)=>{
    console.log("promise1")
    resolve()
}).then(()=>{
    console.log("then11")
    new Promise((resolve,reject)=>{
        console.log("promise2")
        resolve()
    }).then(()=>{
        console.log("then21")
    }).then(()=>{
        console.log("then23")
    })
}).then(()=>{
    console.log("then12")
})
new Promise((resolve,reject)=>{
    console.log("promise3")
    resolve()
}).then(()=>{
    console.log("then31")
})

```

promise1,promise3,then11,promise2,then31,then21,then12,then23


加上 async/await

```js
async function async1() {
    console.log("async1 start");
    await  async2();
    console.log("async1 end");
}

async function async2() {
    console.log( 'async2');
}

console.log("script start");

setTimeout(function () {
    console.log("settimeout");
},0);

async1();

new Promise(function (resolve) {
    console.log("promise1");
    resolve();
}).then(function () {
    console.log("promise2");
});
console.log('script end'); 

```
script start,async1 start,async2,promise1,script end,async1 end,promise2,settimeout

>  async1 可以看成如下

```js
funcation async1(){
    console.log("async1 start");
    new Promise((resolve)=>{
     console.log( 'async2');
    }).then(()=>{
        console.log("async1 end");
    })
}
```

```js
async function async1() {
    console.log(1)
    await async2()
    console.log(2)
    return await 3
}
async function async2() {
    console.log(4)
}

setTimeout(function() {
    console.log(5)
}, 0)

async1().then(v => console.log(v))
new Promise(function(resolve) {
    console.log(6)
    resolve();
    console.log(7)
}).then(function() {
    console.log(8)
})
console.log(9)
```

1,4,6,7,9,2,8,3,5

## 疑惑

我们知道 Promise 本身是一个异步方法,必须得在 执行栈执行完了再去 取 它的值 .因此,所有的返回值都得包一层异步 setTimeout。那么问题来了, 为什么 Promise 的 resolve 被 setTimeout 包裹后 就成了微任务, 要知道 setTimeout 可是宏 任务 啊。


**解析**

在现代浏览器里面，产生微任务有两种方式。

- 第一种方式是使用 MutationObserver 监控某个 DOM 节点，然后再通过 JavaScript 来修改这个节点，或者为这个节点添加、删除部分子节点，当 DOM 节点发生变化时，就会产生 DOM 变化记录的微任务。
- 第二种方式是使用 Promise，当调用 Promise.resolve() 或者 Promise.reject() 的时候，也会产生微任务。

ECMAScript 规范明确指出 Promise 必须以 Promise Job 形式加入 job queues（也就是 microtask）。Job Queue 是 ES6 中新提出的概念，建立在事件循环队列之上。

因此我个人理解如下:

Promise 执行了 then 后 会被置入到一个 **微任务** 队列, 和里面是不是 setTimeout 包裹没有关系. 然后等待 主线程 任务运行结束, 再去执行 队列任务