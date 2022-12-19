const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    entry: {
        quill: './quill.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Quill Demo',
            template: 'quill-online.html'
        }),
        new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'quill.css'), to: path.resolve(__dirname, 'dist/quill.css')},
            ],
        }),
    ],
    output: {
        globalObject: 'self',
        path: path.resolve(__dirname, './dist/'),
        filename: '[name].bundle.js',
        // publicPath: '/quill/dist/',
        clean: true
    },
    /*module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },*/
    devServer: {
        static: path.join(__dirname),
        compress: true,
        // publicPath: '/dist/'
    }
}
