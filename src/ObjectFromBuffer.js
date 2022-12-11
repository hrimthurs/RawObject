// ROLLUP-PLUGIN-ACTIVATE: import { Buffer } from 'buffer'
import { inflate } from './lib/pako.esm.mjs'
import * as environ from './environ.js'

/**
 * Make javascript Object from raw Buffer
 * @param {Buffer|ArrayBuffer} srcBuffer        - source buffer
 * @return {object}
 */
function ObjectFromBuffer(srcBuffer) {
    let result

    let buffer = srcBuffer instanceof ArrayBuffer ? Buffer.from(srcBuffer) : srcBuffer
    let chunks = _parseBody(buffer)

    if (typeof chunks[0] === 'string') {
        const reRawChunk = new RegExp(`^${environ.SIGN_RAW_CHUNK}(\\d+)$`)

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

function _parseBody(srcBuffer) {
    let bufBody = Buffer.alloc(srcBuffer.length - 1)
    srcBuffer.copy(bufBody, 0, 1)

    let compressed = srcBuffer.readUInt8(0)
    if (compressed) bufBody = Buffer.from(inflate(bufBody))

    let offset = 0

    let bigEndian = bufBody.readUInt8(offset++)
    const methodReadUInt16 = environ.getBufMethodByNumType('read', 'UInt16', bigEndian)
    let numChunks = bufBody[methodReadUInt16](offset)

    offset += 2

    let typeItem = _getTypeChunk(bufBody.readUInt8(offset++))
    let sizeArr = numChunks * typeItem.size
    let sizesChunks = _getArrNumFromBuffer(bufBody, sizeArr, typeItem, offset, bigEndian)

    offset += sizeArr

    let chunks = sizesChunks.map(sizeChunk => {
        let chunk

        let typeChunk = _getTypeChunk(bufBody.readUInt8(offset))
        if (!typeChunk.size) {

            if (typeChunk.name === 'Object') chunk = bufBody.toString('utf-8', offset, offset + sizeChunk)

        } else chunk = _getArrNumFromBuffer(bufBody, sizeChunk - 1, typeChunk, offset + 1, bigEndian)

        offset += sizeChunk
        return chunk
    })

    return chunks
}

function _getArrNumFromBuffer(buffer, size, typeItem, offset, bigEndian) {
    const numItems = size / typeItem.size
    const methodReadItem = environ.getBufMethodByNumType('read', typeItem.name, bigEndian)

    return new Array(numItems).fill(0).map((v, ind) => buffer[methodReadItem](offset + ind * typeItem.size))
}

function _getTypeChunk(rawTypeChunk) {
    let typeNameChunk = Object.entries(environ.TYPES_CHUNKS).find(rec => rec[1].id == rawTypeChunk)?.[0]

    if (typeNameChunk) return { name: typeNameChunk, size: environ.TYPES_CHUNKS[typeNameChunk].size }
    else throw Error('Unknown type chunk')
}

export default ObjectFromBuffer