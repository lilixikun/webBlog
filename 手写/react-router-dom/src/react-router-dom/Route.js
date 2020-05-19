import React, { PureComponent } from 'react'
import { pathToRegexp } from 'path-to-regexp'
import { Consumer } from './Context'

export default class Route extends PureComponent {

    render() {
        const { path, component: Component, exact = false } = this.props

        return (
            <Consumer>
                {state => {
                    const { pathname } = state.location

                    const regexp = pathToRegexp(pathname, [], { end: exact });

                    if (regexp.test(path)) {
                        return <Component />
                    }
                    return null
                }}
            </Consumer>
        )
    }
}