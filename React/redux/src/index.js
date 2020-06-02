import { createStore, combineReducers, applyMiddleware } from './redux'
import { countReducer, infoReducer } from './reducer'


const reducer = combineReducers({
    count: countReducer,
    info: infoReducer
})

// const next = store.dispatch

const loggerMiddleware = store => next => action => {
    next(action)
    console.log(action);
    console.log('next store', store.getState());
}

const exceptionMiddleware = store => next => action => {
    try {
        next(action)
    } catch (error) {
        console.log('错误报告!', error);
    }
}

const timeMiddleware = store => next => action => {
    console.log('time', new Date().getTime());
    next(action)
}



const store = createStore(reducer, applyMiddleware(loggerMiddleware, exceptionMiddleware, timeMiddleware))

// const time = timeMiddleware(store)
// const logger = loggerMiddleware(store);
// const exception = exceptionMiddleware(store)

// store.dispatch = exception(time(logger(next)))

setTimeout(() => {
    store.dispatch({
        type: 'SET_NAME'
    })
}, 2000);


setTimeout(() => {
    store.dispatch({
        type: 'INCREMENT'
    })
}, 2000);