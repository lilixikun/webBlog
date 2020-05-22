## 圣杯布局

```html
<header>我是头部</header>

<div class="center">
    <div class="main">
        <p>我最重要</p>
    </div>
    <div class="left">左边边</div>
    <div class="right">右边边</div>
</div>

<footer>我是底部</footer>
```

```css
header,
footer {
    background-color: cadetblue;
    text-align: center;
    height: 100px;
    line-height: 60px;
}

.center {
    width: 100%;
    background: coral;
}

.main {
    float: left;
    width: 100%;
    background: yellow;
    height: 200px;
}

.main p {
    padding: 0 100px 0 200px;
}

.left {
    float: left;
    margin-left: -100%;
    width: 200px;
    position: relative;
    left: 0;
    background: green;
    height: 200px;
}

.right {
    float: left;
    margin-left: -100px;
    width: 100px;
    position: relative;
    background: red;
    height: 200px;
}
```

## 双飞翼布局

```html
<header>我是头部</header>

<div class="center">
    <div class="main-father">
        <div class="main">我最重要</div>
    </div>
    <div class="left">左边边</div>
    <div class="right">右边边</div>
</div>

<footer>我是底部</footer>
```

```css

header,
footer {
    background: antiquewhite;
    height: 100px;
}

.center {
    width: 100%;
    background: coral;

}

.main-father {
    width: 100%;
    float: left;
    background: blueviolet;
}

.main {
    padding: 0 100px 0 200px;
    background: yellow;
    height: 200px;
}

.left {
    float: left;
    margin-left: -100%;
    width: 200px;
    background: green;
    height: 200px;
}

.right {
    float: left;
    margin-left: -100px;
    width: 100px;
    background: red;
    height: 200px;
}
```