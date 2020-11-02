# setState

## 执行setState立即更新？

首先看摘自 [React官网](https://zh-hans.reactjs.org/docs/react-component.html#setstate)的一段话:

::: warning
setState() 将对组件 state 的更改排入队列，并通知 React 需要使用更新后的 state 重新渲染此组件及其子组件。这是用于更新用户界面以响应事件处理器和处理服务器数据的主要方式

将 setState() 视为请求而不是立即更新组件的命令。为了更好的感知性能，React 会延迟调用它，然后通过一次传递更新多个组件。React 并不会保证 state 的变更会立即生效。

setState() 并不总是立即更新组件。它会批量推迟更新。这使得在调用 setState() 后立即读取 this.state 成为了隐患。为了消除隐患，请使用 componentDidUpdate 或者 setState 的回调函数（setState(updater, callback)），这两种方式都可以保证在应用更新后触发。如需基于之前的 state 来设置当前的 state，请阅读下述关于参数 updater 的内容。

除非 shouldComponentUpdate() 返回 false，否则 setState() 将始终执行重新渲染操作。如果可变对象被使用，且无法在 shouldComponentUpdate() 中实现条件渲染，那么仅在新旧状态不一时调用 setState()可以避免不必要的重新渲染
:::

因此可以看到,我们在执行完 **setState** 页面并不会马上执行更新,它会批量推迟更新,每执行一次 **setState** 就会创建 update 然后会加入到 fiber 的队列中,如我们前面的模拟过程 [UpdateQueue](http://localhost:8080/blog/framework/updateQueue.html)


::: danger
**传入对象就会被合并**

**传入函数不会被合并**,函数没法合并
:::

## setState是同步还是异步

**setState** 本身无所谓异步还是同步,但是我们想拿到更新后 state 的值 这个时候就会出现所谓的 "同步"和"异步"。

![setState-status](/react/setState-status.png)


代码中有一个变量锁 **isBatchingUpdates**,**isBatchingUpdates** 表示是否进行批量更新，初始化时默认为 <font color='red'>false</font>, **batchedUpdates** 方法会将  **isBatchingUpdates** 设为 <font color='red'>true</font>

这个同步异步主要取决于能否命中 **batchedUpdates** 机制, 判断 <font color='red'> isBatchingUpdates </font>

**同步有那些**

- setTimeout/setInterval 

- 自定义的DOM 事件

同步的本质是因为修改了 **isBatchingUpdates** 的状态,简单流程如下:

![isBatchingUpdates](/react/isBatchingUpdates.png)

## 总结

React的 **setState** 的流程可以总结为以下：

![batchedUpdates](/react/batchedUpdates.png)
