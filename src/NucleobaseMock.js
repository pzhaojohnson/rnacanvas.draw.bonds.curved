export class NucleobaseMock {
  /**
   * Make each one unique.
   */
  id = `${Math.random()}`;

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
