# ReactDOM.render

React 创建更新的三种方式
- ReactDOM.render || hydrate
- setState
- forceUpdate

我们在编写 **React** 程序时,都会类似一下代码

```js
ReactDOM.render(<App />, document.getElementById('root'));
```

这是React渲染的入口方法

## ReactDOM

**ReactDOM** 定义在文件 **packages/react-dom/src/client/ReactDOM.js**中。
 
在 **react-dom/client/ReactDOM.js** 可以看到导出了 **render** 等方法
```js
import {
  findDOMNode,
  render,
  hydrate,
  unstable_renderSubtreeIntoContainer,
  unmountComponentAtNode,
} from './ReactDOMLegacy';
```


我们在 **ReactDOMLegacy.js** 找到 render 方法如下:

## render
```js
export function render(
  element: React$Element<any>,
  container: Container,
  callback: ?Function,
) {
  invariant(
    isValidContainer(container),
    'Target container is not a DOM element.',
  );
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
}
```

可以看到返回了一个 **legacyRenderSubtreeIntoContainer**执行的结果,现在我们再去看看这个方法

```js
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: Container,
  forceHydrate: boolean,
  callback: ?Function,
) {
  // TODO: Without `any` type, Flow says "Property cannot be accessed on any
  // member of intersection type." Whyyyyyy.
  let root: RootType = (container._reactRootContainer: any);
  let fiberRoot;
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    );
    fiberRoot = root._internalRoot;
    // 封装了callBack函数
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    // 初始化不走批处理逻辑,为了快
    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    fiberRoot = root._internalRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        const instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    }
    // Update
    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}
```

由render方法传进来的参数如下:
| 参数名        | 参数值           | 含义  |
| ------------- |:-------------:| -----:|
| parentComponent  | null |  父组件 |
| children      | element    |  待渲染的元素即我们传如的<App /> |
| container     | container      |   渲染元素的容器 <div id="" root></div> |
| forceHydrate  | false      |  是否服务的渲染 

1. 第一次进入 **root** 为undefined 创建 ReactRoot,调用了**legacyCreateRootFromDOMContainer** 方法,并 赋值给了 **root** 和 **container._reactRootContainer**

2. 取出 **root._internalRoot** 并赋值给 **fiberRoot**, 

3. 如果有 **callback** 对他进行一次封装

4. 初始化执行 **unbatchedUpdates** 并执行 **updateContainer**

5. 非初始化直接执行 **updateContainer**,并传入上面赋值的 fiberRoot 等参数

6. 返回 **getPublicRootInstance** 调用的结果

OK,我们现在来看看 **legacyCreateRootFromDOMContainer** 干了什么

```js

function legacyCreateRootFromDOMContainer(
  container: Container,
  forceHydrate: boolean,
): RootType {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // First clear any existing content.
  if (!shouldHydrate) {
    let warned = false;
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  return createLegacyRoot(
    container,
    shouldHydrate
      ? {
          hydrate: true,
        }
      : undefined,
  );
}
```

1. 判断是不是服务端渲染,很明显这是是false
2. 执行一个循环 移除 container 的子元素
3. 返回 **createLegacyRoot** 执行的结果

我们在 **ReactDOMRoot.js** 中看看 createLegacyRoot 干了啥

```js
export function createLegacyRoot(
  container: Container,
  options?: RootOptions,
): RootType {
  return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}
```

看来也没干啥,直接返回 **ReactDOMBlockingRoot** 类的实例对象。

```js
function ReactDOMBlockingRoot(
  container: Container,
  tag: RootTag,
  options: void | RootOptions,
) {
  this._internalRoot = createRootImpl(container, tag, options);
}
```

同时我们发现 **ReactDOMRoot** 和 **ReactDOMBlockingRoot** 类似

```js
function ReactDOMRoot(container: Container, options: void | RootOptions) {
  this._internalRoot = createRootImpl(container, ConcurrentRoot, options);
}
```
并且他们挂载原型的方法也是一样的


```js
ReactDOMRoot.prototype.render = ReactDOMBlockingRoot.prototype.render = function(
  children: ReactNodeList,
): void {
  const root = this._internalRoot;
  updateContainer(children, root, null, null);
};

ReactDOMRoot.prototype.unmount = ReactDOMBlockingRoot.prototype.unmount = function(): void {
  const root = this._internalRoot;
  const container = root.containerInfo;
  updateContainer(null, root, null, () => {
    unmarkContainerAsRoot(container);
  });
};
```

为啥一样现在我们先不讨论,去看 **createRootImpl** 的实现

```js
function createRootImpl(
  container: Container,
  tag: RootTag,
  options: void | RootOptions,
) {
  // Tag is either LegacyRoot or Concurrent Root
  const hydrate = options != null && options.hydrate === true;
  const hydrationCallbacks =
    (options != null && options.hydrationOptions) || null;
  const root = createContainer(container, tag, hydrate, hydrationCallbacks);
  markContainerAsRoot(root.current, container);
  if (hydrate && tag !== LegacyRoot) {
    const doc =
      container.nodeType === DOCUMENT_NODE
        ? container
        : container.ownerDocument;
    eagerlyTrapReplayableEvents(container, doc);
  }
  return root;
}
```

此方法最重要的功能就是调用 **createContainer** 创建root并返回。

```js
import {createContainer, updateContainer} from 'react-reconciler/inline.dom';
```

我们去 **react-reconciler/src/ReactFiberReconciler.js** 找到 **createContainer** 方法

## createContainer

```js
export function createContainer(
  containerInfo: Container,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
): OpaqueRoot {
  return createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks);
}


export function createFiberRoot(
  containerInfo: any,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
): FiberRoot {
  const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any);
  if (enableSuspenseCallback) {
    root.hydrationCallbacks = hydrationCallbacks;
  }

  // 创建第一个FiberNode
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```

可以看到 直接返回一个创建的 **FiberRoot** 对象

到此我们上面的创建过程就走完,过程如下

创建 **ReactRoot** 的过程中创建了 **FiberRoot**,挂载在了 dom 元素 _reactRootContainer 上, 从 **new ReactDOMBlockingRoot** 的 **_internalRoot** 取出创建的 **FiberRoot** 并赋值给了 fiberRoot

## unbatchedUpdates

然后执行 **unbatchedUpdates**,初始化不走批处理,为了快,也在 **react-reconciler/src/ReactFiberReconciler.js** 文件


```js
export function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {

  const prevExecutionContext = executionContext;
  // 按位操作
  executionContext &= ~BatchedContext;
  executionContext |= LegacyUnbatchedContext;

  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      // Flush the immediate callbacks that were scheduled during this batch
      flushSyncCallbackQueue();
    }
  }
}
```

## updateContainer

在 **unbatchedUpdates** 调用 **updateContainer**,

```js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): ExpirationTime {
  // FiberNode 
  const current = container.current;
  // 通过 msToExpirationTime 得到currentTime  Date.now()
  const currentTime = requestCurrentTimeForUpdate();
 
  // 当前批量更新的配置, 是一个全局对象
  const suspenseConfig = requestCurrentSuspenseConfig();
  // 根据给任务分优先级，来得到不同的过期时间
  const expirationTime = computeExpirationForFiber(
    currentTime,
    current,
    suspenseConfig,
  );

  const update = createUpdate(expirationTime, suspenseConfig);
  // Caution: React DevTools currently depends on this property
  // being called "element".
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }
  // update 添加到 fiber.updateQuene链表
  enqueueUpdate(current, update);
  // 调度和更新当前current对象(HostRootFiber)
  scheduleWork(current, expirationTime);

  return expirationTime;
}
```

updateContainer 做了以下几件事情
1. 拿到 FiberNode
2. 设置 expirationTime,过期时间,并设置优先级
3. 新建一个 uodate 并添加到 enqueueUpdate 里面
4. 执行调度 scheduleWork

## 总结
- 创建 ReactRoot
- 创建 ReactRoot 会调用 createContainer 创建 FiberRoot
- 调用 unbatchUpdate 非批处理
- 调用 updateContainer
- 设置 expirationTime 超时时间
- React.render 或者 setState 会生成一个 update,赋值给Fiber.updateQueue
- 进入 scheduleWork,执行任务调度