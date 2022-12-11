// ROLLUP-PLUGIN-ACTIVATE: import { Buffer } from 'buffer'
import { deflate } from './lib/pako.esm.mjs'
import { TkArray } from '@hrimthurs/tackle'
import * as environ from './environ.js'

/**
 * Make raw Buffer from javascript Object
 * @param {object} srcObj                       - source object
 * @param {object} [options]                    - options
 * @param {number} [options.floatDigits]        - number of decimal points of the float values (default: 0 → not change original value)
 * @param {string|string[]} [options.skipKeys]  - exclude values of fields by skipKeys name (default: [])
 * @param {boolean} [options.bigEndian]         - use big endian order (default: true)
 * @param {boolean} [options.checkGain]         - check gain size of transform num arrays (default: true)
 * @param {boolean} [options.compress]          - use zip-compression (default: true)
 * @return {Buffer}
 */
function ObjectToBuffer(srcObj, options) {
    let useOptions = {
        floatDigits: 0,
        skipKeys: [],
        bigEndian: true,
        checkGain: true,
        compress: true,
        ...options
    }

    let chunks = []
    let skipKeys = TkArray.getArray(useOptions.skipKeys)

    let mainObject = JSON.stringify(srcObj, (key, val) => {
        if (!skipKeys.includes(key)) {

            switch (typeof val) {
                case 'number':
                    if (useOptions.floatDigits) val = Number(val.toFixed(useOptions.floatDigits))
                    break

                case 'object':
                    if (Array.isArray(val) && (val.length > 0)) {

                        let nameUnityType = _detectArrNumUnityType(val, useOptions.floatDigits)
                        if (nameUnityType && (!useOptions.checkGain || _isGainSize(val, nameUnityType))) {
                            let chunk = _makeChunkFromNumArray(val, nameUnityType, useOptions.bigEndian)
                            chunks.push(chunk)
                            val = environ.SIGN_RAW_CHUNK + chunks.length
                        }
                    }
                    break
            }

            return val
        }
    })

    let mainChunk = Buffer.concat([
        _makeBufferFromNum(environ.TYPES_CHUNKS['Object'].id, 'UInt8'),
        Buffer.from(mainObject)
    ])

    chunks.unshift(mainChunk)

    return _makeBody(chunks, useOptions.compress, useOptions.bigEndian)
}

function _makeBody(arrChunks, compress, bigEndian) {
    let sizesChunks = arrChunks.map(chunk => chunk.length)

    let bufBody = Buffer.concat([
        _makeBufferFromNum(bigEndian, 'UInt8'),
        _makeBufferFromNum(arrChunks.length, 'UInt16', bigEndian),
        _makeChunkFromNumArray(sizesChunks, 'UInt32', bigEndian),
        ...arrChunks
    ])

    if (compress) bufBody = Buffer.from(deflate(bufBody, { level: environ.LEVEL_COMPRESS }))

    return Buffer.concat([_makeBufferFromNum(compress, 'UInt8'), bufBody])
}

function _makeChunkFromNumArray(srcArr, typeNameItem, bigEndian) {
    const sizeItem = environ.TYPES_CHUNKS[typeNameItem].size
    const writeMethod = environ.getBufMethodByNumType('write', typeNameItem, bigEndian)

    let bufType = _makeBufferFromNum(environ.TYPES_CHUNKS[typeNameItem].id, 'UInt8')
    let bufBody = Buffer.alloc(srcArr.length * sizeItem)
    srcArr.forEach((item, index) => bufBody[writeMethod](item, index * sizeItem))

    return Buffer.concat([bufType, bufBody])
}

function _makeBufferFromNum(value, typeName, bigEndian = true) {
    const writeMethod = environ.getBufMethodByNumType('write', typeName, bigEndian)

    let buffer = Buffer.alloc(environ.TYPES_CHUNKS[typeName].size)
    buffer[writeMethod](value)

    return buffer
}

function _detectArrNumUnityType(checkArr, floatDigits) {
    let unityType = {}

    for (const val of checkArr) {
        if (typeof val === 'number') {
            let numType = _detectNumType(val, floatDigits)

            unityType.float = unityType.float || numType.float
            unityType.signed = unityType.signed || numType.signed
            unityType.bits = Math.max(unityType.bits ?? 0, numType.bits)
        } else return null
    }

    return _getNameTypeNum(unityType)
}

function _detectNumType(num, floatDigits) {
    let float = !Number.isInteger(num)
    let signed = float || (num < 0)

    let bits = float
        ? floatDigits && (new Float32Array([num])[0].toFixed(floatDigits) === new Float64Array([num])[0].toFixed(floatDigits)) ? 32 : 64
        : environ.LIM_NUM_DIGITS.find(rec => signed ? Math.abs(num) < (rec.lim / 2) : num < rec.lim).bits

    return { float, signed, bits }
}

function _getNameTypeNum(numType) {
    return numType.float
        ? numType.bits == 32 ? 'Float' : 'Double'
        : (numType.bits == 64 ? 'Big' : '') + (numType.signed ? 'Int' : 'UInt') + numType.bits
}

function _isGainSize(val, nameType) {
    let sizeItem = environ.TYPES_CHUNKS[nameType]?.size
    let sizeCompress = val.length * sizeItem + environ.SIGN_RAW_CHUNK.length + 3
    return Buffer.from(JSON.stringify(val)).length > sizeCompress
}

export default ObjectToBuffer