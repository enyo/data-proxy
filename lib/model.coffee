###
Copyright(c) 2012 Matias Meno <m@tias.me>
###

# Dependencies
Property = require("./property")


# A model gets instantiated with optional data and checks the data against the schema.
# 
# Models are not meant to be instantiated on their own. You rather get a subclassed model from Schema.model().
class Model
  constructor: (data, errorCallback) -> @setData data, errorCallback if data

 
  # Sets the data object and validates if not skipped
  # 
  # @param {Object} data
  # @param {Function} errorCallback Passed to validate() if skipValidation is false.
  # @param {Boolean} skipValidation
  setData: (data, errorCallback, skipValidation) ->
    if skipValidation
      @data = data
    else
      sanitizedData = @validate(errorCallback, data)
      sanitizedData = null if sanitizedData instanceof Property.INVALID
      @data = sanitizedData

  
  # Validates the data object and updates the data with sanitized values.
  # 
  # `errorCallback` Called if validation fails. Defaults to an Exception
  # `data` Optional data object to test. If none provided `this.data` is used.
  validate: (errorCallback, data) ->
    @_validateRecursive data or @data, @schema.definitionProperty, errorCallback or (path, errorCode) ->
      throw new Error("Validation error in '" + path + "': " + errorCode)
    , @constructor.modelName

  
  # Checks the property if it's valid. If it's an Object property, goes through each value to check it.
  # 
  # `path` Path attribute that helps reference the error inside the definition.
  _validateRecursive: (value, property, errorCallback, path) ->
    self = this
    
    # Validates all flat values, and makes sure the value is an array or an object if the property is Array or Object
    value = property.validate(value)
    if value instanceof Property.INVALID
      errorCallback path, (if value is Property.INVALID_REQUIREMENT then Model.UNDEFINED_VALUE else Model.INVALID_VALUE)  if errorCallback
      return value
    if value isnt null
      if property.type is Object
        
        # Holds a list of provided keys to see at the end if there have been more than actually possible
        providedKeys = Object.keys(value)
        
        # Now lets actually go through each index and validate it.
        for own key, childProperty of property.child
          childValue = value[key]
          childPath = path + "." + key
          unless key of value
            errorCallback childPath, Model.UNDEFINED_KEY  if errorCallback  and childProperty.isRequired
            continue
          
          # Remove the key
          providedKeys.splice providedKeys.indexOf(key), 1
          childValue = self._validateRecursive(childValue, childProperty, errorCallback, childPath)
          if childValue instanceof Property.INVALID
            delete value[key]

            
            # No need to call the error callback since _validateRecursive has been called with the childValue, and throws
            # the exception if necessary.
            continue
          
          # TODO: make it configurable to leave null values
          if childValue is null
            delete value[key]
          else
            value[key] = childValue

        for invalidKey in providedKeys
          delete value[invalidKey]
          errorCallback path + "." + invalidKey, Model.INVALID_KEY  if errorCallback

      else if property.type is Array
        
        # Now lets iterate through the array and check every element.
        for arrayValue, i in value
          value[i] = self._validateRecursive(arrayValue, property.child, errorCallback, path + "." + i)

      else
    
    # Well if it's a simple flat value, then the validation is already done.
    value




# Passed to the errorCallback as error code if the provided value was incorrect.
Model.INVALID_VALUE = "Invalid Value"


# Passed to the errorCallback as error code if an object property contained an invalid key.
Model.INVALID_KEY = "Invalid Key"


# Passed to the errorCallback as error code if a required key was not provided.
Model.UNDEFINED_KEY = "Undefined Key"


# Passed to the errorCallback as error code if a required value was not provided.
Model.UNDEFINED_VALUE = "Undefined Value"



# Exporting the schema
module.exports = Model