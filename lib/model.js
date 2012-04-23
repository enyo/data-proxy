/*!
 * Copyright(c) 2012 Matias Meno <m@tias.me>
 */

/**
 * Dependencies
 */
var _ = require('underscore')
  , Property = require('./property');

/**
 * A model gets instantiated with optional data and checks the data against the schema.
 * 
 * Models are not meant to be instantiated on their own. You rather get a subclassed model from Schema.model().
 * 
 * @param {Object} data
 * @param {Function} errorCallback
 * @api public
 */
var Model = function(data, errorCallback) {
  if (data) this.setData(data, errorCallback);
};


/**
 * Passed to the errorCallback as error code if the provided value was incorrect.
 * @type {String}
 */
Model.INVALID_VALUE = 'Invalid Value';
/**
 * Passed to the errorCallback as error code if an object property contained an invalid key.
 * @type {String}
 */
Model.INVALID_KEY = 'Invalid Key';
/**
 * Passed to the errorCallback as error code if a required key was not provided.
 * @type {String}
 */
Model.UNDEFINED_KEY = 'Undefined Key';
/**
 * Passed to the errorCallback as error code if a required value was not provided.
 * @type {String}
 */
Model.UNDEFINED_VALUE = 'Undefined Value';


Model.prototype = {

  /**
   * Sets the data object and validates if not skipped
   * 
   * @param {Object} data 
   * @param {Function} errorCallback Passed to validate() if skipValidation is false.
   * @param {Boolean} skipValidation 
   */
  setData: function(data, errorCallback, skipValidation) {
    if (skipValidation) {
      this.data = data;
    }
    else {
      var sanitizedData = this.validate(errorCallback, data);
      if (sanitizedData instanceof Property.INVALID) {
        sanitizedData = null;
      }
      this.data = sanitizedData;
    }
  },

  /**
   * Validates the data object and updates the data with sanitized values.
   * 
   * @property {Function} errorCallback Called if validation fails. Defaults to an Exception
   * @property {Object} data Optional data object to test. If none provided `this.data` is used.
   * @return {Object} Sanitized data
   * @api public
   */
  validate: function(errorCallback, data) {
    return this._validateRecursive(data || this.data, this.schema.definitionProperty, errorCallback || function(path, errorCode) { throw new Error("Validation error in '" + path + "': " + errorCode) }, this.constructor.modelName);
  },

  /**
   * Checks the property if it's valid. If it's an Object property, goes through each value to check it.
   * 
   * @param {Object} value
   * @param {Property} property
   * @param {Function} errorCallback
   * @param {String} path Path attribute that helps reference the error inside the definition.
   * @return {Object} sanitized data
   * @api private
   */
  _validateRecursive: function(value, property, errorCallback, path) {
    var self = this;

    // Validates all flat values, and makes sure the value is an array or an object if the property is Array or Object
    var value = property.validate(value);

    if (value instanceof Property.INVALID) {
      if (errorCallback) errorCallback(path, value === Property.INVALID_REQUIREMENT ? Model.UNDEFINED_VALUE : Model.INVALID_VALUE);
      return value;
    }
    if (value !== null) {
      if (property.type === Object) {
        // Holds a list of provided keys to see at the end if there have been more than actually possible
        var providedKeys = Object.keys(value);

        // Now lets actually go through each index and validate it.
        _.each(property.child, function(childProperty, key) {
          var childValue = value[key]
            , childPath = path + '.' + key;

          if (!(key in value)) {
            if (childProperty.required) {
              if (errorCallback) errorCallback(childPath, Model.UNDEFINED_KEY);
            }
            return; // Continue loop
          }

          // Remove the key
          providedKeys.splice(providedKeys.indexOf(key), 1);

          childValue = self._validateRecursive(childValue, childProperty, errorCallback, childPath);

          if (childValue instanceof Property.INVALID) {
            delete value[key];
            // No need to call the error callback since _validateRecursive has been called with the childValue, and throws
            // the exception if necessary.
            return; // Continue loop
          }
          
          // TODO: make it configurable to leave null values
          if (childValue === null) delete value[key];
          else value[key] = childValue;
        });

        _.each(providedKeys, function(invalidKey) {
          delete value[invalidKey];
          if (errorCallback) errorCallback(path + '.' + invalidKey, Model.INVALID_KEY);
        });
      }
      else if (property.type === Array) {
        // Now lets iterate through the array and check every element.
        _.each(value, function(arrayValue, i) {
          value[i] = self._validateRecursive(arrayValue, property.child, errorCallback, path + '.' + i);
        });
      }
      else {
        // Well if it's a simple flat value, then the validation is already done.
      }
    }

    return value;
  }

};





/**
 * Exporting the schema
 * @type {Schema}
 */
module.exports = Model;