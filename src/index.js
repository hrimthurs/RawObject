const ObjectToBuffer = require('./ObjectToBuffer.js')
const ObjectFromBuffer = require('./ObjectFromBuffer.js')

module.exports = {
    toBuffer: (srcObj, inOptions) => ObjectToBuffer(srcObj, inOptions),
    fromBuffer: (buffer) => ObjectFromBuffer(buffer)
}