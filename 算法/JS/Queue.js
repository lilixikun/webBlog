class Queue {
    constructor() {
        this.count = 0;
        this.lowestCount = 0;
        this.items = {};
    }

    /**
     * 向队列尾部添加一个（或多个）新的项。
     * @param {*} elements 
     */
    enqueue(elements) {
        this.items[this.count] = elements
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
queue.enqueue(7)
queue.enqueue(8)
queue.dequeue()
console.log(queue.toString());



class Deque {
    constructor() {
        this.lowestCount = 0
        this.count = 0
        this.items = {}
    }

    /**
     * 该方法在双端队列前端添加新的元素。
     * @param {*} element 
     */
    addFront(element) {
        // 第一种场景是这个双端队列是空的
        if (this.isEmpty()) {
            this.addBack(element)
        }
        // 是一个元素已经被从双端队列的前端移除（
        else if (this.lowestCount > 0) {
            this.lowestCount--
            this.items[this.lowestCount] = element
        }
        // 是 lowestCount 为 0 的情况 
        else {
            for (let i = this.count; i > 0; i--) {
                this.items[i] = this.items[i - 1]
                this.count++
                this.items[0] = element
            }
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
console.log(deque.isEmpty());

// deque.addBack('Tom')
// deque.addBack('Li')
// console.log(deque.toString());
// deque.addBack('XK')
// console.log(deque.toString(), deque.size());
// deque.removeFront()
// console.log(deque.toString(), deque.size());
// deque.removeBack()
// console.log(deque.toString(), deque.size());
// deque.addFront('Tom')
// console.log(deque.toString(), deque.size());

// 击鼓传花
function hotPotato(elementsList, num) {
    const queue = new Queue(); // {1} 
    const elimitatedList = [];
    for (let i = 0; i < elementsList.length; i++) {
        queue.enqueue(elementsList[i]); // {2} 
    }
    while (queue.size() > 1) {
        for (let i = 0; i < num; i++) {
            queue.enqueue(queue.dequeue()); // {3} 
        }
        // 取出每次的最后一个
        elimitatedList.push(queue.dequeue()); // {4} 
    }

    return {
        eliminated: elimitatedList,
        winner: queue.dequeue() // {5} 
    };
}

const names = ['John', 'Jack', 'Camila', 'Ingrid', 'Carl'];

const result = hotPotato(names, 7);

result.eliminated.forEach(name => {
    console.log(`${name}在击鼓传花游戏中被淘汰。`);
});
console.log(`胜利者： ${result.winner}`);


// 回文检查
function palindromeChecker(num) {
    if (num < 0 || num > 2 ** 31 - 1) {
        return false
    }
    if (num < 10) {
        return true
    }
    const dequeue = new Deque()
    for (let i = 0; i < String(num).length; i++) {
        dequeue.addBack(String(num)[i])
    }

    let isEqual = true
    let firstChar, lastChar;

    while (dequeue.size() > 1 && isEqual) {
        firstChar = dequeue.removeFront()
        lastChar = dequeue.removeBack()
        if (firstChar !== lastChar) {
            isEqual = false
        }
    }
    return isEqual
}

console.log(palindromeChecker(11011));
