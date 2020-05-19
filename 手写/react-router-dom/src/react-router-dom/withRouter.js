import React from 'react'
import { Consumer } from './Context'

export default function (OldComponent) {
    function routerWrapper(props) {
        return <Consumer>
            {
                value => <OldComponent {...props} {...value} />
            }
        </Consumer>
    }
    return routerWrapper;
}