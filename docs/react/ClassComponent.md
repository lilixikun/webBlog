# ClassComponent

在 **begininWork** 中当 workInProgress.tag 为 **ClassComponent** 时

## 合并属性

```js
case ClassComponent: {
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps;
    const resolvedProps =
    workInProgress.elementType === Component
        ? unresolvedProps
        : resolveDefaultProps(Component, unresolvedProps);
    // render和render之前的生命周期函数会在这里执行
    return updateClassComponent(
    current,
    workInProgress,
    Component,
    resolvedProps,
    renderExpirationTime,
    );
}
```

首先就是合并 **props**

```js
export function resolveDefaultProps(Component: any, baseProps: Object): Object {
  if (Component && Component.defaultProps) {
    // Resolve default props. Taken from ReactElement
    const props = Object.assign({}, baseProps);
    const defaultProps = Component.defaultProps;
    for (let propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
    return props;
  }
  return baseProps;
}
```

当 **Component.defaultProps** 上有 默认属性时就和原本的 **workInProgress.pendingProps** 进行合并 然后 调用 **updateClassComponent**

## updateClassComponent

```js
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps,
  renderExpirationTime: ExpirationTime,
) {
  let hasContext;
  if (isLegacyContextProvider(Component)) {
    hasContext = true;
    pushLegacyContextProvider(workInProgress);
  } else {
    hasContext = false;
  }
  prepareToReadContext(workInProgress, renderExpirationTime);
  // 指向的当前的实例
  const instance = workInProgress.stateNode;
  let shouldUpdate;
  if (instance === null) {
    if (current !== null) {
      current.alternate = null;
      workInProgress.alternate = null;
      // Since this is conceptually a new fiber, schedule a Placement effect
      workInProgress.effectTag |= Placement;
    }
    // In the initial pass we might need to construct the instance.
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
    shouldUpdate = true;
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
  } else {
    // 执行render之前的生命周期，render之后的生命周期打上tag标记
    // 来避免没有必要的渲染，shouldUpdate会给到finishClassComponent，来判断
    // 是否需要执行render()生命周期
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderExpirationTime,
    );
  }
  // 执行render() 生周期，获取下一个子节点
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderExpirationTime,
  );
  return nextUnitOfWork;
}
```

首先会判断是否有 stateNode 示例,也就是真实 DOM,如何不存在会调用 [constructClassInstance](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L544) 进行 <font color='red'>new</font> 操作

```js
    ...
  const instance = new ctor(props, context);
  const state = (workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined
      ? instance.state
      : null);
  adoptClassInstance(workInProgress, instance);
```

接下来会调用 [mountClassInstance](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L768) 运行 **render** 阶段的生命周期

```js
function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderExpirationTime: ExpirationTime,
): void {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  initializeUpdateQueue(workInProgress);

  const contextType = ctor.contextType;
  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType);
  } else if (disableLegacyContext) {
    instance.context = emptyContextObject;
  } else {
    const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    instance.context = getMaskedContext(workInProgress, unmaskedContext);
  }

  processUpdateQueue(workInProgress, newProps, instance, renderExpirationTime);
  instance.state = workInProgress.memoizedState;

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    );
    instance.state = workInProgress.memoizedState;
  }

  // In order to support react-lifecycles-compat polyfilled components,
  // Unsafe lifecycles should not be invoked for components using the new APIs.
  if (
    typeof ctor.getDerivedStateFromProps !== 'function' &&
    typeof instance.getSnapshotBeforeUpdate !== 'function' &&
    (typeof instance.UNSAFE_componentWillMount === 'function' ||
      typeof instance.componentWillMount === 'function')
  ) {
    callComponentWillMount(workInProgress, instance);
    // If we had additional state updates during this life-cycle, let's
    // process them now.
    processUpdateQueue(
      workInProgress,
      newProps,
      instance,
      renderExpirationTime,
    );
    instance.state = workInProgress.memoizedState;
  }

  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update;
  }
}
```
1. 首先会初始化创建一个 **UpdateQueue**
2. 判断有没有 **getDerivedStateFromProps**,有就执行 [applyDerivedStateFromProps](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L829)
3. 判断有没有 **componentWillMount**,有就执行 [callComponentWillMount](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L707)

## updateClassInstance
初次渲染看完了 现在来看看 [updateClassInstance](https://github.com/facebook/react/blob/v16.13.0/packages/react-reconciler/src/ReactFiberClassComponent.js#L999)


在这里面会进行新老 props 的对比判断,然后会触发 **callComponentWillReceiveProps** 和 **applyDerivedStateFromProps** 等生命周期,关键代码:

```js
  const shouldUpdate =
    checkHasForceUpdateAfterProcessing() ||
    checkShouldComponentUpdate(
      workInProgress,
      ctor,
      oldProps,
      newProps,
      oldState,
      newState,
      nextContext,
    );
```

来看看 **checkShouldComponentUpdate** 方法


### shouldUpdate

```js
function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext,
) {
  const instance = workInProgress.stateNode;
  if (typeof instance.shouldComponentUpdate === 'function') {
    startPhaseTimer(workInProgress, 'shouldComponentUpdate');
    const shouldUpdate = instance.**shouldComponentUpdate**(
      newProps,
      newState,
      nextContext,
    );
    stopPhaseTimer();
    return shouldUpdate;
  }

  if (ctor.prototype && ctor.prototype.isPureReactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    );
  }

  return true;
}
```

可以看到它会读取 我们平常写的 **shouldComponentUpdate** 的返回结果,如果是 **PureReactComponent** 的话它会自动帮我们进行浅对比

然后在 **updateClassInstance** 里面可以看到对 **shouldUpdate** 做了不同的处理

```js
if (shouldUpdate) {
  ...
  if (
    !hasNewLifecycles &&
    (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
      typeof instance.componentWillUpdate === 'function')
  ) {
    startPhaseTimer(workInProgress, 'componentWillUpdate');
    if (typeof instance.componentWillUpdate === 'function') {
      instance.componentWillUpdate(newProps, newState, nextContext);
    }
    if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
      instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
    }
    stopPhaseTimer();
  }
  if (typeof instance.componentDidUpdate === 'function') {
    workInProgress.effectTag |= Update;
  }
  if (typeof instance.getSnapshotBeforeUpdate === 'function') {
    workInProgress.effectTag |= Snapshot;
  }
}else{
  ...
}
```

## finishClassComponent
上面流程走走完后会,会执行最后的方法 **finishClassComponent**,它的最主要作用就是 执行 **render** 方法获取下一个子节点,看到这里有没有很熟悉呢,这也是为什么 class 组件必须要有 **rendr** 方法了

```js
... 
  // fiber.stateNode指向这个新的实例
  const instance = workInProgress.stateNode;
  ReactCurrentOwner.current = workInProgress;
  let nextChildren;
  ...
  nextChildren = instance.render();

    workInProgress.effectTag |= PerformedWork;
  if (current !== null && didCaptureError) {
    forceUnmountCurrentAndReconcile(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
  } else {
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    );
  }
  workInProgress.memoizedState = instance.state;
  return workInProgress.child;
```

可以看到首先获取 fiber 的实例 **stateNode** ,执行 **rendr** 获取下一个子节点, 然后执行前面说的 **reconcileChildren** 继续创建 fiber 节点,然后会把实例的state 同步到 **memoizedState** 上 最后返回 **workInProgress.child**,又会回到和 我们 **/react/beginWork.html#updatehostroot** 流程一样