const path = require('path');

module.exports = {
    target: "web",
    mode: 'development',
    entry: {
        app: ['./src/index.js']
    },
    output: {
        path: path.resolve(__dirname, "dist/js"),
        publicPath: '/js/', //root path of bundle.js, it is relative to index.html file (used for splitchunk)
        filename: 'bundle.js'
    },
    module: {
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: ['babel-loader']
            },
            {
                test: /\.(html|htm)$/,
                exclude: /node_modules/,
                loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                loader:['style-loader', 'css-loader']
            }
        ]
    },
    devtool: 'inline-source-map'
}