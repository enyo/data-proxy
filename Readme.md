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
  
    var Schema = require('data-proxy').Schema;

    var UserSchema = new Schema({
        id: Number
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

    // This call automatically validates the object.
    var user = new User({ username: "sexy82", address: { street: "Downtownstreet 37" } });

