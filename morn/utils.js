const Url = require("url");
const Fs = require('fs');

function parseQuery(url) {
    if (url) {
        const { query } = Url.parse(url, true);
        return query;
    }
    return "";
};

function parseUrl(url) {
    if (url) {
        return Url.parse(url);
    }
    return {};
};

function logRequestHeaders(requestHeaders, optionsPath = "request.log") {
    const isExists = Fs.existsSync(optionsPath);
    if (isExists) {
        const file = Fs.readFileSync(optionsPath, 'utf-8');
        const fileObj = JSON.parse(file.toString())
        fileObj.unshift(requestHeaders);
        Fs.writeFileSync(optionsPath, JSON.stringify(fileObj, null, 2))
        return;
    }
    Fs.writeFileSync(optionsPath, JSON.stringify([requestHeaders], null, 2))
}

function jointMessage(message) {
    let joint = "!";
    if (message) {
        joint = `：${message}`;
    }
    return joint;
};


const MESSAGE = {
    succeed: function ({ code = 1, message = "", data = {} }) {
        return JSON.stringify({ code, message: `请求成功${jointMessage(message)}`, data })
    },
    failed: function ({ code = 0, message = "", data = {} }) {
        return JSON.stringify({ code, message: `请求失败${jointMessage(message)}`, data })
    }
}

module.exports = { parseQuery, parseUrl, logRequestHeaders, MESSAGE };
