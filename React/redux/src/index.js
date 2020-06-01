import createStore from './createStore'
import combineReducers from './combineReducers'
import { countReducer, infoReducer } from './reducer'


const reducer = combineReducers({
    count: countReducer,
    info: infoReducer
})

const store = createStore(reducer)

const next = store.dispatch

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

const time = timeMiddleware(store)
const logger = loggerMiddleware(store);
const exception = exceptionMiddleware(store)

store.dispatch = exception(time(logger(next)))

store.dispatch({
    type: 'SET_NAME'
})


//渲染应用
// function renderApp(state) {
//     renderHeader(state);
//     renderContent(state);
// }
// //渲染 title 部分
// function renderHeader(state) {
//     const header = document.getElementById('header');
//     header.style.color = state.color;
// }
// //渲染内容部分
// function renderContent(state) {
//     const content = document.getElementById('content');
//     content.style.color = state.color;
// }



// //点击按钮，更改字体颜色
// document.getElementById('to-blue').onclick = function () {
//     store.changeState({
//         type: 'CHANGE_COLOR',
//         color: 'rgb(0, 51, 254)'
//     })

//     // 取消订阅
//     const unsub = store.subscribe(() => renderApp(store.getState()));
//     unsub()
// }
// document.getElementById('to-pink').onclick = function () {
//     store.changeState({
//         type: 'CHANGE_COLOR',
//         color: 'rgb(247, 109, 132)'
//     });
// }

// renderApp(store.getState());
// // 每次 state 发生变化时,都重新渲染
// store.subscribe(() => renderApp(store.getState()))

