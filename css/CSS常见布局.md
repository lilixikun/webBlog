# 水平居中

## 文本/行内元素/行内块级元素

text-align只控制行内内容(文字、行内元素、行内块级元素)如何相对他的块父元素对齐

```css
.parent{
    text-align:center;
}
```
优缺点:
- 缺点:只对行内元素有效,会影响后代行内内容;只有子元素宽度小于父元素才会水平居中。


设置对象上下间距为0，左右自动。
.son{
    margin:0 auto;
}
``` 
缺点
- 必须定宽,不能设置成auto,并且宽度必须小于父元素。

## 多个块级元素
text-align只控制行内内容(文字、行内元素、行内块级元素)如何相对他的块父元素对齐

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
**vertical**生效的前提是元素的display：inline-block。

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
    /* 相当于 top: 50px */
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





