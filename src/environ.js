export const LEVEL_COMPRESS = 9
export const SIGN_RAW_CHUNK = '#RAW'

export const LIM_NUM_DIGITS = [8, 16, 32, 64].map(bits => ({
    bits,
    lim: Math.pow(2, bits)
}))

export const TYPES_CHUNKS = {
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

export function getBufMethodByNumType(prefix, typeName, bigEndian) {
    let endian = TYPES_CHUNKS[typeName].size > 1 ? bigEndian ? 'BE' : 'LE' : ''
    return prefix + typeName + endian
}