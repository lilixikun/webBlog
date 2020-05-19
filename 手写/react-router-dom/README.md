# Reaact 路由之 HashRoute 实现

## HashRouter

HashRouter只是一个容器, 并没有DOm 结构,它渲染的就是它的子组件，并向下层传递location, 当hash值发生变化的时候会通过hashchange捕获变化，并给pathname重新赋值

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Link, Redirect,withRouter } from 'react-router-dom'
//import { HashRouter, Route, Link, Switch, Redirect } from './react-router-dom'
import App from './App';
import Home from './Home'
import User from './User'
import NavHeader from './NavHeader'
import './index.css';

ReactDOM.render(
  <HashRouter>
    <NavHeader title="返回首页"></NavHeader>
    <Link to='/home'> Home</Link>
    <Link to='/user'> User</Link>
    <Link to='/app'> App</Link>

    <Switch>
      <Route path="/app" component={App} />
      <Route path="/home" component={Home} />
      <Route path="/home/123" component={Home} />
      <Route path="/user" component={User} />
      <Redirect to='/app' />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);
```

HashRouter的实现如下

```js
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
```

因为HashRouter渲染的是它的子组件，那么子组件里面有可能嵌套着二级三级路由，这个时候就需要上下文Context来读取嵌套的值，需要创建一个Context

```js
import React from 'react'

const { Provider, Consumer } = React.createContext()

export { Provider, Consumer }
```

## Route

route代表一条路由规则，path代表此规则的路径， component代表要渲染的组件，如果说通过Context传下来的路径location.pathname与当前属性中的路径path相匹配就进行渲染

```js
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
```

## Link超链接

点击某个链接跳转到指定页面，它的渲染结构就是一个a链接，href就是属性to对应的值，所以可以这么实现link方法：

```js
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
```

## Switch
switch是为了解决route的唯一渲染，保证路由只渲染一个路径。

```js
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
```

## Redirect

重定向，当所有都不匹配的时候会重定向到新的页面，就是改变path值驱动页面重新渲染。

```js
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
```

## withRouter
withRouter是一个高阶组件，它的作用是将一个自定义组件包裹进Route里面, 然后react-router的三个对象history, location, match就会被放进这个组件的props属性中。从而实现自定义组件的路由跳转

查看 Navheader 组件, 用 withRouter 包裹后 可以自定义路由跳转

```js
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
```

withRouter 的实现:

```js
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
```

代码地址 [React路由实现](https://github.com/LiLixikun/webBlog/tree/master/%E6%89%8B%E5%86%99/react-router-dom)