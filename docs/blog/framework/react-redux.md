# React-redux 实现

## React-Redux 

为了方便使用,Redux 的作者封装了一个 React 专用的库 React-Redux.

React-Redux 规定，所有的 UI 组件都由用户提供，容器组件则是由 React-Redux 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。 React-Redux 核心 就是 **Provider** 和 **connect**

**Provider** 其实就只是一个外层容器，它的作用就是通过配合 **connect** 来达到跨层级传递数据。使用时 只需将Provider定义为整个项目最外层的组件，并设置好 **store**。那么整个项目都可以直接获取这个 store。它的原理其实是通过 **React** 中的 **Context** 来实现的。

## Provider

新建 **Context.js**,它的作用很简单就是创建 一个 createContext

```js
import React from 'react'

const { Provider, Consumer } = React.createContext()

export { Provider, Consumer }
```

Provider.js

```js
const Context = React.createContext()

export const Provider = ({ store, children }) => {
    return (
        <Provider value={store}>
            {children}
        </Provider>
    )
}
```

实质就是利用了 **React** 的 **Context** 向下传递 **store**,渲染包裹的children。

## connect


## 源码地址

源码地址请移步 [手写React-Redux](https://github.com/LiLixikun/Blog-example/tree/master/packages/react-redux)