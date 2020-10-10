# requestAnimationFrame

window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行

> 注意：若你想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用window.requestAnimationFrame()



## 用法

**window.requestAnimationFrame(callback)**

## callback

下一次重绘之前更新动画帧所调用的函数(即上面所说的回调函数)。该回调函数会被传入DOMHighResTimeStamp参数，该参数与 **performance.now()** 的返回值相同，它表示requestAnimationFrame() 开始去执行回调函数的时刻

## 返回值
一个 long 整数,请求 ID ，是回调列表中唯一的标识。是个非零值，没别的意义。你可以传这个值给 window.**cancelAnimationFrame()** 以取消回调函数。

## 示例

如现在有这么一个需求 在页面绘制一个进度条值从 0-100%

我们可以使用 **setTimeout**,通过设定间隔时间来不断改变图像位置，达到动画效果。但是容易出现卡顿、抖动的现象;原因是：

1. settimeout任务被放入异步队列，只有当主线程任务执行完后才会执行队列中的任务，因此实际执行时间总是比设定时间要晚
2. settimeout的固定时间间隔不一定与屏幕刷新时间相同，会引起丢帧。

使用 **requestAnimationFrame** 优势由系统决定回调函数的执行时机。60Hz的刷新频率，那么每次刷新的间隔中会执行一次回调函数，不会引起丢帧，不会卡顿,如下:

```html
<body>
    <div id="progress-bar" style="background: lightblue;width:0px;height:20px"></div>
    <button id="btn">开始</button>
    <script>
        //一下raf的用法 页面上绘制一个进度条 值0%=>100%
        let btn = document.getElementById('btn');
        let oDiv = document.getElementById('progress-bar');
        let start;
        function progress() {
            oDiv.style.width = oDiv.offsetWidth + 1 + 'px';
            oDiv.innerHTML = (oDiv.offsetWidth) + '%';//修改文本为百分比
            if (oDiv.offsetWidth < 100) {
                let current = Date.now();
                // 假如说浏览器本身的任务执行是5MS
                console.log(current - start);//打印的是开始准备执行的时候到真正执行的时间的时间差
                start = current;
                requestAnimationFrame(progress);
            }
        }
        btn.addEventListener('click', () => {
            oDiv.style.width = 0;//先把宽度清除 rAf 后面会用到
            let current = Date.now();//先获取到当前的时间 current是毫秒数
            start = current;
            requestAnimationFrame(progress);
        });
    </script>
</body>
```
