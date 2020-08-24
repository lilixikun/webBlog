# ReactElement.js 

暴露出了 以下几个方法 我们进去看看

```js
import {
  createElement as createElementProd,
  createFactory as createFactoryProd,
  cloneElement as cloneElementProd,
  isValidElement,
  jsx as jsxProd,
} from './ReactElement';
```

## createElement

首先 **createElement**

```js
export function createElement(type, config, children) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    // ref和key是两个特殊的属性，要单独处理
    if (hasValidRef(config)) {
      ref = config.ref;

      if (__DEV__) {
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    // 遍历config得到props
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  // createElement可以传递N个参数，N-2就是子元素的个数
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  // 赋值为default
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 创建一个ReactElement
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}
```

可以看到 内部对config,childArray 做完一些基本检测判断后,返回 一个 **ReactElement** 方法来创建 Element, 我们去看看 **ReactElement** 方法

## ReactElement

```js
const ReactElement = function(type, key, ref, self, source, owner, props) {
  // reactElement在内部就是这么一个object
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    // 用来表明react类型，一个Symbol类型
    // 通过Symbol类型可以用来避免一些可能的xss注入
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
  return element;
};
```

可以看到 ReactElement 就是返回一个 element  的对象

## cloneElement

我们再去查看 **cloneElement**  发现内部逻辑和 createElement 基本一致,最后也是一个 ReactElement 方法并传入对应的参数
```js
export function cloneElement(element, config, children) {
    return ReactElement(element.type, key, ref, self, source, owner, props);
}
```

## createFactory

这个方法感觉用的特别少,几乎没有用过,我们还是简单看下

```js
export function createFactory(type) {
  const factory = createElement.bind(null, type);
  // 通过工厂方法创建 Rax 组件实例，该方法就是对 createElement() 的封装，所以 type 参数既可以是标签名字符串，也可以是组件类型。在需要批量创建的场景下可以使用，若使用 JSX 开发，将不会使用到该方法
  factory.type = type;
  return factory;
}  
```

## isValidElement

根据字面意思我们也知道,验证是不是 ReactElement 方法如下

```js
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
```