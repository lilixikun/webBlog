# 基本选择器

## ID 选择器

ID 选择器使用 "#" 号加 ID 名称 xx 来表示，用来选择 HTML 中的 id="xxx"的 DOM 元素

```html
<div id="page">我是id选择器</div>
```

当我们想给这个元素应用样式时候

```css
#page {
  color: #fff;
  background: #000;
}
```

## 类选择器

类选择器我们是用 “.” 加上 claa 名称来表示,用来选择 HTML 中的 class="xx"的 DOM 元素。

```html
<li class="list-item">1</li>
<li class="list-item">2</li>
<li class="list-item">3</li>
```

把样式加到每一条元素，使用类选择器

```css
.list-item {
  color: red;
  font-size: 16px;
}
```

## 通配符选择器

> 通配符选择器使用 \* 来选择页面里面的所有元素

```css
* {
  margin: 0;
  padding: 0;
}
```

由于通配符选择器要把样式覆盖到所有的元素上,因此它的效率不会高。

## 标签选择器

标签选择器就是选中 HTML 中某一种类的标签，直接使用 HTML 中的标签名作为肖泽强的名称

```css
li {
  font-size: 20px;
}
```

> Tips 标签选择器通常用来重置某些标签的样式,标签选择器的效率也不是很高

## 属性选择器

属性选择器通过 DOM 的属性来选择 DOM 节点，属性选择器用括号"[]"包裹，如下

```css
a[href] {
  color: red;
}
```

属性选择器有如下几种形式

- [attr] 用来选择带有 attr 属性的元素

- [attr=xxx] 用来选择 attr 属性等于 xxx 的元素,如选择文本输入框

```css
<input type="text" value="xuanze"/>>

//css
input[type=text] {
  color: red;
}
```

> 这个选择器要注意,xxx 和 HTML 中的属性值必须完全相等才会生效

```html
<input class="input text" type="text" value="xuanze" />> //css
input[class="input text"]{ color:red; }
```

- [attr~=xxx] 这个选择器中间用了~=,选择属性值包含 xx

```html
<input class="input text" type="text" value="xuanze" />> //css
input[class~=input]{ color:red; }
```

- [attr|xxx] 这个选择器是用来选择为 xxx 或者 xxx- 开头的元素，使用如下

```html
<div class="article">1</div>
<div class="article-tile">2</div>
<div class="article-content">3</div>
<div class="article_footer">4</div>

div[class|=article]{ color:red }
```

上面会有 article 开头的生效，但对第四条不会生效

- [attr^=xxx]，这个选择器会匹配 xxx 开头,实际就是用正则去匹配属性值,只要是 xxx 开头就行

如果把选择器改成 div[class^=artice] 那么都会选中了

- [attr$=xxx] 这个选择器用正则匹配属性以 XXX 结尾的元素

- [attr*=xxx] 这个选择器用正则匹配的方法来选择属性值中包含 XXX 字符的所有元素。

# 组合选择器

## 后代选择器

后代选择器是用空格分隔多个选择器组合,它的作用是在 A 选择器的后代中找到 B 选择器所指的元素，如:

```html
<div class="page">
  <div class="acr">
    <p>我是随便写的</p>
  </div>
  <p>我也是随便写的</p>
</div>

.page p { color: gold; font-size: 20px; }
```

## 子元素选择器

子元素选择器和后代选择器类似，不过子元素只找子元素,不会把所有的后代都找一遍

```css
.page > p {
  color: red;
}
```

## 相邻兄弟选择器

相邻兄弟选择器是用来选取某个元素紧邻的兄弟元素,它的语法是"选择器 A + 选择器 B"

```css
h1 + p {
  margin-top: 20px;
  color: black;
}
```

## 通用兄弟选择器

通用兄弟选择器和相邻兄弟选择器很相似,它的语法是"选择器 A ~ 选择器 B"，会匹配选择器 A 后面所有符合选择器 B 的元素

```CSS
H1~P{
    color:red
}
```

## 交集选择器

交集选择器是为了找两个或多个选择器的交集,用法就是把两个选择器放在一起,法语"选择器 A 选择器 B"

```css
.list-item.active {
  color: red;
  font-size: 20px;
}
```

## 并集选择器

并集选择器是为了合并类型的样式,可以是选择器不用单样式相同的 CSS 语法块合并。并集选择器就是用多个逗号分隔多个选择器,如"选择器 A,选择器 B"

```CSS
H1,H2,P{
    margin:0;
    padding:0;
}
```

# 伪类和伪元素选择器

## 标记状态的伪类

- :link
  选取未访问过的超链接

- :visited
  选取访问过的连接

- :hover
  选取鼠标悬浮的元素

- :active
  选取点中的元素

- :focus
  选取获取焦点的元素

## 筛选功能的伪类

- :empty
  选取没有子元素的元素

- :checked
  选取勾选状态下的 input 元素 只对 radio 和 checkbox 有效

- :disabled
  选取禁用的表单元素

- :first-child
  选取当前选择器下的第一个元素

- :last-child
  选取当前选择器下的最后一个元素

- :nth-child(an+b)
  选取指定位置的元素,参数支持 an+b 的形势.比如 li:nth(2n+1),就可以选取 li 元素序号是 2 的整数倍+1 的所有元素,也就是 1,3,5,7,9 序号的 li 元素

- :nth-last-child(an+b)
  和上面类似,不过从后面选取.

- :only-child
  选取元素唯一的子元素,如果元素的父元素只有它一个子元素就会生效,如果还有其他的兄弟元素,则不生效

- :only-of-type
  选取唯一的某个元素类型。如果元素的父元素只有它一个当前类型的子元素就会生效。

## 伪元素选择器

伪元素选择器是用来香元素设置某种特殊效果.伪元素选择器并不是真实的 DOM 元素,所以称之伪元素.常用的如下:

- ::first-line
  为元素的第一行使用样式

- ::first-letter
  为某个元素的首字母或第一个文字使用样式

- ::before
  在某个元素之前插入内容

- ::after
  在某个元素之后插入内容

- ::selection
  对光标选中的元素添加样式

```tip
1.伪元素构造的元素是虚拟的,所以不能使用js去操作

2.first-line和first-letter不使用于内联样式,在内联样式中都会失效

3.如果同时使用了 befor 和first-letter. 第一个内容要从before中算起,如果before 中第一个为非文本内容,那first-letter也会作用到这个非文本内容上,但不会生效。

4.在CSS3 中规定, 伪类用一个冒号 (:) 表示, 伪元素用两个冒号 (::)来表示
```

## 优先级

- !important 10000
- ID -- 0100
- 类选择器,属性选择器或者伪类 如 .class | :hover,:link,:target | [type] 0010
- 标签 | 伪元素 选择器 如 p | ::after, ::before, ::fist-inline, ::selection 0001
- 通配符选择器 0000
