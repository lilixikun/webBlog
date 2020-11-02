# Ref

## createRef

**createRef** 源码只有几句如下:

```js
export function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  if (__DEV__) {
    Object.seal(refObject);
  }
  return refObject;
}
```

作者源码注释写的是这个函数返回一个不变的对象，这个对象有一个可变的 current 属性。

React.createRef 是用在类组件里面的，**不能在函数组件上使用 ref 属性，因为它们没有实例**。

如果要在函数组件上使用ref ，可以使用 **forwardRef**

## forwardRef

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

当 tag 为 **ForwardRef**,便会走到 **updateForwardRef** 分支 会走 **renderWithHooks**,自己看吧,使用方法如下:

```js
import React from 'react'

const TargetComponent = React.forwardRef((props, ref) => (
  <input type="text" ref={ref} />
))

export default class Comp extends React.Component {
  constructor() {
    super()
    this.ref = React.createRef()
  }

  componentDidMount() {
    this.ref.current.value = 'ref get input'
  }

  render() {
    return <TargetComponent ref={this.ref} />
  }
}
```

## useRef

**useRef** 分创建阶段和修改呢阶段

```js
function mountRef<T>(initialValue: T): {|current: T|} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  if (__DEV__) {
    Object.seal(ref);
  }
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): {|current: T|} {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

源码非常简单 就是把 ref 挂载到 **memoizedState** 然后使用时再去 **memoizedState** 取值