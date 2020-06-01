/**
 * const store = createStore(reducer, {}, rewriteCreateStoreFunc);
 * @param {*} reducer 
 * @param {*} initState 默认 state
 * @param {*} rewriteCreateStoreFunc 中间件
 */
export default function createStore(reducer, initState, rewriteCreateStoreFunc) {

    // Redux允许 const store = createStore(reducer, rewriteCreateStoreFunc);
    if (typeof initState === 'function') {
        rewriteCreateStoreFunc = initState
        initState = undefined
    }

    // 如果有中间价
    if (rewriteCreateStoreFunc) {
        const newCreateStore = rewriteCreateStoreFunc(createStore);
        return newCreateStore(reducer, initState)
    }

    let state = initState

    let listeners = []

    let getState = () => state

    let dispatch = action => {
        state = reducer(state, action)
        listeners.forEach(ln => ln())
    }

    // subscribe 每次调用，都会返回一个取消订阅的方法
    const subscribe = ln => {
        listeners.push(ln)
        // 订阅之后也要允许取消订阅, 不然就是耍流氓
        const unsubscribe = () => [
            listeners = listeners.filter(listener => listener !== ln)
        ]
        return unsubscribe
    }

    /* 注意！！！只修改了这里，用一个不匹配任何计划的 type，来获取初始值 */
    dispatch({ type: Symbol() })

    return {
        getState,
        dispatch,
        subscribe
    }
}