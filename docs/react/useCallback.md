# useCallback

React 的Hooks的方法都分为创建和更新阶段,代码如下,非常的简洁:

## mountCallback

```js
function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```
**callback** 就是我们传进去的函数,**deps** 就是依赖的参数

## updateCallback

```js
function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

第一次看到 **callback** 的实现我以为我眼睛花了,因为它和 [useMemo](/react/useMemo.html) 简直一模一样,唯一区别 **useMemo** 返回了函数执行的值,而 **callback** 是直接返回了整个函数. 个人猜想一个是为了复用值,一个是为了复用函数,如回调函数 而这样设计的吧!🐱