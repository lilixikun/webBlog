# Electron 质量监控

Electron 程序崩溃会出现主进程或者渲染层
主进程：程序突然中止，Native报错
渲染层：白屏 ｜ 业务代码内存泄露


崩溃监控 -- 客户端部分

初始化崩溃监控 crashReporter.start({ submitURL: 'https://your-domain.com/url-to-submit' })  官网使用范例[https://www.electronjs.org/docs/api/crash-reporter]

服务端实现

崩溃报告将发送下面 multipart/form-data POST 型的数据给 submitURL:

    ver String - Electron 的版本.
    platform String - 例如 'win32'.
    process_type String - 例如 'renderer'.
    guid String - 例如 '5e1286fc-da97-479e-918b-6bfb0c3d1c72'.
    _version String - package.json 里的版本号.
    _productName String - crashReporter options 对象中的产品名字
    prod String - Name of the underlying product. In this case Electron.
    _companyName String - crashReporter options 对象中的公司名称
    upload_file_minidump File - minidump 格式的崩溃报告
    All level one properties of the extra object in the crashReporter options object.


主进程异常监控

```js
process.on("uncaughtException", function (erros) {
    // 上报异常
})
```