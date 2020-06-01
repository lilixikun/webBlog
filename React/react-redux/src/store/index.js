import { createStore } from 'redux'


function reducer(state, action) {
    console.log(action);
    
    switch (action.type) {
        case 'ADD':
            return {
                ...state,
                num: state.num++
            }
        case 'CHANGE_NAME':
            return {
                ...state,
                name: action.name
            }
        default:
            return state
    }
}

let initState = {
    num: 100,
    name: 'XIKUN'
}
const store = createStore(reducer, initState)

export default store

