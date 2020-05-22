## 两栏布局  

float +  margin-left 实现


```html
<div class="left"></div>
<div class="right"></div>
```

```css
div {
    height: 200px;
}

.left {
    width: 500px;
    float: left;
    background-color: red;
}

.right {
    background-color: forestgreen;
    margin-left: -500px;
}
```
float + BFC

```css
.right {
    background-color: forestgreen;
    /* 触发BFC */
    overflow: auto;
}
```


## 三栏布局

```html
<div class="left"></div>
<div class="right"></div>
<div class="center "></div>
```

```css
.left,
.right {
    width: 200px;
    background-color: firebrick;
}

.left {
    float: left;
}

.right {
    float: right;
}

.center {
    margin: 0 200px;
    background-color: yellowgreen;
}
```