const http = require("http");
const url = require("url");
const fs = require('fs');

const querystring = require('querystring');

function route(pathname) {
    const { request, response } = this;
    const name = pathname.replace(/^\//, "");
    console.log('======request start======');
    console.log('request methods is:', request.method);
    console.log('request name is:', name);
    console.log('request headers is:', request.headers);

    if (request.method.toLowerCase() === 'post') {
        let postData;

        request.on('data', function (chuck) {
            postData = chuck;
        });

        request.on('end', function () {
            request.body = JSON.parse(postData);
            console.log("request body is:", request.body)
        });
    }


    // if (request.method.toLowerCase() === 'post') {
    //     console.log('request body is:', request);
    // }
    console.log('======request end======');

    let text = "request is succeed!";
    let headers = {
        "content-type": "text/plain"
    };

    switch (name) {
        // 'Access-Control-Allow-Headers': 'Test-CORS, Content-Type',
        // 'Access-Control-Allow-Methods': 'PUT,DELETE',
        //  'Access-Control-Max-Age': 86400
        // 'Access-Control-Allow-Credentials': true
        case 'simple':
            headers['Access-Control-Allow-Origin'] = "http://127.0.0.1:3000";
            // headers['Access-Control-Allow-Headers'] = "my-cookie, Content-Type";
            // headers['Access-Control-Allow-Methods'] = "GET";
            // headers['Set-Cookie'] = "name=zzcyes";
            // headers['Access-Control-Allow-Credentials'] = true;
            // headers['Access-Control-Max-Age'] = "10";
            text = "simple CORS is succeed!"
            break;
        case 'no-simple':
            headers['Access-Control-Allow-Origin'] = "http://127.0.0.1:3000";
            headers['Access-Control-Allow-Headers'] = "DPR,my-cookie, Content-Type";
            headers['Access-Control-Allow-Methods'] = "GET,POST,OPTIONS";
            headers['Set-Cookie'] = "name=zzcyes";
            headers['Access-Control-Allow-Credentials'] = true;
            headers['Access-Control-Max-Age'] = "10";
            text = "no-simple CORS is succeed!"
            break;
        default:
            break;
    }
    console.log('======response start======');

    console.log('response headers is:', headers);
    console.log('response text is:', text);
    console.log('======response end======');

    response.writeHead(200, headers)
    response.write(text);
    response.end();
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
