# updateQueue

上一章节我们讲到,初始化执行 unbatchedUpdates 并执行 updateContainer 在里面会 调用 **createUpdate** 生成一个 update.我们来看看

方法定义在文件 **react-reconcile/src/ReactUpdateQueue.js** 中。

## createUpdate

```js

export function createUpdate(
  expirationTime: ExpirationTime,
  suspenseConfig: null | SuspenseConfig,
): Update<*> {
  let update: Update<*> = {
    expirationTime,
    suspenseConfig,


    tag: UpdateState,
    payload: null,
    callback: null,


    next: (null: any),
  };
  update.next = update;
  return update;
}
```

- expirationTime 是更新的过期时间
- suspenseConfig 当前批量更新的配置, 是一个全局对象
- UpdateState 的值是 0 定义在本文

```js
    export const UpdateState = 0;   // 更新state
    export const ReplaceState = 1;  // 替换state
    export const ForceUpdate = 2;   // 强制更新
    export const CaptureUpdate = 3; // 捕获更新
```

- payload 更新内容，比如setState接收的第一个参数    
- callback 对应的回调，比如setState({}, callback)
- next 指向下一个更新

创建完 update 会调用 **enqueueUpdate**

## enqueueUpdate

```js
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    // Only occurs if the fiber has been unmounted.
    return;
  }


  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    // This is the first update. Create a circular list.
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
}
```

前面在 创建 **FiberRoot** 的时候会 执行 **initializeUpdateQueue** 初始化 **updateQueue**,我们来 看看 **updateQueue** 有那些东西

```js
export function initializeUpdateQueue<State>(fiber: Fiber): void {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState,
    baseQueue: null,
    shared: {
      pending: null,
    },
    effects: null,
  };
  fiber.updateQueue = queue;
}
```

在初始化的时候会创建 **UpdateQueue** 挂载在对应的 **fiber** 结构上, **UpdateQueue** 是一个单向链表, 在执行 <font color='red'>render</font>  和 <font color='red'>setState</font> 创建一个的 **update** 挂载到 UpdateQueue 的shared 中