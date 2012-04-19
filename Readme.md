# Data proxy Version 0.0.4-dev

> This proxy is still in development and unsafe to use.  
> As soon as the version is bumped to 0.1.x it will be usable but still in beta.

The data proxy is a node module that has pretty complex schema/model definition capabilities to automatically receive
and transmit data in a formatted and validated form.

I wrote this so you can easily submit data sent from an untrusted browser form to a backend that receives trusted JSON.

It helps validate that all defined properties are set and the right type, and formats the JSON correctly.


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
