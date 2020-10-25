# finishSyncRender

当 **DOM** 创建完毕,**workLoopSync** 的流程也走完了,会进入到 **commit**,调用 **finishSyncRender** 进入提交阶段

## commitRoot

```js
function finishSyncRender(root) {
  // Set this to null to indicate there's no in-progress render.
  workInProgressRoot = null;
  commitRoot(root);
}
```

**commitRoot** 调用了 **commitRootImpl** 并把当前任务优先级设置成最高,不可打断

```js
function commitRoot(root) {
  const renderPriorityLevel = getCurrentPriorityLevel();
  // 设置优先级为最高优先级
  runWithPriority(
    ImmediatePriority,
    commitRootImpl.bind(null, root, renderPriorityLevel),
  );
  return null;
}
```

## commitRootImpl

**commitRootImpl** 里面的代码非常多,它主要做了以下几件事情:
1. 更新FiberRoot对象上的属性

2. 处理finishedWork中的Effect

3. before mutaion

4. mutation  调用render(){}

5. after mutation 调用didmount

```js
  const finishedWork = root.finishedWork;
  const expirationTime = root.finishedExpirationTime;
  if (finishedWork === null) {
    return null;
  }
  // 更新FiberRoot对象上的属性
  root.finishedWork = null;
  root.finishedExpirationTime = NoWork;
```

处理副作用

```js
if (finishedWork.effectTag > PerformedWork) {
    // 把副作用给统一收集起来
    if (finishedWork.lastEffect !== null) {
        finishedWork.lastEffect.nextEffect = finishedWork;
        firstEffect = finishedWork.firstEffect;
    } else {
        firstEffect = finishedWork;
    }
} else {
    firstEffect = finishedWork.firstEffect;
}

if (firstEffect !== null) {
    nextEffect = firstEffect
    // ... 三个 while
}
```
在处理 Effect 过程里面有三个 **while** 循环,我简化了代码如下:

```js
    if (firstEffect !== null) {
        nextEffect = firstEffect
        // before mutaion.
        do {
            // 这里调用getSnapshotBeforeUpdate
            nextEffect = nextEffect.nextEffect;
            commitBeforeMutationEffects()
        } while (nextEffect != null);

        // 。。。
        nextEffect = firstEffect
        do {
            // mutation.更新到最新的Fiber状态
            commitMutationEffects()
            nextEffect = nextEffect.nextEffect;
        } while (nextEffect !== null);

        // work is current during componentDidMount/Update.
        root.current = finishedWork
        nextEffect = firstEffect;

        do {
            commitLayoutEffects()
            nextEffect = nextEffect.nextEffect;
        } while (nextEffect !== null);
    }   
```

这三个 **while** 循环分别做以下事情:

 * 第一个函数 用来执行 **getSnapshotBeforeUpdate**
 * 第二个函数 真正用来操作页面 将有更新的节点 该插入的**插入** 该更新的**更新** 该删除的**删除**
 * 第三个循环 执行剩余的**生命周期**

 ## commitBeforeMutationEffects

 第一个 **while** 循环我们看到调用了 **commitBeforeMutationEffects**,我们去看下:

 ```js
 function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if ((effectTag & Snapshot) !== NoEffect) {
      setCurrentDebugFiberInDEV(nextEffect);
      recordEffect();

      const current = nextEffect.alternate;
      commitBeforeMutationEffectOnFiber(current, nextEffect);

      resetCurrentDebugFiberInDEV();
    }
    if ((effectTag & Passive) !== NoEffect) {
      // If there are passive effects, schedule a callback to flush at
      // the earliest opportunity.
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
 ```

**commitBeforeMutationEffectOnFiber** 方法如下:

```js
function commitBeforeMutationLifeCycles(
  current: Fiber | null,
  finishedWork: Fiber,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent:
    case Block: {
      return;
    }
    case ClassComponent: {
      if (finishedWork.effectTag & Snapshot) {
        if (current !== null) {
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');
          const instance = finishedWork.stateNode;
          const snapshot = instance.getSnapshotBeforeUpdate(
            finishedWork.elementType === finishedWork.type
              ? prevProps
              : resolveDefaultProps(finishedWork.type, prevProps),
            prevState,
          );
          ...
          instance.__reactInternalSnapshotBeforeUpdate = snapshot;
          stopPhaseTimer();
        }
      }
      return;
    }
    case HostRoot:
    case HostComponent:
    case HostText:
    case HostPortal:
    case IncompleteClassComponent:
      // Nothing to do for these component types
      return;
  }
}
```
可以看到只有是 **ClassComponent** 时才会执行 **getSnapshotBeforeUpdate** 生命周期

## commitMutationEffects

第二个 **while** 会执行 **commitMutationEffects** 方法 如下:

```js
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {
  // TODO: Should probably move the bulk of this function to commitWork.
  while (nextEffect !== null) {
    setCurrentDebugFiberInDEV(nextEffect);

    const effectTag = nextEffect.effectTag;

    if (effectTag & ContentReset) {
      commitResetTextContent(nextEffect);
    }

    if (effectTag & Ref) {
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }

    let primaryEffectTag =
      effectTag & (Placement | Update | Deletion | Hydrating);
    switch (primaryEffectTag) {
      case Placement: {
        commitPlacement(nextEffect);
        nextEffect.effectTag &= ~Placement;
        break;
      }
      case PlacementAndUpdate: {
        // Placement
        commitPlacement(nextEffect);
        // Clear the "placement" from effect tag so that we know that this is
        // inserted, before any life-cycles like componentDidMount gets called.
        nextEffect.effectTag &= ~Placement;

        // Update
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Hydrating: {
        nextEffect.effectTag &= ~Hydrating;
        break;
      }
      case HydratingAndUpdate: {
        nextEffect.effectTag &= ~Hydrating;

        // Update
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Update: {
        const current = nextEffect.alternate;
        commitWork(current, nextEffect);
        break;
      }
      case Deletion: {
        commitDeletion(root, nextEffect, renderPriorityLevel);
        break;
      }
    }

    // TODO: Only record a mutation effect if primaryEffectTag is non-zero.
    recordEffect();

    resetCurrentDebugFiberInDEV();
    nextEffect = nextEffect.nextEffect;
  }
}
```

可以看到会根据不同的副作用进行不同的 **commitPlacement** 或者 **commitWork** 操作,但是删除操作 **Deletion** 是唯独调用的 **commitDeletion**

### commitPlacement

来看看初次新增的情况是怎么提交的:

```js
function commitPlacement(finishedWork: Fiber): void {
  if (!supportsMutation) {
    return;
  }

  // Recursively insert all host nodes into the parent.
  const parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  let parent;
  let isContainer;
  const parentStateNode = parentFiber.stateNode;
  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      isContainer = false;
      break;
    case HostRoot:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break;
    case HostPortal:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break;
    case FundamentalComponent:
      if (enableFundamentalAPI) {
        parent = parentStateNode.instance;
        isContainer = false;
      }
    // eslint-disable-next-line-no-fallthrough
    default:
        ...
  }
  if (parentFiber.effectTag & ContentReset) {
    // Reset the text content of the parent before doing any insertions
    resetTextContent(parent);
    // Clear ContentReset from the effect tag
    parentFiber.effectTag &= ~ContentReset;
  }

  const before = getHostSibling(finishedWork);
  // We only have the top Fiber that was inserted but we need to recurse down its
  // children to find all the terminal nodes.
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}
```
根据 **isContainer** 分别调用 **insertOrAppendPlacementNodeIntoContainer** 和 **insertOrAppendPlacementNode** 看下 **insertOrAppendPlacementNode** 代码:

```js
function insertOrAppendPlacementNode(
  node: Fiber,
  before: ?Instance,
  parent: Instance,
): void {
  const {tag} = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost || (enableFundamentalAPI && tag === FundamentalComponent)) {
    const stateNode = isHost ? node.stateNode : node.stateNode.instance;
    if (before) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  } else if (tag === HostPortal) {
    // If the insertion itself is a portal, then we don't want to traverse
    // down its children. Instead, we'll get insertions from each child in
    // the portal directly.
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}
```
插入过程大致如下:
先找到一个能插进来的父节点,再找能往父节点插的节点,然后再找有没有可插入的兄弟节点 直到根节点 **root** 该流程结束,具体代码去看吧 🐶

### Update
Update 标签时会调用 **commitWork** 来进行更新,[commitWork](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L1365) 方法也是根据不同的 **Tag** 来处理不同的更新,我们主要来看下 **HostComponent** 和 **HostText**

```js
    ...
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode;
      if (instance != null) {
        // Commit the work prepared earlier.
        const newProps = finishedWork.memoizedProps;
        // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        // TODO: Type the updateQueue to be specific to host components.
        const updatePayload: null | UpdatePayload = (finishedWork.updateQueue: any);
        finishedWork.updateQueue = null;
        if (updatePayload !== null) {
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
            finishedWork,
          );
        }
        if (enableDeprecatedFlareAPI) {
          const prevListeners = oldProps.DEPRECATED_flareListeners;
          const nextListeners = newProps.DEPRECATED_flareListeners;
          if (prevListeners !== nextListeners) {
            updateDeprecatedEventListeners(nextListeners, finishedWork, null);
          }
        }
      }
      return;
    }
    case HostText: {
      const textInstance: TextInstance = finishedWork.stateNode;
      const newText: string = finishedWork.memoizedProps;
      // For hydration we reuse the update path but we treat the oldProps
      // as the newProps. The updatePayload will contain the real change in
      // this case.
      const oldText: string =
        current !== null ? current.memoizedProps : newText;
      commitTextUpdate(textInstance, oldText, newText);
      return;
    }
    ...
```

其实 **commitUpdate** 方法定义在 **react-dom** 里面 [代码](https://github.com/facebook/react/blob/v16.13.0/packages/react-dom/src/client/ReactDOMHostConfig.js#L390)

```js
export function commitUpdate(
  domElement: Instance,
  updatePayload: Array<mixed>,
  type: string,
  oldProps: Props,
  newProps: Props,
  internalInstanceHandle: Object,
): void {
  // Update the props handle so that we know which props are the ones with
  // with current event handlers.
  updateFiberProps(domElement, newProps);
  // Apply the diff to the DOM node.
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
}
```

其中 **updateProperties** 就分别对 **input**/**textarea**/**select** 做了不同的处理,自己去看吧


**commitTextUpdate** 就比较简单了
```js
export function commitTextUpdate(
  textInstance: TextInstance,
  oldText: string,
  newText: string,
): void {
  textInstance.nodeValue = newText;
}
```
直接给节点设置新的 text

### Deletion

删除节点会调用 [commitDeletion](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L1340) 方法,会做两件事情:
1. 删除对应的真实 DOM 节点

2. 删除 Fiber 数据

```js
function commitDeletion(
  finishedRoot: FiberRoot,
  current: Fiber,
  renderPriorityLevel: ReactPriorityLevel,
): void {
  if (supportsMutation) {
    // Recursively delete all host nodes from the parent.
    // Detach refs and call componentWillUnmount() on the whole subtree.
    unmountHostComponents(finishedRoot, current, renderPriorityLevel);
  } else {
    // Detach refs and call componentWillUnmount() on the whole subtree.
    commitNestedUnmounts(finishedRoot, current, renderPriorityLevel);
  }
  detachFiber(current);
}
```
当走 **unmountHostComponents** 方法时会去 调用 **removeChildFromContainer**/**removeChild** 方法进行删除,并且会调用 [commitUnmount](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L770) 进行生命周期卸载,可以看到 **ClassComponent** 会调用 [callComponentWillUnmountWithTimer](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L174) 方法执行 **componentWillUnmount**

```js
const callComponentWillUnmountWithTimer = function(current, instance) {
  startPhaseTimer(current, 'componentWillUnmount');
  instance.props = current.memoizedProps;
  instance.state = current.memoizedState;
  instance.componentWillUnmount();
  stopPhaseTimer();
};
```

对应的方法都贴出来了,自己看吧

删除完 DOM 后也会对 Fiber 结构进行删除,[detachFiber](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L937)

```js

function detachFiber(current: Fiber) {
  const alternate = current.alternate;
  // Cut off the return pointers to disconnect it from the tree. Ideally, we
  // should clear the child pointer of the parent alternate to let this
  // get GC:ed but we don't know which for sure which parent is the current
  // one so we'll settle for GC:ing the subtree of this child. This child
  // itself will be GC:ed when the parent updates the next time.
  current.return = null;
  current.child = null;
  current.memoizedState = null;
  current.updateQueue = null;
  current.dependencies = null;
  current.alternate = null;
  current.firstEffect = null;
  current.lastEffect = null;
  current.pendingProps = null;
  current.memoizedProps = null;
  current.stateNode = null;
  if (alternate !== null) {
    detachFiber(alternate);
  }
}
```

## commitLayoutEffects

```js
function commitLayoutEffects(
  root: FiberRoot,
  committedExpirationTime: ExpirationTime,
) {
  // TODO: Should probably move the bulk of this function to commitWork.
  while (nextEffect !== null) {
    setCurrentDebugFiberInDEV(nextEffect);

    const effectTag = nextEffect.effectTag;

    if (effectTag & (Update | Callback)) {
      recordEffect();
      const current = nextEffect.alternate;
      commitLayoutEffectOnFiber(
        root,
        current,
        nextEffect,
        committedExpirationTime,
      );
    }

    if (effectTag & Ref) {
      recordEffect();
      commitAttachRef(nextEffect);
    }

    resetCurrentDebugFiberInDEV();
    nextEffect = nextEffect.nextEffect;
  }
}
```

递归处理 **Effect**,调用 [commitLayoutEffectOnFiber](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberCommitWork.js#L443) 主要做两件事情:


1. 执行didMount/didUpdate生命周期

2. 执行commitUpdateQueue，调用callCallback

```js
function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedExpirationTime: ExpirationTime,
): void {
  switch (finishedWork.tag) {
    ...
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          startPhaseTimer(finishedWork, 'componentDidMount');
          instance.componentDidMount();
          stopPhaseTimer();
        } else {
          const prevProps =
            finishedWork.elementType === finishedWork.type
              ? current.memoizedProps
              : resolveDefaultProps(finishedWork.type, current.memoizedProps);
          const prevState = current.memoizedState;
          startPhaseTimer(finishedWork, 'componentDidUpdate');

          instance.componentDidUpdate(
            prevProps,
            prevState,
            instance.__reactInternalSnapshotBeforeUpdate,
          );
          stopPhaseTimer();
        }
      }
      const updateQueue = finishedWork.updateQueue;
      if (updateQueue !== null) {
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
    case HostRoot: {
      const updateQueue = finishedWork.updateQueue;
      if (updateQueue !== null) {
        let instance = null;
        if (finishedWork.child !== null) {
          switch (finishedWork.child.tag) {
            case HostComponent:
              instance = getPublicInstance(finishedWork.child.stateNode);
              break;
            case ClassComponent:
              instance = finishedWork.child.stateNode;
              break;
          }
        }
        commitUpdateQueue(finishedWork, updateQueue, instance);
      }
      return;
    }
}
```

当为 **ClassComponent** 时,初次渲染时执行 **componentDidMount** 改变有修改时候执行 **componentDidUpdate** 传入 **prevProps** 和 **prevState**


**commitUpdateQueue** 循环执行 里面的 **effects**
```js
export function commitUpdateQueue<State>(
  finishedWork: Fiber,
  finishedQueue: UpdateQueue<State>,
  instance: any,
): void {
  // Commit the effects
  const effects = finishedQueue.effects;
  finishedQueue.effects = null;
  if (effects !== null) {
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      const callback = effect.callback;
      if (callback !== null) {
        effect.callback = null;
        callback.call(instance);
      }
    }
  }
}
```

至此 React  初次渲染流程差不多就完了,中间至于异步的打断恢复过程还没去研究 🥱