import React, { PureComponent } from 'react'
import { Provider } from './Context'

export default class HashRouter extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            location: {
                pathname: window.location.hash.slice(1) || '',
                state: window.history.state
            }
        }
    }

    componentDidMount() {
        //如果没有hash值就给一个默认值
        window.location.hash = window.location.hash || '/'

        window.addEventListener('hashchange', () => {
            this.setState({
                ...this.state,
                location: {
                    ...this.state.location,
                    pathname: window.location.hash.slice(1)
                }
            })
        })
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange')
    }

    render() {
        const value = {
            location: this.state.location,
            history: {
                push(path) {
                    window.location.hash = path
                }
            }
        }

        return (
            <Provider value={value}>
                {this.props.children}
            </Provider>
        )
    }
}