class Queue {
    constructor() {
        this.count = 0;
        this.lowestCount = 0;
        this.items = {};
    }

    /**
     * 向队列尾部添加一个新的项。
     * @param {*} element 
     */
    enqueue(element) {
        this.items[this.count] = element
        this.count++
    }

    /**
     * 移除队列第一项
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined
        }
        const result = this.items[this.lowestCount]
        delete this.items[this.lowestCount]
        this.lowestCount++
        return result
    }

    /**
     * 返回队列中第一个元素
     */
    peek() {
        if (!this.isEmpty()) {
            return undefined
        }
        return this.items[this.lowestCount]
    }

    /**
     * 如果队列中不包含任何元素，返回 true，否则返回 false。
     */
    isEmpty() {
        return this.size() === 0
    }

    /**
     * 返回队列包含的元素个数，与数组的 length 属性类似。
     */
    size() {
        return this.count - this.lowestCount;
    }

    /**
     * 清空队列
     */
    clear() {
        this.items = {}
        this.count = 0
        this.lowestCount = 0
    }

    toString() {
        if (this.isEmpty()) {
            return ''
        }
        let objString = `${this.items[this.lowestCount]}`;
        for (let i = this.lowestCount + 1; i < this.count; i++) {
            objString = `${objString},${this.items[i]}`;
        }
        return objString;
    }
}

const queue = new Queue()
queue.enqueue('John');
queue.enqueue('Jack');
console.log(queue.toString());
queue.enqueue('Camila');
console.log(queue.toString());
console.log(queue.size());
console.log(queue.isEmpty());
queue.dequeue()
queue.dequeue()
console.log(queue.toString());