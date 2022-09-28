const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const PATH_SRC = path.join(__dirname, 'src', 'index.js')
const PATH_DST = path.join(__dirname, 'dist')

const cfgBase = {
    output: {
        filename: '[name].js',
        path: PATH_DST,
        library: {
            name: '[name]',
            type: 'umd'
        }
    },

    resolve: {
        fallback: {
            path: require.resolve('path-browserify'),
            zlib: require.resolve('browserify-zlib'),
            stream: require.resolve('stream-browserify')
        }
    },

    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                        cacheDirectory: true
                    }
                }
            }
        ]
    }
}

const cfgProd = {
    mode: 'production',

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            minify: TerserPlugin.uglifyJsMinify,
            extractComments: false,
            terserOptions: {
                output: { comments: false },
                mangle: { reserved: [] }
            }
        })]
    }
}

const cfgDev = {
    mode: 'development',

    devtool: 'source-map',
    optimization: { minimize: false }
}

module.exports = env => ({
    ...cfgBase,
    entry: { [env.name || 'build']: PATH_SRC },
    ...env.build_prod ? cfgProd : (env.build_dev ? cfgDev : {})
})