###
Copyright(c) 2012 Matias Meno <m@tias.me>
###


# In addition to the normal data types, the data-proxy also supports the checked types which are in fact normal data
# types but give the certainty that the value is not just injected by a POST form but generated in code.
# 
# This is relevant for ids that should only be available for logged in users for example.

# The parent class of all checked types.
class CheckedType


# Expose CheckedType
exports.Type = CheckedType









# Constructor for CheckedString
class CheckedString extends CheckedType
  constructor: (string) ->
    throw new Error("CheckedString has to be provided with a String.") if typeof string isnt "string"
    @string = string

# toString() and valueOf() are the same for a checkedString
CheckedString::toString = CheckedString::valueOf = -> @string


# Exposing CheckedString
exports.String = CheckedString









# Constructor for CheckedNumber
class CheckedNumber extends CheckedType
  constructor: (number) ->
    throw new Error("CheckedNumber has to be provided with a Number.") if typeof number isnt "number"
    @number = number


# Implementing toString()
CheckedNumber::toString = -> @number.toString()


# Implementing valueOf()
CheckedNumber::valueOf = -> @number


# Exposing CheckedNumber
exports.Number = CheckedNumber