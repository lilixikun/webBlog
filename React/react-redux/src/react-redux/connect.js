import React, { PureComponent } from 'react'
import { Consumer } from './Context'

const defaultMapStateToProps = state => ({})
const defaultMapDispatchToProps = dispatch => ({ dispatch });


export default function connect(mapStateTpProps = defaultMapStateToProps, mapDispatchToProps = defaultMapDispatchToProps) {

    return function wrapWithConnect(WrappedComponent) {

        return class Connect extends PureComponent {

            render() {
                return (
                    <Consumer>
                        {
                            state => {
                                const { store: { getState, dispatch, subscribe } } = state
                                let defaultState = getState()
                                subscribe(() => {
                                    if (defaultState !== getState()) {
                                        this.setState({
                                            refresh: new Date()
                                        });
                                    }
                                })
                                return (<WrappedComponent {...this.props} {...mapStateTpProps(defaultState)} {...mapDispatchToProps(dispatch)} />)
                            }
                        }
                    </Consumer>
                )
            }
        }
    }
}