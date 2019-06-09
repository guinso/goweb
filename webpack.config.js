const path = require('path');

module.exports = {
    context: __dirname,
    entry: '.client/js/index.js',
    mode: 'development',
    module: {
        rules: [{
            test: /\.js$/,
        }],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};