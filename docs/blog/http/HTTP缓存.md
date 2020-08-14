# HTTP缓存机制

缓存会根据请求保存输出内容的副本,例如html页面,图片,文件,当下一个请求来到的时候：如果是相同的URL，缓存直接使用副本响应访问请求，而不是向源服务器再次发送请求

**浏览器第一次请求**

![nocache.png](https://images2018.cnblogs.com/blog/940884/201804/940884-20180423141945261-83532090.png)

**浏览器再次请求时：**
![cache.png](https://images2018.cnblogs.com/blog/940884/201804/940884-20180423141951735-912699213.png)

## 浏览器缓存分类

浏览器缓存分为**强缓存**和**协商缓存**,浏览器加载一个页面的简单流程如下:

- 浏览器先根据这个资源的http头信息来判断是否命中强缓存。如果命中则直接加在缓存中的资源，并不会将请求发送到服务器。
- 如果未命中强缓存，则浏览器会将资源加载请求发送到服务器。服务器来判断浏览器本地缓存是否失效。若可以使用，则服务器并不会返回资源信息，浏览器继续从缓存加载资源。
- 如果未命中协商缓存，则服务器会将完整的资源返回给浏览器，浏览器加载新资源，并更新缓存。

## 强缓存

命中强缓存时，浏览器并不会将请求发送给服务器。在Chrome的开发者工具中看到http的返回码是200，但是在Size列会显示为(memory cache)。

![memory.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593337779750-952ad0bd-1c7f-44fe-9c66-7db898721b9d.png?x-oss-process=image%2Fresize%2Cw_746)

强缓存是利用http的返回头中的 **Expires** 或者 **Cache-Control** 两个字段来控制的，用来表示资源的缓存时间。

## Expires
缓存过期时间，用来指定资源到期的时间，是服务器端的具体的时间点。也就是说，Expires=max-age + 请求时间，需要和 **Last-modified** 结合使用。但在上面我们提到过，**cache-control**的优先级更高。 Expires是Web服务器响应消息头字段，在响应http请求时告诉浏览器在过期时间前浏览器可以直接从浏览器缓存取数据，而无需再次请求。

![expires.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593338090251-7ea9118e-aae5-460e-baa1-126aaa941b89.png)

该字段会返回一个时间，比如 Expires:Thu,31 Dec 2037 23:59:59 GMT。这个时间代表着这个资源的失效时间,也就是说在2037年12月31日23点59分59秒之前都是有效的，即命中缓存。这种方式有一个明显的缺点，由于失效时间是一个绝对时间，所以当客户端本地时间被修改以后，服务器与客户端时间偏差变大以后，就会导致缓存混乱。于是发展出了Cache-Control。

## Cache-Control

Cache-Control是一个相对时间，例如Cache-Control:3600，代表着资源的有效期是3600秒。由于是相对时间，并且都是与客户端时间比较，所以服务器与客户端时间偏差也不会导致问题。

**Cache-Control** 与 **Expires** 可以在服务端配置同时启用或者启用任意一个,同时启用的时候 **Cache-Control优先级高**。


Cache-Control 可以由多个字段组合而成，主要有以下几个取值：
1. **max-age** 指定一个时间长度，在这个时间段内缓存是有效的，单位是s。例如设置 Cache-Control:max-age=31536000，也就是说缓存有效期为（31536000 / 24 / 60 * 60）天，第一次访问这个资源的时候，服务器端也返回了 Expires 字段，并且过期时间是一年后。在没有禁用缓存并且没有超过有效时间的情况下，再次访问这个资源就命中了缓存，不会向服务器请求资源而是直接从浏览器缓存中取。
2. **s-maxage** 同 max-age,覆盖 max-age、Expires，但仅适用于共享缓存，在私有缓存中被忽略。
3. **public** 表明响应可以被任何对象（发送请求的客户端、代理服务器等等）缓存。
4. **private** 表明响应只能被单个用户（可能是操作系统用户、浏览器用户）缓存，是非共享的，不能被代理服务器缓存。
5. **no-cache** 强制所有缓存了该响应的用户,在使用已缓存的数据前，发送带验证器的请求到服务器。不是字面意思上的不缓存。
6. **no-store** 禁止缓存，每次请求都要向服务器重新获取数据。
7. **must-revalidate** 指定如果页面是过期的，则去服务器进行获取。这个指令并不常用，就不做过多的讨论了。

## 协商缓存

若未命中强缓存，则浏览器会将请求发送至服务器。服务器根据 http 头信息中的 **Last-Modified**/**If-Modify-Since**或**Etag**/**If-None-Match**来判断是否命中协商缓存。如果命中，则http返回码为**304**,浏览器从缓存中加载资源。

### Last-Modified/If-Modify-Since

浏览器第一次请求一个资源的时候，服务器返回的header中会加上Last-Modified，Last-Modified是一个时间标识该资源的最后修改时间，例如 Last-Modified:Thu,31 Dec 2037 23:59:59 GMT。

![Last-Modified.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593337988295-0e78246b-d04a-4966-ba2c-c1bb37dff37c.png)

当浏览器再次请求该资源时，发送的请求头中会包含If-Modify-Since,该值为缓存之前返回的Last-Modified。服务器收到If-Modify-Since后,根据资源的最后修改时间判断是否命中缓存。

![If-Modify-Since.png](https://images2018.cnblogs.com/blog/940884/201804/940884-20180423141732879-1484228353.png)

如果命中缓存，则返回http304，并且不会返回资源内容，并且不会返回Last-Modified。由于对比的服务端时间，所以客户端与服务端时间差距不会导致问题。但是有时候通过最后修改时间来判断资源是否修改还是不太准确(资源变化了最后修改时间也可以一致)。于是出现了ETag/If-None-Match。

### ETag/If-None-Match

与Last-Modified/If-Modify-Since不同的是，Etag/If-None-Match返回的是一个校验码（ETag: entity tag）。ETag可以保证每一个资源是唯一的，资源变化都会导致ETag变化*。ETag值的变更则说明资源状态已经被修改。服务器根据浏览器上发送的If-None-Match值来判断是否命中缓存。

![eTag.png](https://cdn.nlark.com/yuque/0/2020/png/1656137/1593337878486-d5f5f7ad-fb22-4b00-82aa-f1e4cee904ba.png)

## 总结


![cache.png](/optimization/cache.png)

![cache-level.png](/optimization/cache-level.png)

- cache-control
- expries
- etag
- last-modified