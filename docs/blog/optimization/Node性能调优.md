# Node 性能调优

## 内存泄露

程序运行需要内存。对于持续运行的服务进程,必须即使释放不再用到的内存.否则,内存占用会越来越高,轻则影响系统性能,重则导则进程崩溃。不在用到的内存,没有及时释放,叫做内存泄露。

**具体表现**

![neicun.png](/node/neicun.png)

- 随着内存泄漏的增长, **V8** 对垃圾收集器越来越具有攻击性,这会使你的应用运行速度变慢
- 内存泄漏可能触发其他类型的失败. 内存泄漏的代码可能会持续引用有限的资源,可能会耗尽文件描述符;还可能突然不能建立连接新的数据库连接
- 应用迟早会崩溃

点击 **Memory** 手机内存快照

## 压力测试 寻找内存泄露

### 什么是 QPS

**PV**: 网站当日访问人数 **UV** 独立访问人数. 换算公式

```
QPS = PV/t
``` 
如: 1000000 / 10*60*60 =27.7 (100万个请求集中在10个小时,服务器每秒需要处理 27.7个业务请求)

### wrk 进行压测

**wrk**是一个用来做HTTP benchmark测试的工具

安装 wrk

```
brew install wrk
```

命令行敲下 wrk ,查看帮助
    
    使用方法: wrk <选项> <被测HTTP服务的URL>                            
    Options:                                            
    -c, --connections <N>  跟服务器建立并保持的TCP连接数量  
    -d, --duration    <T>  压测时间           
    -t, --threads     <N>  使用多少个线程进行压测   
                                                      
    -s, --script      <S>  指定Lua脚本路径       
    -H, --header      <H>  为每一个HTTP请求添加HTTP头      
        --latency          在压测结束后，打印延迟统计信息   
        --timeout     <T>  超时时间     
    -v, --version          打印正在使用的wrk的详细版本信息
                                                      
    <N>代表数字参数，支持国际单位 (1k, 1M, 1G)
    <T>代表时间参数，支持时间单位 (2s, 2m, 2h)

做一次简单压测

```js
  "scripts": {
    "test": "wrk -t12 -c200 -d 60s http://127.0.0.1:3000"
  }
```

启动命令

```
node index.js
node run test
```
压测结果如下:
![work.png](/node/work.png)


| 属性        | 名称           | 含义  |
| ------------- |:-------------:| -----:|
| Avg        | 平均值  |  每次测试的平均值 |
| Stdev      | 标准偏差  |  结果果的离散程度,越高说明越不稳定｜
| Max     | 最大值 | 最大一次结果    ｜   
| +/- SStdev  | 正负一个标准差占比 |   结果的离散程度，越大越不稳定 ｜


Latency: 可以理解为响应时间

Req/Sec: 每个线程每秒钟的完成的请求数 一般我们来说我们主要关注平均值和最大值. 标准差如果太大说明样本本身离散程度比较高. 有可能系统性能波动很大

也可以使用 [autocannon](https://github.com/mcollina/autocannon)

### 使用 Memeye 查看内存
Memeye 是一个轻量级的 NodeJS 进程监控工具，它提供 进程内存、V8 堆空间内存、操作系统内存 三大维度的数据可视化展示

```
npm install memeye -D
```

用法也是很简单

```js
const http = require('http');
const memeye = require('memeye');
memeye();
let leakArray = [];
const server = http.createServer((req, res) => {
    if (req.url == '/') {
        leakArray.push(Math.random());
        console.log(leakArray);
        res.end('hello world');
    }
});
server.listen(3000);
```

再次启动 Node 服务,会给我们在本地在起另一个服务 http://localhost:23333,如下

![memeye.png](/node/memeye.png)


### process.memoryUsage

使用 **process.memoryUsage** 可以查看内存使用情况,如下:

```js
console.log(process.memoryUsage())

let map = new Map();
let key = new Array(5 * 1024 * 1024);
map.set(key, 1);

key = null
console.log(process.memoryUsage());
```

终端会显示 内存占用情况

```json
{
  rss: 18481152,
  heapTotal: 4014080,
  heapUsed: 2237704,
  external: 764981,
  arrayBuffers: 9382
}
{
  rss: 61792256,
  heapTotal: 46886912,
  heapUsed: 44959104,
  external: 933057,
  arrayBuffers: 9382
}
```

## 内存泄漏原因以及编码规范

### 内存膨胀

如下我们对某个接口进行统计

```js
console.log('statr', process.memoryUsage())
let leakArray = []
app.get('/', function (req, res) {
    leakArray.push('leak' + Math.random())
    console.log('end', process.memoryUsage());
    res.send('hello word')
})
```
这时内存会不断膨胀,因为 函数内的变量是可以随着函数执行被回收的，但是全局不行。如果实在业务需求应避免使用对象作为缓存，可 移步到Redis等

### 队列消费不及时

例如 收集日志:
如果日志产生速度大于文件写入速度,就容易产生内存泄漏(压测工具以及收到返回,服务器log4 日志还在不停写入)。表层解决办法可以更换消费速度更快的技术,但这不治本.

**根本解决**办法应该是监控队列长度,一旦堆积就报警或者拒绝新的请求,还有一种是所有的异步调用都有超时,一旦达到时间调用未得到结果就报警


### 编码不规范

**闭包**

```js
function foo() {
    var tem_obj = {
        x: 1,
        y: 2,
        arr: new Array(20000)
    }
    // 目前闭包只引用了clone
    let clone = tem_obj.x
    return function () {
        return clone
    }
}
```
如上 我们只需要用 x,那么只需要引用 **tem_obj.x** 即可,而不是返回整个 **tem_obj**

- 闭包不可怕,可怕的是闭包里面引用了大对象


**GC 无法回收**

```js
let map = new Map();
let key = new Array(5 * 1024 * 1024)
map.set(key, 1)
key = null
```

正确的是我们需要 先 移除 map 对 key 的引用,再把 key 设置 null

```js
map.delete(key)
key = null
```

**频繁的垃圾回收让GC没有机会工作**

```js
// function strToArray(str) {
//     let i = 0;
//     const len = str.length;
//     let arr = Array(len);
//     for (; i < len; i++) {
//         arr[i] = str.charCodeAt(i) + Math.random();
//     }
//     return arr;
// }
// function foo() {
//     let i = 0;
//     let str = 'test v8 GC';
//     while (i++ < 10000) {
//         strToArray(str);
//     }
// }
// foo();

function strToArray(str, bufferView) {
    let i = 0;
    const len = str.length;
    for (; i < len; i++) {
        bufferView[i] = str.charCodeAt(i) + Math.random();
    }
    return bufferView;
}
function foo() {
    let i = 0;
    let str = 'test v8 GC';
    // SharedArrayBuffer = 连续的内存
    let bufferView = [];
    while (i++ < 10000) {
        strToArray(str, bufferView);
    }
}
foo();
```


```sh
[8135:0x1045e7000]       43 ms: Scavenge 2.3 (3.0) -> 1.9 (4.0) MB, 0.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[8135:0x1045e7000]       54 ms: Scavenge 2.4 (4.0) -> 2.0 (5.0) MB, 0.7 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[8135:0x1045e7000]       55 ms: Scavenge 3.0 (5.0) -> 2.0 (7.0) MB, 0.2 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[8135:0x1045e7000]       57 ms: Scavenge 4.0 (7.0) -> 2.0 (7.0) MB, 0.1 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
# 优化后
node --trace-gc demo4.js 
[8139:0x1045e7000]       36 ms: Scavenge 2.3 (3.0) -> 1.9 (4.0) MB, 0.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[8139:0x1045e7000]       46 ms: Scavenge 2.4 (4.0) -> 2.0 (5.0) MB, 0.8 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure 
[8139:0x1045e7000]       47 ms: Scavenge 3.0 (5.0) -> 2.0 (7.0) MB, 0.2 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
```

## Buffer

## 调试工具 clinicjs

[clinicjs](https://clinicjs.org/)

[中文文档](https://youjingyu.github.io/clinic-doc-zh/)

## 总结

- 准确计算 QPS 未雨绸缪
- 利用压测工具发现内存是否有异常
- 缓存 队列内存泄漏 耗时较长的任务