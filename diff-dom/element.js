//虚拟dom 元素对象
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}

//返回虚拟节点
function createElement(type, props, children) {
    return new Element(type, props, children);
}

//设置各种属性
function setAttr(node, key, value) {
    switch (key) {
        case 'value':
            //如果node 是一个input 或者textarea
            if (node.tagName.toUpperCase() === "INPUT" || node.tagName.toUpperCase() === "TEXTAREA") {
                node.value = value
            } else {
                node.setAttribute(key, value)
            }
            break;
        case 'style':
            node.style.cssText = value;
            break;
        //或者别的    
        default:
            node.setAttribute(key, value)
            break;
    }
}

//render将vnode转换成真是dom
function render(eleObj) {
    //创建元素
    let el = document.createElement(eleObj.type);
    //设置属性
    for (const key in eleObj.props) {
        //设置属性的方法
        setAttr(el, key, eleObj.props[key])
    }
    eleObj.children.forEach(child => {
        child = (child instanceof Element) ? render(child) : document.createTextNode(child.children);
        el.appendChild(child)
    });
    return el;
}

function renderDom(el, target) {
    target.appendChild(el);
}

export { createElement, render, Element, renderDom };
