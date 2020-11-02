# useEffect

## mountEffect

代码合并下如下:

```js
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {

  const hook = mountWorkInProgressHook();
  // 依赖数组, 强烈杜绝不写依赖数组
  const nextDeps = deps === undefined ? null : deps;
  // 设置effectTag
  currentlyRenderingFiber.effectTag |= UpdateEffect | PassiveEffect,;

  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    undefined,
    nextDeps,
  );
}
```

**mountWorkInProgressHook** 会创建一个 hooks 链表如下：

```js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

Hooks作为一个链表存储在fiber的 **memoizedState** 中。



**pushEffect** 方法如下,会创建一个 **Effect** 加入到 currentlyRenderingFiber.updateQueue 中

```js
function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy, // undefined
    deps,
    // Circular
    next: (null: any),
  };
  // 把effect 添加到链表的最后
  // componentUpdateQueue 会被作为 currentlyRenderingFiber.updateQueue 参与到compleleRoot中
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  // 一个全局变量，在renderWithHooks里初始化一下，存储全局最新的副作用
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}

```

所以 **mountEffect** 就是把 **useEffect** 加入了hook链表中，并且单独维护了一个 **useEffect**的链表。



## updateEffect

```js
function updateEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return updateEffectImpl(
    UpdateEffect | PassiveEffect,
    HookPassive,
    create,
    deps,
  );
}
```

```js
function updateEffectImpl(fiberEffectTag, hookEffectTag, create, deps): void {
	// 获取当前正在工作的hook
  const hook = updateWorkInProgressHook();
  // 最新的依赖项
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
	
  if (currentHook !== null) {
  // 上一次的hook的effect
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      // 比较依赖项是否发生变化
      if (areHookInputsEqual(nextDeps, prevDeps)) {
      // 如果两次依赖项相同，componentUpdateQueue增加一个tag为NoHookEffect = 0 的effect，
        pushEffect(NoHookEffect, create, destroy, nextDeps);
        return;
      }
    }
  }
	// 两次依赖项不同，componentUpdateQueue上增加一个effect，并且更新当前hook的memoizedState值
  currentlyRenderingFiber.effectTag |= fiberEffectTag;
  hook.memoizedState = pushEffect(hookEffectTag , create, destroy, nextDeps);
}
```

::: warning
这一段有个重点： useEffect的依赖项没变化的时候，componentUpdateQueue增加一个tag为 **NoHookEffect**
= 0 的effect
:::

**currentlyRenderingFiber** 表示我们正在进行渲染的节点，它来自于workInProgress，在 **renderWithHooks** 函数里面可以看到赋值, current表示已经渲染的节点。

## useEffect 执行阶段

**useEffect** 什么时候执行，这得从react的函数组件的生命周期相关的调度开始。


在fiber的调度过程中，最终追溯到 **commitBeforeMutationLifeCycles** 方法里面执行 **commitLayoutEffects** 在这里会根据组件类型，去执行对应的生命周期，FunctionComponent组件执行 **commitHookEffectListMount**方法

```js

function commitHookEffectListMount(tag: number, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  // 有更新队列
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    // 遍历所有的effect
    do {
      if ((effect.tag & tag) === tag) {
        // Mount
        const create = effect.create;
        effect.destroy = create();
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

在卸载时调用 **commitHookEffectListUnmount**

```js
function commitHookEffectListUnmount(tag: number, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  let lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & tag) === tag) {
        // Unmount
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          destroy();
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

所以如果您真的有需要去模拟一个像之前的componentDidMount和componentWillUnmount的生命周期，那么最好用上一个单独的Effect:

```js
useEffect(()=>{
  // 加载时的逻辑
  return ()=>{
    // 卸载时的逻辑
  }
},[])
```

这里用[]作为依赖数组，是因为这样依赖就不会变动，也就是只在加载时执行一次加载逻辑，卸载时执行一次卸载逻辑。

不加依赖数组时，那么每次渲染都会执行一次加载和卸载。

## 如何区分是didMount还是didUpdate？


我们在末尾指定 [] 以表示它只运行一次。相当于 **componentDidMount**

[visible] 当数组里面有值时,就会进行对比,如果值改变就会重新触发 回调函数的执行, 相当与 **componentDidUpdate**

当没有依赖为 null 时,

```js
import {useEffect} from "React";

const App = (props) => {
 useEffect(()=> {
   // 这基本上是componentDidMount + componentDidUpdate的组合
   // 它在componentDidMount上执行一次，并且在任何状态变量从useState更新时执行
 });
}
```
这时候相当于 **componentDidMount** 和 **componentDidUpdate** 全部结合在一起。

## 总结

1. 有两个参数 callback 和 dependencies 数组

2. 如果 dependencies 不存在，那么 callback 每次 render 都会执行

3. 如果 dependencies 存在，只有当它发生了变化， callback 才会执行