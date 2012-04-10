/*!
 * Copyright(c) 2012 Matias Meno <m@tias.me>
 */

/**
 * Dependencies
 */
var Model = require("./model")
  , Property = require("./property")
  , _ = require("underscore")
  , Checked = require("./checked_types");


/**
 * The schema is used to create models.
 * @param {Object} definition
 * @api public
 */
var Schema = function(definition) {
  this.definition = definition;
  this.definitionProperty = this.parseDefinition(definition);
};



/**
 * Parses the passed definition and brings it in a form.
 * 
 * @param  {Object} definition
 * @return {Property} A formatted version of the definition
 * @api private
 */
Schema.prototype.parseDefinition = function(definition) {
  return this._parseDefinitionRecursively(definition);
};

/**
 * Parses the passed definition resursively.
 * 
 * @param  {Object} definition
 * @return {Property} A formatted version of the definition
 * @api private
 */
Schema.prototype._parseDefinitionRecursively = function(definition) {

  var property = this._parseSingleValue(definition)
  if (!property) {
    // Array has to be checked before, since Array is an instanceof Object
    if (definition instanceof Array) {
      property = this._parseArrayOfValues(definition);
    }
    else if (definition instanceof Object) {
      property = this._parseObjectOfValues(definition);
    }
    else {
      throw new Error("Invalid definition");
    }
  }

  return property;

};

/**
 * Returns a property of type `String`|`Number`|`Boolean`|`Date`|`Checked.Number`|`Checked.String`
 * 
 * @param  {Object} definition Unparsed definition
 * @return {Property}
 */
Schema.prototype._parseSingleValue = function(definition) {
  var property
    , required = false
    , private = false;

  switch (definition) {
    case String:
    case Number:
    case Boolean:
    case Date:
    case Checked.Number:
    case Checked.String:
      return new Property(definition);
      break;
    default:
      return false;
      break;
  }
};

/**
 * Returns a property of type `Object`.
 * 
 * This function goes through each value of the object and calls `_parseDefinitionRecursively` on it to get a valid child
 * Property.
 * 
 * This function takes care of turning `$key_` names into `private` and `required`.
 * 
 * @param  {Object} definition
 * @return {Property}
 */
Schema.prototype._parseObjectOfValues = function(definition) {
  var self = this
   , child = { };

  _.each(definition, function(value, key) {
    var required = false
      , private = false;

    if(key.charAt(key.length - 1) === "_") {
      required = true;
      key = key.slice(0, -1);
    }
    if(key.charAt(0) === "$") {
      private = true;
      key = key.slice(1);
    }

    var property = self._parseDefinitionRecursively(value);

    property.required = required;
    property.private = private;

    child[key] = property;
  });

  return new Property(Object, child);
};

/**
 * Returns a property of type `Array`
 * 
 * It calls `_parseDefinitionRecursively` on the first item in the array.
 * 
 * @param  {Object} definition
 * @return {Property} 
 */
Schema.prototype._parseArrayOfValues = function(definition) {
  if (definition.length !== 1) throw new Error("Invalid array provided for key '" + key + "'");
  return new Property(Array, this._parseDefinitionRecursively(definition[0]));
};

/**
 * Returns a model of the schema.
 * @param {String} name 
 * @return {Function} Constructor for a model
 */
Schema.prototype.model = function(name) {
  var schema = this;

  // Creating a specific model class on the fly which subclasses Model
  var SpecificModel = function() {
    Model.apply(this, arguments);
  };

  SpecificModel.modelName = name;
  SpecificModel.__proto__ = Model;
  SpecificModel.prototype.__proto__ = Model.prototype;
  SpecificModel.prototype.schema = schema;

  return SpecificModel;
};


/**
 * Exporting the schema
 * @type {Schema}
 */
module.exports = Schema;