# React 常用API

**React** 包括两部分,一 是 **React**, 二是 **ReactDOM**

**React** 部分只是提供了我们使用的 **API**. 真正的核心是 **ReactDOM**,更新,任务调度,事件等核心都在 **ReactDOM** 中

基于 React 16.13 暴露出来的 API 如下

```jsx
export {
  Children,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  REACT_FRAGMENT_TYPE as Fragment,
  REACT_PROFILER_TYPE as Profiler,
  REACT_STRICT_MODE_TYPE as StrictMode,
  REACT_SUSPENSE_TYPE as Suspense,
  createElement,
  cloneElement,
  isValidElement,
  ReactVersion as version,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // Deprecated behind disableCreateFactory
  createFactory,
  // Concurrent Mode
  useTransition,
  useDeferredValue,
  REACT_SUSPENSE_LIST_TYPE as SuspenseList,
  withSuspenseConfig as unstable_withSuspenseConfig,
  // enableBlocksAPI
  block,
  // enableDeprecatedFlareAPI
  useResponder as DEPRECATED_useResponder,
  createResponder as DEPRECATED_createResponder,
  // enableFundamentalAPI
  createFundamental as unstable_createFundamental,
  // enableScopeAPI
  createScope as unstable_createScope,
  // enableJSXTransformAPI
  jsx,
  jsxs,
  // TODO: jsxDEV should not be exposed as a name. We might want to move it to a different entry point.
  jsxDEV,
};
```


Children  这个对象提供了一堆帮你处理props.children的方法，因为children是一个类似数组但是不是数组的数据结构，如果你要对其进行处理可以用React.Children外挂的方法。
```jsx
const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};
```

除了 Hooks 的 API 外 大部分都是很熟悉的,值得稍微提一下的就是 **forwardRef** 

**forwardRef** 解决了 HOC 组件传递 **ref** 的问题

```js
export default function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {

  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };
}
```

**forwardRef** 的使用方法如下

```js
const TargetComponent = React.forwardRef((props, ref) => (
  <TargetComponent ref={ref} />
))
```

