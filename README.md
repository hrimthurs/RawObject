# RawObject

[![npm](https://img.shields.io/npm/v/@hrimthurs/rawobject.svg)](https://npmjs.com/@hrimthurs/rawobject)
[![info badge](https://img.shields.io/npm/dt/@hrimthurs/rawobject.svg)](http://npm-stat.com/charts.html?package=@hrimthurs/rawobject)
[![packagephobia publish](https://badgen.net/packagephobia/publish/@hrimthurs/rawobject)](https://bundlephobia.com/result?p=@hrimthurs/rawobject)

Convert Object type value to/from raw Buffer

> The best result is obtained when using for big objects with arrays numbers

## Installation

You can use this package on the server side as well as the client side.

### [Node.js](http://nodejs.org/):

~~~
npm install @hrimthurs/rawobject
~~~

## Connection

### ESM:

~~~ javascript
import RawObject from '@hrimthurs/rawobject'
import { toBuffer, fromBuffer } from '@hrimthurs/rawobject'
~~~

### CommonJS:

~~~ javascript
const RawObject = require('@hrimthurs/rawobject')
const { toBuffer, fromBuffer } = require('@hrimthurs/rawobject')
~~~

### HTML tag \<script\>:

* Connection full:

    [![GitHub file size in bytes](https://img.shields.io/github/size/hrimthurs/RawObject/dist/RawObject.js?label=RawObject.js)](https://github.com/hrimthurs/RawObject/blob/master/dist/RawObject.js)

    ~~~ html
    <script src="RawObject.js"></>
    <script>
        RawObject.toBuffer(obj, options)
        RawObject.fromBuffer(buffer)
    </script>
    ~~~

* Connection part convert object to buffer:

    [![GitHub file size in bytes](https://img.shields.io/github/size/hrimthurs/RawObject/dist/ObjectToBuffer.js?label=ObjectToBuffer.js)](https://github.com/hrimthurs/RawObject/blob/master/dist/ObjectToBuffer.js)

    ~~~ html
    <script src="ObjectToBuffer.js"></>
    <script>
        ObjectToBuffer(obj, options)
    </script>
    ~~~

* Connection part convert buffer to object:

    [![GitHub file size in bytes](https://img.shields.io/github/size/hrimthurs/RawObject/dist/ObjectFromBuffer.js?label=ObjectFromBuffer.js)](https://github.com/hrimthurs/RawObject/blob/master/dist/ObjectFromBuffer.js)

    ~~~ html
    <script src="ObjectFromBuffer.js"></>
    <script>
        ObjectFromBuffer(buffer)
    </script>
    ~~~

## API

~~~ javascript
• RawObject.toBuffer(src, options)
• ObjectToBuffer(src, options)
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

• RawObject.fromBuffer(buffer)
• ObjectFromBuffer(buffer)
    /**
     * Make javascript Object from raw Buffer
     * @param {Buffer|ArrayBuffer} buffer           - source buffer
     * @return {object}
     */
~~~

## Usage

Make Buffer from Object:

~~~ javascript
let raw = RawObject.toBuffer(obj, { compress: true, floatDigits: 6 })
~~~

Make Object from Buffer:

~~~ javascript
let obj = RawObject.fromBuffer(raw)
~~~

> It is possible to create an Object only from the Buffer obtained by the `RawObject` methods

More usage examples can be found [here](./examples/example.js) and [here](./examples/example.html)

## Bugs and Issues

If you encounter any bugs or issues, feel free to open an issue at
[github](https://github.com/hrimthurs/RawObject).
