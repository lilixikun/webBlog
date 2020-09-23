# 手写Webpack

这节我们就按照上面解析的流程来手写一个简易版的 **webpack**

## 运行流程
我们将按照总结的 **Compiler**--> **Compilation** --> **Module** --> **Parser** --> **Template** 来编写,初始化项目

```js
yarn init -y
```

在根目录新建 **webpack.config.js**
```js
const { join } = require('path')

module.exports = {
    entry: join(__dirname, './src/index.js'),
    output: {
        path: join(__dirname, './dist'),
        filename: 'main.js'
    }
}
```

新建 src 目录, 新建 index.js/data.js
```js
// data.js
const data = '我是data'
export default data

// index.js
import data from './data.js'
console.log(data);
console.log('我是主入口 init');
```

新建 xkpack 目录,新建 index.js

```js
const options = require('../webpack.config.js')

const Compiler = require('./Compiler.js')

const compiler = new Compiler(options)
compiler.run()
```
这是我们实例化 **Compiler**,并执行了很重要的一步 **run** 的方法,之前校验 **options** 的步骤可以查看 [webpack源码解析二](/blog/webpack/源码解析二)

## Compiler

首先 Compiler它有一个 **run** 方法和 **compile** 方法,还有一些 hooks

安装 **tapable**
```js
yarn add tapable
```

**Compiler.js**

```js
const { SyncHook } = require('tapable');

class Compiler {
    constructor(options) {
        this.hooks = {
            run: new SyncHook(['compilation']),
        };
        this.modules = [];
        this.options = options
    }
    run() {
        const onCompiled = (err, compilation) => { }
        this.compile(onCompiled);
    }

    compile() {
        const compilation = this.newCompilation();
        this.hooks.run.call(compilation);
    }

    newCompilation() {
        const compilation = new Compilation(this);
        return compilation;
    }
}

module.exports = Compiler
```
在源码中我们看到 在 Compiler 中实例化了 **Compilation**,它是 webpack 构建流程中最核心的对象,我们也去新建一个 **Compilation** 对象

## Compilation

```js
const { join } = require('path');
const { writeFileSync } = require('fs')
const Parser = require('./Parser');
const Template = require('./Template.js');

class Compilation {

    constructor(compiler) {
        const { options, modules } = compiler
        this.options = options
        this.modules = modules
    }

    buildModule() {
    }

    emitFiles() {

    }
}

module.exports = Compilation
```

Compilation 里面有两个重要方法,**buildModule** 和 **emitFiles**
- buildModule 主要用于处理各个模块之间的解析以及依赖关系
- emitFiles 调用模版写入文件

## 解析入口文件

在 **Compiler** 中的 **compile** 我们首先解析入口文件也就是 **options.entry**
```js
    compile() {
        const compilation = this.newCompilation();
        this.hooks.run.call(compilation);
        // 得到入口文件

        const entryMoudle = compilation.buildModule(this.options.entry, true)
        this.modules.push(entryMoudle)

        this.modules.map(_module => {
            _module.dependencies.map(dependency => {
                this.modules.push(compilation.buildModule(dependency, false))
            })
        })
    }
```
然后我们判断 modules 的 dependencies 是否有依赖,也就是比如 A 模块里面是否引入了 B/C模块对他们进行了依赖,如果有,就合并在一个 modules 里面

然后 **Compilation** 的 **buildModule** 实现如下:

```js
    buildModule(fileName, isEntry) {
        let ast = ''
        if (!isEntry) {
            const path = join(process.cwd(), './src/', fileName);
            ast = Parser.ast(path)
        } else {
            ast = Parser.ast(fileName)
        }

        const dependencies = Parser.getDependency(ast);
        const code = Parser.transform(ast)
        return {
            fileName,
            dependencies,
            code
        }
    }
```
**buildModule** 首先接收了两个参数,然后返回了三个参数,然后对不是入口文件进行了路径补充

- fileName 传入的文件名
- dependencies 依赖的对象
- code 解析的代码

这里我们用到了 **Parser.ast**,那么我们再去建个 **Parser** 类

## Parser

**Parser** 主要有三个方法:
```js
const babylon = require('babylon');
const fs = require('fs')
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require('@babel/core')

class Parser {
    static ast(path) {
        const code = fs.readFileSync(path, 'utf-8');
        return babylon.parse(code, {
            sourceType: 'module'
        })
    }

    static getDependency(ast) {
        const dependencies = [];
        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                dependencies.push(node.source.value);
            },
        });
        return dependencies;
    }

    static transform(ast) {
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env'],
        });
        return code;
    }
}

module.exports = Parser
```

在 **Compilation** 的 buildModule 调用了 **Parser.ast** 并传入了路径

Parser.ast 静态方法做的事件其实也很简单
- 利用 **fs** 读取对应文件的内容
- 使用 babylon.parse 把内容转成 [AST](https://astexplorer.net/) 语法树

静态方法 **getDependency** 使用 [@babel/traverse](https://www.babeljs.cn/docs/babel-traverse) 通过提取 **ImportDeclaration** 找出它们之间的依赖关系

静态方法 **transform** 就是 用 [@babel-core](https://www.babeljs.cn/docs/babel-core)  把 AST 语法数转成浏览器能够运行的代码

## Run
上面构建的差不多了,现在我们执行下命令看看 **Compiler** 中的**modules**

![modules](/webpack/modules.png)

如图,我们分析出来了各个文件之间的依赖关系,以及对应的code,具体可以看 [webpack源码解析一](/blog/webpack/源码解析一) ok, 剩下一步就是写入文件了

## Template

**Template** 就是一个生成我们 webpack源码解析一 里面的那种模版,这里我们就弄个简单的模版看看,如下:
```js
const { join } = require('path')
const { writeFileSync, existsSync, mkdirSync } = require('fs')

class Template {
    constructor(modules, options) {
        this.modules = modules
        this.options = options
    }

    write() {
        const { path, filename } = this.options.output
        const outputPath = join(path, filename)

        console.log(path);
        if (!existsSync(outputPath)) {
            mkdirSync(path)
        }

        const template = `(function (modules) {
            var installedModules = {};
            function __webpack_require__(moduleId) {
              // Check if module is in cache
              if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
              }
              // module.exports = {};
              //构建一个新的模块化规范 并 将moduleId放入缓存
              var module = (installedModules[moduleId] = {
                exports: {},
              });
              modules[moduleId].call(
                module.exports,
                module,
                module.exports,
                __webpack_require__
              );
              return module.exports;
            }
            return __webpack_require__('${this.options.entry}');
          })({
           ${this.modules}
          })`;
        writeFileSync(outputPath, template, 'utf-8');
    }
}

module.exports = Template
```
在 **Compilation** 中调用下写入模版:

```js
    emitFiles() {
        let _modules = '';
        this.modules.map(_module => {
            _modules += ` '${_module.fileName}': function (module, exports, require) {
                ${_module.code}
              },`;
        })
        const template = new Template(_modules, this.options)
        template.write()
    }
```

如上把 modules 遍历,拼接成 键值 的字符串。 然后 在 ***Compilation*** 调用 **emitFiles** 方法写入文件 如下:

![Template](/webpack/Template.png)

把这段代码粘贴到 控制台发现正常运行

## 编写Plugin
之前也说了 **Plugin** 只要监听对应的hooks,compiler 对应的 hook 执行 run 即可

在 index.js 添加plugin的注册

```js
const compiler = new Compiler(options)
for (const plugin of plugins) {
    plugin.apply(compiler)
}
```

现在编写一个简单的 plugin

```js
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
    apply(compiler) {
        compiler.hooks.run.tap(pluginName, (compilation) => {
            console.log(' 🔥🔥🔥 webpack 构建过程开始！');
            //console.log('🔥', compilation);
        });
    }
}
module.exports = ConsoleLogOnBuildWebpackPlugin;
```
在 webpack.config.js 配置中添加 如下:
```js
plugins: [new ConsoleLogOnBuildWebpackPlugin()]
```
ok,再次执行 run,发现我们的插件生效了 [源码地址](https://github.com/LiLixikun/Blog-example/tree/master/packages/webpack)

## 更多。。。
除了 **webpack**,还有很多优秀的打包工具 🔧 ,如:
- [gulp](https://github.com/gulpjs/gulp)
- [rollup.js](https://github.com/rollup/rollup)
- [rome](https://github.com/romefrontend/rome)
- [snowpack](https://github.com/pikapkg/snowpack)
- [brunch](https://github.com/brunch/brunch)

