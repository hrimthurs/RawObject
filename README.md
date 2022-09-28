# RawObject

[![npm](https://img.shields.io/npm/v/@hrimthurs/rawobject.svg)](https://npmjs.com/@hrimthurs/rawobject)
[![info badge](https://img.shields.io/npm/dt/@hrimthurs/rawobject.svg)](http://npm-stat.com/charts.html?package=@hrimthurs/rawobject)
[![GitHub file size in bytes](https://img.shields.io/github/size/hrimthurs/RawObject/dist/RawObject.js?label=lib%20size)](https://github.com/hrimthurs/RawObject/blob/master/dist/RawObject.js)

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

* Connection full [RawObject.js](https://github.com/hrimthurs/RawObject/blob/master/dist/RawObject.js):

    ~~~ html
    <script src="RawObject.js"></>
    <script>
        RawObject.toBuffer(obj, options)
        RawObject.fromBuffer(buffer)
    </script>
    ~~~

* Connection part convert object to buffer [ObjectToBuffer.js](https://github.com/hrimthurs/RawObject/blob/master/dist/ObjectToBuffer.js):

    ~~~ html
    <script src="ObjectToBuffer.js"></>
    <script>
        ObjectToBuffer(obj, options)
    </script>
    ~~~

* Connection part convert buffer to object [ObjectFromBuffer.js](https://github.com/hrimthurs/RawObject/blob/master/dist/ObjectFromBuffer.js):

    ~~~ html
    <script src="ObjectFromBuffer.js"></>
    <script>
        ObjectFromBuffer(buffer)
    </script>
    ~~~

## API

Make raw Buffer from javascript Object:

~~~ typescript
RawObject.toBuffer(src: Object, options?: Object): Buffer
ObjectToBuffer(src: Object, options?: Object): Buffer
~~~

Make javascript Object from raw Buffer:

~~~ typescript
RawObject.fromBuffer(buffer: Buffer | ArrayBuffer): Object
ObjectFromBuffer(buffer: Buffer | ArrayBuffer): Object
~~~

Options:

~~~ typescript
{
    floatDigits: Number,          // - how many decimal places to leave in float numbers (default: 0 - no trunc float)
    skipKeys: String | String[],  // - skip object keys (default: [] - no skip keys)
    bigEndian: Boolean,           // - use big endian order for raw numbers (default: true)
    checkGain: Boolean,           // - check gain size for numbers arrays (default: true)
    compress: Boolean             // - use zip-compression (default: true)
}
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

More usage examples can be found [here](./examples/example.js)

## Bugs and Issues

If you encounter any bugs or issues, feel free to open an issue at
[github](https://github.com/hrimthurs/RawObject).
