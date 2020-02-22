// 先深度优先
// 当前节点相同时,去看下属性是否相同 产生一个属性补丁包 {type:"ATTRS",attrs:{class:'new-class'}}
// 新的dom 不存在 {type:'REMOVE',index:xx}
// 节点类型不相同采用替换模式 {type:'REPLACE',newNode:el}
// 文本的变化 {type:'TEXT',text:xx}

const ATTRS = 'ATTRS'
const TEXT = 'TEXT';
const REMOVE = 'REMOVE';
const REPLACE = 'REPLACE';
let Index = 0;

function isString(node) {
    return Object.prototype.toString.call(node) === '[object String]'
}

function diff(oldTree, newTree) {
    //返回补丁包
    let patches = {};
    let index = 0;
    //递归树比较后的结果放在补丁包
    walk(oldTree, newTree, index, patches)
    return patches
}


function diffAttr(oldArrts, newArrts) {
    let patch = {};
    //判断老的属性和新的属性的不同
    for (const key in oldArrts) {
        if (oldArrts[key] !== newArrts[key]) {
            patch[key] = newArrts[key] //有可能是undefined
        }
    }
    //判断老的属性没有新的 属性
    for (const key in newArrts) {
        if (!oldArrts.hasOwnProperty(key)) {
            patch[key] = newArrts[key]
        }
    }
    return patch
}

function diffChildren(oldChildren, newChildren, patches) {
    oldChildren.forEach((child, idx) => {
        //索引不应该是index了
        // index 是递增的
        walk(child, newChildren[idx], ++Index, patches)
    });
}

function walk(oldNode, newNode, index, patches) {
    //每个元素都有一个补丁对象
    let currentPatch = [];

    if (!newNode) {
        currentPatch.push({ type: REMOVE, index })
    }
    //判断是否是文本
    if (isString(oldNode) && isString(newNode)) {
        if (oldNode !== newNode) {
            currentPatch.push({ type: TEXT, text: newNode })
        }
    }
    else if (oldNode.type === newNode.type) {
        //比较属性是否有更改
        let arrts = diffAttr(oldNode.props, newNode.props);
        if (Object.keys(arrts).length > 0) {
            currentPatch.push({ type: ATTRS, arrts })
        }
        //如果有子节点
        diffChildren(oldNode.children, newNode.children,patches);

    } else {
        //说明节点被替换了
        currentPatch.push({ type: REPLACE, newNode })
    }
    //当前元素确实有补丁
    if (currentPatch.length) {
        //将元素和补丁对应起来 更新到大补丁包
        patches[index] = currentPatch
    }
}

export default diff;