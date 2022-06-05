# 流量指标

## 指标库

- PV：页面浏览量，count(type=pv)
- UV：用户浏览量，count(type=pv,distinct visitor_id)
  - visitor_id 不能为 null
  - 对于未登录的用户，需要在客户端生成 visitor_id（uuid 持久化存储）
  - 对于已登录用户，需要获取用户的 user_id，并将 user_id，并将 写入 visitor_id
- PV 点击率：页面点击率，count(type=click) /PV
  - 可以大于 100%
- UV 点击率：用户点击率，count(type=click,distinct visitor_id)
  - 不可以大于 100%
- 停留时长：用户从打开页面到关闭页面的总时长，leave page time（beforeunload）- open time（onload）

### 可视化

- 通过折线图的方式，展示 24 小时内每小时页面指标
- 通过表格的方式，展示一定时间段页面的指标

## 模块访问行为

- 模块曝光：模块显示时发送的埋点，count(type = exp,mod = mod_id)
- 模块点击：模块被点击时发送的埋点，count(type = click,mod = mod_id)
- 通过表格的方式，展示某个页面中所有模块的曝光和点击数据

## 页面的性能

- 首屏渲染时间：从打开页面到页面完全加载的时间，计算公式：
- API 请求时间：API 发起，到 API 响应的时间，计算公式：API 响应时间- API 发起时间

## 监控日志创建

### 创建监控日志表

```sql
DROP TABLE IF EXISTS za_monitor ;

CREATE TABLE IF NOT EXISTS za_monitor
(
    appId STRING COMMENT '应用ID',
    pageId STRING COMMENT '页面ID',
    timestamp STRING COMMENT '埋点日志上报时间，eg: 2022-05-01 10:00:00',
    ua STRING COMMENT '浏览器User-Agent',
    url STRING COMMENT '页面URL',
    eventType STRING COMMENT '日志类型（1/2/3/4）1=pv日志，2=点击日志，3=曝光日志，4=自定义日志',
    args STRING COMMENT '自定义参数',
    user_id STRING COMMENT '用户id',
    visitor_id STRING COMMENT '访客id(userid存在时、取user_id)',
    mod_id STRING COMMENT '模块id'
)
PARTITIONED BY     --数据量大时进行分区
(
    DATETIME STRING COMMENT '分区字段：日期'
);
```

### 生成监控数据指标表

对上面的 `za_monitor` 数据进行整理汇总后插入到此表

```sql
DROP TABLE IF EXISTS za_monitor_feature;
CREATE TABLE IF NOT EXISTS za_monitor_feature
(
    appId STRING COMMENT '应用ID',
    pageId STRING COMMENT '页面ID',
    modId STRING COMMENT '页面ID',
    `tpye` STRING COMMENT '指标类型',
    `value` STRING COMMENT '指标数据'
)
PARTITIONED BY
(
    DATETIME STRING COMMENT '分区字段：日期'
)
tblproperties ("transactional"="true");
```

### 更新监控数据指标

```sql
-- 清空当天表数据
DELETE FROM za_monitor_feature WHERE datetime = '${biz_date}';
-- 插入PV日志
INSERT INTO TABLE za_monitor_feature PARTITION (datetime = '${biz_date}')
    SELECT appId, pageId, '' AS modId, 'pv' AS type, COUNT(*) AS value
    FROM za_monitor WHERE datetime = '${biz_date}' AND eventtype = 'pv'
    GROUP BY appid, pageid, datetime;

-- 插入UV日志
INSERT INTO TABLE za_monitor_feature PARTITION (datetime = '${biz_date}')
    SELECT appId, pageId, '' AS modId, 'uv' AS type, COUNT(DISTINCT visitor_id) AS value
    FROM za_monitor WHERE datetime = '${biz_date}' AND eventtype = 'pv'
    GROUP BY appid, pageid, datetime;

-- 插入PV点击指标
INSERT INTO TABLE za_monitor_feature PARTITION (datetime = '${biz_date}')
    SELECT appid,pageid,'' AS modId, 'pv_click' AS type, COUNT(*) AS value
        FROM (
            SELECT t1.appid AS appid, t1.pageid AS pageid, t2.datetime AS datetime
                FROM (
                    SELECT appid,pageid
                    FROM code_robot_dev.za_monitor WHERE datetime = '${biz_date}' AND eventtype = 'pv'
                    GROUP BY appid, pageid, datetime
                ) AS t1 LEFT JOIN code_robot_dev.za_monitor AS t2 ON t1.appid = t2.appid AND t1.pageid = t2.pageid
                WHERE t2.datetime = '${biz_date}' AND t2.eventtype = "click"
        ) AS t1 GROUP BY appid, pageid, datetime;

-- 插入UV点击指标
INSERT INTO TABLE za_monitor_feature PARTITION (datetime = '${biz_date}')
    SELECT appId, pageId,'' AS modId, 'uv_click' AS type, COUNT_IF(uv_click >0) AS uv_click
    FROM (
        SELECT appid, pageid, datetime, visitor_id, uv_click, uv
        FROM (
            SELECT appid, pageid, datetime, visitor_id, COUNT_IF(eventtype = 'click') AS  uv_click, COUNT_IF(eventtype = 'pv') AS uv
            FROM (
                SELECT appid, pageid, datetime, visitor_id, eventtype FROM  code_robot_dev.za_monitor
                WHERE datetime = '${biz_date}' AND (eventtype = 'pv' OR eventtype = 'click')
                ) AS  t1
                GROUP BY appid, pageid, datetime, visitor_id
            )
    ) AS  t1
    GROUP BY appid, pageid, datetime;

    -- 插入停留时长指标
INSERT INTO TABLE za_monitor_feature PARTITION (datetime = '${biz_date}')
    SELECT appId, pageId, '' AS modId, 'stay' AS type, AVG(stayTime) AS value
    FROM (
        SELECT appid, pageid, datetime, GET_JSON_OBJECT(args, '$.stayTime') AS stayTime FROM code_robot_dev.za_monitor
        WHERE datetime = '${biz_date}' AND eventtype = 'stay'
    ) AS t1 WHERE stayTime > 0 AND stayTime < 600 * 1000
    GROUP  BY appid, pageid, datetime;
```

### 监控日志查询

查询出来表的数据如下：

![monitor_feature](/monitor/monitor_feature.png)

然后通过这张表、我们可以分别计算出 PV、UV、PV 点击率、UV 点击率等等

```sql
SELECT * FROM za_monitor_feature WHERE datetime = '20220604';

SELECT * FROM za_monitor WHERE datetime = '20220604' AND eventtype = 'click';

-- PV
SELECT appid ,pageid, datetime, COUNT(*) AS pv
FROM code_robot_dev.za_monitor WHERE   datetime ="20220604" AND eventtype ="pv"
GROUP BY appid, pageid, datetime;

-- uv
SELECT appid, pageid, datetime, COUNT(DISTINCT visitor_id) AS uv
FROM code_robot_dev.za_monitor WHERE  datetime ="20220604" AND eventtype ="pv"
GROUP BY appid, pageid, datetime;

-- PV 点击率
SELECT appid, pageid, datetime, COUNT(*) AS pv_click
    FROM (
        SELECT t1.appid AS appid, t1.pageid AS pageid, t2.datetime AS datetime
        FROM (
            SELECT appid,pageid
            FROM code_robot_dev.za_monitor WHERE datetime = "20220604" AND eventtype = "pv"
            GROUP BY appid, pageid, datetime
        ) AS t1 LEFT JOIN code_robot_dev.za_monitor AS t2 ON t1.appid = t2.appid AND t1.pageid = t2.pageid
        WHERE t2.datetime = "20220604" AND t2.eventtype = "click"
    ) AS t1 GROUP BY appid, pageid, datetime;

-- PV点击率横表
SELECT appid, pageid, datetime, pv_click, pv
FROM (
    SELECT appid,pageid,datetime, COUNT_IF(eventtype = 'click') AS  pv_click, COUNT_IF(eventtype = 'pv') AS pv
    FROM (
        SELECT appid,pageid,datetime,eventtype FROM  code_robot_dev.za_monitor
        WHERE datetime = "20220604" AND (eventtype = 'pv' OR eventtype = 'click')
    ) AS  t1
    GROUP  BY appid, pageid, datetime
);

-- UV点击率
SELECT appid, pageid, datetime,COUNT_IF(uv_click >0) AS uv_click, COUNT(*) AS uv
FROM (
    SELECT appid, pageid, datetime, visitor_id, uv_click, uv
    FROM (
        SELECT appid, pageid, datetime, visitor_id, COUNT_IF(eventtype = 'click') AS  uv_click, COUNT_IF(eventtype = 'pv') AS uv
        FROM (
            SELECT appid, pageid, datetime, visitor_id, eventtype FROM  code_robot_dev.za_monitor
            WHERE datetime = "20220604" AND (eventtype = 'pv' OR eventtype = 'click')
            ) AS  t1
            GROUP BY appid, pageid, datetime, visitor_id
        )
) AS  t1
GROUP BY appid, pageid, datetime;

-- 停留时长
SELECT appid, pageid, datetime, AVG(stayTime)
FROM (
    SELECT appid, pageid, datetime, GET_JSON_OBJECT(args, '$.stayTime') AS stayTime FROM code_robot_dev.za_monitor
    WHERE datetime = "20220604" AND eventtype = 'stay'
) AS t1 WHERE stayTime > 0 AND stayTime < 600 * 1000
GROUP  BY appid, pageid, datetime;
```

## 数据回流

### 创建 Mysql 数据集成表

我们需要把 `za_monitor_feature` 表的数据回流到数据库进行持久化存储、这里为了方便我们使用 云数据库 [RDS](https://rdsnext.console.aliyun.com/rdsList/cn-hangzhou/basic)、创建一张和 `MaxCompute` 的 `za_monitor_feature` 表字段同步的数据库表、如下：

![mysql](/monitor/rds-mysql.png)

### 数据集成

点击 `MaxCompute` 的数据集成、选择对应的数据来源、去向
![jicheng](/monitor/jicheng.png)

第一次需要新建数据源、如下，填入对应的实例 ID

![add-datasource](/monitor/add-datasource.png)

### 开启调度

点击调度配置、便可以进行任务调度、如下每天一次进行数据同步

![diaodu](/monitor/diaodu.png)

到此、我们基于阿里云 **MaxCompute** 完成了 **数据采集-数据清洗-指标计算-数据回流-调度任务** 全链路流程。
