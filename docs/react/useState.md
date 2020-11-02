# useState

React 16 之后出现了Hooks 可以让我们在函数组件中拥有自己的 "state",基本API 就是 **useState**

## mountState

```js
// 第一次执行函数体的时候
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  // 1. 默认值是function，执行function，得到初始state
  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }
  // 2. state是存放在memoizedState
  hook.memoizedState = hook.baseState = initialState;
  // 3. 新建一个quene
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  });
  // 4. 把queue传递给dispatch
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  // 5. 返回默认值和dispatch
  return [hook.memoizedState, dispatch];
}
```
**mountWorkInProgressHook** 方法会创建一个 hook 的链表,如果多次 **useState** 就会形成一条链表,该函数返回一个数组,包含 初始值,以及一个修改值的方法


## dispatchAction

[dispatchAction](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberHooks.js#L1263),当我们每调用一次 setCount(2);setCount((count) => count++) 就会执行以下:

1. 创建一个update, 添加到queue.pending链表中
2. 提前计算出最新的state，保存在eagerState
3. 最后调用一次 scheduleWork ,进入调度，触发function重新执行一次 

可以看到这个过程和 setState 其实很想，都是创建 update 添加到 链表中,然后最后执行 **scheduleWork** 直接调度

## updateState
 
**updateState** 就是一个 reducer的语法糖,会调用 **updateReducer**

```js
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}
```

## updateReducer

[updateReducer](https://github.com/facebook/react/blob/v16.13.1/packages/react-reconciler/src/ReactFiberHooks.js#L655) 方法会  **递归执行quene里的update，计算最新的state，赋值给memoizedState**

```js
 ...
 hook.memoizedState = newState;
 ...
 const dispatch: Dispatch<A> = (queue.dispatch: any);
 return [hook.memoizedState, dispatch];
```

## 提问

为什么 hooks 的 **useState** / **useEffect** 不能添加条件来渲染

根据源码可以看到 hooks 的调用是一个 链表,依次遍历执行,如果因为某个条件 会导致 hooks 的链表位置发生错乱。 因此, React 规定 Hooks 不能在循环，条件，嵌套函数等中调用useState(). 在多个useState()调用中，渲染之间的调用顺序必须相同。