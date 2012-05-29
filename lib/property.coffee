###
Copyright(c) 2012 Matias Meno <m@tias.me>
### 

# Dependencies
Checked = require "./checked_types"


# A list of valid property types
validPropertyTypes = [ String, Boolean, Number, Object, Array, Date, Checked.String, Checked.Number ]




# A property gets set in the schema.
#
# It gets configured by chained configuration calls.
#
# `type` Any of `validPropertyTypes`
class Property
  constructor: (type, child) ->
    throw new Error("Invalid type: " + type)  unless ~validPropertyTypes.indexOf(type)
    throw new Error("You have to provide a child when you use the type Array or Object.")  if (type is Array or type is Object) and not child
    @type = type
    @child = child
    @isRequired = false
    @isPrivate = false


  # Validates the value and returns a sanitized version.
  # Returns Property.INVALID if validation fails.
  validate: (value) ->
    if value is `undefined` or value is null
      if @isRequired
        return Property.INVALID_REQUIREMENT
      else
        return null

    switch @type
      when String
        if typeof value is "string" or typeof value is "number"
          return value.toString()
        else
          return Property.INVALID_VALUE
      when Number
        unless isNaN(value = parseFloat(value))
          return value
        else
          return Property.INVALID_VALUE
      when Date
        date = new Date value
        unless isNaN(date.getTime())
          return date
        else
          return Property.INVALID_VALUE
      when Boolean
        return (if (typeof value is "string" and (value is "0" or value.toLowerCase() is "false")) then false else !!value)
      when Array
        return (if (value instanceof Array) then value else Property.INVALID_VALUE)
      when Object
        return (if (value instanceof Object and typeof value is "object") then value else Property.INVALID_VALUE)
      when Checked.String
        if value instanceof Checked.String
          return value.valueOf()
        else
          return Property.INVALID_VALUE
      when Checked.Number
        if value instanceof Checked.Number
          return value.valueOf()
        else
          return Property.INVALID_VALUE
      else
        # Theoretically this case should never happen since the Schema already takes care of the checking.
        throw new Error("The schema is badly described.")


# The INVALID property that validate returns.
class Property.INVALID
  constructor: -> @INVALID = true



class InvalidValueClass extends Property.INVALID
  constructor: -> @INVALID_VALUE = true

Property.INVALID_VALUE = new InvalidValueClass




class InvalidRequirementClass extends Property.INVALID
  constructor: -> @INVALID_REQUIREMENT = true

Property.INVALID_REQUIREMENT = new InvalidRequirementClass




# Array shortcut
Property.Array = (child) -> new Property Array, child


# Object shortcut
Property.Object = (child) -> new Property Object, child


# Exporting the property
module.exports = Property


