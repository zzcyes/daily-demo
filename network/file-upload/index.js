
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
        const separator = `--${request.headers['content-type'].split('boundary=')[1]}`

        console.log('separator:',separator);
        let data = Buffer.alloc(0)

        request.on('data', function (chunk) {
            fileData += chunk;
            data = Buffer.concat([data, chunk])
        });

        request.on('end',  function () {
            parseFile(data, separator);
            response.end();
        })
        // request.on('end', async function () {
        //     // var file = querystring.parse(fileData, '\r\n', ':')
        //     const [contentDisposition, contentType, content] = fileData.split("\r\n").filter(str => str).slice(1, -1)
        //     const formDataQuery = contentDisposition.split(":")[1].split(";");
        //     const fileKeyValueStr = formDataQuery.slice(-1)[0].replace(/[ ]/g,"");
        //     const fileName = fileKeyValueStr.match(/^filename="([^"]*)"$/)[1];
            
        //     // console.log({ contentDisposition, contentType, fileKeyValueStr,fileName });
        //     console.log(fileData.split("\r\n").filter(str => str).slice(1, -1));
         
        
        //     const writeFile = fs.writeFileSync(`./upload-file/${fileName}`, content);
        //     console.log('writeFile:', writeFile);
        //     if (writeFile) {
        //         commonHeaders["Content-Type"] = 'text/plain;charset=utf-8'
        //         commonHeaders["Content-Language"] = 'zh-CN'

        //         response.writeHead(200, commonHeaders);
        //         response.write(MESSAGE.succeed({ message: '文件提交成功!', data: { url: `upload-file/${fileName}` } }));
        //         response.end();
        //         return;
        //     }

        //     commonHeaders["Content-Type"] = 'text/plain;charset=utf-8'
        //     commonHeaders["Content-Language"] = 'zh-CN'

        //     response.writeHead(200, commonHeaders);
        //     response.write(MESSAGE.succeed({ code: 0, message: '文件提交失败!', data: { url: 'upload-file' } }));
        //     response.end();
        // })
    } else {
        response.writeHead(200, commonHeaders);
        response.write(`this request url ${routeName} is not exist!`);
        response.end();
    }
}

function parseHeader(header) {
    const [name, value] = header.split(': ')
    const valueObj = {}
    value.split('; ').forEach(item => {
        const [key, val = ''] = item.split('=')
        valueObj[key] = val && JSON.parse(val)
    })

    return valueObj
}
  


function split(buffer, separator) {
    const res = []
    let offset = 0;
    let index = buffer.indexOf(separator, 0)
    while (index != -1) {
      res.push(buffer.slice(offset, index))
      offset = index + separator.length
      index = buffer.indexOf(separator, index + separator.length)
    }
  
    res.push(buffer.slice(offset))
  
    return res
  }

function parseFile(data, separator) {
    console.log(data, separator);
    // 利用分隔符分割data
    // split 等同于数组的 split
    const bufArr = split(data, separator).slice(1, -1)
    
    bufArr.forEach(item => {
      // 分割 head 与 body
      const [head, body] = split(item, '\r\n\r\n')
      // 可能会存在两行 head，所以用换行符 '\r\n' 分割一下
      // 这里的第一个元素是截取后剩下空 buffer，所以要剔除掉
      const headArr = split(head, '\r\n').slice(1)
      // head 的第一行肯定是 Content-Disposition
      // 通过这个字段肯定能拿到文件名
      // 通过parseHeader解析head
      const headerVal = parseHeader(headArr[0].toString())
      // 如果 head 内存在 filename 字段，则代表是一个文件
      console.log('headerVal.filename:',headerVal.filename);
      if (headerVal.filename) {
        // 写入文件到磁盘
        fs.writeFile(path.resolve(__dirname, `./upload-file/${headerVal.filename}`), body.slice(0, -2), (err) => {
          if (err) {
            console.log(err)
          }
        })
      }
    })
  }

new Morn({ port: 3000, handleRoute });

