# 手写一个简易版打包工具 

## 入口

在 src/index.js 写入以下内容

```js
import message from './message.js';

console.log(message);

// message.js
const message = `say word`;
export default message;
```

新建 bundle.js 我们使用 **fs** 读取文件得内容,打印内容如下:

```js
const path = require('path')
const fs = require('fs')

const moduleAnalyser = (filename) => {
    const content = fs.readFileSync(filename, 'utf-8')
    console.log(content);
}

moduleAnalyser('./src/index.js')
```


## @babel/parser
使用 @babel/parser 输出抽象语法树 AST

```js
const parse = require('@babel/parser')
const ast = parse.parse(content, {
    sourceType: "module",
});
console.log(ast);
```

![ast](/webpack/ast.png)

可以去 [AST](https://astexplorer.net/) 查看

## @babel/traverse

@babel/traverse 可以用来遍历更新 @babel/parser生成的AST
- 对语法数中特殊的节点进行操作
- 进入节点
- 退出节点

我们对 **import** 引入进行一个提取

```js
const traverse = require('@babel/traverse').default;

traverse(ast, {
    ImportDeclaration({ node }) {
        console.log(node);
    }
})
```

![source](/webpack/source.png)

我们现在把文件的路径进行一下提取

```js
const dependencies = {};

traverse(ast, {
    ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        const newFile = './' + path.join(dirname, node.source.value);
        dependencies[node.source.value] = newFile;
        console.log(dependencies);
        //  { './message.js': './src/message.js' }
    }
})
```
意思代表我引入的 **'./message.js'** 相对目录文件在  **'./src/message.js'** 下

![import](/webpack/import.png)


所有的 JS 词法标示类型可以查看 [babel-types](https://babeljs.io/docs/en/babel-types#api)

## 使用 @babel/core

@babel/core 可以把 AST 语法数转成浏览器能够运行的代码,[@babel-core](https://www.babeljs.cn/docs/babel-core) 

```
npm install @babel/core
```

```
npm install @babel/preset-env -D
```
进行转换

```js
const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
});
return {
    filename,
    dependencies,
    code
}
```
我们使用了 **ES6** 语法,所以这里使用 **@babel/preset-env** 插件,并导出一些内容

现在我们到处以下内容

什么意思呢
- filename:表示我们的入口文件是哪
- dependencies:表示依赖了哪些文件,并且它真正的文件地址在哪
- code: 表示经过babel 转译后浏览器能够识别的代码

![graph](/webpack/graph.png)

上面我们就转译了一个入口文件的js,而它依赖别的文件,深层级的依赖文件我们并没有解析,现在我们来解析深层次的文件引用

```js
const makeDependenciesGraph = (entry) => {
    const entryModule = moduleAnalyser(entry)
    const graphArray = [entryModule]
    for (let i = 0; i < graphArray.length; i++) {
        const item = graphArray[i]
        const { dependencies } = item;
        if (dependencies) {
            for (const key in dependencies) {
                graphArray.push(moduleAnalyser(dependencies[key]))
            }
        }
    }
    const graph = {}

    graphArray.forEach(item => {
        graph[item.filename] = {
            dependencies: item.dependencies,
            code: item.code
        }
    })
    console.log("graph打印结果是");
    return graph
}
```

我们打印下结果看看
```js
const graph = makeDependenciesGraph('./src/index.js')
console.log(graph);
{
  './src/index.js': {
    dependencies: { './message.js': './src/message.js' },
    code: '"use strict";\n' +
      '\n' +
      'var _message = _interopRequireDefault(require("./message.js"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      'console.log(_message["default"]);'
  },
  './src/message.js': {
    dependencies: { './word.js': './src/word.js' },
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _word = require("./word.js");\n' +
      '\n' +
      'var message = "say ".concat(_word.word);\n' +
      'var _default = message;\n' +
      'exports["default"] = _default;'
  },
  './src/word.js': {
    dependencies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports.word = void 0;\n' +
      "var word = 'hello';\n" +
      'exports.word = word;'
  }
}
```

上面代码什么意思呢？
- 我们从入口文件 index.js 开始,先去看它依赖 **dependencies**了哪些文件
- 然后根据里面的 路径再去读区它依赖文件里面的内容。然后把读取的内容 **push** 到 **graphArray**,
- graphArray 长度增加会再次去继续读区,这里巧妙了用了一个队列去实现,而没有使用递归

最后我们拼接成上面的数据结构, index.js 依赖了 message.js,而 message 文件又依赖了 word.js


根据上面的数据结构,看到这里我们差不多就懂了。当遇到 require 时候,我们替换成对于依赖里面的code 即可

```js
const generateCode = (entry) => {
	const graph = JSON.stringify(makeDependenciesGraph(entry));
	return `
		(function(graph){
			function require(module) { 
				function localRequire(relativePath) {
					return require(graph[module].dependencies[relativePath]);
				}
				var exports = {};
				(function(require, exports, code){
					eval(code)
				})(localRequire, exports, graph[module].code);
				return exports;
			};
			require('${entry}')
		})(${graph});
	`;
}

const code = generateCode('./src/index.js');
console.log(code);
```
我们生成后的code 直接在浏览器运行 如下图

![code](/webpack/code.png)