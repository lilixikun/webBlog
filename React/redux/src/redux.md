# Redux 设计思想

- Redux 将整个应用状态(state)封装到一个地方(store)
- 当我们需要修改状态事件,必须派发 (**dispatch**) 和一个 **action** (action 是一个带有 type 字段的对象)
- 专门的状态处理函数 **reducer** 接收旧的 state 和 action ，并会返回一个新的 state
- 通过 subscribe 设置订阅，每次派发动作时，通知所有的订阅者。
- combineReducers 多 reducer 合并成一个 reducer

# dispatch({ type: Symbol() })
- createStore 的时候，用一个不匹配任何 type 的 action，来触发 state = reducer(state, action)
- 因为 action.type 不匹配，每个子 reducer 都会进到 default 项，返回自己初始化的 state，这样就获得了初始化的 state 树了。