// class Stack {
//     constructor() {
//         this.items = []
//     }

//     /** 添加一个或多个到栈顶 */
//     push(...elements) {
//         this.items.push(...elements)
//     }

//     /** 移除栈顶的元素 并返回被移除的元素*/
//     pop() {
//         return this.items.pop()
//     }

//     /** 返回栈顶的元素 */
//     peek() {
//         return this.items[this.size() - 1]
//     }

//     /** 判断是否栈内是否有元素*/
//     isEmpty() {
//         return this.items.length === 0
//     }

//     /** 移除栈所有的元素*/
//     clear() {
//         this.items = []
//     }

//     /** 返回栈内的个数 */
//     size() {
//         return this.items.length
//     }
// }

class Stack {
    constructor() {
        this.count = 0;
        this.items = {}
    }
    push(element) {
        this.items[this.count] = element;
        this.count++
    }

    pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        this.count--;
        const result = this.items[this.count];
        delete this.items[this.count];
        return result
    }

    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[this.count - 1];
    }

    size() {
        return this.count;
    }

    isEmpty() {
        return this.count === 0
    }

    clear() {
        this.items = {};
        this.count = 0;
    }

    toString() {
        if (this.isEmpty()) {
            return ''
        }
        let objString = this.items[0];
        for (let i = 1; i < this.count; i++) {
            objString = `${objString},${this.items[i]}`
        }
        return objString
    }
}

const stack = new Stack()
stack.push(1)
console.log(stack.peek());
stack.push(4)
console.log(stack.peek());
console.log(stack.isEmpty());
console.log(stack.toString());
stack.pop()
stack.pop()
console.log(stack.size());


