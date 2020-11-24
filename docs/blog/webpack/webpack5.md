# webpack5

目标，使用 webpack5 + ts + React 发布一个 react  组件

添加依赖

```js
yarn add typescript ts-loader -D
```

生成 tsconfig.json 文件

```js
tsc --init
```

添加 babel

```js
yarn add babel-loader @babel/core @babel/preset-typescript -D

```

```js
@babel/preset-react
```

样式处理

```js
yarn add style-loader css-loader less less-loader postcss-loader postcss -D
```