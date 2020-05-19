import React from 'react'
import { Consumer } from './Context'

export default function Link(props) {
    return (
        <Consumer>
            {
                state => (
                    // eslint-disable-next-line no-template-curly-in-string
                    <a href="{`#${props.to}`}" onClick={(e) => {
                        // 阻止默认行为
                        e.preventDefault()
                        state.history.push(props.to)
                    }}>{props.children}</a>
                )
            }
        </Consumer>
    )
}