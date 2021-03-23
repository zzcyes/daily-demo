function test(EventEmitter) {
    const emitter = new EventEmitter();

    const someoneCb = function (name, action) {
        console.log(`${name}正在${action}！`);
    };

    emitter.on('someone', someoneCb);

    setTimeout(() => {
        emitter.emit('someone', 'zzcyes', '打篮球');
    }, 1000)

    emitter.off('someone', someoneCb);


    setTimeout(() => {
        emitter.emit('someone', 'zzcyeah', '睡觉');
    }, 1500)

    console.log('------分割线------');

    const someoneOnceCb = function (name, action) {
        console.log(`${name}打了一次${action}！`);
    };

    emitter.once('someone-once', someoneOnceCb);

    emitter.emit('someone-once', 'zzcyes', '打篮球');

    emitter.emit('someone-once', 'zzcyeah', '睡觉');
}

module.exports = test
