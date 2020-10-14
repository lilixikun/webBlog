# scheduleWork

在前面流程中 render 后会执行 **updateContainer**
```js
function updateContainer(){
  //...
  const update = createUpdate(expirationTime, suspenseConfig);
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }
  // update 添加到 fiber.updateQuene链表
  enqueueUpdate(current, update);
  // 调度和更新当前current对象(HostRootFiber)
  scheduleWork(current, expirationTime);
}
```

在 [scheduleWork](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberWorkLoop.js#L449) 可以看到相对应的方法

## scheduleUpdateOnFiber

::: details scheduleUpdateOnFiber

```js
export function scheduleUpdateOnFiber(
  fiber: Fiber,
  expirationTime: ExpirationTime,
) {
  // 检测最近的更新次数
  checkForNestedUpdates();
  warnAboutRenderPhaseUpdatesInDEV(fiber);
  // 找到 rootFiber 并遍历更新子节点的 expirationTime
  const root = markUpdateTimeFromFiberToRoot(fiber, expirationTime);
  if (root === null) {
    warnAboutUpdateOnUnmountedFiberInDEV(fiber);
    return;
  }
  // 判断是否有高优先级任务打断当前正在执行的任务
  checkForInterruption(fiber, expirationTime);
  recordScheduleUpdate();

  // 获取当前任务的优先级
  // if：onClick事件: currentPriorityLevel = UserBlockingPriority
  const priorityLevel = getCurrentPriorityLevel();

  // 同步立即执行
  if (expirationTime === Sync) {
    if (
      // Check if we're inside unbatchedUpdates
      // 处于unbatchedUpdates中
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      // Check if we're not already rendering
      // 不在render阶段和commit阶段
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      // Register pending interactions on the root to avoid losing traced interaction data.
      // 注册或更新pendingInteractions——update的集合
      schedulePendingInteractions(root, expirationTime);

      // 传入FiberRoot对象, 执行同步更新
      performSyncWorkOnRoot(root);
    } else {
      ensureRootIsScheduled(root);
      // 注册或更新pendingInteractions——update的集合
      schedulePendingInteractions(root, expirationTime);
      if (executionContext === NoContext) {
        // 立即更新同步队列
        // 故意将其放置在scheduleUpdateOnFiber而不是scheduleCallbackForFiber内，
        // 以保留在不立即刷新回调的情况下调度回调的功能。 
        // 我们仅对用户启动的更新执行此操作，以保留旧版模式的历史行为。
        flushSyncCallbackQueue();
      }
    }
  } else {
    ensureRootIsScheduled(root);
    // 注册或更新pendingInteractions——update的集合
    schedulePendingInteractions(root, expirationTime);
  }

  if (
    (executionContext & DiscreteEventContext) !== NoContext &&
    // 只有在用户阻止优先级或更高优先级的更新才被视为离散，即使在离散事件中也是如此
    (priorityLevel === UserBlockingPriority ||
      priorityLevel === ImmediatePriority)
  ) {
    //这是离散事件的结果。 跟踪每个根的最低优先级离散更新，以便我们可以在需要时尽早清除它们。
    //如果rootsWithPendingDiscreteUpdates为null，则初始化它
    if (rootsWithPendingDiscreteUpdates === null) {
      rootsWithPendingDiscreteUpdates = new Map([[root, expirationTime]]);
    } else {
      const lastDiscreteTime = rootsWithPendingDiscreteUpdates.get(root);
      if (lastDiscreteTime === undefined || lastDiscreteTime > expirationTime) {
        rootsWithPendingDiscreteUpdates.set(root, expirationTime);
      }
    }
  }
}
export const scheduleWork = scheduleUpdateOnFiber;
```
:::

获取优先级的方法可以在 [getCurrentPriorityLevel](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/SchedulerWithReactIntegration.js) 中看到

```js
// 除NoPriority以外，这些都与Scheduler优先级相对应。 我们用
//递增数字，因此我们可以像数字一样比较它们。 他们从90开始避免与Scheduler的优先级冲突。
// reactDom.render(), commitRoot
// NormalPriority 
export const ImmediatePriority: ReactPriorityLevel = 99;
export const UserBlockingPriority: ReactPriorityLevel = 98;
export const NormalPriority: ReactPriorityLevel = 97;
export const LowPriority: ReactPriorityLevel = 96;
export const IdlePriority: ReactPriorityLevel = 95;
// NoPriority is the absence of priority. Also React-only.
export const NoPriority: ReactPriorityLevel = 90;
```

然后就判断当前是同步任务还是异步任务,是同步任务会执行 **performSyncWorkOnRoot** ,异步任务在最终也会进入 performSyncWorkOnRoot

## performSyncWorkOnRoot

在[performSyncWorkOnRoot](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberWorkLoop.js#L990) 主要会做两件事:
- 调用 **workLoopSync** 创建 fiber 树和生成 dom 节点
- 执行 **finishSyncRender** 进行 commit 提交

```js
function performSyncWorkOnRoot(root) {
  // Check if there's expired work on this root. Otherwise, render at Sync.
  const lastExpiredTime = root.lastExpiredTime;
  //初次render, lastExpiredTime = NoWork
  const expirationTime = lastExpiredTime !== NoWork ? lastExpiredTime : Sync;

  flushPassiveEffects();

  // 如果根目录或过期时间已更改，则抛出现有堆栈
  //准备一个新的。否则我们将继续我们离开的地方。
  if (root !== workInProgressRoot || expirationTime !== renderExpirationTime) {
    prepareFreshStack(root, expirationTime);
    startWorkOnPendingInteractions(root, expirationTime);
  }

  if (workInProgress !== null) {
    // 1. 设置RenderContext
    // 2. 调用workLoopSync
    const prevExecutionContext = executionContext;
    // 设置当前执行上下文为renderContext
    executionContext |= RenderContext;
    const prevDispatcher = pushDispatcher(root);
    const prevInteractions = pushInteractions(root);
    startWorkLoopTimer(workInProgress);

    do {
      try {
        workLoopSync();
        break;
      } catch (thrownValue) {
        handleError(root, thrownValue);
      }
    } while (true);
    resetContextDependencies();
    executionContext = prevExecutionContext;
    popDispatcher(prevDispatcher);
    if (enableSchedulerTracing) {
      popInteractions(((prevInteractions: any): Set<Interaction>));
    }

    if (workInProgressRootExitStatus === RootFatalErrored) {
      const fatalError = workInProgressRootFatalError;
      stopInterruptedWorkLoopTimer();
      prepareFreshStack(root, expirationTime);
      markRootSuspendedAtTime(root, expirationTime);
      ensureRootIsScheduled(root);
      throw fatalError;
    }

    // CommitContext  不能被打断的部分
    // 1. 调用CommitRoot
    if (workInProgress !== null) {
     
    } else {
      stopFinishedWorkLoopTimer();
      root.finishedWork = (root.current.alternate: any);
      root.finishedExpirationTime = expirationTime;
      // commit 阶段
      finishSyncRender(root);
    }
    // 再次对fiberRoot进行调度(退出之前保证fiberRoot没有需要调度的任务)
    ensureRootIsScheduled(root);
  }

  return null;
}
```

在执行之前首先会调用 [prepareFreshStack](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1235)创建 **workInProgress**

::: details 点击查看代码
```js
function prepareFreshStack(root, expirationTime) {
  root.finishedWork = null;
  root.finishedExpirationTime = NoWork;

  const timeoutHandle = root.timeoutHandle;
  if (timeoutHandle !== noTimeout) {
    // The root previous suspended and scheduled a timeout to commit a fallback
    // state. Now that we have additional work, cancel the timeout.
    root.timeoutHandle = noTimeout;
    // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above
    cancelTimeout(timeoutHandle);
  }

  if (workInProgress !== null) {
    let interruptedWork = workInProgress.return;
    while (interruptedWork !== null) {
      unwindInterruptedWork(interruptedWork);
      interruptedWork = interruptedWork.return;
    }
  }
  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
  renderExpirationTime = expirationTime;
  workInProgressRootExitStatus = RootIncomplete;
  workInProgressRootFatalError = null;
  workInProgressRootLatestProcessedExpirationTime = Sync;
  workInProgressRootLatestSuspenseTimeout = Sync;
  workInProgressRootCanSuspendUsingConfig = null;
  workInProgressRootNextUnprocessedUpdateTime = NoWork;
  workInProgressRootHasPendingPing = false;

  if (enableSchedulerTracing) {
    spawnedWorkDuringRender = null;
  }
}
```
:::

在 React 中最多同时存在两颗 fiber树 。 当前屏幕上显示内容对应的 **Fiber树** 称为 **current Fiber树**,正在内存构建的 fiber树 称为 workInProgress Fiber树。下一章节我们将重点说下 React 的双缓存 Fiber 树

## ensureRootIsScheduled
如果是异步会执行 [ensureRootIsScheduled](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberWorkLoop.js#L567) 进入到异步流程中,这个流程里面处理的事件比较多 下面给出部分代码

```js
function ensureRootIsScheduled(root: FiberRoot) {
  const lastExpiredTime = root.lastExpiredTime;
  // lastExpiredTime 初始值为 noWork，只有当任务过期时，会被更改为过期时间（markRootExpiredAtTime方法）
  if (lastExpiredTime !== NoWork) {
    // 任务过期，需要立即执行
    // Special case: Expired work should flush synchronously.
    root.callbackExpirationTime = Sync;
    root.callbackPriority = ImmediatePriority;
    root.callbackNode = scheduleSyncCallback(
      performSyncWorkOnRoot.bind(null, root),
    );
    return;
  }
  // 获取下一个任务的到期时间。
  const expirationTime = getNextRootExpirationTimeToWorkOn(root);
  const existingCallbackNode = root.callbackNode;
  // 2. 没有新的任务, return
  if (expirationTime === NoWork) {
    // There's nothing to work on.
    if (existingCallbackNode !== null) {
      // 重置
      root.callbackNode = null;
      root.callbackExpirationTime = NoWork;
      root.callbackPriority = NoPriority;
    }
    return;
  }
  ... 
    let callbackNode;
  // 最高的优先级
  if (expirationTime === Sync) {
    // Sync React callbacks are scheduled on a special internal queue
    // 1. 把callback添加到syncQueue中
    // 2. 以Scheduler_ImmediatePriority调用Scheduler_scheduleCallback
    callbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  } else if (disableSchedulerTimeoutBasedOnReactExpirationTime) {
    callbackNode = scheduleCallback(
      priorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
  } else {
    callbackNode = scheduleCallback(
      priorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
      // Compute a task timeout based on the expiration time. This also affects
      // ordering because tasks are processed in timeout order.
      // 设置了过期时间
      { timeout: expirationTimeToMs(expirationTime) - now() },
    );
```
1. 判断任务有没有过期,设置最高优先级,需要立即执行
2. 没有新的任务,重置
3. 上一个任务还没有执行完，来了新的任务，判断优先级，如果上一个任务的优先级高，就继续执行之前的,否则取消之前的任务，准备调度新的
4. 执行 **scheduleSyncCallback**/**scheduleCallback** => unstable_scheduleCallback

在 **ensureRootIsScheduled** 可以看到根据不同判断执行 **performSyncWorkOnRoot** 和 [performConcurrentWorkOnRoot](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberWorkLoop.js#L646), 

异步最终都会执行 **performSyncWorkOnRoot** 方法。

1. 分成了及时任务和延时任务
2. 在执行 **performSyncWorkOnRoot** 之前，会判断把延时任务加到及时任务里面来
3. 如果任务超过了 timeout ,任务会过期
4. 通过 **messageChanel** ,这个宏任务，来在下一次的事件循环里调用performSyncWorkOnRoot
5. 如果任务超过了 timeout ,任务会过期





异步的调用原理具体可详见 [SchedulerHostConfig](/blog/framework/SchedulerHostConfig.default),下一章我们会说下 **createWorkInProgress** 的创建以及双缓存 fiber 树