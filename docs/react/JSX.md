# JSX

在 **React** 中我们是会有 **JSX** 来编写,最后会被编译成浏览器可以识别的代码,下面来看看这么一段代码:

```js
let element = (
  <div id='A1' style={style}>
    A1
    <h1 id="B1" style={style}>
      B1
      <h2 id="C1" style={style}>C1</h2>
      <h3 id="C2" style={style}><span>123</span></h3>
    </h1>
    <div id="B2">B2</div>
  </div>
);

console.log(element);
```

![JSX](/react/jsx.png)

React 会根据该数据结构生成 对应 Fiber 树,然后生成 真实的DOM 插入到根节点上