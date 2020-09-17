# React Hooks 实现 Redux

## 核心

使用 React Hooks 实现 Redux 的效果,主要用到的钩子就是 useReducer,useContext

先简单说下 useReducer 的用法:

```js
import React, { useReducer } from "react"

const todoReducer = (state, action) => {
    switch (action.type) {
        case 'add':
            return [...state, ...action.data]
        default:
            return state
    }
}

const initTodo = ['张三', '李四', '老王']

export function todoList() {
    const [state, dispatch] = useReducer(todoReducer, initTodo);
    return (
        <>
            <ul>
                {state.map((todo, index) => <li key={index}>{todo}</li>)}
            </ul>
            <button onClick={() => dispatch({ type: 'add', data: 'do something' })}>change</button>
        </>
    )
}
```

上面其实就是一个初级版的 Redux,但是它有点问题,因为它的 **state** 和 **dispatch** 属于自己的,因此我们要使用 **context** 来解决全局状态

## useContext

我们仿照 Redux 的写法,创建一个 **createStore** 的方法,并导出 **store** 和 **Provider**

```js
import React, { createContext, useContext, useReducer } from 'react';
export default function createStore(parms) {

    const { initState, middlewares } = {
        initState: undefined,
        dispatch: undefined,
        ...parms
    }

    //全局一个全局的状态管理机制
    const AppContext = createContext();
    const store = {
        _state: initState,
        getState: () => {
            return store._state
        },
        useContext: () => {
            return useContext(AppContext)
        }
    }

    const middlewareReducer = (state, action) => {
        // TODO
    }

    const Provider = (props) => {
        const [state, dispatch] = useReducer(middlewareReducer, initState);
        store.dispatch = dispatch
        return <AppContext.Provider {...props} value={state} />;
    }
    return {
        store,
        Provider
    }
}
```

## 使用
我们初始化 createStore 在组件中使用下:
```js
import createStore from './redux';

const { Provider, store } = createStore({
  initialState: { name: '凹凸曼', age: 0 },
});

function Button() {
  function handleAdd() {
    store.dispatch(actionOfAdd());
  }
  return <button onClick={handleAdd}>点击增加</button>;
}

function Page() {
  const state = store.useContext();
  return (
    <div>
      {state.age}
      <hr />
      <Button />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <Page />
    </Provider>
  );
}
```

按照之前的操作 我们直接在 middlewareReducer 里面进行 state 的操作,然后返回一个新的 state,可是我们现在 createStore 是一个小 lib, 业务肯定不是堆在这里,我们可以把对应的 todoReducer 拿出去 让它再外面维护各自的,反正 **useReducer** 对应的 todoReducer 操作就是返回一个新的 state。 于是我们可以改造一下:


```js
function actionOfAdd() {
  return {
    type: 'addNum',
    reducer(state) {
      return {
        ...state,
        age: state.age + 1,
      };
    },
  };
}
```

actionOfAdd 返回了一个 **action**,里面有 对应的 **type**,还有一个函数,也就是修改完的 state,执行完 **dispatch** 后 就来到了 **middlewareReducer**

```js
function reducerInAction(state, action) {
  // 如果是 function 执行 action.reducer 返回新的state
  if (typeof action.reducer === 'function') {
    return action.reducer(state);
  }
  return state;
}
const middlewareReducer = (state, action) => {
    let nextState = reducerInAction(state, action);
    return nextState;
}
```

OK,我们现在来试试点击,发现没什么问题 age 正常的在递增

## middleware
上面我们实现了把 Reducer 提出去的操作,也叫 **reducerInAction**,我们现在来解决中间件的问题,如我现在想加一个 日志中间件,记录 action.type 和新老 state 值的情况

```js
 const { middlewares } = {
    // ...
    middlewares: params.isDev ? [middlewareLog] : undefined,
    ...params,
  };
```

我们现在给我们的 默认参数添加一个 **middlewares** 配置,并根据是开发环境默认添加一个 日志中间件,我们的中间件在哪执行呢,不用想,肯定在 middlewareReducer,于是修改下:
```js
const middlewareReducer = (state, action) => {
    let nextState = reducerInAction(lastState, action);
    // 依次执行中间件
   for (let item of middlewares) {
      const newState = item(state, nextState, action, isDev);
      if (newState) {
        nextState = newState;
      }
    }
    //更新回状态
    store._state = nextState;
    return nextState;
}
```
上面我们依次执行中间件,如果中间件改变了 state ,记得把 **store** 里面的 **_state** 重写赋值,现在我们来编写这个日志中间件
```js
function middlewareLog(lastState, nextState, action, isDev) {
  if (isDev) {
    console.log('🐒', action.type);
    console.log('①', lastState);
    console.log('②', nextState);
  }
}
```

发现,中间件生效了,也很好使. ok，我们现在也完成的七七八八了，只剩一个终极异步没有解决了,下面我们来干这个!

## async

例如,我们现在有个异步数据 请求,
```js
function timeOutAdd(a) {
  console.log('异步事件');
  return new Promise((cb) => setTimeout(() => cb(a + 1), 300));
}
const actionOfAdd = async () => {
  const age = await timeOutAdd(ownState.age);
  return {
    type: 'addNumAsync',
    reducer(state) {
      return {
        ...state,
        age,
      };
    },
  };
};
```

如上, **age** 是个异步得到的数据,然后我们再按照上面的操作返回 新的 state

我们执行点击操作,发现页面并没有更新,通过日志中间件发现 action.type 是个 **undefined**, 再一打印 发现 action 是个 **Promise**, 根本触发不了 更新 state

## dispatch
按照上面那样的操作,我们的异步没法触发 更新 state,因为不知道啥时候回调。 那么能不能换个思路 如同上面 我们把  **Reduer** 抽离了出来 让它直接更新完state 再返回,我们这里 能不能把 **dispatch** 丢出去,啥时候数据回来了自己再去执行 **dispatch**,也就是增强我们的 action, 思路有了 我们修改下:

```js
    const [state, dispatch] = useReducer(middlewareReducer, initialState);
    if (!store.dispatch) {
      store.dispatch = async (action) => {
        if (typeof action === 'function') {
          await action(dispatch, store.getState());
        } else {
          dispatch(action);
        }
      };
    }
```

如上,我们给 action 增强,如果是个函数,我们就把 **dispatch** 丢出去

```js
function timeOutAdd(a) {
  console.log('异步事件');
  return new Promise((cb) => setTimeout(() => cb(a + 1), 300));
}
const actionOfAdd = () => async (dispatch, ownState) => {
  const age = await timeOutAdd(ownState.age);
  dispatch({
    type: 'addNumAsync',
    reducer(state) {
      return {
        ...state,
        age,
      };
    },
  });
};
```
这边就更容易理解了,首先返回一个 function 于是就可以接到 回调的 **dispatch**,等待 ⌛️ 异步 结束后 再用 **dispatch** 去执行和上面一样的操作 就没问题了 

再次执行点击操作,发现异步也没任何问题了

## 源码
源码地址请移步 [手写React-Hooks-Redux](https://github.com/LiLixikun/Blog-example/tree/master/packages/hooks-redux)