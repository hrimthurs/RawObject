const { deflate } = require('../lib/pako_deflate.js')
const { TkArray } = require('@hrimthurs/tackle')
const environ = require('./environ.js')

const LEVEL_COMPRESS = 9

const LIM_NUM_DIGITS =  [8, 16, 32, 64].map(bits => ({
    bits,
    lim: Math.pow(2, bits)
}))

class ObjectToBuffer {

    static writeObject(srcObj, inOptions) {
        let options = {
            floatDigits: 0,
            skipKeys: [],
            bigEndian: true,
            checkGain: true,
            compress: true,
            ...inOptions
        }

        let chunks = []
        let skipKeys = TkArray.getArray(options.skipKeys)

        let mainObject = JSON.stringify(srcObj, (key, val) => {
            if (!skipKeys.includes(key)) {

                switch (typeof val) {
                    case 'number':
                        if (options.floatDigits) val = Number(val.toFixed(options.floatDigits))
                        break

                    case 'object':
                        if (Array.isArray(val) && (val.length > 0)) {

                            let nameUnityType = this.#detectArrNumUnityType(val, options.floatDigits)
                            if (nameUnityType && (!options.checkGain || this.#isGainSize(val, nameUnityType))) {
                                let chunk = this.#makeChunkFromNumArray(val, nameUnityType, options.bigEndian)
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
            this.#makeBufferFromNum(environ.TYPES_CHUNKS['Object'].id, 'UInt8'),
            Buffer.from(mainObject)
        ])

        chunks.unshift(mainChunk)

        return this.#makeBody(chunks, options.compress, options.bigEndian)
    }

    static #makeBody(arrChunks, compress, bigEndian) {
        let sizesChunks = arrChunks.map(chunk => chunk.length)

        let bufBody = Buffer.concat([
            this.#makeBufferFromNum(bigEndian, 'UInt8'),
            this.#makeBufferFromNum(arrChunks.length, 'UInt16', bigEndian),
            this.#makeChunkFromNumArray(sizesChunks, 'UInt32', bigEndian),
            ...arrChunks
        ])

        if (compress) bufBody = Buffer.from(deflate(bufBody, { level: LEVEL_COMPRESS }))

        return Buffer.concat([this.#makeBufferFromNum(compress, 'UInt8'), bufBody])
    }

    static #makeChunkFromNumArray(srcArr, typeNameItem, bigEndian) {
        const sizeItem = environ.TYPES_CHUNKS[typeNameItem].size
        const writeMethod = environ.getBufMethodByNumType('write', typeNameItem, bigEndian)

        let bufType = this.#makeBufferFromNum(environ.TYPES_CHUNKS[typeNameItem].id, 'UInt8')
        let bufBody = Buffer.alloc(srcArr.length * sizeItem)
        srcArr.forEach((item, index) => bufBody[writeMethod](item, index * sizeItem))

        return Buffer.concat([bufType, bufBody])
    }

    static #makeBufferFromNum(value, typeName, bigEndian = true) {
        const writeMethod = environ.getBufMethodByNumType('write', typeName, bigEndian)

        let buffer = Buffer.alloc(environ.TYPES_CHUNKS[typeName].size)
        buffer[writeMethod](value)

        return buffer
    }

    static #detectArrNumUnityType(checkArr, floatDigits) {
        let unityType = {}

        for (const val of checkArr) {
            if (typeof val === 'number') {
                let numType = this.#detectNumType(val, floatDigits)

                unityType.float = unityType.float || numType.float
                unityType.signed = unityType.signed || numType.signed
                unityType.bits = Math.max(unityType.bits ?? 0, numType.bits)
            } else return null
        }

        return this.#getNameTypeNum(unityType)
    }

    static #detectNumType(num, floatDigits) {
        let float = !Number.isInteger(num)
        let signed = float || (num < 0)

        let bits = float
            ? floatDigits && (new Float32Array([num])[0].toFixed(floatDigits) === new Float64Array([num])[0].toFixed(floatDigits)) ? 32 : 64
            : LIM_NUM_DIGITS.find(rec => signed ? Math.abs(num) < (rec.lim / 2) : num < rec.lim).bits

        return { float, signed, bits }
    }

    static #getNameTypeNum(numType) {
        return numType.float
            ? numType.bits == 32 ? 'Float' : 'Double'
            : (numType.bits == 64 ? 'Big' : '') + (numType.signed ? 'Int' : 'UInt') + numType.bits
    }

    static #isGainSize(val, nameType) {
        let sizeItem = environ.TYPES_CHUNKS[nameType]?.size
        let sizeCompress = val.length * sizeItem + environ.SIGN_RAW_CHUNK.length + 3
        return Buffer.from(JSON.stringify(val)).length > sizeCompress
    }

}

module.exports = (srcObj, inOptions) => ObjectToBuffer.writeObject(srcObj, inOptions)