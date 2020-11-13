# completeUnitOfWork

上面我们分析完了 [beginWork](/react/beginWork.html) 接下来会调用 [completeUnitOfWork](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1503)

```js
function performUnitOfWork(workInProgress) {
    let next = beginWork(current,workInProgress)
    if (next === null) {
        next = completeUnitOfWork(workInProgress)
    }
    return next
}
```

## completeUnitOfWork

**completeUnitOfWork** 主要做以下几件事情:

1. 创建DOM对象

2. 递归处理子树的DOM对象

3. 把创建的dom 对象赋值给 workInProgress.stateNode 属性

4. 设置DOM 对象的属性 绑定事件

5. 把子节点的 sideEffect 添加到父节点上

基于上面我把代码简化了下 大体思路如下,可以自行查看源码 [completeUnitOfWork](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberWorkLoop.js#L1503)

```js
function completeUnitOfWork(workInProgress) {
    while (true) {
        // 创建 dom 节点
        next= completeWork(workInProgress)
        // 存在新的Fiber节点,退出循环, 回到performUnitOfWork阶段
        if (next !== null) {
            // Completing this fiber spawned new work. Work on that next.
            return next;
        }

        let effectTag = workInProgress.effectTag
        ...
        let returnFiber = workInProgress.return
        let siblingFiber = workInProgress.sibling
        // 把所有子Fiber节点的effects和当前Fiber的effects添加到父节点的effect队列当中去
        if (returnFiber.firstEffect === null) {
          returnFiber.firstEffect = workInProgress.firstEffect;
        }
        if (workInProgress.lastEffect !== null) {
          if (returnFiber.lastEffect !== null) {
            returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
          }
          returnFiber.lastEffect = workInProgress.lastEffect;
        }

        // 看是否存在同级的兄弟Fiber节点，如存在，则退出completeUnitOfWork阶段，回到beginWork里去
        if (!!siblingFiber) return siblingFiber
        if (!!returnFiber) {
            workInProgress = returnFiber
            continue
        }
        return null
    }
}
```

逻辑什么意思呢?我们知道 React **fiber** 的 **child** 只会关联一个,那我们有多个子节点怎么办呢?这个时候就会用到 **sibling** 属性来关联,最后子节点的 **return** 都会指向父节点,对应我们之前的那张图

![Filber](/react/Filber.png)

因此 React 会首先进行 **从上到下** 创建 fiber 节点,然后再从下到上生成 DOM节点,我们在上面逻辑可以看到,首先调用 **completeWork** 传入 **workInProgress** 创建 DOM 节点,然后会判断有没有兄弟节点,然后返回兄弟节点,那么又会回到 **beginWork** 创建 Fiber 节点,然后本节点创建完了 就会去判断有没有父节点 然后再去生成 DOM, 如同我们前面的 [例子](/react/workLoopSync.html#例子)

::: warning 👺
这里不得不感慨,React 这设计真的巧妙啊!!!
:::

这样一来,流程基本就串起来了,生成 Fiber树->生成DOM树,接下来看生成 DOM的方法 **completeWork**

## completeWork

[completeWork](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCompleteWork.js#L636) 会根据 ***workInProgress.tag*** 走不同的分支

```js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case Profiler:
    case ContextConsumer:
    case MemoComponent:
      return null;
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      return null;
    }
    ...
    // 创建DOM对象
    case HostComponent: {
        ...
    }
    // 创建文本
    case HostText: {
        ... 
    }
}
```

我们主要看 **HostComponent**,因为它是原生HTML元素。

## HostComponent

```js
    case HostComponent: {
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        );

        if (enableDeprecatedFlareAPI) {
          const prevListeners = current.memoizedProps.DEPRECATED_flareListeners;
          const nextListeners = newProps.DEPRECATED_flareListeners;
          if (prevListeners !== nextListeners) {
            markUpdate(workInProgress);
          }
        }

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);
        }
      } else {
        if (!newProps) {
          return null;
        }

        const currentHostContext = getHostContext();
        // TODO: Move createInstance to beginWork and keep it on a context
        // "stack" as the parent. Then append children as we go in beginWork
        // or completeWork depending on whether we want to add them top->down or
        // bottom->up. Top->down is faster in IE11.
        let wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          // TODO: Move this and createInstance step into the beginPhase
          // to consolidate.
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            // If changes to the hydrated node need to be applied at the
            // commit-phase we mark this as such.
            markUpdate(workInProgress);
          }
          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance,
              );
            }
          }
        } else {
          // 创建Dom对象
          let instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );

          // 把子树中的DOM对象append到本节点的instance之中
          appendAllChildren(instance, workInProgress, false, false);

          // This needs to be set before we mount Flare event listeners
          workInProgress.stateNode = instance;

          if (enableDeprecatedFlareAPI) {
            const listeners = newProps.DEPRECATED_flareListeners;
            if (listeners != null) {
              updateDeprecatedEventListeners(
                listeners,
                workInProgress,
                rootContainerInstance,
              );
            }
          }

          // 设置DOM对象的属性, 绑定事件等
          if (
            finalizeInitialChildren(
              instance,
              type,
              newProps,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            markUpdate(workInProgress);
          }
        }

        if (workInProgress.ref !== null) {
          // If there is a ref on a host node we need to schedule a callback
          markRef(workInProgress);
        }
      }
      return null;
    }
```

下章我们具体看下创建 DOM 的过程