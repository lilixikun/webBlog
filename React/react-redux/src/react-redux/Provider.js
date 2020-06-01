import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Provider } from './Context'


export default class Index extends PureComponent {

    static store = {
        subscribe: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
        getState: PropTypes.func.isRequired
    }

    render() {
        return (
            <Provider value={{ store: this.props.store }}>
                {this.props.children}
            </Provider>
        )
    }
}