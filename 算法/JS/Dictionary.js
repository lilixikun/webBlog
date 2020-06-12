const defaultToString = function (item) {
    if (item === null) {
        return 'NULL';
    } else if (item === undefined) {
        return 'UNDEFINED';
    } else if (typeof item === 'string' || item instanceof String) {
        return `${item}`;
    }
    return item.toString();
}

class ValuePair {
    constructor(key, value) {
        this.key = key
        this.value = value
    }

    toString() {
        return `[#${this.key}: ${this.value}]`;
    }
}

class Dictionary {
    constructor(toStrFn = defaultToString) {
        this.toStrFn = toStrFn
        this.table = {}
    }

    /**
     * 向字典中添加新元素。如果 key 已经存在，那么已存在的 value 会被新的值覆盖。
     * @param {*} key 
     * @param {*} value 
     */
    set(key, value) {
        if (key != null && value != null) {
            const tableKey = this.toStrFn(key);
            this.table[tableKey] = new ValuePair(key, value);
            return value
        }
        return false
    }

    /**
     * 通过使用键值作为参数来从字典中移除键值对应的数据值。
     * @param {*} key 
     */
    remove(key) {
        if (this.hasKey(key)) {
            delete this.table[this.toStrFn(key)];
            return true
        }
        return false;
    }

    /**
     * 如果某个键值存在于该字典中，返回 true，否则返回 false。
     * @param {*} key 
     */
    hasKey(key) {
        return this.table[this.toStrFn(key)] != null
    }

    /**
     * 通过以键值作为参数查找特定的数值并返回
     * @param {*} key 
     */
    get(key) {
        const valuePair = this.table[this.toStrFn(key)]
        return valuePair == null ? undefined : valuePair.value
    }

    /**
     * 删除该字典中的所有值。
     */
    clear() {
        this.table = {}
    }

    /**
     * 返回字典值的个数
     */
    size() {
        return Object.keys(this.table).length;
    }

    /**
     * 在 size 等于零的时候返回 true，否则返回 false。
     */
    isEmpty() {
        return this.size() === 0
    }

    /**
     * 将字典所包含的所有键名以数组形式返回。
     */
    keys() {
        return this.keyValues().map(valuePair => valuePair.key)
    }


    /**
     * 将字典所包含的所有数值以数组形式返回。
     */
    values() {
        return this.keyValues().map(valuePair => valuePair.value)
    }

    /**
     * 将字典中所有[键，值]对返回。
     */
    keyValues() {
        const valuePairs = [];
        for (const key in this.table) {
            if (this.hasKey(key)) {
                valuePairs.push(this.table[key])
            }
        }
        return valuePairs
        // 可能不是所有浏览器都支持 Object.values 方法
        // return Object.values(this.table)
    }

    /**
     * 迭代字典中所有的键值对。callbackFn 有两个参数：key 和value。
     * @param {*} callbackFn 
     */
    forEach(callbackFn) {
        const valuePairs = this.keyValues();
        for (let i = 0; i < valuePairs.length; i++) {
            const result = callbackFn(valuePairs[i].key, valuePairs[i].value);
            if (result === false) {
                break;
            }
        }
    }

    toString() {
        if (this.isEmpty()) {
            return '';
        }
        const valuePairs = this.keyValues();
        let objString = `${valuePairs[0].toString()}`; // {1} 
        for (let i = 1; i < valuePairs.length; i++) {
            objString = `${objString},${valuePairs[i].toString()}`; // {2} 
        }
        return objString; // {3} 
    }
}

const dictionary = new Dictionary()
dictionary.set('Gandalf', 'gandalf@email.com');
dictionary.set('John', 'johnsnow@email.com');
dictionary.set('Tyrion', 'tyrion@email.com');
console.log(dictionary.hasKey('Gandalf'));
console.log(dictionary.size());

console.log(dictionary.remove('John'));

console.log(dictionary.keys());
console.log(dictionary.values());
console.log(dictionary.keyValues());

dictionary.forEach((k, v) => {
    console.log(`key: ${k}- value:${v}`)
})


// 散列表
class HashTable {
    constructor(toStrFn = defaultToString) {
        this.toStrFn = toStrFn;
        this.table = {};
    }

    /**
     * 向散列表增加一个新的项（也能更新散列表）
     * @param {*} key 
     * @param {*} value 
     */
    put(key, value) {
        if (key != null && value != null) {
            const position = this.hashCode(key)
            this.table[position] = new ValuePair(key, value)
        }
        return false
    }

    /**
     * 根据键值从散列表中移除值
     * @param {*} key 
     */
    remove(key) {
        const hash = this.hashCode(key)
        const valuePair = this.table[hash]
        if (valuePair != null) {
            delete this.table[hash]
            return true
        }
        return false
    }

    /**
     * 返回根据键值检索到的特定的值。
     * @param {*} key 
     */
    get(key) {
        const valuePair = this.table(this.hashCode(key))
        return valuePair == null ? undefined : valuePair.value
    }

    loseloseHashCode(key) {
        if (typeof key === "number") {
            return key
        }
        const tableKey = this.toStrFn(key)
        let hash = 0
        for (let i = 0; i < tableKey.length; i++) {
            hash += tableKey.charCodeAt(i)

        }
        return hash % 37;
    }

    hashCode(key) {
        return this.loseloseHashCode(key);
    }
}

const hash = new HashTable()
hash.put('Gandalf', 'gandalf@email.com');
hash.put('John', 'johnsnow@email.com');
hash.put('Tyrion', 'tyrion@email.com');
console.log(hash.hashCode('Gandalf') + ' - Gandalf');
console.log(hash.hashCode('John') + ' - John');
console.log(hash.hashCode('Tyrion') + ' - Tyrion');