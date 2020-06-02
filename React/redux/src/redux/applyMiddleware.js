export default function applyMiddleware(...middlewares) {
    // 返回一个重写 createStore的方法
    return (oldCreateStore) => {
        // 返回重写后的 createStore
        return (reducer, initState) => {
            // 1 生成 store
            const store = oldCreateStore(reducer, initState)

            // 不要给那么大权限 只给数据
            const simpleStore = { getState: store.getState };

            /*给每个 middleware 传下store，相当于 const logger = loggerMiddleware(store);*/
            const chain = middlewares.map(middleware => middleware(simpleStore))

            let dispatch = store.dispatch

            // 形成 exception(time(logger(next)))
            chain.reverse().map(middleware => {
                dispatch = middleware(dispatch)
            })

            //  重写 dispatch
            store.dispatch = dispatch
            return store
        }
    }
}

// compose
// 我们的 applyMiddleware 中，把 [A, B, C] 转换成 A(B(C(next)))，是这样实现的

/**
 * redux 实现
 * @param  {...any} funcs 
 */
function compose(...funcs) {
    if (funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}