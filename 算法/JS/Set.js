
class Set {
    constructor() {
        this.items = {}
    }

    /**
     * 向集合添加一个新元素
     * @param {*} element 
     */
    add(element) {
        if (!this.has(element)) {
            this.items[element] = element
            return true
        }
        return false
    }

    /**
     * 从集合移除一个元素
     * @param {*} element 
     */
    delete(element) {
        if (this.has(element)) {
            delete this.items(element)
            return true
        }
        return false
    }

    /**
     * 如果元素在集合中，返回 true，否则返回 false
     * @param {*} element 
     */
    has(element) {
        return Object.prototype.hasOwnProperty.call(this.items, element)
    }

    /**
     * 移除集合中的所有元素
     */
    clear() {
        this.items = {}
    }

    /**
     * 返回集合所包含元素的数量。
     */
    size() {
        return Object.keys(this.items).length
    }

    /**
     * 返回一个包含集合中所有值（元素）的数组
     */
    values() {
        return Object.values(this.items)
    }

    /**
     * 并集
     * @param {*} otherSet 
     */
    union(otherSet) {
        const unionSet = new Set();
        this.values().forEach(element => unionSet.add(element));
        otherSet.values().forEach(element => unionSet.add(element))
        return unionSet
    }

    /**
     * 交集
     * @param {*} otherSet 
     */
    intersection(otherSet) {
        const intersectionSet = new Set();
        const values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (intersectionSet.has(values[i])) {
                intersectionSet.add(values[i])
            }
        }
        return intersectionSet
    }


    /**
     * 差集
     * @param {*} otherSet 
     */
    difference(otherSet) {
        const differenceSet = new Set();
        const values = this.values();

        for (let i = 0; i < values.length; i++) {
            if (!otherSet.has(values[i])) {
                differenceSet.add(values[i])
            }
        }
        return differenceSet
    }

    /**
     * 子集
     * @param {*} otherSet 
     */
    isSubsetOf(otherSet) {
        if (this.size() > otherSet.size()) {
            return false
        }

        const values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (!otherSet.has(values[i])) {
                return false
            }
        }
        return true
    }
}

const setA = new Set();
setA.add(1);
setA.add(2);
const setB = new Set();
setB.add(1);
setB.add(2);
setB.add(3);
const setC = new Set();
setC.add(2);
setC.add(3);
setC.add(4);

console.log(setA.isSubsetOf(setC))
