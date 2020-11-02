# memo

## 定义

**memo** 源码也是非常简单如下:

```js
export default function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean,
) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  };
}
```

**React.memo** 是一个高阶组件，它和 **React.PureComponent** 非常相似,但是只适用于函数组件

**memo** 的定义很简单，传入两个参数，第一个是 React 组件，第二个是一个比较函数，函数参数是旧的 props 和新的 props，返回值是 boolean，如果为 true 表示该组件不需要重新渲染，如果为 false 表示重新渲染该组件

**默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。**

## updateMemoComponent

标记了 tag 后在 **begninWork** 中会走到 **MemoComponent** 里面调用 **updateMemoComponent** 方法如下:

```js
function updateMemoComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  updateExpirationTime,
  renderExpirationTime: ExpirationTime,
): null | Fiber {

  // 省略...
  let currentChild = ((current.child: any): Fiber); 
  if (updateExpirationTime < renderExpirationTime) {
    const prevProps = currentChild.memoizedProps;
    // Default to shallow comparison
    let compare = Component.compare;
    compare = compare !== null ? compare : shallowEqual;
    if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderExpirationTime,
      );
    }
  }
  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  let newChild = createWorkInProgress(currentChild, nextProps);
  newChild.ref = workInProgress.ref;
  newChild.return = workInProgress;
  workInProgress.child = newChild;
  return newChild;
}
```

可以看到如果我们传入了自定义的比较那么就会走自己的,否则就会走 默认的 **shallowEqual** 进行浅比较,然后自己走 
**bailoutOnAlreadyFinishedWork** 执行 **cloneChildFibers** 进行复用 返回 **workInProgress**