// 栈数据结构

class Stack {
    constructor() {
        this.count = 0
        this.items = {}
    }

    /**
     * 添加一个（或几个）新元素到栈顶
     * @param {*} element 
     */
    push(element) {
        this.items[this.count] = element
        this.count++
    }

    /**
     * 移除栈顶的元素，同时返回被移除的元素
     */
    pop() {
        if (this.isEmpty()) {
            return undefined
        }
        this.count--
        const result = this.items[this.count]
        delete this.items[this.count]
        return result
    }

    /**
     * ：返回栈顶的元素，不对栈做任何修改（该方法不会移除栈顶的元素，仅仅返回它）
     */
    peek() {
        if (this.isEmpty()) {
            return undefined
        }
        return this.items[this.count - 1]
    }

    /**
     * 如果栈里没有任何元素就返回 true，否则返回 false。
     */
    isEmpty() {
        return this.count === 0
    }

    /**
     * 移除栈里的所有元素
     */
    clear() {
        this.items = {}
        this.count = 0

        // 遵循 LIFO 原则，使用下面的逻辑来移除栈中所有的元素
        // while (!this.isEmpty()) {
        //     this.pop()
        // }
    }

    /**
     * 返回栈里的元素个数。该方法和数组的 length 属性很类似。
     */
    size() {
        return this.count
    }

    /**
     * 创建 toString 方法
     */
    toString() {
        if (this.isEmpty()) {
            return ''
        }
        let objString = `${this.items[0]}`; // {1}
        for (let i = 1; i < this.count.length; i++) {
            objString = `${objString},${this.items[i]}`; // {3}
        }
        return objString
    }
}

const stack = new Stack()
console.log(stack.isEmpty());
stack.push(5)
stack.push(8)
// stack.pop()
// stack.pop()
console.log(stack.toString())


function decimalToBinary(decNumber) {
    const remStack = new Stack();
    let number = decNumber;
    let rem;
    let binaryString = '';
    while (number > 0) {
        rem = Math.floor(number % 2);
        remStack.push(rem)
        number = Math.floor(number / 2)
    }

    while (!remStack.isEmpty()) {
        binaryString += remStack.pop().toString()
    }
    return binaryString
}

console.log(decimalToBinary(233));
