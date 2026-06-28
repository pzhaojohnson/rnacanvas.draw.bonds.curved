export class NucleobaseMock {
  domNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');

  constructor() {
    // make each base unique
    this.domNode.setAttribute('id', 'id-' + `${Math.random()}`.slice(2));

    this.domNode.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
  }

  get id() {
    return this.domNode.getAttribute('id');
  }

  set id(id) {
    this.domNode.setAttribute('id', id);
  }

  centerPoint = {
    x: 0,
    y: 0,
  };

  #eventListeners = {
    'change': [],
  };

  addEventListener(name, listener) {
    this.#eventListeners[name].push(listener);
  }

  dispatchEvent(name) {
    this.#eventListeners[name].forEach(listener => listener());
  }

  removeEventListener(name, listener) {
    this.#eventListeners[name] = this.#eventListeners[name].filter(li => li !== listener);
  }
}
