# Data proxy Version 0.5.5


The data proxy is a node module that has pretty complex schema/model definition capabilities to automatically receive
and transmit data in a formatted and validated form.

I wrote this so you can easily submit data sent from an untrusted browser form to a backend that receives trusted JSON.

It helps validate that all defined properties are set and the right type, and formats the JSON correctly.



I use [semantic versioning][] and my [tag script][] to tag this module.

The library is fully tested with the [mocha test framework][] and the [should assertion library][]. If you contribute
please make sure that you write tests for it.


[semantic versioning]: http://semver.org/
[tag script]: https://github.com/enyo/tag
[mocha test framework]: http://visionmedia.github.com/mocha/
[should assertion library]: https://github.com/visionmedia/should.js


The latest **stable** version is always in the `master` branch. The `develop` branch is
cutting edge where tests regularely won't completely pass. Only checkout the `develop` branch
if you want to contribute.


## Installation

Simply install via [npm][]:

    npm install data-proxy

or download the latest manually, and put it in `node_modules`.

[npm]: http://npmjs.org

## Configuration

Simply call `dataProxy.configure()` to configure the proxy:

    var dataProxy = require("data-proxy");
    dataProxy.configure({
        host: '10.0.0.100'
      , protocol: 'https'
      , port: 443
      , pathPrefix: '/some/path' // Without trailing slash
      , queryStringSeparator: '&'
      , debug: false
    });

> The `pathPrefix` should not have a trailing slash.


## Define your schema

The first part to do is define your schema.  
A schema definition could look something like this:

    // /models/user.js
  
    var Schema = require('data-proxy').Schema
      , Checked = require('data-proxy').checked_types;

    var UserSchema = new Schema({
        id: Checked.Number // Since normally you simply insert the data submitted by a form, it can happen that a user
                           // submits an ID referencing an entity that does not belong to her/him. To ensure that all
                           // those are IDs are checked the «Checked.» types are used. Those attributes can't simply be
                           // generated from a submitted String (as all other attributes are), but have to be set
                           // programatically.
      , username_: String // The trailing _ means that it is required
      , password: String
      , $trusted: Boolean // The $ prefix means that this variable is private and should never be sent to the user
      , memberSince: Date
      , address: {
            street: String
          , city: String
          , countryId: Number
        }
      , friendIds: [Number]
      , favoriteFoods: [{
            name: String
          , recipe: {
              difficulty: Number
            , instructions: String
          }
        }]
    });

    // Export the User model
    module.exports = UserSchema.model('User');

And to validate and handle that model:

    // Somewhere inside your app:
    var User = require("./models/user");

    // This call automatically validates the object and throws an exception if it's invalid.
    var user = new User({ username: "sexy82", address: { street: "Downtownstreet 37" } });

If you want to handle errors differently you can pass a errorCallback:

    // During initialization
    var user = new User({ }, function(path, errorCode) {
      // handle the error
    });
    // or set the data
    var user = new User()
      , skipValidation = false;

    user.setData({ }, function(path, errorCode) { }, skipValidation);

Where `path` is the path of the key/value that caused the error starting with the model name (e.g.: User.address.city),
and `errorCode` is one of:

  - `Model.INVALID_VALUE` if the object provided an invalid value
  - `Model.INVALID_KEY` if the object provided an invalid key
  - `Model.UNDEFINED_KEY` if a required key was not provided
  - `Model.UNDEFINED_VALUE` if a required value was not provided


## Usage

Actually post a request:

    // dataProxy.post(path, body, successCallback, errorCallback);
    // Example:
    dataProxy.post(
        '/path/to/post'
      , { body: { some: "data", to: "post", as: "json" } })
    .then(function(response) {
      // Success
    })
    .fail(function(err) {
      // Error (If the server responded with 40x oder 50x, or if the JSON was invalid.)
      // The server response is inside `err.response`
    );


`response` is an object containing following information:

- `response.statusCode` The http status code returned (e.g.: `404`).
- `response.headers` An array of the headers returned.
- `response.data` Contains the data returned by the server.
- `response.dataObject` (optional) Contains the parsed data (if any) returned by the server.
- `response.record` (optional) If you specified the `receiveAs` option.

> If the `content-type` submitted by the server is  `application-json` then the data will automatically be parsed and is
> accessible via `response.dataObject`.


If you expect to receive a specific model, you can pass the `receiveAs` option. You will then receive the record in
the response as `response.record`. **The `dataObject` will then be the sanitized version of the data!**

    // Example:
    var User = require("./models/user");
    dataProxy.post(
        '/path/to/post'
      , { receiveAs: User })
    .then(function(response) {
      // Success
      // response.record is a user document, filled with the received and sanitized data.
    })
    .fail(function(err) {
      // Error
    });


## License

(The MIT License)

Copyright (c) 2012 Matias Meno &lt;m@tias.me&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
