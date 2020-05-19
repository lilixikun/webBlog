import React from 'react'
import { withRouter } from './react-router-dom'

function Navheader(props) {
    return (
        <div className="navbar-heading">
            <div
                onClick={() => props.history.push('/user')} //点击的时候跳转到首页
                className="navbar-brand">{props.title}</div>
        </div>
    )
}
export default withRouter(Navheader)