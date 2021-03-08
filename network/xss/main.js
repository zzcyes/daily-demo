const fs = require('fs')
const crypto = require('crypto')

var filePath = "./bg.jpg";


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

// const file = fs.readFileSync(filePath);
// console.log(entitytag(file))

