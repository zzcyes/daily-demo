const http = require("http");
const url = require("url");
const fs = require('fs');

function renderHTML(name) {
    const { response } = this;
    fs.readFile(`${name}.html`, 'utf-8', (err, data) => {
        if (err) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write(`this ${name} if not found!`);
            response.end();
        } else {
            response.end(data);
        }
    });
};

function route(pathname) {
    const { response } = this;
    const name = pathname.replace(/^\//, "");
    console.log("About to route a request for " + name);
    if (pathname === 'hello') {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write("Hello World");
        response.end();
    } else {
        renderHTML.call(this, name);
    }
}

const start = (port = 3000) => {
    function onRequest(request, response) {
        const pathname = url.parse(request.url).pathname;
        const app = { request, response };
        route.call(app, pathname)
    }
    const server = http.createServer(onRequest).listen(port);
    console.log(`Server has started:http://127.0.0.1:${port}`);
    return server;
}

exports.start = start;
