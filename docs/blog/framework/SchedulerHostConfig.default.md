# React中requestIdleCallback的实现

## 背景知识
当前大多数屏幕的刷新频率都是 **60hz**,也就是每秒屏幕刷新60次,低于60hz人眼就会感知卡顿掉帧等情况，同样我们前端浏览器所说的 **FPS**（frame per second）是浏览器每秒刷新的次数，理论上FPS越高人眼觉得界面越流畅，在两次屏幕硬件刷新之间，浏览器正好进行一次刷新（重绘），网页也会很流畅，当然这种是理想模式， 如果两次硬件刷新之间浏览器重绘多次是没意义的，只会消耗资源，如果浏览器重绘一次的时间是硬件多次刷新的时间，那么人眼将感知卡顿掉帧等， 所以浏览器对一次重绘的渲染工作需要在 <font color='red'>16ms</font>（1000ms/60）之内完成，也就是说每一次重绘小于16ms才不会卡顿掉帧。


浏览器的**一帧**说的就是一次完整的重绘。一次 **重绘** 需要做 如下:


![requestIdleCallback](/react/requestIdleCallback.png)

具体查看 [requestIdleCallback](/blog/framework/requestIdleCallback)


## 帧时间的计算
要实现 **requestIdleCallback** 最主要的就是 <font color='red'>deadline.timeRemaining()</font>,主要看下面两点描述
- <font color='red'>当前帧结束时间</font> **我们知道requestAnimationFrame的回调被执行的时机是当前帧开始绘制之前。也就是说rafTime是当前帧开始时候的时间，如果按照每一帧执行的时间是16.66ms。那么我们就能算出当前帧结束的时间， frameDeadline = rafTime + 16.66**

- <font color='red'>当前帧剩余时间</font> **当前帧剩余时间 = 当前帧结束时间(frameDeadline) - 当前帧花费的时间。关键是我们怎么知道 '当前帧花费的时间',这个是怎么算的，这里就涉及到 JS 事件循环的知识。react中是用 [MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel)实现的**

## requestIdleCallback的实现

下面我们使用  **requestAnimationFrame** 和 **MessageChannel** 实现一个简单的 **requestIdleCallback**

```js
let frameDeadline // 当前帧的结束时间
let penddingCallback // requestIdleCallback的回调方法 也就是 react 执行 performSyncWorkOnRoot
let channel = new MessageChannel()

// 当执行此方法时，说明requestAnimationFrame的回调已经执行完毕，此时就能算出当前帧的剩余时间了，直接调用timeRemaining()即可。
// 因为MessageChannel是宏任务，需要等主线程任务执行完后才会执行。我们可以理解requestAnimationFrame的回调执行是在当前的主线程中，只有回调执行完毕onmessage这个方法才会执行。
channel.port2.onmessage = function() {
  // 判断当前帧是否结束
  // timeRemaining()计算的是当前帧的剩余时间 如果大于0 说明当前帧还有剩余时间
  let timeRema = timeRemaining()
    if(timeRema > 0){
        // 执行回调并把参数传给回调
        penddingCallback && penddingCallback({
            // 当前帧是否完成
            didTimeout: timeRema < 0,
            // 计算剩余时间的方法
            timeRemaining
        })
    }
}
// 计算当前帧的剩余时间
function timeRemaining() {
    // 当前帧结束时间 - 当前时间
    // 如果结果 > 0 说明当前帧还有剩余时间
    return frameDeadline - performance.now()
}
window.requestIdleCallback = function(callback) {
    requestAnimationFrame(rafTime => {
      // 算出当前帧的结束时间 这里就先按照16.66ms一帧来计算
      frameDeadline = rafTime + 16.66
      // 存储回调
      penddingCallback = callback
      // 这里发送消息，MessageChannel是一个宏任务，也就是说上面onmessage方法会在当前帧执行完成后才执行
      channel.port1.postMessage(null) 
    })
}
```

在前面提到了 [requestAnimationFrame](/blog/framework/requestAnimationFrame)的回调函数会被传入DOMHighResTimeStamp参数,该参数与 [performance.now()](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now) 的返回值相同，它表示requestAnimationFrame() 开始去执行回调函数的时刻


<font color='red'>performance.now()</font> 是什么呢?

我的理解就是从页面打开开始 **performance.now()** 就会从 **0** 开始一直计时,随着在当前页面停留的时间增长这个时间不断累加的一个值，其实就类似一个计时器。官网的说法是 **performance.timing.navigationStart + performance.now() 约等于 Date.now()。**

## React中requestIdleCallback的polyfill实现

在 [chrome](https://developers.google.com/web/updates/2015/08/using-requestidlecallback) 文档上,可以看到原生提供的 **requestIdleCallback** 方法的 **timeRemaining()** 最大返回是 **50ms**,也就是 <font color='red'>20fps</font>,达不到页面流畅度的要求，并且该API兼容性也比较差。

在 **react/packages/scheduler/src/forks/SchedulerHostConfig.default.js** 下，React实现了对requestIdleCallback的polyfill。


针对 DOM 下和非DOM环境下实现了两套方案，我们先来看下该文件暴露出去的方法。

```js
export let requestHostCallback; // requestIdleCallback的polyfill方法
export let cancelHostCallback;  // 用于取消requestHostCallback
export let requestHostTimeout;
export let cancelHostTimeout;   // 用于取消requestHostTimeout
export let shouldYieldToHost;
export let requestPaint;
export let getCurrentTime;      // 获取当前触发事件
export let forceFrameRate;      // 设置渲染的fps
```

我们这里只看在 DOM 环境下的实现


```js
if (typeof console !== 'undefined') {
    const requestAnimationFrame = window.requestAnimationFrame;
    const cancelAnimationFrame = window.cancelAnimationFrame;
    // ....
}
```
首先是对requestAnimationFrame和cancelAnimationFrame两方法做了是否有的判断，并做了error的提示，实际上，在本文件下是没有使用这两个方法的，注释是说以防未来可能有使用

### getCurrentTime

```js
if (typeof performance === 'object' && typeof performance.now === 'function') {
    getCurrentTime = () => performance.now();
  } else {
    const initialTime = Date.now();
    getCurrentTime = () => Date.now() - initialTime;
  }
```

在 **DMOM** 环境下优先使用 **performance.now()** 不支持再实现 **Date**

### forceFrameRate

```js
forceFrameRate = function (fps) {
    if (fps < 0 || fps > 125) {
        // message
      return;
    }
    if (fps > 0) {
      yieldInterval = Math.floor(1000 / fps);
    } else {
      // reset the framerate
      yieldInterval = 5;
    }
  };
```

该方法用于设置渲染的 **fps** 仅支持 <font color='red'>0-125fps</font>的，超出的做error提示。然后根据 **fps** 计算 **yieldInterval** 每帧的时间。

### requestHostCallback

```js
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
// 及时的任务
requestHostCallback = function (callback) {
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
    }
};
```
**requestHostCallback** 在非 DOM 环境下用 **setTimeout** 实现的,在 **DOM** 是使用 **MessageChannel** 实现的,通过 **MessageChannel** 双通道来处理任务,messageChannel属于宏认为，异步执行

**port.postMessage**, 触发 **performWorkUntilDeadline函数**

```js
  // 1. 执行flushwork
  // 2. 判断有没有更多的任务，有更多的任务,在下一个事件循环里再继续调用performWorkUntilDeadline（异步的递归）
  const performWorkUntilDeadline = () => {
    if (scheduledHostCallback !== null) {
      const currentTime = getCurrentTime();
      // 设置截止时间，刚开始为5ms，后面渐渐动态调整
      deadline = currentTime + yieldInterval;
      const hasTimeRemaining = true;
      try {
        // scheduledHostCallback为传入的callback，此处为 flushWork
        // 执行flushwork——递归执行taskQuene里的callBack，也就是 workLoop
        const hasMoreWork = scheduledHostCallback(
          hasTimeRemaining,
          currentTime,
        );
        if (!hasMoreWork) {
          // 没有更多任务, 重置消息循环状态, 清空回调函数
          isMessageLoopRunning = false;
          scheduledHostCallback = null;
        } else {
          // 有更多任务，在下一个循环里继续调度
          port.postMessage(null);
        }
      } catch (error) {
        port.postMessage(null);
        throw error;
      }
    } else {
      isMessageLoopRunning = false;
    }
    needsPaint = false;
  };
```

我们可以在源码 **scheduler/src/flushWork** 中看到如下代码:

```js
...
if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
}

// 1. 执行workLoop
  // 2. 把每一个taskQuene的任务，调用 performSyncWorkOnRoot
function flushWork(hasTimeRemaining, initialTime) {
  ...
  try {
    if (enableProfiling) {
      try {
        return workLoop(hasTimeRemaining, initialTime);
      } catch (error) {
        if (currentTask !== null) {
          const currentTime = getCurrentTime();
          markTaskErrored(currentTask, currentTime);
          currentTask.isQueued = false;
        }
        throw error;
      }
    } else {
      // No catch in prod codepath.
      return workLoop(hasTimeRemaining, initialTime);
    }
  } finally {
    // ...
  }
}
```

这样一来 就和我们的 React 里面的代码流程对应上了,和我们之前用 **requestIdleCallback** 模拟 **workLoop** 流程一致了

### cancelHostCallback

```js
cancelHostCallback = function () {
    scheduledHostCallback = null;
};
```
置空回调,这样在performWorkUntilDeadline中就不会执行对应的函数了，相当于取消了requestHostCallback。


### requestHostTimeout
```js
requestHostTimeout = function(callback, ms) {
    taskTimeoutID = setTimeout(() => {
        callback(getCurrentTime());
    }, ms);
};
```

基于 **setTimeout**,向回调传入当前时间作为参数。

### cancelHostTimeout

```js
  cancelHostTimeout = function () {
    clearTimeout(taskTimeoutID);
    taskTimeoutID = -1;
  };
```

requestHostTimeout的取消方法，即 **clearTimeout**。

### shouldYieldToHost

```js
shouldYieldToHost = function () {
    const currentTime = getCurrentTime();
    if (currentTime >= deadline) {
    if (needsPaint || scheduling.isInputPending()) {
        return true;
    }
    return currentTime >= maxYieldInterval;
    } else {
    return false;
    }
};
```

shouldYieldToHost根据当前时间是否大于最后的预期时间