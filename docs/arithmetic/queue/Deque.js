class Deque {
    constructor() {
        this.lowestCount = 0
        this.count = 0
        this.items = {}
    }

    /**
     * 1. 是这个双端队列是空的,直接执行 addBack
     * 2. 元素已经被从双端队列的前端移除 lowestCount >=1
     * 3. lowestCount 为 0 的情况,该方法在双端队列前端添加新的元素。 
     * @param {*} element 
     */
    addFront(element) {
        if (this.isEmpty()) {
            this.addBack(element)
        } else if (this.lowestCount > 0) {
            this.lowestCount--
            this.items[this.lowestCount] = element
        } else {
            for (let i = this.count; i > 0; i--) {
                this.items[i] = this.items[i - 1]
            }
            this.count++;
            this.lowestCount = 0;
            this.items[0] = element;
        }
    }

    /**
     * 该方法在双端队列后端添加新的元素（实现方法和 Queue 类中的enqueue 方法相同）。
     * @param {*} element 
     */
    addBack(element) {
        this.items[this.count] = element
        this.count++
    }

    /**
     * 该方法会从双端队列前端移除第一个元素
     */
    removeFront() {
        if (this.isEmpty()) {
            return undefined
        }
        const result = this.items[this.lowestCount]
        delete this.items[this.lowestCount]
        this.lowestCount++
        return result
    }

    /**
     * 该方法会从双端队列后端移除第一个元素
     */
    removeBack() {
        if (this.isEmpty()) {
            return undefined
        }
        this.count--
        const result = this.items[this.count]
        delete this.items[this.count]
        return result
    }

    /**
     * 该方法返回双端队列前端的第一个元素
     */
    peekFront() {
        if (this.isEmpty()) {
            return undefined
        }
        return this.items[this.lowestCount]
    }

    /**
     * 该方法返回双端队列后端的第一个元素
     */
    peekBack() {
        if (this.isEmpty()) {
            return undefined
        }
        return this.items[this.count - 1]
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

const deque = new Deque();
console.log(deque.isEmpty()); // 输出true
deque.addBack('John');
deque.addBack('Jack');
console.log(deque.toString()); // John, Jack
deque.addBack('Camila');
console.log(deque.toString()); // John, Jack, Camila
console.log(deque.size()); // 输出3
console.log(deque.isEmpty()); // 输出false
deque.removeFront(); // 移除John
console.log(deque.toString()); // Jack, Camila
deque.removeBack(); // Camila 决定离开
console.log(deque.toString()); // Jack
deque.addFront('John'); // John 回来询问一些信息
console.log(deque.toString()); // John, Jack