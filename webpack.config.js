const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, './src/index.js'),
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'app.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['react', 'env']
                    }
                }
            },
            {
                test: /(\.scss|\.css)$/,
                loaders: [
                    require.resolve('style-loader'),
                    require.resolve('css-loader'),
                    require.resolve('sass-loader') + '?sourceMap'
                ]
            }
        ]
    }
};