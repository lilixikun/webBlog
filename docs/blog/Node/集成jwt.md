
# Koa 集成 JWT

## 为什么使用 JWT

网上有很多关于 **jwt** 的介绍,这里不做叙述,总结有以下优势:
- 安全性高,防止token被伪造和篡改
- 支持跨域访问: Cookie是不允许垮域访问的，这一点对Token机制是不存在的，前提是传输的用户认证信息通过HTTP头传输.
- 无状态:Token机制在服务端不需要存储session信息，因为Token 自身包含了所有登录用户的信息，只需要在客户端的cookie或本地介质存储状态信息.
- 去耦: 不需要绑定到一个特定的身份验证方案。Token可以在任何地方生成，只要在你的API被调用的时候，你可以进行Token生成调用即可.

## 集成 jwt

安装依赖

```js
npm install jsonwebtoken
```

## 生成 token

在 config 文件里面配置 秘钥(secret) 和 过期时间

```js
...
security: {
    secretKey: 'xikun',
    expiresIn: 60 * 60
}
```

> jwt.sign(payload, secretOrPrivateKey, [options, callback])

- payload 必须是一个object, buffer或者string
- 我们配置的秘钥
- 各种配置

封装生成token 的方法

```js
const generateToken = (uid, scope) => {
    const token = jwt.sign({
        uid,
        scope
    }, secretKey, {
        expiresIn
    })

    return token
}
```

假如我们在用户登录完成后生成了 **token** 并且返回了token 给前端,前端下次携带 token 来,我们如何接收并对其校验呢?

## 编写 Auth 中间件

在我们的接口中,有的需要接口需要登录后才能访问,有的不需要,因此我们必须来进行区分一下. 如下,我们来编写一个中间件来获取 token 并进行校验

```js
class Auth {
/**
 * token 验证
 * @param {*} token 
 */
static verifyToken(token) {
    try {
        jwt.verify(token, secretKey)
        return true
    } catch (error) {
        return false
    }
}
}
```

验证 token 是否正确 只需要调用 **jwt** 的 **verify** 方法即可

我们现在再编写一个方法获取 **headers** 里面的 **authorization** 加密生成的签名

```js

/**
 * 获取请求头Authorization 上的token
 * @param {*} ctx 
 */
static resolveAuthorizationHeader(ctx) {
    if (!ctx.req.headers || !ctx.req.headers.authorization) {
        return false
    }
    const parts = ctx.header.authorization.split(' ');

    if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
            return credentials;
        }
    }
    return false
}

```

我们给 Auth 添加一个 **get** 方法

```js
get verifyToken() {
    return async (ctx, next) => {
        // 获取token
        const token = Auth.resolveAuthorizationHeader(ctx)

        if (!token) {
            throw new AuthFaild('Bad Authorization header format. Format is "Authorization: Bearer <token>"')
        }

        let errMsg = "token 不合法"
        // token 验证
        try {
            var decode = jwt.verify(token, secretKey)
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                errMsg = 'token 已过期请重新登录'
            }
            throw new AuthFaild(errMsg)
        }
        await next()
    }
}

```

编写完了中间件如何使用呢,下来我们在接口中具体使用下:

## 在接口中进行拦截

一个不要登录就能访问的接口如下:

```js
const router = new Router({
    prefix: '/user'
})
router.post('/login', async (ctx) => {
 // do
})
```

现在突然来了一个需要登录才能访问的接口,我们可以这样使用:

```js

const { Auth } = require('../../services/auth')
router.get('/:uid', new Auth().verifyToken, async (ctx) => {
    const { uid } = ctx.params
    if (!uid) {
        throw new ParameterException('uid必填!')
    }

    const res = await UserController.findByUid(uid)

    throw new Success(res)

})

```

OK , 这样我们就集成了 **jwt** 和完成了基本的登陆权限。具体使用方法 请查看 [jsonwebtoken](https://github.com/slava-lu/koa-jwt-auth)

## 使用 koa-jwt

如何你觉得上面的步骤太过于繁琐,你可以集成 **koa-jwt** 来完成上面繁琐的步骤

```js
npm install koa-jwt
```
koa-jwt 使用 非常方面,只需要几行代码便能帮我们实现 生成token,验证token,接口拦截等一系列操作.

```js
var Koa = require('koa');
var jwt = require('koa-jwt');

var app = new Koa();

app.use(jwt({ secret: 'shared-secret' }).unless({ path: [/^\/] }));

```
unless 可以填入多个路径表示 以该路径开头 不进行 token 校验的。更多功能请查看 [koa-jwt](https://github.com/koajs/jwt)

## 用postmen 进行调试 JWT

![jenkins_down.png](/node/jwt_token.png)


在 Headers 里面配置 **Authorization** Value 填入 **Bearer** + **空格** + token ,记住 Bearer 后面必须要有空格 因为这是 jwt 的约定方式
![jenkins_down.png](/node/jwt_Bearer.png)

还有种方法直接点击 **Authorization** 选择 **Bearer Token** 然后直接输入 token 点击发送即可



## JWT 在线验签

我们可以进入 [JWT.IO](https://jwt.io/) 输入 token 和 secret 进行在线验签


![jenkins_down.png](/node/jwt_io.png)


