<!-- TOC -->

- [基础选择<!-- TOC -->](#基础选择---toc---)
    - [1.1 ID选择器](#11-id选择器)
    - [1.2 类选择器](#12-类选择器)
    - [1.3 通配符选择器](#13-通配符选择器)
    - [1.4标签选择器](#14标签选择器)
    - [1.5 属性选择器](#15-属性选择器)
- [2.组合选择器](#2组合选择器)
    - [2.1 后代选择器](#21-后代选择器)
    - [2.2 子元素选择器](#22-子元素选择器)
    - [2.3相邻兄弟选择器](#23相邻兄弟选择器)
    - [2.4通用兄弟选择器](#24通用兄弟选择器)
    - [2.5交集选择器](#25交集选择器)
    - [2.6并集选择器](#26并集选择器)

<!-- /TOC -->

## 1.1 ID选择器
 ID选择器使用 "#" 号加ID名称xx来表示，用来选择HTML 中的id="xxx"的DOM元素
 ```html
<div id="page">我是id选择器</div>
 ```
 当我们想给这个元素应用样式时候
```css
#page{
    color:#fff;
    background:#000;
}
```

## 1.2 类选择器
类选择器我们是用 “.” 加上claa名称来表示,用来选择HTML中的class="xx"的DOM元素。

```html
    <li class="list-item">1</li>
    <li class="list-item">2</li>
    <li class="list-item">3</li>
```

把样式加到每一条元素，使用类选择器

```css
.list-item{
   color:red;
   font-size:16px 
}
```

## 1.3 通配符选择器
>通配符选择器使用 * 来选择页面里面的所有元素

```css
*{
    margin:0;
    padding:0;
}
```
由于通配符选择器要把样式覆盖到所有的元素上,因此它的效率不会高。

## 1.4标签选择器

标签选择器就是选中HTML中某一种类的标签，直接使用HTML中的标签名作为肖泽强的名称
```html
li{
    font-size:20px;
}
```
>Tips 标签选择器通常用来重置某些标签的样式,标签选择器的效率也不是很高

## 1.5 属性选择器
属性选择器通过DOM的属性来选择DOM节点，属性选择器用括号"[]"包裹，如下
```css
a[href]{
    color:red;
}
```

属性选择器有如下几种形式
- [attr] 用来选择带有attr属性的元素

- [attr=xxx] 用来选择attr属性等于xxx的元素,如选择文本输入框
```html
<input type="text" value="xuanze"/>>

//css
input[type=text]{
    color:red;
}
```
>这个选择器要注意,xxx和HTML中的属性值必须完全相等才会生效
```html
<input class="input text" type="text" value="xuanze"/>>

//css
input[class="input text"]{
    color:red;
}
```
- [attr~=xxx] 这个选择器中间用了~=,选择属性值包含xx
```html
<input class="input text" type="text" value="xuanze"/>>

//css
input[class~=input]{
    color:red;
}
```

- [attr|xxx] 这个选择器是用来选择为xxx或者xxx- 开头的元素，使用如下

```html
   <div class="article">1</div>
   <div class="article-tile">2</div>
   <div class="article-content">3</div>
   <div class="article_footer">4</div>

   div[class|=article]{
       color:red
   }
```
上面会有article开头的生效，但对第四条不会生效

- [attr^=xxx]，这个选择器会匹配xxx开头,实际就是用正则去匹配属性值,只要是xxx开头就行

如果把选择器改成 div[class^=artice] 那么都会选中了

- [attr$=xxx] 这个选择器用正则匹配属性以XXX结尾的元素

- [attr*=xxx] 这个选择器用正则匹配的方法来选择属性值中包含XXX字符的所有元素。
  


# 2.组合选择器

## 2.1 后代选择器

后代选择器是用空格分隔多个选择器组合,它的作用是在A选择器的后代中找到B选择器所指的元素，如:
```html
<div class="page">
    <div class="acr">
        <p>我是随便写的</p>
    </div>
    <p>我也是随便写的</p>
</div>

.page p {
     color: gold;
     font-size: 20px;
   }
```


## 2.2 子元素选择器
子元素选择器和后代选择器类似，不过子元素只找子元素,不会把所有的后代都找一遍
```css
.page >p{
    color:red
}
```

## 2.3相邻兄弟选择器

相邻兄弟选择器是用来选取某个元素紧邻的兄弟元素,它的语法是"选择器A + 选择器B"
```css
h1+p{
    margin-top:20px;
    color:black;
}
```

## 2.4通用兄弟选择器
通用兄弟选择器和相邻兄弟选择器很相似,它的语法是"选择器A ~ 选择器B"，会匹配选择器A后面所有符合选择器B的元素

```CSS
H1~P{
    color:red
}
```

## 2.5交集选择器
交集选择器是为了找两个或多个选择器的交集,用法就是把两个选择器放在一起,法语"选择器A选择器B"
```css
.list-item.active{
    color:red;
    font-size:20px
}
```

## 2.6并集选择器
并集选择器是为了合并类型的样式,可以是选择器不用单样式相同的CSS语法块合并。并集选择器就是用多个逗号分隔多个选择器,如"选择器A,选择器B"
```CSS
H1,H2,P{
    margin:0;
    padding:0;
}
```