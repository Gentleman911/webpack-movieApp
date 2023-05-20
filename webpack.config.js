//path模块是nodejs 自带的，不需要额外下载
const path = require('path')
const webpack = require('webpack')
//获取到当前根目录的绝对路径
//__dirname 就能够直接拿到当前目录的绝对路径
// console.log('________',__dirname)

//引入插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//取消单注释文件插件
const TerserPlugin = require("terser-webpack-plugin");


//优化html的以及入口配置代码
const lists = ['index', 'register', 'logon', 'MovieDetails', 'map', 'seats', 'pay']

// const htmlPlugins = lists.map(item=>{
//     return  new HtmlWebpackPlugin({
//         template:`./src/${item}.html`,  //源html文件位置
//         filename:`./${item}.html`,
//         chunks:[item]
//     })
// })

const { NODE_EVN } = process.env;

module.exports = {
    //配置打包的模式
    // mode: 'production', //生产模式
    // mode: 'development', //开发模式
    mode: NODE_EVN,

    //配置项目的入口js
    entry: {
        // index:'./src/js/index.js',
        // login:'./src/js/login.js',
        // register:'./src/js/register.js'
        ...lists.reduce((total, next) => {
            return { ...total, [next]: `./src/js/${next}.js` }
        }, {})
    },
    //配置出口
    output: {
        path: path.resolve(__dirname, 'dist'),  //这个地方必须是一个绝度路径，这里需要用到path.resolve()来拼接绝对路径
        filename: './js/[name].js',  //指定js的打包出口位置
        clean: true //每次打包都清除原本的文件
    },
    //配置插件
    plugins: [
        //处理html文件的配置
        ...lists.map(item => {
            return new HtmlWebpackPlugin({
                template: `./src/${item}.html`,  //源html文件位置
                filename: `./${item}.html`,  //html文件出口
                chunks: [item]               //html引入其他文件名<例如：css和script文件>
            })
        }),
        new MiniCssExtractPlugin({
            filename: './css/[name].css'  //css存放出口
        }),

        // 引入jQuery
        new webpack.ProvidePlugin({
            "$": "jquery",
            "jQuery": "jquery"
        }),
    ],

    // 取消单独注释文件夹
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,//不将注释提取到单独的文件中
            }),
        ],
    },



    //配置loader
    module: {
        rules: [
            {
                test: /\.css$/i, //正则验证css文件
                use: [
                    // "style-loader",  //利用js创建style标签，将样式通过js放在style标签内
                    MiniCssExtractPlugin.loader,
                    "css-loader", //将css中的样式代码，转换到js中
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env" //解决大多数样式的兼容问题
                                ]
                            }
                        }
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,  //正则验证scss文件
                use: [
                    // 将 JS 字符串生成为 style 节点
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    // 将 CSS 转化成 CommonJS 模块
                    'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-preset-env" //解决大多数样式的兼容问题
                                ]
                            }
                        }
                    },
                    // 将 Sass 编译成 CSS
                    'sass-loader',
                ],
            },
            {
                //处理图片的路径
                test: /\.(png|jpe?g|gif|webp|svg)$/,   //正则验证图片文件
                type: 'asset',
                generator: {
                    filename: 'images/[hash][ext][query]', //图片存放出口
                    publicPath: './'  //修改打包公共路径
                },
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024 // 8kb以下的图片转为base64格式
                    }
                }
            },
            {
                //处理视频的路径
                test: /\.(MP4)$/i,   //正则验证图片文件
                type: 'asset',
                generator: {
                    filename: 'video/[hash][ext][query]', //图片存放出口
                    publicPath: './'  //修改打包公共路径
                },
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ],
    },

    devServer: {
        hot: true,    //开启热更新
        port: 8080,   //指定开启端口，默认是8080
        open: true    //启动服务器后是否自动开启浏览器，可指定打开文件名
    }
};