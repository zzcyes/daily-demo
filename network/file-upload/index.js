
const Morn = require("../../morn/morn");
const fs = require('fs');
const path = require('path')
const utils = require('../../morn/utils');
const iconv = require('iconv-lite');
const querystring = require('querystring');
const { MESSAGE } = utils;

const commonHeaders = {
    "Content-Type": "text/plain"
};

function saveFile(filePath, fileData) {
    return new Promise((resolve, reject) => {
        const wstream = fs.createWriteStream(filePath);
        wstream.on('open', () => {
            const blockSize = 128;
            const nbBlocks = Math.ceil(fileData.length / (blockSize));
            for (let i = 0; i < nbBlocks; i += 1) {
                const currentBlock = fileData.slice(
                    blockSize * i,
                    Math.min(blockSize * (i + 1), fileData.length),
                );
                wstream.write(currentBlock);
            }

            wstream.end();
        });
        wstream.on('error', (err) => { reject(err); });
        wstream.on('finish', () => { resolve(true); });
    });
}

/**
 * @description unicode转中文
 * @param {String} str
 */
function reconvert(str) {
    str = str.replace(/(\\u)(\w{1,4})/gi, function ($0) {
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi, function ($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi, function ($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
    });

    return str;
}

const handleRoute = function () {
    const { response, request, routeName } = this;
    if (routeName === 'uploadFile') {
        let fileData;

        request.on('data', function (chuck) {
            fileData += chuck;
        });

        request.on('end', async function () {
            var file = querystring.parse(fileData, '\r\n', ':')
            const [contentDisposition, contentType, content] = fileData.split("\r\n").filter(str => str).slice(1, -1)
            const formDataQuery = contentDisposition.split(":")[1].split(";");
            const fileStr = formDataQuery.slice(-1)[0];
            console.log(formDataQuery.slice(-1)[0])
            // const fileName = formDataQuery.slice(-1)[0].match(/^fileName="([^"]*)"$/)[1];
            // console.log({ contentDisposition, contentType, fileName });


            const wrteFile = fs.writeFileSync(`./upload-file/${fileName}`, content);
            console.log('wrteFile:', wrteFile);
            if (wrteFile) {
                commonHeaders["Content-Type"] = 'text/plain;charset=utf-8'
                commonHeaders["Content-Language"] = 'zh-CN'

                response.writeHead(200, commonHeaders);
                response.write(MESSAGE.succeed({ message: '文件提交成功!', data: { url: `upload-file/${fileName}` } }));
                response.end();
                return;
            }

            commonHeaders["Content-Type"] = 'text/plain;charset=utf-8'
            commonHeaders["Content-Language"] = 'zh-CN'

            response.writeHead(200, commonHeaders);
            response.write(MESSAGE.succeed({ code: 0, message: '文件提交失败!', data: { url: 'upload-file' } }));
            response.end();
        })
    } else {
        response.writeHead(200, commonHeaders);
        response.write(`this request url ${routeName} is not exist!`);
        response.end();
    }
}

new Morn({ port: 3000, handleRoute });

