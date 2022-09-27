import zlib from 'node:zlib'
import { Buffer } from 'node:buffer'
import { TkArray } from '@hrimthurs/tackle'

const SIGN_RAW_CHUNK = '#RAW'
const LEVEL_COMPRESS = zlib.constants.Z_BEST_COMPRESSION

const LIM_NUM_DIGITS = [8, 16, 32, 64].map(bits => ({
    bits,
    lim: Math.pow(2, bits)
}))

const TYPES_CHUNKS = {
    'Object':       { id: 10 },

    'Int8':         { id: 20, size: 1 },
    'Int16':        { id: 21, size: 2 },
    'Int32':        { id: 22, size: 4 },
    'BigInt64':     { id: 23, size: 8 },

    'UInt8':        { id: 24, size: 1 },
    'UInt16':       { id: 25, size: 2 },
    'UInt32':       { id: 26, size: 4 },
    'BigUInt64':    { id: 27, size: 8 },

    'Float':        { id: 28, size: 4 },
    'Double':       { id: 29, size: 8 }
}

export function ObjectToBuffer(srcObj, inOptions) {
    return RawObject.toBuffer(srcObj, inOptions)
}

export function ObjectFromBuffer(srcBuffer) {
    return RawObject.fromBuffer(srcBuffer)
}

export default class RawObject {

    static toBuffer(srcObj, inOptions) {
        let options = {
            floatDigits: 0,
            skipKeys: [],
            bigEndian: true,
            checkGain: true,
            compress: true,
            ...inOptions
        }

        let chunks = []
        let skipKeys = TkArray.get(options.skipKeys)

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
                                val = SIGN_RAW_CHUNK + chunks.length
                            }
                        }
                        break
                }

                return val
            }
        })

        let mainChunk = Buffer.concat([
            this.#makeBufferFromNum(TYPES_CHUNKS['Object'].id, 'UInt8'),
            Buffer.from(mainObject)
        ])

        chunks.unshift(mainChunk)

        return this.#makeBody(chunks, options.compress, options.bigEndian)
    }

    static fromBuffer(srcBuffer) {
        let result
        let chunks = this.#parseBody(srcBuffer)

        if (typeof chunks[0] === 'string') {
            const reRawChunk = new RegExp(`^${SIGN_RAW_CHUNK}(\\d+)$`)

            result = JSON.parse(chunks[0], (key, val) => {
                if (typeof val === 'string') {
                    let matched = val.match(reRawChunk)
                    if (matched) {
                        let useChunk = matched[1]
                        if (chunks[useChunk]) val = chunks[useChunk]
                        else throw Error('Lost raw chunk')
                    }
                }

                return val
            })
        } else throw Error('Incorrect raw structure')

        return result
    }

    static #parseBody(srcBuffer) {
        let bufBody = Buffer.alloc(srcBuffer.length - 1)
        srcBuffer.copy(bufBody, 0, 1)

        let compressed = srcBuffer.readUInt8()
        if (compressed) bufBody = zlib.inflateSync(bufBody)

        let offset = 0

        let bigEndian = bufBody.readUInt8(offset++)
        const methodReadUInt16 = this.#getBufMethodByNumType('read', 'UInt16', bigEndian)
        let numChunks = bufBody[methodReadUInt16](offset)

        offset += 2

        let typeItem = this.#getTypeChunk(bufBody.readUInt8(offset++))
        let sizeArr = numChunks * typeItem.size
        let sizesChunks = this.#getArrNumFromBuffer(bufBody, sizeArr, typeItem, offset, bigEndian)

        offset += sizeArr

        let chunks = sizesChunks.map(sizeChunk => {
            let chunk

            let typeChunk = this.#getTypeChunk(bufBody.readUInt8(offset))
            if (!typeChunk.size) {

                if (typeChunk.name === 'Object') chunk = bufBody.toString('utf-8', offset, offset + sizeChunk)

            } else chunk = this.#getArrNumFromBuffer(bufBody, sizeChunk - 1, typeChunk, offset + 1, bigEndian)

            offset += sizeChunk
            return chunk
        })

        return chunks
    }

    static #makeBody(arrChunks, compress, bigEndian) {
        let sizesChunks = arrChunks.map(chunk => chunk.length)

        let bufBody = Buffer.concat([
            this.#makeBufferFromNum(bigEndian, 'UInt8'),
            this.#makeBufferFromNum(arrChunks.length, 'UInt16', bigEndian),
            this.#makeChunkFromNumArray(sizesChunks, 'UInt32', bigEndian),
            ...arrChunks
        ])

        if (compress) bufBody = zlib.deflateSync(bufBody, { level: LEVEL_COMPRESS })

        return Buffer.concat([this.#makeBufferFromNum(compress, 'UInt8'), bufBody])
    }

    static #makeChunkFromNumArray(srcArr, typeNameItem, bigEndian) {
        const sizeItem = TYPES_CHUNKS[typeNameItem].size
        const writeMethod = this.#getBufMethodByNumType('write', typeNameItem, bigEndian)

        let bufType = this.#makeBufferFromNum(TYPES_CHUNKS[typeNameItem].id, 'UInt8')
        let bufBody = Buffer.alloc(srcArr.length * sizeItem)
        srcArr.forEach((item, index) => bufBody[writeMethod](item, index * sizeItem))

        return Buffer.concat([bufType, bufBody])
    }

    static #makeBufferFromNum(value, typeName, bigEndian = true) {
        const writeMethod = this.#getBufMethodByNumType('write', typeName, bigEndian)

        let buffer = Buffer.alloc(TYPES_CHUNKS[typeName].size)
        buffer[writeMethod](value)

        return buffer
    }

    static #getArrNumFromBuffer(buffer, size, typeItem, offset, bigEndian) {
        const numItems = size / typeItem.size
        const methodReadItem = this.#getBufMethodByNumType('read', typeItem.name, bigEndian)

        return new Array(numItems).fill(0).map((v, ind) => buffer[methodReadItem](offset + ind * typeItem.size))
    }

    static #getTypeChunk(rawTypeChunk) {
        let typeNameChunk = Object.entries(TYPES_CHUNKS).find(rec => rec[1].id == rawTypeChunk)?.[0]

        if (typeNameChunk) return { name: typeNameChunk, size: TYPES_CHUNKS[typeNameChunk].size }
        else throw Error('Unknown type chunk')
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
        let sizeItem = TYPES_CHUNKS[nameType]?.size
        let sizeCompress = val.length * sizeItem + SIGN_RAW_CHUNK.length + 3
        return Buffer.from(JSON.stringify(val)).length > sizeCompress
    }

    static #getBufMethodByNumType(prefix, typeName, bigEndian) {
        let endian = TYPES_CHUNKS[typeName].size > 1 ? bigEndian ? 'BE' : 'LE' : ''
        return prefix + typeName + endian
    }

}