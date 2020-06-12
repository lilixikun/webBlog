class Node {
    constructor(key) {
        this.key = key
        this.left = null
        this.right = null
    }
}

const Compare = {
    LESS_THAN: '<',
    BIGGER_THAN: '>'
}

const defaultCompare = (a, b) => a < b ? Compare.LESS_THAN : Compare.BIGGER_THAN


class BinarySearchTree {
    constructor(compareFn = defaultCompare) {
        this.compareFn = compareFn
        this.root = null
    }

    /**
     * 向树中插入一个新的键
     * @param {*} key 
     */
    insert(key) {
        if (this.root == null) {
            this.root = new Node(key)
        } else {
            this.insertNode(this.root, key)
        }
    }

    insertNode(node, key) {
        if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
            if (node.left == null) {
                node.left = new Node(key)
            } else {
                this.insertNode(node, key)
            }
        } else {
            if (node.right == null) {
                node.right = new Node(key)
            } else {
                this.insertNode(node, key)
            }
        }
    }

    /**
     * 在树中查找一个键。如果节点存在，则返回 true；如果不存在，则返回false。
     * @param {*} key 
     */
    search(key) {
        return this.searchNode(this.root, key)
    }

    searchNode(node, key) {
        if (node == null) {
            return false
        }
        if (this.compareFn(key, node.key) === Compare.LESS_THAN) {
            return this.searchNode(node.left, key);
        } else if (
            this.compareFn(key, node.key) === Compare.BIGGER_THAN
        ) {
            return this.searchNode(node.right, key);
        } else {
            return true;
        }
    }

    /**
     * 通过中序遍历方式遍历所有节点
     */
    inOrderTraverse(callback) {
        this.inOrderTraverseNode(this.root, callback)
    }

    inOrderTraverseNode(node, callback) {
        if (node != null) {
            this.inOrderTraverseNode(node.left, callback)
            callback(node.key)
            this.inOrderTraverseNode(node.right, callback)
        }
    }

    /**
     * 通过先序遍历方式遍历所有节点
     */
    preOrderTraverse() {
        this.preOrderTraverseNode(this.root, callback)
    }

    preOrderTraverseNode(node, callback) {
        if (node != null) {
            callback(node.key)
            this.preOrderTraverseNode(node.left, callback)
            this.preOrderTraverseNode(node.right, callback)
        }
    }

    /**
     * 通过后序遍历方式遍历所有节点。
     */
    postOrderTraverse(callback) {
        this.postOrderTraverseNode(this.root, callback)
    }

    postOrderTraverseNode(node, callback) {
        if (node != null) {
            this.postOrderTraverseNode(node.left, callback)
            this.postOrderTraverseNode(node.right, callback)
            callback(node.key)
        }
    }

    /**
     * 返回树中最小的值/键。
     */
    min() {
        return this.minNode(this.root)
    }

    minNode(node) {
        let current = node
        while (current != null && current.left != null) {
            current = current.left
        }
        return current
    }

    /**
     * 返回树中最大的值/键。
     */
    max() {
        return this.maxNode(this.root)
    }

    maxNode(node) {
        let current = node
        while (current != null && current.right != null) {
            current = current.left
        }
        return current
    }

    /**
     * 从树中移除某个键
     * @param {*} key 
     */
    remove(key) {
        this.root = this.removeNode(this.root, key)
    }

    removeNode(node, key) {
        if (node == null) {
            return null
        }
        if (this.compareFn(key, node.key) === Compare.LESS_THAN) { // {3} 
            node.left = this.removeNode(node.left, key); // {4} 
            return node; // {5} 
        } else if (
            this.compareFn(key, node.key) === Compare.BIGGER_THAN
        ) { // {6} 
            node.right = this.removeNode(node.right, key); // {7} 
            return node; // {8} 
        } else {
            // 键等于 node.key 
            // 第一种情况
            if (node.left == null && node.right == null) { // {9} 
                node = null; // {10} 
                return node; // {11} 
            }
            // 第二种情况
            if (node.left == null) { // {12} 
                node = node.right; // {13} 
                return node; // {14} 
            } else if (node.right == null) { // {15} 
                node = node.left; // {16} 
                return node; // {17} 
            }
            // 第三种情况
            const aux = this.minNode(node.right); // {18} 
            node.key = aux.key; // {19} 
            node.right = this.removeNode(node.right, aux.key); // {20} 
            return node; // {21} 
        }
    }
}