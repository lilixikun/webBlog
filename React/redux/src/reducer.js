let initState = {
    count: 1
}
export function countReducer(state = initState, action) {
    switch (action.type) {
        case 'INCREMENT':
            return {
                count: state.count++
            }
        default:
            return state
    }
}

let initInfo = {
    name: 'tom'
}
export function infoReducer(state = initInfo, action) {
    switch (action.type) {
        case 'SET_NAME':
            return {
                name: 'hello tom'
            }
        default:
            return state
    }
}