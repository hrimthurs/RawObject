const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

const cfgBase = {
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
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

module.exports = env => {
    const [
        buildName = 'build',
        srcPath = require('./package.json').main
    ] = env.part?.split(',') || []

    return {
        ...cfgBase,
        entry: { [buildName]: path.join(__dirname, srcPath) },
        ...env.build_prod ? cfgProd : (env.build_dev ? cfgDev : {})
    }
}