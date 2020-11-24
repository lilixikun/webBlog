# requestIdleCallback

**window.requestIdleCallback()** 方法将在浏览器的空闲时段内调用的函数排队。这使开发者能够在主事件循环上执行后台和低优先级工作,而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间 **timeout**,则有可能为了在超时前执行函数而打乱执行顺序。

你可以在空闲回调函数中调用 **requestIdleCallback()**,以便在下一次通过事件循环之前调度另一个回调。

> 这是一个实验中的功能,强烈建议使用timeout选项进行必要的工作，否则可能会在触发回调之前经过几秒钟。

浏览器在一帧内可能会做执行下列任务，而且它们的执行顺序基本是固定的:

- 处理用户输入事件
- Javascript执行
- requestAnimation 调用
- 布局 Layout
- 绘制 Paint

上面说理想的一帧时间是 16ms (1000ms / 60),如果浏览器处理完上述的任务(布局和绘制之后)，还有盈余时间，浏览器就会调用 requestIdleCallback 的回调。例如

![requestIdleCallback](/react/requestIdleCallback.png)

**但是在浏览器繁忙的时候，可能不会有盈余时间，这时候requestIdleCallback回调可能就不会被执行。 为了避免饿死，可以通过** <font color='red'>requestIdleCallback</font> **的第二个参数指定一个超时时间**

> 另外不建议在requestIdleCallback中进行DOM操作，因为这可能导致样式重新计算或重新布局(比如操作DOM后马上调用 getBoundingClientRect)，这些时间很难预估的，很有可能导致回调执行超时，从而掉帧。


目前 **requestIdleCallback** 是一个实验功能。所以目前 React [自己实现了一个](https://github.com/facebook/react/blob/master/packages/scheduler/src/forks/SchedulerHostConfig.default.js)。它利用 <font color='red'>MessageChannel</font> 模拟将回调延迟到 **绘制操作** 之后执行:

## 用法

```js
var handle = window.requestIdleCallback(callback[, options])
```

## 参数
一个在事件循环空闲时即将被调用的函数的引用。函数会接收到一个名为 IdleDeadline 的参数，这个参数可以获取当前 **空闲时间** 以及回调是否在 **超时** 时间前已经执行的状态。

**options** 可选
timeout:如果指定了 **timeout** 并具有一个正值,并且尚未通过超时毫秒数调用回调,那么回调会在下一次空闲时期被强制执行，尽管这样很可能会对性能造成负面影响。

## 返回值
一个ID，可以把它传入 Window.cancelIdleCallback() 方法来结束回调。


## 示例1

**React** 正是使用了此特性实现 **Fiber** 的调度并且可以打断. 下面我们来看一个例子:
```js
function sleep(date) {
  let flag = true;
  const now = Date.now();
  while (flag) {
    if (Date.now() - now > date) {
      flag = false;
    }
  }
}

function work() {
  sleep(2000); // 模拟主线程任务执行时间

  requestIdleCallback(() => {
    console.log("空闲时间1");
    sleep(1000);
    console.log("空闲时间1回调任务执行完成");
  });

  requestIdleCallback(() => {
    console.log("空闲时间2");
  });
}

btn1.addEventListener("click", work);
```

执行结果:点击button -> 等待2s -> 打印 空闲时间1 -> 等待 1s -> 打印 空闲时间1回调任务执行完成 -> 空闲时间2；当sleep结束requestIdleCallback获取到主线程空闲，立马执行cb（也是在主线程执行）继续占用主线程，直到sleep结束，第二个requestIdleCallback获取主线程空闲输出空闲时间2

如果仔细看看 **requestIdleCallback** 不就是 **setTimeout** 吗?上一章我们也讲了 **requestIdleCallback** 是可以获取到浏览器剩余的工作时间以及是否超时,**setTimeout** 需要知道具体延迟时间，所以这是主要的却别。


## 示例2

我们来模拟下 页面更新

```js
 let btn1 = document.getElementById('btn1')

function sleep(date) {
    let flag = true;
    const now = Date.now();
    while (flag) {
        if (Date.now() - now > date) {
            flag = false;
        }
    }
}

function renderElement(txt) {
    const p = document.createElement("p");
    p.innerText = txt;

    return p;
}

let taskLen = 10;
let update = 0;
function work2() {
    document.body.appendChild(renderElement(`任务还剩 ${taskLen}`));
    console.log(`页面更新${++update}次`);
    taskLen--;
    if (taskLen) {
        requestAnimationFrame(work2);
    }
}

btn1.addEventListener("click", () => {
    requestAnimationFrame(work2);
    window.requestIdleCallback(() => {
        console.log("空闲了, requestIdleCallback生效了");
    });
});
```

结果如下:

![requestIdleCallback](/react/requestIdleCallback-work.png)

**requestIdleCallback** 在第一帧过后就执行,原因第一帧过后就出现了空闲时段。那么如果每一帧没有空闲时间，**requestIdleCallback** 会什么时候执行哪？

```js
// ...
function work2() {
  document.body.appendChild(renderElement(`任务还剩 ${taskLen}`));
  console.log(`页面更新${++update}次`);
  sleep(1000);
  taskLen--;
  if (taskLen) {
    requestAnimationFrame(work2);
  }
}
```
如上在更新页面之前加了 **sleep** 函数,发现在所有的任务走完后才去执行 **requestIdleCallback**,这就造成了我们上面说的 **饿死** 情况,依次 第二个参数的用处就来了 <font color='red'>{timeout: 1000}</font> 我们修改代码如下:

```js
 btn1.addEventListener("click", () => {
    requestAnimationFrame(work2);
    window.requestIdleCallback(() => {
        console.log("空闲了, requestIdleCallback生效了");
    }, { timeout: 1000 });
});
```

结果如下:
![requestIdleCallback-timeout](/react/requestIdleCallback-timeout.png)

可以看到在第二个任务执行完毕后 **requestIdleCallback** 执行了,成功的插队了。


## 示例3

如下就是模拟 **React** 里面的 **workLoop** 执行过程,其实就是使用了 **requestIdleCallback** 的特性,是 **Fiber** 能够被打断在浏览器空闲时继续执行

```html
<body>
    <script>
        function sleep(delay) { 
            //在JS里如何实现睡眠的功能 t=当前时间
            for (var start = Date.now(); Date.now() - start <= delay;) { }
        }
        let allStart = Date.now();
        // fiber是把整个任务分成很多个小任务，每次执行一个任务
        // 执行完成后会看看有没剩余时间，如果有继续下一个任务，如果没有放弃执行，交给浏览器进行调度
        const works = [
            () => {
                console.log('第1个任务开始');
                //while (true) { }
                sleep(20);//一帧16.6 因为此任务的执行时间已经超过了16.6毫秒，所需要把控制 权交给浏览器
                console.log('第1个任务结束 ');
            },
            () => {
                console.log('第2个任务开始');
                sleep(20);
                console.log('第2个任务结束 ');
            },
            () => {
                console.log('第3个任务开始');
                sleep(20);
                console.log('第3个任务结束 ');
                console.log(Date.now() - allStart);
            }
        ]

        // deadline是一个对象 有两个属性
        // timeRemaining()可以返回此帧还剩下多少时间供用户使用
        // didTimeout 此callback任务是否超时
        function workLoop(deadline) {
            console.log(`本帧的剩余时间为${parseInt(deadline.timeRemaining())}`);
            //如果此帧的剩余时间超过0,或者此已经超时了
            while ((deadline.timeRemaining() > 1 || deadline.didTimeout) && works.length > 0) {
                performUnitOfWork();
            }
            //如果说没有剩余时间了，就需要放弃执行任务控制权，执行权交还给浏览器
            if (works.length > 0) {//说明还有未完成的任务
                window.requestIdleCallback(workLoop, { timeout: 1000 });
            }
        }
        function performUnitOfWork() {
            //shift取出数组中的第1个元素
            works.shift()();
        }

        //告诉 浏览器在1000毫秒后，即使你没有空闲时间也得帮我执行，因为我等不及你
        requestIdleCallback(workLoop, { timeout: 1000 });
    </script>
</body>
```