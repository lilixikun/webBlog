
/**
 * 缺点，即每次都会返回一个新的 state 对象，这会导致在数据没有变化时进行无意义的重新渲染
 * 以对数据进行判断，在数据没有变化时，返回原本的 state 即可。
 * @param {*} reducers 
 */
export default function combineReducers(reducers) {
    // count info
    const reducerKeys = Object.keys(reducers)

    // 返回合并后的新的 reducer 函数
    return function combination(state = {}, action) {
        // 定义一个新的 state
        const nextState = {}

        // 状态是否改变
        let hasChanged = false
        for (let i = 0; i < reducerKeys.length; i++) {
            const key = reducerKeys[i];
            const reducer = reducers[key];
            /* 之前的 key 的 state */
            const previousStateForKey = state[key]
            /* 执行 分 reducer，获得新的state */
            const nextStateForKey = reducer(previousStateForKey, action)

            nextState[key] = nextStateForKey

            //只有所有的 nextStateForKey 均与 previousStateForKey 相等时，hasChanged 的值才是 false
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }

        // state 没有改变时候 返回原对象
        return hasChanged ? nextState : state
    }
}