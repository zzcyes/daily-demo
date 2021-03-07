const http = require("http");
const url = require("url");
const fs = require('fs');

function renderHTML(name) {
    const { response } = this;
    fs.readFile(`${name}.html`, 'utf-8', (err, data) => {
        if (err) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write(`this ${name} html is not found!`);
            response.end();
        } else {
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(data);
            response.end();
        }
    });
};

function route(pathname) {
    const name = pathname.replace(/^\//, "");
    console.log("About to route a request for " + name);
    renderHTML.call(this, name);
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
