const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: './views/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['stage-3']
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                  'vue-style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      // enable CSS Modules
                      modules: true,
                      // customize generated class names
                      localIdentName: '[local]_[hash:base64:8]'
                    }
                  }
                ]
              }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    plugins: [
        // make sure to include the plugin!
        new VueLoaderPlugin()
    ],
    devServer: {
        port: 8080,
        historyApiFallback: {
            disableDotRule: true
        }
    }
}