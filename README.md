# RawObject

[![info badge](https://img.shields.io/npm/dt/@hrimthurs/RawObject.svg)](http://npm-stat.com/charts.html?package=@hrimthurs/RawObject)

Convert Object type value to/from raw Buffer

> The best result is obtained when using for big objects with arrays numbers

## Installation

### [Node.js](http://nodejs.org/):

~~~
npm install rawobject
~~~

~~~ javascript
import RawObject from 'rawobject'
import { ObjectToBuffer, ObjectFromBuffer } from 'rawobject'
~~~

## API

Make raw Buffer from javascript Object:

~~~ javascript
RawObject.toBuffer(srcObject: Object, [options: Object]): Buffer
ObjectToBuffer(srcObject: Object, [options: Object]): Buffer
~~~

Make javascript Object from raw Buffer:

~~~ javascript
RawObject.fromBuffer(buffer: Buffer): Object
ObjectFromBuffer(buffer: Buffer): Object
~~~

Options:

~~~ javascript
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
