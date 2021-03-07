const http = require('http')
const url = require('url')
const port = 3000

const server = http.createServer((req, res) => {
    const { query } = url.parse(req.url, true);
    const { callback } = query;
    console.log('req.query', query);
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${callback}({ "name": "Hello JSONP!" })`)
})

server.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}/`)
})
