# 双缓存fiber树

## 什么是双缓存？
前面说了 React 最多会同时存在两棵 Fiber 树,那么什么是 <font color='red'>双缓存</font>呢?

当我们用 *canvas* 绘制动画，每一帧绘制前都会调用 *ctx.clearRect* 清除上一帧的画面。

如果当前帧画面计算量比较大，导致清除上一帧画面到绘制当前帧画面之间有较长间隙，就会出现白屏。

为了解决这个问题，我们可以在内存中绘制当前帧动画，绘制完毕后直接用当前帧替换上一帧画面，由于省去了两帧替换间的计算时间，不会出现从白屏到出现画面的闪烁情况。

这种 **在内存中构建并直接替换** 的技术叫做 <font color='red'>双缓存</font>。

**React** 使用“双缓存”来完成Fiber树的构建与替换——对应着 **DOM树** 的创建与更新。

## 双缓存Fiber树

在React中最多会同时存在两棵Fiber树。当前屏幕上显示内容对应的Fiber树称为current Fiber树，正在内存中构建的Fiber树称为workInProgress Fiber树。他们通过 **alternate** 属性连接

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

React 应用的根节点通过 current 指针在不同的 Fiber树的 rootFiber 间切换来实现 Fiber树的切换

当workInProgress Fiber树构建完成交给Renderer渲染在页面上后，应用根节点的current指针指向workInProgress Fiber树，此时workInProgress Fiber树就变为current Fiber树。

每次状态更新都会产生新的workInProgress Fiber树，通过current与workInProgress的替换，完成DOM更新。

![workInProgressFiber](/react/workInProgressFiber.png)

## mount

1. 首次执行ReactDOM.render会创建 fiberRootNode（源码中叫fiberRoot）和rootFiber。其中fiberRootNode是整个应用的根节点，rootFiber是<App/>所在组件树的根节点。 会调用 **createContainer** 创建 **FiberRoot**,并挂载在 root 的current 上


之所以要区分fiberRootNode与rootFiber，是因为在应用中我们可以多次调用ReactDOM.render渲染不同的组件树，他们会拥有不同的rootFiber。但是整个应用的根节点只有一个，那就是fiberRootNode。

```js
// 创建第一个FiberNode
const uninitializedFiber = createHostRootFiber(tag);
root.current = uninitializedFiber;
uninitializedFiber.stateNode = root;
```

由于是首屏渲染,页面中还没有挂载任何DOM，所以fiberRootNode.current指向的rootFiber没有任何子Fiber节点（即current Fiber树为空）。

2. 接下来进入render阶段,根据组件返回的JSX在内存中依次创建 **Fiber** 节点并连接在一起构建 **Fiber** 树，被称为 **workInProgress Fiber **树。（下图中右侧为内存中构建的树，左侧为页面显示的树）

在构建workInProgress Fiber树时会尝试复用current Fiber树中已有的Fiber节点内的属性，在首屏渲染时只有rootFiber存在对应的current fiber（即rootFiber.alternate）。

![rootFiber](/react/rootFiber.jpeg)


3. 右侧已构建完的workInProgress Fiber树在commit阶段渲染到页面。此时DOM更新为右侧树对应的样子。fiberRootNode的current指针指向workInProgress Fiber树使其变为current Fiber 树。
![currentFiber](/react/currentFiber.jpeg)


## update

接下来我们点击p节点触发状态改变，这会开启一次新的render阶段并构建一棵新的 workInProgress Fiber 树。

![workInProgressFiber](/react/workInProgressfiber1.png)

和mount时一样，**workInProgress fiber** 的创建可以复用 **current Fiber** 树对应的节点数据。
>这个决定是否复用的过程就是Diff算法

workInProgress Fiber 树在 **render** 阶段完成构建后进入 **commit** 阶段渲染到页面上。渲染完毕后，workInProgress Fiber 树变为 **current Fiber** 树 也就是第一张图那张。