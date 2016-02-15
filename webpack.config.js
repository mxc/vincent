var path = require('path');

module.exports = {
    entry: './src/app.js',
    target: 'node',
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'src'),
                loader: 'babel-loader'
            }
        ]
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'app.js'
    }
}