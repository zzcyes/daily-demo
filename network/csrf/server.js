const http = require("http");
const url = require("url");
const fs = require('fs');

const users = {
    "zzcyes": {
        password: '123456',
        session: '49BCE4B850D2615C70404CAC3B1ED59B',
        money: 0
    },
    "zzcyeah": {
        password: '123456',
        session: 'b73cd02a16151641468803272e',
        money: 99999
    }
};

function renderAsset(path) {
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
        response.write(`this ${path} asset is not found!`);
        response.end();
        return;
    }
    response.writeHead(200, readOptions.head);
    response.write(file, readOptions.headType);
    response.end();
}

function route(pathname) {
    const { request, response } = this;
    const name = pathname.replace(/^\//, "");
    console.log("About to route a request for " + name);
    if (/.html$/.test(name)) {
        renderAsset.call(this, name);
    } else if (name === 'login') {
        if (request.method.toLowerCase() === 'post') {
            let postData;
            request.on('data', function (chuck) {
                postData = chuck;
            });
            request.on('end', function () {
                const { username, password } = JSON.parse(postData);
                const user = users[username];

                console.log(username, password, user);

                if (user && password === user.password) {
                    response.writeHead(200, {
                        "Content-Type": "charset=UTF-8;applation/json",
                        "Set-Cookie": `session=${user.session}`
                    });
                    response.write(JSON.stringify({ code: 1, message: "登陆成功!", session: user.session }));
                    response.end();
                    return;
                }
                response.writeHead(200, { "Content-Type": "charset=UTF-8;applation/json" });
                response.write(JSON.stringify({ code: 0, message: "登录失败!", session: null }));
                response.end();
            });
        } else {
            const { username } = request.query || {};
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write(username);
            response.end();
        }

    } else if (name === 'getMoney') {
        const { username } = request.query;
        const cookie = request.headers['cookie'];
        if (cookie) {
            const session = cookie.split("=")[1];
            if (users[username] && session === users[username].session) {
                response.writeHead(200, { "Content-Type": "charset=UTF-8;applation/json" });
                response.write(JSON.stringify({ code: 1, message: "获取成功!", money: users[username].money }));
                response.end();
                return;
            }
        }
        response.writeHead(200, { "Content-Type": "charset=UTF-8;applation/json" });
        response.write(JSON.stringify({ code: 0, message: "获取失败!", session: null }));
        response.end();
    } else if (name === 'trade') {
        const { give, receive, money } = request.query;
        const givePerson = users[give];
        const receivePerson = users[receive];
        if (givePerson && receivePerson) {
            receivePerson.money += money;
            givePerson.money -= money;
            response.writeHead(200, { "Content-Type": "charset=UTF-8;applation/json" });
            response.write(JSON.stringify({ code: 1, message: "交易成功!", session: null }));
            response.end();
            return;
        }
        response.writeHead(200, { "Content-Type": "charset=UTF-8;applation/json" });
        response.write(JSON.stringify({ code: 0, message: "交易失败!", session: null }));
        response.end();
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
        route.call(app, pathname)
    }
    const server = http.createServer(onRequest).listen(port);
    console.log(`Server has started:http://127.0.0.1:${port}`);
    return server;
}

exports.start = start;
