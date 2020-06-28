# HTTP简介

HTTP协议是Hyper Text Transfer Protocol(超文本传输协议) 的缩写,是用于从万维网 (WWW:World Wide Web) 服务器传输超文本到本地浏览器的传送协议。

HTTP是一个基于TCP/IP通信协议来传递数据 (HTML 文件, 图片文件, 查询结果等)。

HTTP是一个属于应用层的面向对象的协议，由于其简捷、快速的方式，适用于分布式超媒体信息系统。它于1990年提出，经过几年的使用与发展，得到不断地完善和扩展。目前在WWW中使用的是HTTP/1.0的第六版，HTTP/1.1的规范化工作正在进行之中，而且HTTP-NG(Next Generation of HTTP)的建议已经提出。

HTTP协议是由从客户机到服务器的请求(Request)和从服务器到客户机的响应(response)进行约束和规范

![http-response.jpg](https://upload-images.jianshu.io/upload_images/2964446-5a35e17f298a48e1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2)

# 当我们输入网址后发生了什么

- 输入网址并回车
- 解析域名
- 浏览器发送HTTP请求
- 服务器处理请求
- 服务器返回HTML响应
- 浏览器处理HTML页面
- 继续请求其他资源


# 了解 TCP/IP 协议栈

## 应用层

为用户提供各种需要的服务器,例如 :HTTP、FTP、DNS、SMTP等.


## 传输层
- 为应用层实体提供端到端的通信功能，保证数据包的顺序传送及数据的完整性。
- 该层定义了两个主要的协议：传输控制协议（TCP）和用户数据报协议（UDP).


## 网络层
主要解决主机到主机的通信问题. IP 协议是网际互联层最重要的协议

## 网络接口层
负责监视数据在主机和网络之间的交换。


# HTTP 工作原理

一次HTTP操作称为一个事务，其工作过程可分为四步:

## 客户端连接到Web服务器

首先客户机与服务器需要建立连接。只要单击某个超级链接，HTTP的工作开始。

## 发送HTTP请求
建立连接后，客户机发送一个请求给服务器，请求方式的格式为：统一资源标识符(URL)、协议版本号,后边是MIME信息包括请求修饰符、客户机信息和可能的内容

## 服务器接受请求并返回HTTP响应
服务器接到请求后，给予相应的响应信息，其格式为一个状态行，包括信息的协议版本号、一个成功或错误的代码，后边是MIME信息包括服务器信息、实体信息和可能的内容。

## 客户端浏览器解析HTML内容

客户端接收服务器所返回的信息通过浏览器显示在用户的显示屏上，然后客户机与服务器断开连接。

>如果在以上过程中的某一步出现错误，那么产生错误的信息将返回到客户端，有显示屏输出。对于用户来说，这些过程是由HTTP自己完成的，用户只要用鼠标点击，等待信息显示就可以了。

# HTTP之请求消息Request

客户端发送一个HTTP请求到服务器的请求消息包括以下格式：

**请求行（request line）、请求头部（header）、空行和请求数据四个部分组成。**

![request.png](https://upload-images.jianshu.io/upload_images/2964446-fdfb1a8fce8de946.png?imageMogr2/auto-orient/strip%7CimageView2/2)

![re.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338564964-2c0a992a-55e8-4b87-bb3e-0c7f45c41b25.png)

## 空行
很重要，用来区分开 **头部** 和 **实体**。

问: 如果说在头部中间故意加一个空行会怎么样?
那么空行后的内容全部被视为实体。

## 实体
就是具体的数据了，也就是body部分。请求报文对应请求体, 响应报文对应响应体。

头部字段的格式:
- 字段名不区分大小写
- 字段名不允许出现空格，不可以出现下划线 <font color="#ff502c">_</font>
- 字段名后面必须紧接着 <font color="#ff502c">:</font>

# HTTP之响应消息Response

![response.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338592086-eb720aac-dd35-419e-adea-1d203b148248.png?x-oss-process=image%2Fresize%2Cw_746)

# 请求方法

- GET 请求获取Request-URI所标识的资源
- POST  在Request-URI所标识的资源后附加新的数据
- HEAD 请求获取由Request-URI所标识的资源的响应消息报头
- PUT 请求服务器存储一个资源，并用Request-URI作为其标识
- DELETE 请求服务器删除Request-URI所标识的资源
- TRACE 请求服务器回送收到的请求信息，主要用于测试或诊断
- CONNECT HTTP/1.1协议中预留给能够将连接改为管道方式的代理服务器。
- OPTIONS 请求查询服务器的性能，或者查询与资源相关的选项和需求

# HTTP状态码

**状态代码有三位数字组成，第一个数字定义了响应的类别，共分五种类别:**

- **1xx：指示信息--表示请求已接收，继续处理**
  
- **2xx：成功--表示请求已被成功接收、理解、接受**

- **3xx：重定向--要完成请求必须进行更进一步的操作**

- **4xx：客户端错误--请求有语法错误或请求无法实现**

- **5xx：服务器端错误--服务器未能实现合法的请求**

**常见状态码：**
 | 状态码  | 解释 |   
 |------  | ----  |
 | 200 OK  | 客户端请求成功 |
 |304 Not Modified | 当协商缓存命中时会返回这个状态码 |
 | 400 Bad Request  | 客户端请求有语法错误，不能被服务器所理解 |
 | 401 Unauthorized | 请求未经授权，这个状态代码必须和WWW-Authenticate报头域一起使用 |
 | 403 Forbidden    | 服务器收到请求，但是拒绝提供服务 |
 | 404 Not Found    | 请求资源不存在，eg：输入了错误的URL | 
 | 500 Internal Server Error | 服务器发生不可预期的错误 |
 | 503 Server Unavailable | 服务器当前不能处理客户端的请求，一段时间后可能恢复正常 |

 更多状态码  [状态码](https://www.runoob.com/http/http-status-codes.html)


# GET 和 POST 有什么区别?
差别如下:
- 从缓存的角度，GET 请求会被浏览器主动缓存下来，留下历史记录，而 POST 默认不会
- 从编码的角度，GET 只能进行 URL 编码，只能接收 ASCII 字符，而 POST 没有限制
- 从参数的角度，GET 一般放在 URL 中，因此不安全，POST 放在请求体中，更适合传输敏感信息。
- 从幂等性的角度，GET是幂等的，而POST不是。(幂等表示执行相同的操作，结果也是相同的)
- 从TCP的角度，GET 请求会把请求报文一次性发出去，而 POST 会分为两个 TCP 数据包，首先发 header 部分，如果服务器响应 100(continue), 然后发 body 部分。(火狐浏览器除外，它的 POST 请求只发一个 TCP 包)

# 常用的请求报头

## Accept 

对于Accept系列字段的介绍分为四个部分: 数据格式、压缩方式、支持语言和字符集。

### 数据格式

HTTP 从MIME type取了一部分来标记报文 body 部分的数据类型，这些类型体现在 **Content-Type** 这个字段，当然这是针对于发送端而言，接收端想要收到特定类型的数据，也可以用Accept字段。

具体而言，这两个字段的取值可以分为下面几类:

- text： text/html, text/plain, text/css 等
- image: image/gif, image/jpeg, image/png 等
- audio/video: audio/mpeg, video/mp4 等
- application: application/json, application/javascript, application/pdf, application/octet-stream

### 压缩方式

一般这些数据都是会进行编码压缩的，采取什么样的压缩方式就体现在了发送方的 **Content-Encoding** 字段上， 同样的，接收什么样的压缩方式体现在了接受方的Accept-Encoding字段上。这个字段的取值有下面几种：

- gzip: 当今最流行的压缩格式
- deflate: 另外一种著名的压缩格式
- br: 一种专门为 HTTP 发明的压缩算法


```js
// 发送端
Content-Encoding: gzip
// 接收端
Accept-Encoding: gzip

```

### 支持语言

对于发送方而言，还有一个 **Content-Language** 字段，在需要实现国际化的方案当中，可以用来指定支持的语言，在接受方对应的字段为 **Accept-Language**。如:

```js
// 发送端
Content-Language: zh-CN, zh, en
// 接收端
Accept-Language: zh-CN, zh, en

```
### 字符集
一个比较特殊的字段, 在接收端对应为 **Accept-Charset**,指定可以接受的字符集，而在发送端并没有对应的Content-Charset, 而是直接放在了Content-Type中，以charset属性指定。如

```js
// 发送端
Content-Type: text/html; charset=utf-8
// 接收端
Accept-Charset: charset=utf-8

```

![Accept.png](https://user-gold-cdn.xitu.io/2020/3/22/170ffd6bb6d09c2d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

## Authorization

Authorization 请求报头域主要用于证明客户端有权查看某个资源。当浏览器访问一个页面时，如果收到服务器的响应代码为 **401(未授权)**,可以发送一个包含 **Authorization** 请求报头域的请求，要求服务器对其进行验证。

## HOST

Host请求报头域主要用于指定被请求资源的Internet主机和端口号，它通常从HTTP URL中提取出来的，发送请求时，该报头域是必需的。

## User-Agen

User-Agent 请求报头域允许客户端将它的操作系统、浏览器和其它属性告诉服务器

# 常见的响应报头

## Location
响应报头域用于重定向接受者到一个新的位置。Location响应报头域常用在更换域名的时候。

## Server
Server响应报头域包含了服务器用来处理请求的软件信息。与UserAgent请求报头域是相对应的

## WWW-Authenticate
WWW-Authenticate响应报头域必须被包含在401（未授权的）响应消息中，客户端收到401响应消息时候，并发送Authorization报头域请求服务器对其进行验证时，服务端响应报头就包含该报头域


# 常用的实体报头
请求和响应消息都可以传送一个实体。一个实体由实体报头域和实体正文组成，但并不是说实体报头域和实体正文要在一起发送，可以只发送实体报头域。实体报头定义了关于实体正文(eg：有无实体正文)和请求所标识的资源的元信息


## Content-Encoding
实体报头域被用作媒体类型的修饰符，它的值指示了已经被应用到实体正文的附加内容的编码，因而要获得Content-Type报头域中所引用的媒体类型，必须采用相应的解码机制。

## Content-Language
实体报头域描述了资源所用的自然语言

## Content-Length
实体报头域用于指明实体正文的长度，以字节方式存储的十进制数字来表示。

## Content-Type
实体报头域用语指明发送给接收者的实体正文的媒体类型。

## Last-Modified
实体报头域用于指示资源的最后修改日期和时间。

## Expires
实体报头域给出响应过期的日期和时间

# cookies与session

## Cookies
Cookies是保存在客户端的小段文本，随客户端点每一个请求发送该url下的所有cookies到服务器端。

## Session
Session则保存在服务器端，通过唯一的值sessionID来区别每一个用户。SessionID随每个连接请求发送到服务器，服务器根据sessionID来识别客户端，再通过session 的key获取session值。


# Cookie,Session的使用

- Cookie：客户端将服务器设置的Cookie返回到服务器;
- Set-Cookie：服务器向客户端设置Cookie

![cookie](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338627300-36924d4c-d307-40de-a203-c7c4b7060eb6.png)

服务器在响应消息中用Set-Cookie头将Cookie的内容回送给客户端，客户端在新的请求中将相同的内容携带在Cookie头中发送给服务器。从而实现会话的保持

Session 使用

- 使用Cookie来实现
- 使用URL回显来实现


![session](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338653518-737d8717-5aff-4c60-b3ab-d10b2d5d4daa.png)

