const http = require("http");
const url = require("url");
const fs = require('fs');


function renderHTML(path) {
    const { response } = this;
    let readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/html"
        },
        headType: ""
    }
    var file = fs.readFileSync(path, readOptions.type);
    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${path} html is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

function renderAsset(path) {
    const { response } = this;
    let readOptions = {
        type: "utf-8",
        head: {
            "Content-Type": "text/plain"
        },
        headType: ""
    }
    var file = fs.readFileSync(path, readOptions.type);
    if (!file) {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${path} asset is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

const DATA_MODAL = Object.freeze({
    user: {
        id: '',
        username: '',
        birth: '',
        sex: '',
        job: '',
        message: ''
    }
});

const DATA_BASE = {
    user: [
        {
            id: 1,
            username: 'zzcyes',
            birth: '1997',
            sex: 'boy',
            job: 'FE',
            message: '您很棒！'
        }
    ]
};

function jointMessage(message) {
    let joint = "!";
    if (message) {
        joint = `：${message}`;
    }
    return joint;
};

const MESSAGE = {
    succeed: function (message = "", data = {}) {
        return JSON.stringify({ code: 1, message: `请求成功${jointMessage(message)}`, data })
    },
    failed: function (message = "", data = {}) {
        return JSON.stringify({ code: 0, message: `请求失败${jointMessage(message)}`, data })
    }
};

function findUserIndex(username) {
    return DATA_BASE.user.findIndex(item => item.username === username)
}

function userServer() {
    const { request, response } = this;
    const headers = {
        "Content-Type": "charset=UTF-8;text/plain"
    };
    const method = request.method.toUpperCase();
    let { username } = request.query;
    let userIndex = findUserIndex(username);
    switch (method) {
        case 'GET':
            response.writeHead(200, headers);
            response.write(MESSAGE.succeed("GET-获取资源成功!", DATA_BASE.user[userIndex]));
            response.end();
            break;
        case 'POST':
        case 'PUT':
            let postData;
            request.on('data', function (chuck) {
                postData = chuck;
            });
            request.on('end', function () {
                const {
                    id,
                    username: usernamePOST,
                    birth,
                    sex,
                    job,
                    message
                } = JSON.parse(postData);
                username = usernamePOST;
                userIndex = findUserIndex(username);
                console.log(JSON.parse(postData));
                id && (DATA_BASE.user[userIndex].id = id);
                username && (DATA_BASE.user[userIndex].username = username);
                birth && (DATA_BASE.user[userIndex].birth = birth);
                sex && (DATA_BASE.user[userIndex].sex = sex);
                job && (DATA_BASE.user[userIndex].job = job);
                message && (DATA_BASE.user[userIndex].message = message);

                response.writeHead(200, headers);
                response.write(MESSAGE.succeed("POST-修改数据成功!", DATA_BASE.user[userIndex]));
                response.end();
            });
            break;
        case 'HEAD':
            response.writeHead(200, headers);
            response.write(MESSAGE.succeed("HEAD-获取头部信息成功!", DATA_BASE.user[userIndex]));
            response.end();
            break;
        default:
            response.statusCode = 200;
            response.write(MESSAGE.failed("没有找到对应方法!", DATA_BASE.user[userIndex]));
            response.end();
            break;
    }
}

function route(pathname) {
    const { request, response } = this;
    const name = pathname.replace(/^\//, "");
    console.log("About to route a request for " + name);
    if (/.html$/.test(name)) {
        renderHTML.call(this, name);
    } else if (name === 'user') {
        userServer.call(this, name)
    } else if (name === "request.log") {
        renderAsset.call(this, name);
    } else {
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(`this ${name}  page is not html type!`);
        response.end();
    }
}

const start = (port = 3000) => {
    function onRequest(request, response) {
        const pathname = url.parse(request.url).pathname;
        const { query } = url.parse(request.url, true);
        request.query = query;
        const app = { request, response };
        logRequest.call(app)
        route.call(app, pathname)
    }
    const server = http.createServer(onRequest).listen(port);
    console.log(`Server has started:http://127.0.0.1:${port}`);
    return server;
}

const options = {
    path: 'request.log'
};

function logRequest() {
    const { request } = this;
    const isExists = fs.existsSync(options.path);
    if (isExists) {
        const file = fs.readFileSync(options.path, 'utf-8');
        const fileObj = JSON.parse(file.toString())
        fileObj.unshift(request.headers);
        fs.writeFileSync(options.path, JSON.stringify(fileObj, null, 2))
        return;
    }
    fs.writeFileSync(options.path, JSON.stringify([request.headers], null, 2))
}

exports.start = start;
