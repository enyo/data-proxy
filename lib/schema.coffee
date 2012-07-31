###
Copyright(c) 2012 Matias Meno <m@tias.me>
###

# Dependencies
Model = require("./model")
Property = require("./property")
Checked = require("./checked_types")



# The schema is used to create models.
class Schema

  constructor: (definition) ->
    @definition = definition
    @definitionProperty = @parseDefinition(definition)


  # Parses the passed definition and brings it in a form.
  #
  # Returns a formatted version of the definition
  parseDefinition: (definition) -> @_parseDefinitionRecursively definition


  # Parses the passed definition resursively.
  #
  # Returns a formatted version of the definition
  _parseDefinitionRecursively: (definition) ->
    property = @_parseSingleValue(definition)
    unless property
      
      # Array has to be checked before, since Array is an instanceof Object
      if definition instanceof Array
        property = @_parseArrayOfValues(definition)
      else if definition instanceof Object
        property = @_parseObjectOfValues(definition)
      else
        throw new Error("Invalid definition")
    property


  # Returns a property of type `String`|`Number`|`Boolean`|`Date`|`Checked.Number`|`Checked.String`
  #
  # `definition` is an unparsed definition
  _parseSingleValue: (definition) ->
    switch definition
      when String, Number, Boolean, Date, Checked.Number, Checked.String
        return new Property(definition)
      else
        return false


  # Returns a property of type `Object`.
  # 
  # This function goes through each value of the object and calls `_parseDefinitionRecursively` on it to get a valid child
  # Property.
  # 
  # This function takes care of turning `$key_` names into `isPrivate` and `isRequired`.
  _parseObjectOfValues: (definition) ->
    self = this
    child = {}
    for key, value of definition
      isRequired = false
      isPrivate = false
      if key.charAt(key.length - 1) is "_"
        isRequired = true
        key = key.slice(0, -1)
      if key.charAt(0) is "$"
        isPrivate = true
        key = key.slice(1)
      property = self._parseDefinitionRecursively(value)
      property.isRequired = isRequired
      property.isPrivate = isPrivate
      child[key] = property

    new Property Object, child


  # Returns a property of type `Array`
  # 
  # It calls `_parseDefinitionRecursively` on the first item in the array.
  _parseArrayOfValues: (definition) ->
    throw new Error "Invalid array provided for key '#{key}'" if definition.length isnt 1
    new Property Array, @_parseDefinitionRecursively(definition[0])


  # Returns the constructor for a model of the schema.
  model: (name) ->
    schema = @
    
    # Creating a specific model class on the fly which subclasses Model
    SpecificModel = ->
      Model.apply @, arguments

    SpecificModel.modelName = name
    SpecificModel.__proto__ = Model
    SpecificModel::__proto__ = Model.prototype
    SpecificModel::schema = schema
    SpecificModel


# Exporting the schema
module.exports = Schema
