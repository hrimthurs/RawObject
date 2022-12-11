// ESM:
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

import RawObject from '../build/RawObject.js'
import { ObjectToBuffer, ObjectFromBuffer } from '../build/RawObject.js'

// CommonJS:
// const fs = require('fs')
// const path = require('path')

// const RawObject = require('../build/RawObject.cjs')
// const { ObjectToBuffer, ObjectFromBuffer } = require('../build/RawObject.cjs')


// Native parse src data
const fileNameSrc = path.join(__dirname, './testSrc.json')
let time1 = Date.now()
let srcObj = JSON.parse(fs.readFileSync(fileNameSrc).toString())
outMeasure('Source file:', fileNameSrc, time1)


// Object to raw without compress + without trunc float
const fileNameNoCompress = path.join(__dirname, './1-1.raw')
let data2 = ObjectToBuffer(srcObj, { compress: false })
fs.writeFileSync(fileNameNoCompress, data2)

let time2 = Date.now()
let obj2 = ObjectFromBuffer(fs.readFileSync(fileNameNoCompress))
outMeasure('RawObject [ compress- | trunc- ]:', fileNameNoCompress, time2, srcObj, obj2)


// Object to raw without compress + with trunc float
const fileNameNoCompressTrunс = path.join(__dirname, './1-2.raw')
let data3 = RawObject.ObjectToBuffer(srcObj, { compress: false, floatDigits: 6 })
fs.writeFileSync(fileNameNoCompressTrunс, data3)

let time3 = Date.now()
let obj3 = RawObject.ObjectFromBuffer(fs.readFileSync(fileNameNoCompressTrunс))
outMeasure('RawObject [ compress- | trunc+ ]:', fileNameNoCompressTrunс, time3)


// Object to raw with compress + without trunc float
const fileNameCompress = path.join(__dirname, './2-1.raw')
let data4 = RawObject.ObjectToBuffer(srcObj, { compress: true })
fs.writeFileSync(fileNameCompress, data4)

let time4 = Date.now()
let obj4 = RawObject.ObjectFromBuffer(fs.readFileSync(fileNameCompress))
outMeasure('RawObject [ compress+ | trunc- ]:', fileNameCompress, time4, srcObj, obj4)


// Object to raw with compress + with trunc float
const fileNameCompressTrunc = path.join(__dirname, './2-2.raw')
let data5 = RawObject.ObjectToBuffer(srcObj, { compress: true, floatDigits: 6 })
fs.writeFileSync(fileNameCompressTrunc, data5)

let time5 = Date.now()
let obj5 = RawObject.ObjectFromBuffer(fs.readFileSync(fileNameCompressTrunc))
outMeasure('RawObject [ compress+ | trunc+ ]:', fileNameCompressTrunc, time5)

//////////////////////////////////////////////////////////////////////////////////////////

function outMeasure(title, fileName, timeStart, srcObj = null, checkObj = null) {
    let outData = {
        workTime: Date.now() - timeStart,
        size: fs.statSync(fileName).size
    }

    if (srcObj && checkObj) outData.check = JSON.stringify(srcObj) === JSON.stringify(checkObj)

    console.log(title, outData)
}
