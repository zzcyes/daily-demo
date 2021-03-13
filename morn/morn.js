const http = require("http");
const fs = require('fs');
const utils = require('./utils');

function Morn({ port, handleRoute }) {
    this.request = null;
    this.response = null;
    this.query = "";
    this.pathname = "";
    this.routeName = "";
    this.port = port || 3000;
    this.handleRoute = handleRoute;
    this.server = this.registerServer();
}

Morn.prototype.registerServer = function () {
    const server = http.createServer(this.onRequest.bind(this)).listen(this.port);
    if (server) {
        console.log(`Server has started:http://127.0.0.1:${this.port}`);;
    }
    return server;
}

Morn.prototype.onRequest = function (request, response) {
    this.onMiddleware(request, response);
    utils.logRequestHeaders(request.headers);
    this.routing();
}

Morn.prototype.onMiddleware = function (request, response) {
    this.request = request;
    this.response = response;
    this.query = utils.parseQuery(this.request.url);
    this.pathname = utils.parseUrl(this.request.url).pathname;
    this.pathname && (this.routeName = this.pathname.replace(/^\//, ""));

}

Morn.prototype.routing = function () {
    const { response, routeName } = this;
    console.log("About to route a request for " + routeName);
    if (/.html$/.test(routeName)) {
        this.renderHTML();
    } else if (/.css$/.test(routeName)) {
        this.renderCSS();
    } else if (routeName === "request.log") {
        this.renderAsset();
    } else if (this.handleRoute) {
        this.handleRoute.bind(this)();
    } else {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${routeName}  page is not html type!`);
        response.end();
    }
}

Morn.prototype.renderHTML = function () {
    const { response, routeName } = this;
    const readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/html"
        },
        headType: ""
    }
    var file = fs.readFileSync(routeName, readOptions.type);
    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${routeName} html is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

Morn.prototype.renderAsset = function () {
    const { response, routeName } = this;
    let readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/plain"
        },
        headType: ""
    }
    var file = fs.readFileSync(routeName, readOptions.type);
    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${routeName} asset is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

Morn.prototype.renderCSS = function () {
    const { response, routeName } = this;
    let readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/css"
        },
        headType: ""
    }
    var file = fs.readFileSync(routeName, readOptions.type);
    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${routeName} asset is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

function jointMessage(message) {
    let joint = "!";
    if (message) {
        joint = `：${message}`;
    }
    return joint;
};

Morn.message = function () {
    return {
        succeed: function ({ code = 1, message = "", data = {} }) {
            return JSON.stringify({ code, message: `请求成功${jointMessage(message)}`, data })
        },
        failed: function ({ code = 0, message = "", data = {} }) {
            return JSON.stringify({ code, message: `请求失败${jointMessage(message)}`, data })
        }
    }
};

module.exports = Morn;
