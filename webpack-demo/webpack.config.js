const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const entryPaths = fs.readdirSync("./src")
                    .filter(name=>/.js$/.test(name))
                    .map(name=>`./src/${name}`)

console.log(entryPaths)

module.exports = {
    mode:"development",
    entry:'./src/app.js',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename: "app.js",
    },
    module: {
        rules: [
            {
                test:/\.js$/,
                use:'babel-loader',
            },
            {
                test: /\.css|\.less$/,
                use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        }, 
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        }, 
                        {
                            loader: "less-loader" // compiles Less to CSS
                        }
                ]
            },
            {
                test:/\.(png|jpg|gif|jpeg)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:1024000
                        }
                    }
                ]
            }
            
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./src/assets/template.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer:{
        contentBase:"./dist",
        hot:true
    }
}