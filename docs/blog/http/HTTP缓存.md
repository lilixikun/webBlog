# HTTP缓存

缓存会根据请求保存输出内容的副本,例如html页面,图片,文件,当下一个请求来到的时候：如果是相同的URL，缓存直接使用副本响应访问请求，而不是向源服务器再次发送请求

**浏览器第一次请求**

![nocache.png](/http/nocache.png)

**浏览器再次请求时：**
![cache.png](/http/cache.png)

## 按缓存位置分类

我们可以在 Chrome 的开发者工具中，Network -> Size 一列看到一个请求最终的处理方式：如果是大小 (多少 K， 多少 M 等) 就表示是网络请求，否则会列出 **from memory cache**, **from disk cache** 和 **from ServiceWorker**。


它们的优先级是:(由上到下寻找,找到即返回;加不到继续)
1. Server Worker
2. Memory Cache
3. Disk Cache
4. 网络请求

### memory cache

memory cache 是内存中的缓存(相对 disk cache 就是硬盘上的缓存). 几乎所有的网络请求资源都会被浏览器自动加入到 memory cache 。但是也正因为数量很大但是浏览器占用的内存不能无限扩大这样两个因素，memory cache 注定只能是个“短期存储”,也就是  TAB 关闭后 memory cache 便就失效了。

memory cache 机制保证了一个页面中如果有两个相同的请求 (例如两个 src 相同的 <img>，两个 href 相同的 <link>)都实际只会被请求最多一次，避免浪费

在从 memory cache 获取缓存内容时，浏览器会忽视例如 max-age=0, no-cache 等头部配置,如果不想让一个资源进入缓存,短期也不行,那就需要使用 **no-store**

:::tip 测试
打开浏览器随便一个页面,第一次访问百度首页,发现是网络请求得来的,再次访问,发现很多来自 memory cache 的
:::


### disk cache

disk cache 也叫 HTTP cache，顾名思义是存储在硬盘上的缓存，因此它是持久存储的，是实际存在于文件系统中的。而且它允许相同的资源在跨会话，甚至跨站点的情况下使用，例如两个站点都使用了同一张图片。


disk cache 会严格根据 HTTP 头信息中的各类字段来判定哪些资源可以缓存，哪些资源不可以缓存；哪些资源是仍然可用的，哪些资源是过时需要重新请求的。当命中缓存之后，浏览器会从硬盘中读取资源，虽然比起从内存中读取慢了一些，但比起网络请求还是快了不少的。绝大部分的缓存都来自 disk cache。

### Service Worker

Service Worker 能够操作的缓存是有别于浏览器内部的 memory cache 或者 disk cache 的。我们可以从 Chrome 的 F12 中，Application -> Service Workers 找到。除了位置不同之外，这个缓存是永久性的，即关闭 TAB 或者浏览器，下次打开依然还在(而 memory cache 不是)。

如果 Service Worker 没能命中缓存，一般情况会使用 fetch() 方法继续获取资源。这时候，浏览器就去 memory cache 或者 disk cache 进行下一次找缓存的工作了。注意：经过 Service Worker 的 **fetch()** 方法获取的资源，即便它并没有命中 Service Worker 缓存，甚至实际走了网络请求，也会标注为 **from ServiceWorker**

### 请求网络

如果一个请求在上述 3 个位置都没有找到缓存，那么浏览器会正式发送网络请求去获取内容
1. 根据 Service Worker 中的 handler 决定是否存入 Cache Storage 
2. 根据HTTP头部的相关字段(Cache-control)等决定是否存入缓存 disk cache
3. memory cache 保存一份资源 的引用，以备下次使用。

## 按失效策略分类

1. **memory cache** 是浏览器为了加快读取缓存速度而进行的自身的优化行为,不受开发者控制，也不受 HTTP 协议头的约束,算是一个黑盒。
2. **Service Worker** 是由开发者编写的额外的脚本，且缓存位置独立.
3. **disk cache** 其实是我们最熟悉也是说的最多的。主要分为**强缓存**和**协商缓存**,浏览器加载一个页面的简单流程如下:

- 如果未命中协商缓存，则服务器会将完整的资源返回给浏览器，浏览器加载新资源，并更新缓存。

### 强缓存

浏览器先根据这个资源的http头信息来判断是否命中强缓存。如果命中则先访问缓存数据库看是否存在,如果存在缓存中的资源直接返回,并不会将请求发送到服务器。

强缓存是利用http的返回头中的 <font color='red'> Expires </font>或者 <font color='red'> Cache-Control </font>两个字段来控制的，用来表示资源的缓存时间。

#### Expires
缓存过期时间，用来指定资源到期的时间，是服务器端的具体的时间点。如:

```html
Expires: Thu, 10 Nov 2017 08:45:11 GMT
```

在响应消息头中,设置这个字段之后,就可以告诉浏览器,在未过期之前不需要再次请求。
这种方式有一个明显的缺点,由于失效时间是一个绝对时间，所以当客户端本地时间被修改以后，服务器与客户端时间偏差变大以后，就会导致缓存混乱。于是发展出了Cache-Control。

![expires.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338090251-7ea9118e-aae5-460e-baa1-126aaa941b89.png)

#### Cache-Control

Cache-Control是一个相对时间，例如Cache-Control:3600，代表着资源的有效期是3600秒。由于是相对时间，并且都是与客户端时间比较，所以服务器与客户端时间偏差也不会导致问题。

**Cache-Control**与**Expires**可以在服务端配置同时启用或者启用任意一个,同时启用的时候 <font color='red'>Cache-Control优先级高 </font>。

Cache-Control 可以由多个字段组合而成，主要有以下几个取值：
1. **max-age** 指定一个时间长度，在这个时间段内缓存是有效的，单位是s。例如设置 Cache-Control:max-age=31536000，也就是说缓存有效期为（31536000 / 24 / 60 * 60）天，第一次访问这个资源的时候，服务器端也返回了 Expires 字段，并且过期时间是一年后。在没有禁用缓存并且没有超过有效时间的情况下，再次访问这个资源就命中了缓存，不会向服务器请求资源而是直接从浏览器缓存中取。
2. **s-maxage** 同 max-age,覆盖 max-age、Expires，但仅适用于共享缓存，在私有缓存中被忽略。
3. **public** 表明响应可以被任何对象（发送请求的客户端、代理服务器等等）缓存。
4. **private** 表明响应只能被单个用户（可能是操作系统用户、浏览器用户）缓存，是非共享的，不能被代理服务器缓存。
5. **no-cache** 强制所有缓存了该响应的用户,在使用已缓存的数据前，发送带验证器的请求到服务器。不是字面意思上的不缓存。
6. **no-store** 禁止缓存，每次请求都要向服务器重新获取数据。
7. **must-revalidate** 指定如果页面是过期的，则去服务器进行获取。这个指令并不常用，就不做过多的讨论了。

### 协商缓存

若未命中强缓存，则浏览器会将请求发送至服务器。服务器根据 http 头信息中的 **Last-Modified**/**If-Modify-Since**或**Etag**/**If-None-Match**来判断是否命中协商缓存。如果命中，则http返回码为**304**,浏览器从缓存中加载资源。

#### Last-Modified & If-Modified-Since


1. 浏览器第一次请求一个资源的时候，服务器返回的header中会加上 **Last-Modified** 是一个时间标识该资源的最后修改时间，例如
```html
Last-Modified:Thu,31 Dec 2037 23:59:59 GMT。
```

2. 浏览器将这个值和内容一起记录在缓存数据库中

3. 当浏览器再次请求该资源时，发送的请求头中会包含 **If-Modify-Since**,该值为缓存之前返回的 **Last-Modified**。服务器收到 **If-Modify-Since** 后,根据资源的最后修改时间判断是否命中缓存。

4. 如果命中缓存，则响应 <font color='red'>304</font>,并且不会返回资源内容，并且不会返回Last-Modified。由于对比的服务端时间，所以客户端与服务端时间差距不会导致问题。但是有时候通过最后修改时间来判断资源是否修改还是不太准确(资源变化了最后修改时间也可以一致)。于是出现了 **ETag/If-None-Match**。

#### ETag/If-None-Match

**Etag** 返回的是一个特殊标识（一般都是 hash 生成）. **Etag** 可以保证每一个资源是唯一的,资源变化都会导致 **Etag**变化。ETag值的变更则说明资源状态已经被修改。服务器根据浏览器上发送的 **If-None-Match** 值来判断是否命中缓存。命中缓存返回 <font color='red'>304</font>,不命中返回新资源 <font color='red'>200</font>

![Etag.png](/http/Etag.png)

## 浏览器的行为
所谓浏览器的行为,指的就是用户在浏览器如何操作时,会出发怎样的缓存策略,有以下三种:
1. 打开网页,输入地址:查找 **disk cache** 中是否匹配. 如有则使用;如没有则发送网络请求
2. 普通刷新(F5):因为 TAB 没有关闭,根据上面所说浏览器会自动缓存一些资源, 因此 memory cache 是可用的,会被优先使用(如果配置的话),其次才是 **disk cache**
3. 强制刷新(Ctrl + F5): 浏览器不使用缓存,因此发送的请求头部均带有 <font color='red'>Cache-control: no-cache</font>(为了兼容，还带了 Pragma: no-cache)。服务器直接返回 200 和最新内容。

## 总结

![cache.png](/optimization/cache.png)

![cache-level.png](/optimization/cache-level.png)
