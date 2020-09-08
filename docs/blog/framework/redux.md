# Redux | 实现原理

## Redux 介绍

Redux是一个用来管理管理数据状态和UI状态的JavaScript应用工具。随着JavaScript单页应用（SPA）开发日趋复杂,JavaScript需要管理比任何时候都要多的state（状态）,Redux就是用来降低管理难度的. Redux 不依赖于任何框架,但是它可以适用于任何框架


## 三大原则

- **单一数据源**

整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。

- **State 是只读的**

唯一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。

- **使用纯函数来执行修改**

为了描述 action 如何改变 state tree ，你需要编写 reducers。

## Redux Store 的基础

store 是一个单一对象

- 管理应用的state
- 通过 store.getState() 可以获取 state
- 通过 store.dispatch(action) 来触发 state 更新
- 通过 store.subscribe(listener) 来注册 state 变化监听器
- 通过 createStore(reducer, [initialState]) 创建

## 对应的函数式编程

1. store -> container
2. currentState -> __value
3. action -> f
4. currentReducer -> map
5. middleware -> IO functor (解决异步操作的各种问题)

## 手写一个 Redux

源码地址请移步 [手写Redux](https://github.com/LiLixikun/Blog-example/tree/master/packages/my-redux)