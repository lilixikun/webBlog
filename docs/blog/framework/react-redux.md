# React-redux 实现

## React-Redux 

为了方便使用,Redux 的作者封装了一个 React 专用的库 React-Redux.

React-Redux 规定，所有的 UI 组件都由用户提供，容器组件则是由 React-Redux 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。 React-Redux 核心 就是 **Provider** 和 **connect**

## Provider

**Provider** 其实就只是一个外层容器，它的作用就是通过配合 **connect** 来达到跨层级传递数据。使用时 只需将Provider定义为整个项目最外层的组件，并设置好 **store**。那么整个项目都可以直接获取这个 store。它的原理其实是通过 **React** 中的 **Context** 来实现的,向下传递 **store**,渲染包裹的children。


## connect
connect 的作用是连接React组件与 Redux store，它包在我们的容器组件的外一层，它接收上 Provider 提供的 store 里面的 state 和 dispatch，传给一个构造函数，返回一个对象，以属性形式传给 我们的容器组件。
它共有四个参数 
- mapStateToProps
- mapDispatchToProps, 
- mergeProps
- options

**mapStateToProps** 的作用是将store里的state(数据源)绑定到指定组件的props中 **mapDispatchToProps** 的作用是将store里的action(操作数据的方法)绑定到指定组件的props中

## 源码地址

源码地址请移步 [手写React-Redux](https://github.com/LiLixikun/Blog-example/tree/master/packages/react-redux)