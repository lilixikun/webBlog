<!-- TOC -->

- [水平居中<!-- TOC -->](#水平居中---toc---)
    - [文本/行内元素/行内块级元素](#文本行内元素行内块级元素)
    - [块状元素的水平居中（定宽）](#块状元素的水平居中定宽)
    - [多个块级元素](#多个块级元素)
    - [使用绝对定位实现](#使用绝对定位实现)
    - [flex布局](#flex布局)
- [垂直居中](#垂直居中)
    - [单行文本/行内元素](#单行文本行内元素)
    - [通过verticle-align:middle实现CSS垂直居中](#通过verticle-alignmiddle实现css垂直居中)
    - [使用Table-cell实现](#使用table-cell实现)
    - [使用定位](#使用定位)
    - [使用flex align-items](#使用flex-align-items)
- [水平垂直居中](#水平垂直居中)
    - [水平对齐+行高](#水平对齐行高)
    - [水平+垂直对齐](#水平垂直对齐)
    - [绝对定位](#绝对定位)
    - [flex布局](#flex布局-1)

<!-- /TOC -->

## 文本/行内元素/行内块级元素

text-align只控制行内内容(文字、行内元素、行内块级元素)如何相对他的块父元素对齐

```css
.parent{
    text-align:center;
}
```
优缺点:
- 缺点:只对行内元素有效,会影响后代行内内容;只有子元素宽度小于父元素才会水平居中。


## 块状元素的水平居中（定宽）
设置对象上下间距为0，左右自动。
```css
.son{
    width:200px;
    margin:0 auto;
}
``` 
缺点
- 必须定宽,不能设置成auto,并且宽度必须小于父元素。

## 多个块级元素
text-align只控制行内内容(文字、行内元素、行内块级元素)相对他的块父元素对齐

```css
#parent{
    text-align: center;
}
.son{
    display: inline-block; 
}
```
缺点
- 只对行内内容有效；属性会继承影响到后代行内内容；块级改为inline-block换行、空格会产生元素间隔

## 使用绝对定位实现
子绝父相,利用定位来实现水平居中
```css
.parent {
    width: 100%;
    height: 200px;
    position: relative;
    background-color: firebrick;
    }

.son {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    background-color: blue;
    width: 100px;
    height: 100px;
    }

```

缺点
- 代码多,脱离文档流,transform兼容性不好

## flex布局
使用flex->justify-content 属性
```css
.parent{
    display:flex;
    justifty-content:center;
}
```

# 垂直居中

## 单行文本/行内元素
设置子元素的line-height值等于父元素的height
```css
.parent{
    height:50px;
    line-height:50px;
}
```

## 通过verticle-align:middle实现CSS垂直居中
设置父元素height= line-height,设置子元素的display：inline-block。

```css
.vertical2 {
    width: 500px;
    height: 200px;
    line-height: 200px;
    background-color: fuchsia;
}

.vertical2>div {
    width: 50%;
    height: 50%;
    display: inline-block;
    background-color: salmon;
    vertical-align: middle;
}
```
缺点
- 需要给父元素添加line-height 等于高度,并且会影响子元素

## 使用Table-cell实现
CSS Table，使表格内容对齐方式为middle
```css
.vertical3 {
    width: 500px;
    height: 200px;
    display: table-cell;
    vertical-align: middle;
    background-color: fuchsia;
}
```

## 使用定位

```css
.vertical4 {
    position: relative;
    width: 500px;
    height: 200px;
    background-color: black;
}

.vertical4>div {
    position: absolute;
    top: 50%;
    width: 300px;
    /* 相当于margin-top: 50px  top:0*/
    transform: translateY(-50%);
    height: 100px;
    background-color: #fff;
}
```

## 使用flex align-items
```css
.parent{
    display:flex;
    align-items:center
}
```


# 水平垂直居中

## 水平对齐+行高
text-align + line-height实现单行文本水平垂直居中
```css
.father0 {
    width: 500px;
    height: 200px;
    line-height: 200px;
    text-align: center;
    background-color: black;
}

.son0 {
    width: 100px;
    height: 50px;
    display: inline-block;
    vertical-align: middle;
    background: forestgreen;
}
```


## 水平+垂直对齐

 **table-cell**

 ```css
.father1 {
    width: 500px;
    height: 200px;
    display: table-cell;
    vertical-align: middle;
    background-color: black;
}

.father1 .son1 {
    width: 100px;
    height: 50px;
    background-color: firebrick;
    margin: 0 auto;
}
 ```

>若子元素是图像，不可使用table-cell，而是其父元素用行高替代高度，且字体大小设为0,子元素本身设置vertical-align:middle
```css
.parent{
    text-align: center;
    line-height: 100px;
    /*消除幽灵空白节点的bug*/
    font-size: 0;
}
.img{
    vertical-align: middle;
}
```

## 绝对定位
top、right、bottom、left的值是相对于父元素尺寸的，然后margin或者transform是相对于自身尺寸的，组合使用达到几何上的水平垂直居中

```css
#parent{
    position: relative;
}
#son{
    position: absolute;
    top: 50%;
    left: 50%;
    /*定宽高时等同于margin-left:负自身宽度一半;margin-top:负自身高度一半;*/
    transform: translate(-50%,-50%); 
}
```

缺点
- 使用margin需要知道宽高,transform兼容性不好(ie9+)


已知高度和宽度的元素,设置 top: 0; right: 0; bottom: 0; left: 0; 设置margin： auto的话会无限延伸占满空间并且平分

```css
#parent{
    position: relative;
}
#son{
    position: absolute;
    width: 100px;
    height: 50px;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}
```

缺点 
- 脱离文档流

## flex布局
```css
#parent{
    display: flex;
    justify-content: center;
    align-items: center;
}
```

[代码地址](https://github.com/LiLixikun/webBlog/blob/master/css/middleLayout.html)