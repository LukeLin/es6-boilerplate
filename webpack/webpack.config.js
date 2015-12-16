/**
 * Created by Devicalin on 2015/11/15.
 */

var webpack = require('webpack');
var path = require('path');

var DEBUG = process.env.NODE_ENV === 'development';
var TEST = process.env.NODE_ENV === 'test';

var plugins = [
    new webpack.optimize.OccurenceOrderPlugin()
];
if (DEBUG) {
    plugins.push(
        new webpack.HotModuleReplacementPlugin()
    );
} else if (!TEST) {
    plugins.push(
        //new ExtractTextPlugin(cssBundle, {
        //  allChunks: true
        //}),
        new webpack.optimize.CommonsChunkPlugin({
            name: "commons",
            // (the commons chunk name)

            filename: "commons.js",
            // (the filename of the commons chunk)

            // minChunks: 3,
            // (Modules must be shared between 3 entries)
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.NoErrorsPlugin()
    );
}

module.exports = {
    entry: {
        app: [
            'babel-polyfill',
            './js/app.jsx'
        ],
        //commons: [
        //    'zepto', 'react', 'react-dom', 'react-router',
        //    'modules/test',
        //    'plugins/cookie', 'plugins/swiper', 'plugins/zepto.waypoints'
        //]
    },
    output: {
        path: './release/js/',
        filename: DEBUG ? "[name].js" : "[name]-[hash].js",
        chunkFilename: DEBUG ? "[name].js" : "[name]-[hash].js",
        publicPath: 'cdnurl',
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
                    presets: ['react', 'es2015'],
                    plugins: ['transform-runtime'],
                    cacheDirectory: true
                }
            },

            {
                test: /\.json$/,
                exclude: /node_modules/,
                loaders: ['json-loader']
            },

            //// Load styles
            //{ test: /\.less$/,
            //    loader: DEBUG
            //        ? "style!css!autoprefixer!less"
            //        : ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader!less-loader") },

            // Load images
            //{ test: /\.jpg/, loader: "url-loader?limit=10000&mimetype=image/jpg" },
            //{ test: /\.gif/, loader: "url-loader?limit=10000&mimetype=image/gif" },
            //{ test: /\.png/, loader: "url-loader?limit=10000&mimetype=image/png" },
            //{ test: /\.svg/, loader: "url-loader?limit=10000&mimetype=image/svg" },

            // Load fonts
            //{ test: /\.woff$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
            //{ test: /\.(ttf|eot|svg)$/, loader: "file-loader" }
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
    }
};
