
# Koa 使用 Sequelize

##  使用 sequelize 

```js
npm install sequelize mysql2 --save
```
新建 config.js 文件 配置好 **mysql** 一些基本配置

```js
module.exports = {
    environment: 'dev',
    database: {
        dbName: 'island',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root'
    }
}
```

## 初始化 Sequelize

```js
const Sequelize = require('sequelize')

const { dbName, host, port, user, password } = require('../config').database

const sequelize = new Sequelize(dbName, user, password, {
    port,
    host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        // 字符集
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        supportBigNumbers: true,
        bigNumberStrings: true
    },
    timezone: '+08:00' //时区转换
})
```

## 测试连接

```js
sequelize.authenticate().
    then(() => console.log('链接正常')).
    catch(err => console.log('链接失败', err))
```

## 定义一个测试数据模型

```js
const { Model, Sequelize } = require('sequelize')
const { sequelize } = require('../../core/db')
class Test extends Model {

}

Test.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userName: {
            type: Sequelize.STRING,
            allowNull: false,
            //自定义校验
            validate: { min: 1, max: 100 }
        },
        password: {
            type: Sequelize.STRING,
            set(val) {
                //生成盐
                //const salt = bcryptjs.genSaltSync(10);
                //加密密码
                //const pwd = bcryptjs.hashSync(val, salt);
                this.setDataValue('password', val + 123)
            }
        }
    },
    {
        // 不要添加时间戳属性 (updatedAt, createdAt)
        timestamps: true,
        // 不实际删除数据 而是设置一个新 deletedAt 属性，其值为当前日期 timestamps 启用时
        //paranoid: true,
        // 不需要 `createdAt`
        createdAt: false,
        // 需要 `updatedAt`，但列名为"updateTime"
        updatedAt: 'updateTime',
        // 自动设置字段为蛇型命名规则
        underscored: true,
        // 定义表名
        tableName: 'test',
        // 添加注释
        comment: '我是测试表',
        sequelize,
        // 如果指定的表名称本就是复数形式则不变
        freezeTableName: true
    }
)

module.exports = Test
```

其中 **primaryKey** 为主键, 我们设置 **autoIncrement** 进行自增, **Sequelize** 默认的 **createdAt** 和 **updatedAt** 我们可以不显示 或者进行改字段名

## 同步数据结构到数据库

当模型定义后，需要在数据库中建立对应的数据表，这时候需要做结构的同步，可以使用以下方法进行同步:

```js
sequelize.sync()
```

如果数据库中已经存在该模型对应的表，则我们可以不进行结构同步：

```js
sequelize.sync({
    force: false
})
```

## 定义 Controller 使用 Model 进行操作

新建 TestController.js 文件,我们来编写一个简单的增删改查 RESTful API 接口

```js
const Test = require('../models/test')
const { Faild } = require('../../core/httpException')

class TestController {

}
```

### 新增数据

```js
static async add(obj) {
    const res = await Test.create(obj)
    if (!res) {
        throw new Faild('添加失败')
    }
    return res
}
```

### 修改数据

```js
static async update(obj) {
    const res = await Test.update(obj, {
        where: {
            id: obj.id
        }
    })
    if (!res) {
        throw new Faild('修改失败')
    }
    return res
}
```

### 查询列表

```js
static async findAll(obj) {
    et res= await Test.findAll()

    if (!res) {
        throw new Faild('修改失败')
    }
    return res
}
```

### 查询单个

```js
static async find(id) {
    let data = await Test.findByPk(id)
    // 或者
    // Test.findOne({
    //     where:{
    //         id
    //     }
    // })
    if (!data) {
        throw new Faild('查找失败')
    }
    return data
}
```

### 删除数据

```js
static async dele(id) {
    const res = await Test.destroy({
        where: {
            id
        }
    })
    if (!res) {
        throw new Faild('删除失败')
    }
    return res
}
```

## 编写路由接口

```js

const Router = require("koa-router");
const router = new Router()

const testController = require('../controllers/test')

router.get('/test', async (ctx, next) => {

    const data = await testController.findAll(ctx.params.id)

    ctx.body = data
})

router.get('/test/:id', async (ctx, next) => {

    const data = await testController.find(ctx.params.id)

    ctx.body = data
})

router.post('/test', async (ctx, next) => {
    const data = await testController.add(ctx.request.body)
})

router.put('/test', async (ctx, next) => {
    const data = await testController.update(ctx.request.body)
    ctx.body = data
})

router.delete('/test/:id', async (ctx, next) => {
    const data = await testController.dele(ctx.params.id)
    ctx.body = data
})

module.exports = router
```

至此,我们利用 **Sequelize** 完成了一个简单的增删改查

- [sequelize 更多用法](https://sequelize.readthedocs.io/en/latest/docs/getting-started/)
