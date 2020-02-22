import { createElement, renderDom, render } from './element';
import diff from './diff';
import patch from './patch'

let vertualDom1 = createElement('ul', { class: 'ul' }, [
    createElement('li', { class: 'li' }, ['a']),
    createElement('li', { class: 'li' }, ['b']),
    createElement('li', { class: 'li' }, ['c'])
])

let vertualDom2 = createElement('ul', { class: 'ul-li' }, [
    createElement('li', { class: 'li' }, [1]),
    createElement('li', { class: 'li' }, ['b']),
    createElement('div', { class: 'li' }, ['c']),
    createElement('li', { class: 'li' }, ['d'])
])

//将虚拟dom 转换成真是dom
let el = render(vertualDom1);
renderDom(el, window.root)

console.log(vertualDom);

//DOM Diff比较两个虚拟dom 的区别,比较两个对象的区别
//DOM Diff作用根据两个对象找出不同 来更新dom
// 如果平级元素互换 那会导致 重新渲染
// 新增节点也不会渲染
let patches = diff(vertualDom1, vertualDom2)
//给元素打补丁
patch(el, patches);