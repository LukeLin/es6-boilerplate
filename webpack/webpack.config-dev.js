/**
 * Created by Devicalin on 2015/11/15.
 */

var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');

var DEBUG = true;
var TEST = process.env.NODE_ENV.trim() === 'test';

var plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    //new NyanProgressPlugin()
    new ProgressBarPlugin({
        format: '  build [:bar] :percent (:elapsed seconds)',
        clear: false
    }),
    new ExtractTextPlugin(DEBUG ? './css/[name].css' : './css/[name]-[hash].css', {
        allChunks: true
    }),
];
if (DEBUG) {
    plugins.push(
        new webpack.HotModuleReplacementPlugin()
        //new webpack.optimize.CommonsChunkPlugin({
        //    name: "commons",
        //    // (the commons chunk name)
        //
        //    filename: "commons.js",
        //    // (the filename of the commons chunk)
        //
        //    // minChunks: 3,
        //    // (Modules must be shared between 3 entries)
        //})
    );
} else if (!TEST) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: false
        }),
        function () {
            this.plugin("done", function (stats) {
                var jsonStats = stats.toJson({
                    chunkModules: true
                });
                fs.writeFileSync(
                    __dirname + "/webpack-assets.json",
                    JSON.stringify(jsonStats.assetsByChunkName)
                );
            });
        },
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.NoErrorsPlugin()
    );
}

var appEntry = [
    //'babel-polyfill',
    './js/app.jsx'
];
if(DEBUG) {
    appEntry.push(
        //'webpack-dev-server/client?http://0.0.0.0:8000',
        'webpack/hot/dev-server'
    );
}

module.exports = {
    target: 'web',
    entry: {
        h5GamePortal: appEntry,
        //commons: [
        //    'zepto', 'react', 'react-dom', 'react-router',
        //    'modules/h5portal', 'modules/reportModule', 'modules/softModule', 'modules/userModule', 'modules/utilities',
        //    'plugins/cookie', 'plugins/swiper', 'plugins/zepto.waypoints'
        //]
    },
    output: {
        path: './release/',
        filename: DEBUG ? "./js/[name].js" : "./js/[name]-[hash].js",
        chunkFilename: DEBUG ? "./js/[name].js" : "./js/[name]-[hash].js",
        publicPath: 'http://res.imtt.qq.com///game_list/H5Portal/',
        pathinfo: false
    },

    cache: DEBUG,
    debug: DEBUG,

    // For options, see http://webpack.github.io/docs/configuration.html#devtool
    //devtool: DEBUG && "eval-source-map",
    devtool: DEBUG && "#inline-source-map",

    module: {
        loaders: [
            // Load ES6/JSX
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['transform-runtime'],
                    cacheDirectory: true
                }
            },

            {
                test: /\.json$/,
                exclude: /node_modules/,
                loaders: ['json-loader']
            },

            // Load styles
            {
                test: /\.css$/,
                loader:
                //DEBUG
                //? "style!css" :
                    ExtractTextPlugin.extract("style-loader", "css-loader")
            },

            // Load images
            { test: /\.jpg/, loader: "url-loader?limit=5000&mimetype=image/jpg&name=[path][name].[ext]" },
            { test: /\.gif/, loader: "url-loader?limit=5000&mimetype=image/gif&name=[path][name].[ext]" },
            { test: /\.png/, loader: "url-loader?limit=5000&mimetype=image/png&name=[path][name].[ext]" },
            { test: /\.svg/, loader: "url-loader?limit=5000&mimetype=image/svg&name=[path][name].[ext]" },

            // Load fonts
            { test: /\.woff$/, loader: "url-loader?limit=5000&minetype=application/font-woff&name=[path][name].[ext]" },
            { test: /\.(ttf|eot|svg)$/, loader: "file-loader?name=[path][name].[ext]" }
        ],
        noParse: []
    },

    plugins: plugins,

    externals: {
        'zepto': 'Zepto',
        'react': 'React',
        'react-dom': 'ReactDOM',
        'react-router': 'ReactRouter'
    },

    resolve: {
        modulesDirectories: [
            "node_modules",

            // https://github.com/webpack/webpack-dev-server/issues/60
            "web_modules"
        ],

        // Allow to omit extensions when requiring these files
        extensions: ["", ".js", ".jsx", ".es6", '.json'],

        alias: {
            //'decorators': path.join(__dirname, '../app/decorators'),
            //'components': path.join(__dirname, '../app/components'),
            //'reducers': path.join(__dirname, '../app/reducers'),
            //'actions': path.join(__dirname, '../app/actions'),
            //'constants': path.join(__dirname, '../app/constants'),
            'modules': path.join(__dirname, './js/modules'),
            'plugins': path.join(__dirname, './js/plugins'),
            'components': path.join(__dirname, './js/components')
        }
    },

    devServer: DEBUG && {
        contentBase: './release/',
        hot: true,
        noInfo: false,
        inline: true,
        stats: {colors: true}
    }
};
