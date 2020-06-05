class Node {
    constructor(element) {
        this.element = element
        this.next = undefined
    }
}

const defaultEquals = (a, b) => a === b

class LinkedList {
    constructor(equalsFn = defaultEquals) {
        this.count = 0;
        this.head = undefined
        this.equalsFn = equalsFn
    }

    /**
     * 向链表尾部添加一个新元素
     * @param {*} element 
     */
    push(element) {
        const node = new Node(element)
        let current
        if (this.head == null) {
            this.head = node
        } else {
            current = this.head
            // 获得最后一项
            while (current.next != null) {
                current = current.next
            }
            // 将其 next作为新元素,建立链接
            current.next = node
        }
        this.count++
    }

    /**
     * 向链表的特定位置插入一个新元素
     * @param {*} element 
     * @param {*} index 
     */
    insert(element, index) {
        if (index >= 0 && index <= this.count) {
            const node = new Node(element)
            if (index === 0) {
                const current = this.head
                node.next = current
                this.head = node
            } else {
                const previous = this.getElementAt(index - 1)
                const current = previous.next
                node.next = current
                previous.next = node
            }
            this.count++
            return true
        }
        return false
    }

    /**
     * 返回链表中特定位置的元素
     * @param {*} index 
     */
    getElementAt(index) {
        if (index >= 0 && index <= this.count) {
            let node = this.head
            for (let i = 0; i < index && node != null; i++) {
                node = node.next
            }
            return node
        }
        return undefined
    }

    /**
     * 从链表中移除一个元素。
     * @param {*} element 
     */
    remove(element) {
        const index = this.indexOf(element)
        return this.removeAt(index)
    }

    /**
     * 返回元素在链表中的索引。如果链表中没有该元素则返回-1
     * @param {*} element 
     */
    indexOf(element) {
        let current = this.head
        for (let i = 0; i < this.count && current != null; i++) {
            if (this.equalsFn(element, current.element)) {
                return i
            }
            current = current.next
        }
        return -1
    }

    /**
     * 从链表的特定位置移除一个元素
     * @param {*} index 
     */
    removeAt(index) {
        // 检查越界值
        if (index >= 0 && index < this.count) {
            let current = this.head

            // 移除第一项
            if (index === 0) {
                this.head = current.next
            } else {

                let previous = this.getElementAt(index - 1)
                current = previous.next
                // 将 previous 与 current 的下一项链接起来：跳过 current，从而移除它
                previous.next = current.next
            }
            this.count--
            return current.element
        }
        return undefined
    }

    /**
     * 如果链表中不包含任何元素，返回 true，如果链表长度大于 0则返回 false。
     */
    isEmpty() {
        return this.size() === 0
    }

    /**
     * 返回链表包含的元素个数
     */
    size() {
        return this.count
    }

    /**
     * 返回链表
     */
    getHead() {
        return this.head
    }

    /**
     * ：返回表示整个链表的字符串。
     */
    toString() {
        if (this.head == null) {
            return ''
        }
        let objString = `${this.head.element}`;
        let current = this.head.next
        for (let i = 1; i < this.size() && current != null; i++) {
            objString = `${objString},${current.element}`;
            current = current.next;
        }
        return objString;
    }
}

const list = new LinkedList()

list.push(15)
list.push(10)
list.push(20)
list.removeAt(1)
console.log(list.toString());
//console.log(list.getElementAt(1));

