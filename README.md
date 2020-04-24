# grpc-no-status

This repo contains a small sample program that demonstrates a GRPC server quickly ending and the call stream either receiving, or not receiving a status based on the @grpc/grpc-js version installed.

## Steps to Repro

This repository ships with 0.6.15, which behaves as expected

### Working Behavior

1. Clone this repository
2. run `$ npm install`
3. run `$ node example.js`

**Expected Output:**

    $ node example.js
    waiting for status ...
    { code: 0,
      details: 'OK',
      metadata: Metadata { internalRepr: Map {}, options: {} } }
    status received, exiting

### Not Working Behavior

1. Clone this repository
2. In `pakage.json`, update to 1.0.2 (`"@grpc/grpc-js": "^1.0.2"`)
3. run `$ rm -rf ./node_modules`
2. run `$ npm install`
3. run `$ node example.js`

**Expected Output**

    $ node example.js
    waiting for status ...
    { code: 0,
      details: 'OK',
      metadata: Metadata { internalRepr: Map {}, options: {} } }
    status received, exiting

**Actual Output**

Since the call-stream never receives a status code, the program never ends.

    $ node example.js
    waiting for status ...
