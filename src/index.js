const ObjectToBuffer = require('./ObjectToBuffer.js')
const ObjectFromBuffer = require('./ObjectFromBuffer.js')

module.exports.toBuffer = (srcObj, inOptions) => ObjectToBuffer(srcObj, inOptions)
module.exports.fromBuffer = (buffer) => ObjectFromBuffer(buffer)