# workLoopSync

前面已经讲过在 [performSyncWorkOnRoot](/react/scheduleWork.html#performsyncworkonroot) 分别会调用 **workLoopSync** 和 **finishSyncRender** 我们先从 **开始**

```js
function workLoopSync() {
  // 1. 处理了一个Fiber， 返回下一个fiber，
  //  采用深度优先遍历，先找child，sibling fiber
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

这个地方就是一个 **while** 循环调用 **performUnitOfWork** 传入我们之前生成的 **workInProgress**

## performUnitOfWork

```js
function performUnitOfWork(unitOfWork: Fiber): Fiber | null {
  // 第一次render时, unitOfWork=HostRootFiber, alternate已经初始化
  const current = unitOfWork.alternate;
  // current.alternate => 上一次构建的这个Fiber节点
  startWorkTimer(unitOfWork);
  setCurrentDebugFiberInDEV(unitOfWork);
  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    startProfilerTimer(unitOfWork);
    next = beginWork(current, unitOfWork, renderExpirationTime);
    stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
  } else {
    // 创建Fiber节点， 打上了EffectTag标志
    next = beginWork(current, unitOfWork, renderExpirationTime);
  }
  resetCurrentDebugFiberInDEV();
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  // 没有next，意味着fiber tree已经构建完毕了
  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }

  ReactCurrentOwner.current = null;
  return next;
}
```

**performUnitOfWork** 对传入的 **workInProgress** Fiber节点进行深度优先循环处理
1. 调用beginWork
2. 创建FiberNode, 打上EffectTag标记
3. 深度优先遍历
4. 如果fiber创建完了，调用completeUnitOfWork

## 流程概览
上面这些可以把流程简化,如下:

```js
function workLoop(deadline) {
    let shouldYield = false; // 是否让出时间片或者控制权
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1; //没有时间了，就要让出控制权
    }
    //如果时间片到期了还有任务没有完成，就需要请求浏览器再次调度
    if (!nextUnitOfWork && workInProgressRoot) { 
        console.log('render阶段结束');
        //完成之后提交
        commitRoot();
    }
    // 每一帧都要执行
    window.requestIdleCallback(workLoop, {timeout: 500});
}

function performUnitOfWork(workInProgress) {
    let next = beginWork(current,workInProgress)
    if (next === null) {
        next = completeUnitOfWork(workInProgress)
    }
    return next
}
window.requestIdleCallback(workLoop, {timeout: 500});
```

**performUnitOfWork** 方法会创建下一个 Fiber 节点并赋值给 **workInProgress**,并将 **workInProgress** 与已创建的Fiber节点连接起来构成Fiber树。在 React 中自己实现了 [requestIdleCallback](/blog/framework/SchedulerHostConfig.default),这样就实现了可中断的递归，所以performUnitOfWork的工作可以分为两部分：<font color='red'>递</font>和<font color='red'>归</font>


### 递阶段

首先从 **rootFiber** 开始向下深度优先遍历。为遍历到的每个 **Fiber** 节点调用 [beginWork](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3058)方法。

该方法会根据传入的Fiber节点创建子Fiber节点，并将这两个Fiber节点连接起来。

当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。


### 归阶段

在**归**阶段会调用 [completeWork](https://github.com/facebook/react/blob/970fa122d8188bafa600e9b5214833487fbf1092/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L652)处理Fiber节点。

当某个Fiber节点执行完 **completeWork**,如果其存在兄弟Fiber节点（即fiber.sibling !== null），会进入其兄弟Fiber的 **递** 阶段。

如果不存在兄弟 Fiber , 会进入父级Fiber的“归”阶段。

“递”和“归”阶段会交错执行直到“归”到rootFiber。至此，render阶段的工作就结束了。

### 例子

如下的 jsx 会生成以下的 fiber 结构
```js
function App() {
  return (
    <div>
      i am
      <span>KaSong</span>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"));
```

对应的 Fiber 树结构:
![fibertree](/react/fibertree.jpeg)

这个结构刚好对应我们之前说的 [Fiber](/react/Fiber.html) 的数据结构

render阶段会依次执行:

    1. rootFiber beginWork
    2. App Fiber beginWork
    3. div Fiber beginWork
    4. "i am" Fiber beginWork
    5. "i am" Fiber completeWork
    6. span Fiber beginWork
    7. span Fiber completeWork
    8. div Fiber completeWork
    9. App Fiber completeWork
    10. rootFiber completeWork

::: warning 注意
React 只会在这个节点有兄弟节点的时候会创建 fiber 为独生子的时候不会创建fiber 直接返回null,这是React 的一个性能优化
:::

## 总结
React 会根据 jsx 编译生成的数据结构 生成 Fiber 树, 在创建过程中会从根到底生成,然后再回到根节点。 在此过程中会调用 **beginWork** 和 **completeWork** 后面再具体分析这两个方法如何工作的