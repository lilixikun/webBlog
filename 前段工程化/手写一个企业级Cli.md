# 初始化项目

```
mkdir aotu-cli
npm init -y
npm install eslint husky -D
```

初始化 eslint 配置文件

```
npm eslint --init
```
依次选择

```shell
To check syntax and find problems
CommonJS (require/exports)
None of these
Does your project use TypeScript?(Y/n) n
Where does your code run? Node
What format do you want your config file to be in? JSON
```
配置完后,项目根目录会生成 **.eslintrc.json**

# 工程创建

## 添加配置文件

**创建 bin\www 文件 全局命名执行根文件**, 写入以下:

```js
#!/usr/bin/env node     
console.log('aotu-cli')
```
**#!/usr/bin/env node** 表示我要用系统中的这个目录/user/bin/env的node环境来执行此文件，且需要注意必须放在文件开头

在 **package.json** 中添加如下配置:

```shell
"bin": {
    "aotu-cli": "./bin/www"
}
```

## npm link

link 将一个任意位置的 npm 包链接到全局执行环境，从而在任意位置使用命令行都可以直接运行该npm包。 npm link命令通过链接目录和可执行文件，实现npm包命令的全局可执行

```
npm link
```
在终端 执行 **aotu-cli**

发现 屏幕输出了 aotu-cli

# 编写 Cli

在  bin/www 文件 引入 main.js 作为我们项目入口

```
#!/usr/bin/env node
require('../src/main.js')
```

## 使用 commander

ommander是npm依赖排名前十之一的模块,主要作用为命令行辅助

安装模块

```
npm install commander
```

在 src/main.js  写些东西

```js
const program = require('commander');

const _version = require('../package.json').version;

const program = require('commander');
program.version(_version)
       .parse(process.argv);
```

在终端中执行 **aotu-cli -help**,发现有两个命名命名执行下 **aotu-cli -V**

发现打印了 版本号 **1.0.0**

下面我们来玩点花的 🐶

安装 figlet 生成一些特殊的文字

```
npm install figlet
```

安装 @darkobits/lolcatjs 生成颜色

```
npm install @darkobits/lolcatjs
```
修改 main.js

```js
const figlet = require('figlet');
const versionStr = figlet.textSync('Aotu');
const Printer = require('@darkobits/lolcatjs')

program.version(
    Printer.default.fromString(
        `   \n      席坤的手架${_version}\n    www.47.98.161.153:8082 \n${versionStr}`
    ))

program.parse(process.argv);
```

让我们再执行一次  **auto-cli -V**

发现控制台生成了 花里胡哨 🐶

## inquirer

## shelljs

## chalk