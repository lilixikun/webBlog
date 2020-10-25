# DOM创建

上章讲到会调用 **completeWork** 创建 DOM 实例,讲到 **HostComponent**,初次创建分别会调用 
1. **createInstance** 创建 DOM 对象

2. **appendAllChildren** 把子树中的DOM对象append到本节点的instance之中

3. **finalizeInitialChildren** 设置DOM对象的属性, 绑定事件等

## createInstance

[createInstance](https://github.com/facebook/react/blob/v16.13.0/packages/react-dom/src/client/ReactDOMHostConfig.js#L232) 可以看到方法的定义

```js
export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): Instance {
  let parentNamespace: string;
  parentNamespace = ((hostContext: any): HostContextProd);
  
  const domElement: Instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  );
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
}
```

这里就是调用 **createElement** 返回了 domElement


### createElement
[createElement](https://github.com/facebook/react/blob/v16.13.0/packages/react-dom/src/client/ReactDOMComponent.js#L387) 可以看到会创建 domElement

```js
export function createElement(
  type: string,
  props: Object,
  rootContainerElement: Element | Document,
  parentNamespace: string,
): Element {
  let isCustomComponentTag;

  const ownerDocument: Document = getOwnerDocumentFromRootContainer(
    rootContainerElement,
  );
  let domElement: Element;
  let namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    if (type === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      const div = ownerDocument.createElement('div');

      div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
      // This is guaranteed to yield a script element.
      const firstChild = ((div.firstChild: any): HTMLScriptElement);
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === 'string') {
      // $FlowIssue `createElement` should be updated for Web Components
      domElement = ownerDocument.createElement(type, {is: props.is});
    } else {
      domElement = ownerDocument.createElement(type);
      if (type === 'select') {
        const node = ((domElement: any): HTMLSelectElement);
        if (props.multiple) {
          node.multiple = true;
        } else if (props.size) {
          node.size = props.size;
        }
      }
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }

  return domElement;
}
```

## appendAllChildren

**appendAllChildren** 负责把子树中的DOM对象 append 到本节点的 **instance** 之中

```js

    appendAllChildren = function(
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
    ) {
    let node = workInProgress.child;
    while (node !== null) {
        if (node.tag === HostComponent || node.tag === HostText) {
        // node.stateNode == workInProgress.child.stateNode 就是子fiber的dom对象
        // 因为创建dom对象是从fiber tree的底部向根创建的，所以能先得到子节点的node.stateNode
        appendInitialChild(parent, node.stateNode);
        } else if (enableFundamentalAPI && node.tag === FundamentalComponent) {
        appendInitialChild(parent, node.stateNode.instance);
        } else if (node.tag === HostPortal) {
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
        continue;
        }
        if (node === workInProgress) {
            return;
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === workInProgress) {
                return;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
};
```

创建 Fiber 树的时候是从根节点 RootFiber 开始创建,现在创建 **DOM** 从底部开始,然后回到 **completeUnitOfWork** 判断 有没有兄弟节点如下:

```js
function completeUnitOfWork(workInProgress) {
    while (true) {
        // 创建 dom 节点
        next= completeWork(workInProgress)
        // 存在新的Fiber节点,退出循环, 回到performUnitOfWork阶段
        if (next !== null) {
            // Completing this fiber spawned new work. Work on that next.
            return next;
        }
        ...
        // 看是否存在同级的兄弟Fiber节点，如存在，则退出completeUnitOfWork阶段，回到beginWork里去
        if (!!siblingFiber) return siblingFiber
        if (!!returnFiber) {
            workInProgress = returnFiber
            continue
        }
        return null
    }
}
```

如果有兄弟节点就继续执行 **completeWork** 创建 DOM,在 **appendAllChildren** 中如果兄弟节点也有子节点则继续递归

1. 创建 DOM 添加 子节点,对应一个 parent 可以添加多个

2. 把兄弟节点的 **return** 指向和 **child** 一样,前面说了 fiber 只有 child 节点,其他节点用 **sibling** 关联

3. 如果没有 **return** 兄弟节点 就往上找 **return**

4. 当找到的 fiber 和当前的 **workInProgress** 同级时退出

::: warning dom实例的挂载
workInProgress.stateNode = instance;
:::

## finalizeInitialChildren

接下来就是绑定属性,代码如下:
```js
export function finalizeInitialChildren(
  domElement: Instance,
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
): boolean {
  setInitialProperties(domElement, type, props, rootContainerInstance);
  return shouldAutoFocusHostComponent(type, props);
}
```

[setInitialProperties](https://github.com/facebook/react/blob/v16.13.0/packages/react-dom/src/client/ReactDOMComponent.js#L503) 代码非常多,下面贴出部分代码

```js
export function setInitialProperties(
  domElement: Element,
  tag: string,
  rawProps: Object,
  rootContainerElement: Element | Document,
): void {
  const isCustomComponentTag = isCustomComponent(tag, rawProps);

  // TODO: Make sure that we check isMounted before firing any of these events.
  let props: Object;
  switch (tag) {
    case 'iframe':
    case 'object':
    case 'embed':
      trapBubbledEvent(TOP_LOAD, domElement);
      props = rawProps;
      break;
    case 'video':
    case 'audio':
      // Create listener for each media event
      for (let i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement);
      }
      props = rawProps;
      break;
    case 'source':
      trapBubbledEvent(TOP_ERROR, domElement);
      props = rawProps;
      break;
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent(TOP_ERROR, domElement);
      trapBubbledEvent(TOP_LOAD, domElement);
      props = rawProps;
      break;
    case 'form':
      trapBubbledEvent(TOP_RESET, domElement);
      trapBubbledEvent(TOP_SUBMIT, domElement);
      props = rawProps;
      break;
    case 'details':
      trapBubbledEvent(TOP_TOGGLE, domElement);
      props = rawProps;
      break;
    case 'input':
      ReactDOMInputInitWrapperState(domElement, rawProps);
      props = ReactDOMInputGetHostProps(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'option':
      ReactDOMOptionValidateProps(domElement, rawProps);
      props = ReactDOMOptionGetHostProps(domElement, rawProps);
      break;
    case 'select':
      ReactDOMSelectInitWrapperState(domElement, rawProps);
      props = ReactDOMSelectGetHostProps(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      ReactDOMTextareaInitWrapperState(domElement, rawProps);
      props = ReactDOMTextareaGetHostProps(domElement, rawProps);
      trapBubbledEvent(TOP_INVALID, domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    default:
      props = rawProps;
  }

  assertValidProps(tag, props);

  // 设置属性
  setInitialDOMProperties(
    tag,
    domElement,
    rootContainerElement,
    props,
    isCustomComponentTag,
  );

  switch (tag) {
    case 'input':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track((domElement: any));
      ReactDOMInputPostMountWrapper(domElement, rawProps, false);
      break;
    case 'textarea':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track((domElement: any));
      ReactDOMTextareaPostMountWrapper(domElement, rawProps);
      break;
    case 'option':
      ReactDOMOptionPostMountWrapper(domElement, rawProps);
      break;
    case 'select':
      ReactDOMSelectPostMountWrapper(domElement, rawProps);
      break;
    default:
      if (typeof props.onClick === 'function') {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
      }
      break;
  }
}
```

在 **setInitialDOMProperties** 方法中我们可以看到属性的设置,以及以下特殊属性的设置,如下:

```js
function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement: Element | Document,
  nextProps: Object,
  isCustomComponentTag: boolean,
): void {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = nextProps[propKey];
    // 当为 style
    if (propKey === STYLE) {
      // Relies on `updateStylesByID` not mutating `styleUpdates`.
      setValueForStyles(domElement, nextProp);
    }
    // 为 dangerouslySetInnerHTML
     else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined;
      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    } 
    // 为 child 当为 独身子 child 直接就是文本
    else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        const canSetTextContent = tag !== 'textarea' || nextProp !== '';
        if (canSetTextContent) {
          setTextContent(domElement, nextProp);
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }
    } else if (
      (enableDeprecatedFlareAPI && propKey === DEPRECATED_flareListeners) ||
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } 
    // autoFocus
    else if (propKey === AUTOFOCUS) {
      // We polyfill it separately on the client during commit.
      // We could have excluded it in the property list instead of
      // adding a special case here, but then it wouldn't be emitted
      // on server rendering (but we *do* want to emit it in SSR).
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
      
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}
```

可以看到对不同的属性分别做了不同的处理,如当遇到是 **style** 属性时 又调用了 **setValueForStyles** 方法

```js
export function setValueForStyles(node, styles) {
  const style = node.style;
  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }
    const isCustomProperty = styleName.indexOf('--') === 0;
    const styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty,
    );
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    if (isCustomProperty) {
      style.setProperty(styleName, styleValue);
    } else {
      style[styleName] = styleValue;
    }
  }
}
```

如对 <font color='red'>float</font> 属性做了特殊处理,其他的就自己看吧,都是流水账代码, 对 **trapBubbledEvent** React 的事件合成我们放在后面再说
