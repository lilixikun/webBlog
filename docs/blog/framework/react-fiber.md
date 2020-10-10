# React-Fiber

## Fiber 是什么
**JavaScript** 是单线程的,这意味着我们只有一个线程可以执行所有UI更新,处理用户操作和网络调用等。

在 Fiber 之前 React 有两棵树🌲,一棵是当前树,另一棵是带有所有新更新的更新树🌲。 协调器将在一次通过中同步找到两个树🌲之间的差异,这个过程不能被打断,得全部执行完一把梭更新, 节点过多会导致卡顿,这将阻止主线程执行其他重要任务,例如某些用户操作

因此,Facebook团队在React 16更新中引入了Fiber作为其核心架构。

**Fiber** 就是一个数据结构,它有很多属性,虚拟 dom 就是对真实 dom 的一种简化 一些真实 dom 做不到的对象  虚拟 dom 更做不到。 因此有了 fiber、希望借由 fiber 上的这堆属性 来做一些比较厉害的事件 

## Fiber 架构
为了弥补上面的不足、设计了一些新的算法、为了让这些算法跑起来、所以出现了 **Fiber** 数据结构

**Fiber** 数据结构 + 算法 = **Fiber** 架构

**React** 应用从始至终 管理着最基本的三样东西
1. Root(整个应用的根 一个对象 不是 Fiber 同时有个属性指向 workInProgress)

2. current 树(树上的每一个节点都是 Fiber 保存的是上一次的状态 并且每个FIber节点 都对应这一个 jsx 节点)

3. **workInProgress** 树(树上的每一个节点Fiber 保存的是本次新的节点 并且每个Fiber 节点都对应一个 jsx 节点)


## 如何工作
没有 current 树,React 在一开始创建 Root 就会创建一个 uninitiaFiber (未初始化的FIber)
让 react 的 current 指向 uninitiaFiber,之后再去创建一个本次要用到的 workInProgress

- ReactDOM.render() 和 setState 的时候开始创建更新。
- 将创建的更新加入任务队列，等待调度。
- 在 requestIdleCallback 空闲时执行任务。
- 从根节点开始遍历 Fiber Node，并且构建 WokeInProgress Tree。
- 生成 effectList。
- 根据 EffectList 更新 DOM。

WorkInProgress Tree 构造完毕，得到的就是新的 Fiber Tree,然后喜新厌旧（把 current 指针指向 WorkInProgress Tree，丢掉旧的 Fiber Tree）就好了。

这样做的好处：

- 能够复用内部对象（fiber）

- 节省内存分配、GC的时间开销

就算运行中有错误，也不会影响 View 上的数据

每个 Fiber上都有个 **alternate**属性,也指向一个 Fiber,创建 WorkInProgress 节点时优先取 **alternate**,没有的话就创建一个。

创建 WorkInProgress Tree 的过程也是一个 Diff 的过程，Diff 完成之后会生成一个 **Effect List**,这个 **Effect List** 就是最终 Commit 阶段用来处理副作用的阶段。


## React 主要分两个阶段
![react-fiber](/react/lifecycle.png)

1. render 阶段 指的是创建 fiber 过程
- 为每个节点创建新的 fiber(workInProgress) 可能是复用 生成一棵有新状态的 workInProgress 树
- 初次渲染的时候(或新创建了某个节点) 会将这个 fiber 创建真实的dom 实例,并且对当前节点的子节点进行插入 appendchild
- 如果不是初次渲染的话 就对比新旧的 fiber 状态 将产生了更新的fiber节点 最终通过链表的形式挂在到 RootFiber

2. commit 阶段 才是真正要操作页面的阶段
- 执行生命周期
- 会从 RootFiber 上获取到那条链表 根据链表上的标识 来操作页面

在渲染阶段调用的生命周期方法：
- **getDerivedStateFromProps**
- **shouldComponentUpdate**
- **render**

不管是初次渲染还是更新 都是从根往下遍历的

在提交阶段调用的生命周期方法：

- **getSnapshotBeforeUpdate**
- **componentDidMount**
- **componentDidUpdate**
- **componentWillUnmount**

由于这些方法在提交阶段被调用，因此它们可能包含任何副作用和DOM操作操作
> 这里要特别注意的是，阶段1（渲染）可以暂停和恢复，即，它是异步的，而阶段2必须在一个流程中完成（同步）。


## Prioritization

React系统如何确定要暂停/恢复哪个进程?

**优先级** 是React Fiber最重要的功能之一。
Fiber Reconciler为任务分配优先级，并根据优先级将更新这些更改

根据任务，React分配以下优先级:
- 同步
- 高优先级
- 低优先级
- 场外工作(优先)等

例如,在所有组件的优先级中，将textInput类型事件指定为高优先级。


按照优先级执行,如果插入了新的任务,那么也按照优先级重新排序,分别是 **window.requestAnimationFrame** 和 **window.requestIdleCallback**