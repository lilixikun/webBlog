# LUR 算法实现

使用双向链表+哈希表实现**LUR**算法

```js
function ListNode(key, val) {
  this.key = key;
  this.val = val;
  this.pre = this.next = null;
}

function LRUCache(max) {
  this.max = max;
  this.size = 0;
  this.map = {};
  this.head = new ListNode();
  this.tail = new ListNode();
  this.head.next = this.tail;
  this.tail.pre = this.head;
}

LRUCache.prototype.get = function (key) {
  if (this.map[key] !== undefined) {
    let node = this.map[key];
    this.removeNode(node);
    this.appendHead(node);
    return node.val;
  } else {
    return -1
  }
};

LRUCache.prototype.removeNode = function (node) {
  let preNode = node.pre;
  let next = node.next;
  preNode.next = next;
  next.pre = preNode;
};

LRUCache.prototype.appendHead = function (node) {
  let next = this.head.next;
  this.head.next = node;
  node.pre = this.head;
  node.next = next;
  next.pre = node;
};

LRUCache.prototype.put = function (key, val) {
  let node = this.map[key];
  if (node !== undefined) {
    this.removeNode(node);
    node.val = val;
  } else {
    node = new ListNode(key, val);
    this.map[key] = node;
    if (this.size < this.max) {
      this.size++;
    } else {
      key = this.removeTail();
      delete this.map[key];
    }
  }
  this.appendHead(node);
};

LRUCache.prototype.removeTail = function () {
  let key = this.tail.pre.key;
  this.removeNode(this.tail.pre)
  return key
};
```
