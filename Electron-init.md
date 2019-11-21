

<!-- TOC -->

- [1.down repository](#1down-repository)
- [2.Electron 热更新](#2electron-%e7%83%ad%e6%9b%b4%e6%96%b0)
- [3.添加配置](#3%e6%b7%bb%e5%8a%a0%e9%85%8d%e7%bd%ae)
- [4.插件使用](#4%e6%8f%92%e4%bb%b6%e4%bd%bf%e7%94%a8)

<!-- /TOC -->
# 1.down repository
To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

# 2.Electron 热更新

在编写Electron 时候 代码不能热更新这对开发很不友好，下面我们添加**gulp** 让我们实现代码热更新，避免每次重启。

```bash

npm install gulp --save

npm install electron-connect -save

# 不然只能更新一次
npm install gulp-watch --dev

```

# 3.添加配置

- 新建 **gulpfile.js**文件
```js

const gulp = require('gulp');
const watch = require('gulp-watch')
const electron = require('electron-connect').server.create();

gulp.task('watch:electron', function () {
    electron.start();
    watch(['./main.js'], electron.restart);
    watch(['./index.html'], electron.reload);

    watch(['./render/**/*.html'], electron.reload);
    watch(['./render/**/*.js'], electron.reload);
    watch(['./render/**/*.css'], electron.reload);
    // watch(['./render/**/*.{js,css,html},./render/index.html'], electron.reload);
});

```


- 添加新的启动命名
```bash
"hot": ".\\node_modules\\.bin\\gulp watch:electron",
```


- 修改主进程文件
```node

const { app, Menu ,BrowserWindow} = require('electron');
const client = require('electron-connect').client;
 
// window 会被自动地关闭
let mainWindow = null;
 
// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function () {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            nodeIntegrationInWorker: true//支持多线程
        }
    });
    // 加载应用的 index.html
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // 当 window 被关闭，这个事件会被发出
    mainWindow.on('closed', function () {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 但这次不是。
        mainWindow = null;
    });
    client.create(mainWindow);
})

```

- 修改渲染进程文件

```html
require('electron-connect').client.create();
```

<font color="red" size="6px">使用npm run hot即可运行项目</font>


# 4.插件使用
- electron  [调试工具](https://github.com/sindresorhus/electron-debug)

```
npm install electron-debug
```

- 主进程添加配置
```
const debug = require('electron-debug');

debug();
```

- 本地缓存 [electron-store](https://github.com/sindresorhus/electron-store)
```
npm install electron-store
```
- Usage
```
const Store = require('electron-store');

const store = new Store();

store.set('unicorn', '🦄');
console.log(store.get('unicorn'));
//=> '🦄'

// Use dot-notation to access nested properties
store.set('foo.bar', true);
console.log(store.get('foo'));
//=> {bar: true}

store.delete('unicorn');
console.log(store.get('unicorn'));
```


