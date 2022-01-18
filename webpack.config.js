const path = require('path')                            // core nodejs 모듈 중 하나, 파일 경로 설정할 때 사용
const HtmlWebpackPlugin = require('html-webpack-plugin')// index.html 파일을 dist 폴더에 index_bundle.js 파일과 함께 자동으로 생성, 우리는 그냥 시작만 하고싶지 귀찮게 index.html 파일까지 만들고 싶지 않다.!!
const Dotenv = require('dotenv-webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    mode : 'production',                                  
    entry: ["@babel/polyfill", "./src/index.js"],       // 리액트 파일이 시작하는 곳
    output: {                                           // bundled compiled 파일
        path: path.join(__dirname, '/build'),           //__dirname : 현재 디렉토리, dist 폴더에 모든 컴파일된 하나의 번들파일을 넣을 예정
        filename: 'index_bundle.js'
    },
    module: {                                           // javascript 모듈을 생성할 규칙을 지정 (node_module을 제외한.js 파일을 babel-loader로 불러와 모듈을 생성
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/env',
                        '@babel/preset-react'
                    ]
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader",
                // Compiles Sass to CSS
                "sass-loader",
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ]
    },
    devServer: {
        port: 3000,
    },
    resolve: {
        fallback: {
            path: require.resolve("path-browserify")
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'                // 생성한 템플릿 파일
        }),
        new Dotenv({
            path: './.env',
        }),
    ],
    optimization: {
        minimizer: [new UglifyJsPlugin()],
    },
}