const ObjectToBuffer = require('./ObjectToBuffer.js')
const ObjectFromBuffer = require('./ObjectFromBuffer.js')

module.exports = {

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
    toBuffer: (srcObj, options) => ObjectToBuffer(srcObj, options),

    /**
     * Make javascript Object from raw Buffer
     * @param {Buffer|ArrayBuffer} buffer           - source buffer
     * @return {object}
     */
    fromBuffer: (buffer) => ObjectFromBuffer(buffer)

}