function EventEmitter() {
    this.events = {};
}

EventEmitter.prototype.on = function (eventName, listener) {
    if (!this.events[eventName]) {
        this.events[eventName] = [listener]
    } else {
        this.events[eventName].push(listener)
    }
}

EventEmitter.prototype.emit = function (eventName, ...args) {
    const events = this.events[eventName];
    if (events && events.length) {
        for (let i = 0; i < events.length; i++) {
            events[i].apply(null, args)
        }
    }
}

EventEmitter.prototype.once = function (eventName, listener) {
    const fn = (...args) => {
        listener.apply(null, args);
        this.off(eventName, fn);
    }
    this.on(eventName, fn);
}

EventEmitter.prototype.off = function (eventName, listener) {
    const events = this.events[eventName];
    if (events && events.length) {
        for (let i = 0; i < events.length; i++) {
            if (events[i] == listener) {
                this.events[eventName].splice(i, 1);
            }
        }
    }
}

module.exports = EventEmitter;
