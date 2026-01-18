class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(value) {
    const node = new Node(value);
    if (!this.tail) {
      // First element
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  dequeue() {
    if (!this.head) return null;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      // Queue is now empty
      this.tail = null;
    }
    this.length--;
    return value;
  }

  peek() {
    return this.head?.value ?? null;
  }

  isEmpty() {
    return this.length === 0;
  }
}

export { Queue, peek, dequeue, enqueue, isEmpty }
