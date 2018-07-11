const {
    root
} = require('./helpers');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

/**
 * This is a common webpack config which is the base for all builds
 */
module.exports = {
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        path: root('dist')
    },
    module: {
        rules: [{
                test: /\.ts$/,
                loader: '@ngtools/webpack'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
                    loader: ['raw-loader', 'sass-loader?sourceMap']
                })
            },
            // {
            //   test: /.(png|jpg|svg|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/, 
            //   //loader: 'file-loader'
            //   // loader: ''
            //   use: 'url-loader?limit=1000&name=assets/[name].[ext]'
            //   // loader: [
            //   //   // 'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
            //   //   // 'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false',
            //   //   // //'url-loader?limit=100'
            //   //   'file-loader?name=/src/app/shared/images/[name].[ext]'
            //   // ]
            // },
            {
                test: /\.css$/,
                loader: 'raw-loader'
            },
            {
                test: /\.html$/,
                loader: 'raw-loader'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'app.css',
            allChunks: true
        }),
        // new OptimizeCssAssetsPlugin()
        // new OptimizeCssAssetsPlugin({
        //   assetNameRegExp: /\.optimize\.css$/g,
        //   cssProcessor: require('cssnano'),
        //   cssProcessorOptions: { discardComments: {removeAll: true } },
        //   canPrint: true
        // })
    ]
};