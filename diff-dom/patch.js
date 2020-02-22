import { render, Element } from './element'

let allPatches;
const ATTRS = 'ATTRS'
const TEXT = 'TEXT';
const REMOVE = 'REMOVE';
const REPLACE = 'REPLACE';
let index = 0;
function patch(node, patches) {
    allPatches = patches;
    //默认那个需要打补丁

    walk(node);
}

function walk(node) {
    let currentPatch = node[index++];
    let childNodes = currentPatch.childNodes;
    childNodes.forEach(child => {
        walk(child)
    });
    if (currentPatch.length > 0) {
        doPatch(node, currentPatch)
    }
}

function doPatch(node, patches) {
    patches.forEach(patch => {
        switch (patch.type) {
            case TEXT:
                node.textContent = patch.text;
                break;
            case ATTRS:
                for (const key in patch.arrts) {
                    const value = patch.arrts[key];
                    if (value) {
                        node.setAttribute(key, value)
                    } else {
                        node.removeAttribute(key)
                    }
                }
                break;
            case REMOVE:
                node.parentNode.removeChild(node);
                break;
            case REPLACE:
                let newNode = (patch.newNode instanceof Element) ? render(patch.newNode) : document.createTextNode(patch.newNode);
                node.parentNode.replaceChild(newNode, node);
                break;
            default:
                break;
        }
    })
}

export default patch;