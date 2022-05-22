# MaxCompute

[MaxCompute](https://www.aliyun.com/product/odps) 是阿里云云原生大数据计算服务、以 Serverless 架构提供快速、全托管的在线数据仓库服务、可以帮助我们快速搭建数仓开发服务

## 数据开发

开通阿里云 **MaxCompute** 服务、创建工作空间后点击数据开发进入 **DataWorks** 在线编程、如下、新增 **ODPS SQL**
![maxcompute.png](/monitor/maxcompute.jpg)

**MaxCompute** 不光支持**ODPS SQL**、还可以支持 **PyODPS2** 进行数据库的操作如下：
![pyodps2.png](/monitor/pyodps2.png)

查看数据地图、可以找到对应的表查看详情和数据如下：
![maxcompute-detail.png](/monitor/maxcompute-detail.png)

## PyODPS

除了上面的在线化操作、 **MaxCompute**还提供了 **Java** 和 **Python** 版本的 SDK 和 MaxCompute 基本操作方法、py 对接方式如下：

```py
# 对应 key 的获取可详见 https://help.aliyun.com/document_detail/155553.html**
from odps import ODPS
odps = ODPS('<your_accesskey_id>', '<your_accesskey_secret>', '<your_default_project>', endpoint='<your_end_point>')
```

ODPS 的基本调用方法如下：

```py
# 创建分区
# 指定if_not_exists参数，分区不存在时才创建分区。
table.create_partition('datetime=20220522', if_not_exists=True)

# 插入数据
data = [
    ["appid123", "pageid123", "2022-05-22 14:22:21", "uachrome",
        "http://baidu.com", "pv", '{"name":"xikun"}']
]
odps.write_table(table, data, partition='datetime=20220522')

insertSql = 'INSERT INTO code_robot_dev.za_monitor PARTITION (datetime = "20220522") VALUES ("code-robot","user","1653216066845","Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36","http://localhost:1234/","exp",""'
# 通过 sql 插入数据 execute_sql/run_sql
odps.execute_sql(insertSql)

# 用 sql 查询数据
with odps.execute_sql('select * from code_robot_dev.za_monitor', hints={'odps.sql.allow.fullscan': True}).open_reader() as reader:
    for record in reader:
        print(record)
```

更多的 SDK 方法说明 详见 [python sdk](https://help.aliyun.com/document_detail/34615.html)、有了这些方法后面我们便可以来操作 **MaxCompute** 使用 py 脚本进行数据的插入和查询

## 前度监控上报 API

前端 SDK 采集完埋点数据进行 API 参数上报、这里我们使用 **egg** 作为服务端参数接收、如下：

```js
// 新增 upload 路由
router.get("/monitor/upload", controller.monitor.upload);

class MonitorController extends Controller {
  async upload() {
    const { ctx } = this;
    console.log(ctx.query);
    let { appId, pageId, eventType, ua, timestamp, url, args = "" } = ctx.query;

    if (args && Object.keys(args).length === 0) {
      args = "{}";
    } else {
      args = JSON.stringify(args);
    }
    if (!appId || !pageId || !eventType || !url) {
      failed("参数缺失");
    } else {
      let datetime = createDatetime();
      // 调用 py 脚本进行数据插入 MaxCompute
      ctx.body = {
        appId,
        pageId,
        timestamp,
        ua,
        url,
        eventType,
        args,
      };
    }
  }
}
```

## Node 调用 python 脚本

前面讲了 MaxCompute 可以通过 python 调用对于的方法进行数据插入、因此我们现在需要做的如下：

- 拼接 python 插入的 sql 语言
- 在 Node 环境执行 python 脚本

执行分别如下、（注意：拼接的 sql 插入数据顺序要对 ）

```js
// 拼接 sql
const sql = `INSERT INTO code_robot_dev.za_monitor PARTITION (datetime = "${datetime}") VALUES ("${appId}","${pageId}","${timestamp}","${ua}","${url}","${eventType}","${args}")`;
// 执行 python 脚本
const execSync = require("child_process").execSync;
const res = execSync(
  `python3 ${python3_connect_path} "${encodeURIComponent(sql)}"`
);
console.log(res.toString());
```

对应的 python 如下：

```py
from odps import ODPS
import sys
import urllib

insertSql = urllib.parse.unquote(sys.argv[1])
odps.execute_sql(insertSql)
```

在前端 SDK 中触发 埋点、曝光后、去 Dataworks 数据明细中查看如下：

```js
window.onload = function() {
  // 曝光自动触发
  const monitor = new CodeRobotMonitor({
    appId: "code-robot",
  });
  // 触发 pv
  monitor.sendToAnalytics({
    pageId: "home",
  });
};
```

![py-insert.png](/monitor/py-insert.png)
