import React from 'react'
import { Consumer } from './Context'

export default function (props) {
    return (
        <Consumer>
            {
                value => {
                    //当Redirect元素的props.from属性和当前location.pathname属性相等时或者from属性不存在时就直接跳转到to
                    if (!props.from || props.from === value.location.pathname) {
                        value.history.push(props.to)
                    }
                    return null
                }
            }
        </Consumer>
    )
}