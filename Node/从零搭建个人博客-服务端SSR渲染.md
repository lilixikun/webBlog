# 为什么要使用服务器端渲染(SSR)
* 更好的 SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面
* 解决首屏白屏问题
* 学习新技能

# 使用Node进行服务端渲染

## 同构

在服务端渲染 调用 React 的 服务端渲染方法 **renderToString** 但是无法绑定事件,我们需要在 里面再插入前端打包后的JS,**我们需要将React代码在服务端执行一遍，在客户端再执行一遍，这种服务器端和客户端共用一套代码的方式就称之为同构**

首先服务端调用 renderToString 渲染组件

```js
import { renderToString } from 'react-dom/server'
const ele = renderToString(
    <StaticRouter location={req.url} context={context}>
        <Fragment>{renderRoutes(routers)}</Fragment>
    </StaticRouter>
)

const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
    ...    
    </head>

    <body>
        <div id="root">${ele}</div>
        <script src="/index.js"></script>
    </body>
    </html>
`
```

再在 body 里面插入 打包后的 JS

## 路由的使用
在客户端我们可以使用 **BrowserRouter**, 在服务端我们使用 **StaticRouter** 

解决页面刷新后重定向问题

```js

app.get('*', (req, res) => {
    ...
    <StaticRouter location={req.url} context={context}>
    ...
    </StaticRouter>
})
```

## 解决CSS
在服务端解析 CSS 解析使用 **isomorphic-style-loader** ,会有一个 **_getCss** 方法。

**isomorphic-style-loader** 提供了一个**withStyles** 高阶函数

```js
import withStyles from 'isomorphic-style-loader/withStyles'
export default withStyles(styles)(App)
```

拼接CSS

在服务器端

```js
const css = new Set() // CSS for all rendered React components
const insertCss = (...styles) => styles.forEach(style => css.add(style._getCss()))
<StyleContext.Provider value={{ insertCss }}>
   ...
</StyleContext.Provider>
```
把CSS 插入到 Header 

```html
 <html lang="en">
    <head>
        <style>${[...css].join('')}</style>
    </head>

    <body>
        <div id="root">${ele}</div>
        <script src="/index.js"></script>
    </body>
</html>
```
在客户端

```js
const insertCss = (...styles) => {
    const removeCss = styles.map(style => style._insertCss())
    return () => removeCss.forEach(dispose => dispose())
}
 <StyleContext.Provider value={{ insertCss }}>
 ...
 </StyleContext.Provider>
```

## 在服务端使用Rexu


## 使用Axios 进行异步请求

## 数据注水和数据脱水

## 使用 html-minifier 进行压缩

对得到渲染后的 html 节点 进行压缩

```js
import { minify } from 'html-minifier';

const minifyHtml = minify(html, {
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
});
```

## 使用 react-helmet 管理 head信息












