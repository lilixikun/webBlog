import React from 'react'
import { Consumer } from './Context'
import { pathToRegexp } from 'path-to-regexp'

export default function (props) {

    return (
        <Consumer>
            {value => {
                let children = props.children
                const { pathname } = value.location
                //判断是否是数组，如果不是就包装成数组
                children = Array.isArray(children) ? children : [children]

                for (let i = 0; i < children.length; i++) {
                    //child是一个react元素它的返回值是一个虚拟dom {type:Route,props:{exact,path,component}}
                    let child = children[i]

                    let { path = '/', exact = false } = child.props

                    let regexp = pathToRegexp(path, [], { end: exact })

                    let matched = pathname.match(regexp)
                    //若匹配进行渲染
                    if (matched) {
                        return child
                    }
                }
                //若不匹配就返回null
                return null
            }}
        </Consumer>
    )
}