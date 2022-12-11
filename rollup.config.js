import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-node-polyfills'

import pkg from './package.json' assert { type: 'json' }

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = global['__filename'] = fileURLToPath(import.meta.url)
const __dirname = global['__dirname'] = path.dirname(__filename)

const srcFolder = path.join(__dirname, './src')
const dstFolder = path.join(__dirname, './build')

function pluginCommentActivate() {
    return {
        transform(code) {
            return {
                code: code.replace(/^\s*\/\/\s*ROLLUP-PLUGIN-ACTIVATE:\s*/g, ''),
                map: null
            }
        }
    }
}

function transpile() {
    return babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-proposal-class-properties']
    })
}

function roll(name, format, outFile, usePlugins = [], exports = 'auto') {
    return {
        input: path.join(srcFolder, name + '.js'),
        output: {
            format, exports,
            name: format === 'umd' ? name : undefined,
            file: path.join(dstFolder, outFile.replace(/\[name\]/g, name)),
            banner: `/* ${pkg.name} ${pkg.version} https://github.com/${pkg.repository} @license ${pkg.license} */`
        },
        plugins: usePlugins.map(func => func())
    }
}

const pluginsBase = [pluginCommentActivate, nodePolyfills, resolve]
const pluginsMin = [...pluginsBase, terser]
const pluginsMinES5 = [...pluginsBase, transpile, terser]

export default [
    roll('RawObject', 'esm', '[name].js', [resolve]),
    roll('RawObject', 'cjs', '[name].cjs', [resolve], 'named'),
    roll('RawObject', 'umd', '[name].min.js', pluginsMin, 'named'),
    roll('RawObject', 'umd', '[name].min.legacy.js', pluginsMinES5, 'named'),
    roll('ObjectToBuffer', 'umd', '[name].min.js', pluginsMin),
    roll('ObjectToBuffer', 'umd', '[name].min.legacy.js', pluginsMinES5),
    roll('ObjectFromBuffer', 'umd', '[name].min.js', pluginsMin),
    roll('ObjectFromBuffer', 'umd', '[name].min.legacy.js', pluginsMinES5)
]