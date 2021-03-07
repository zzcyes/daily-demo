const http = require("http");
const url = require("url");
const fs = require('fs');
const crypto = require('crypto')

function entitytag(entity) {
    if (entity.length === 0) {
        return '"0-1B2M2Y8AsgTpgAmY7PhCfg"'
    }
    var hash = crypto
        .createHash('md5')
        .update(entity, 'utf8')
        .digest('base64')
        .replace(/=+$/, '')
    var len = typeof entity === 'string'
        ? Buffer.byteLength(entity, 'utf8')
        : entity.length
    return '"' + len.toString(16) + '-' + hash + '"'
}

const images = ['jpg', 'png'];

function renderAsset(path, type) {
    const { request, response } = this;
    let readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/html"
        },
        headType: ""
    }
    if (type === 'image') {
        readOptions = {
            type: "binary",
            head: {
                "Content-Type": "image/jpg;image/png"
            },
            headType: "binary"
        }
    }
    var file = fs.readFileSync(path, readOptions.type);
    console.log('data:', !!file);

    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${path} asset is not found!`);
        response.end();
        return;
    }

    if (type === 'image') {
        readOptions.head["Cache-Control"] = "max-age=5"; // 强缓存
        //readOptions.head["Cache-Control"] = "no-cache"; // 不走强缓存，直接协商缓存
        if (path.includes('png')) {
            // 协商缓存
            // ETag
            var fileHash = entitytag(file);
            readOptions.head["ETag"] = fileHash;
            if (request.headers['if-none-match'] && request.headers['if-none-match'] == fileHash) {
                response.statusCode = 304;
                // response.writeHead(304, readOptions.head);
                response.end();
                return;
            }

            // Last-Modified
            var modifyTime = fs.statSync(path).ctime.toGMTString();
            readOptions.head["Last-Modified"] = modifyTime;
            if (request.headers['if-modified-since'] && request.headers['if-modified-since'] >= modifyTime) {
                response.statusCode = 304;
                // response.writeHead(304, readOptions.head);
                response.end();
                return;
            }
        }
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}


function route(pathname) {
    const { response } = this;
    const name = pathname.replace(/^\//, "");
    console.log("About to route a request for " + name);
    if (/.(jp)|(pn)g$/.test(name)) {
        renderAsset.call(this, name, 'image');
    } else if (/.html$/.test(name)) {
        renderAsset.call(this, name);
    } else {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${name}  is not html or image!`);
        response.end();
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
