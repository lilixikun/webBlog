# CSS 盒子模型与怪异盒模型

盒子模型（Box Modle）可以用来对元素进行布局，包括内边距，边框，外边距，和实际内容这几个部分。

盒子模型分为两种 第一种是 W3c标准的 盒子模型（标准盒模型） 、第二种IE标准的盒子模型（怪异盒模型）

## 标准盒模型

标准盒模型中width指的是内容区域content的宽度;height指的是内容区域content的高度。

标准盒模型下盒子的大小  = content + border + padding + margin

## 怪异盒模型

怪异盒模型中的width指的是内容、边框、内边距总的宽度(content + border + padding);height指的是内容、边框、内边距总的高度

怪异盒模型下盒子的大小= width(content + border + padding) + margin

## box-sizing的使用

想要切换盒模型也很简单，这里需要借助css3的box-sizing属性

```css
box-sizing:content-box; 
box-sizing:border-box;
```