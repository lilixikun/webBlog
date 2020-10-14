# HostComponent

上一章我们说了 beginwork 根据不同的 tag 走不同的分支,说了 [HostRoot](/react/beginWork.html#updatehostroot) 的流程,现在来看看 **HostComponent** 的fiber创建，**HostComponent** 就是原生的 HTML 标签

## updateHostComponent

```js
function updateHostComponent(current, workInProgress, renderExpirationTime) {
  pushHostContext(workInProgress);

  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }

  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also has access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // If we're switching from a direct text child to a normal child, or to
    // empty, we need to schedule the text content to be reset.
    workInProgress.effectTag |= ContentReset;
  }

  markRef(current, workInProgress);

  // Check the host config to see if the children are offscreen/hidden.
  if (
    workInProgress.mode & ConcurrentMode &&
    renderExpirationTime !== Never &&
    shouldDeprioritizeSubtree(type, nextProps)
  ) {
    if (enableSchedulerTracing) {
      markSpawnedWork(Never);
    }
    // Schedule this fiber to re-render at offscreen priority. Then bailout.
    workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
    return null;
  }

  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  );
  return workInProgress.child;
}
```

1. 调用tryToClaimNextHydratableInstance进行hydrate操作

2. 取出新老属性以及新的children

3. 调用shouldSetTextContext判断是否需要进行文本内容设置，比如textarea、option等。参考下文的shouldSetTextContext

4. 调用markRef标记ref，参考下文的markRef

5. 检查优化children，参考下文的shouldDeprioritizeSubtree

6. 调用reconcileChildren调和子节点

7. 返回workInProgress.child

## shouldSetTextContent

方法定义在文件packages/react-dom/src/client/ReactDOMHostConfig.js中


```js
export function shouldSetTextContent(type: string, props: Props): boolean {
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}
```

方法很简单, 其实关于 **ref** 部分的,我打算放在最后面再去看,结尾就是调用了 **reconcileChildren**, 这就回到了我们之前在看 **HostRoot** 的时候一样的流程 [reconcileChildren](/react/beginWork.html#reconcilechildren)