Property = require("../lib").Property
Checked = require("../lib").Checked
describe "Property", ->
  it("can be instantiated with a type in constructor", ->
    property = new Property(Boolean)
    property.type.should.equal Boolean
  )
  it("throws an exception if the property type is invalid.", ->
    validPropertyTypes = [ String, Boolean, Number, Date, Checked.Number, Checked.String ]
    property = undefined
    validPropertyType = undefined
    i = undefined
    for i of validPropertyTypes
      validPropertyType = validPropertyTypes[i]
      property = new Property(validPropertyType)
      property.type.should.equal validPropertyType
    
    #(property.type === validPropertyType).should.be['true'];
    #property.type.should.equal(validPropertyType);
    (->
      new Property("InvalidType")
    ).should["throw"] "Invalid type: InvalidType"
  )
  it("has shortcut functions for array and object types", ->
    array = Property.Array(a: 1)
    array.type.should.equal Array
    array.should.be["instanceof"] Property
    object = Property.Object(a: 1)
    object.type.should.equal Object
    object.should.be["instanceof"] Property
  )

  describe "INVALID_REQUIREMENT", ->
    it "should be a subclass of Property.INVALID", ->
      Property.INVALID_REQUIREMENT.should.be["instanceof"] Property.INVALID


  describe "INVALID_VALUE", ->
    it "should be a subclass of Property.INVALID", ->
      Property.INVALID_VALUE.should.be["instanceof"] Property.INVALID


  describe "validate()", ->
    it "should accept null and undefined if isRequired is false", ->
      for type in [ String, Date, Number, Boolean, Array, Object ]
        prop = new Property(type, (if type is Array or type is Object then {} else `undefined`))
        (prop.validate(null) is null).should.be["true"]
        (prop.validate(`undefined`) is null).should.be["true"]
        prop.isRequired = true
        prop.validate(null).should.equal Property.INVALID_REQUIREMENT
        prop.validate(`undefined`).should.equal Property.INVALID_REQUIREMENT


    it "should validate Strings", ->
      prop = new Property(String)
      prop.validate("Hi").should.equal "Hi"
      prop.validate("").should.equal ""
      prop.validate(123).should.equal "123"
      prop.validate(123.43).should.equal "123.43"
      prop.validate(true).should.equal Property.INVALID_VALUE
      prop.validate(new Date()).should.equal Property.INVALID_VALUE

    it "should validate Numbers", ->
      prop = new Property(Number)
      prop.validate(0).should.equal 0
      prop.validate(123).should.equal 123
      prop.validate(123.43).should.equal 123.43
      prop.validate("0").should.equal 0
      prop.validate("123").should.equal 123
      prop.validate("123.43").should.equal 123.43
      prop.validate(true).should.equal Property.INVALID_VALUE
      prop.validate(new Date()).should.equal Property.INVALID_VALUE

    it "should validate Booleans", ->
      prop = new Property(Boolean)
      prop.validate(true).should.equal true
      prop.validate(false).should.equal false
      prop.validate("some string").should.equal true
      prop.validate("true").should.equal true
      prop.validate("false").should.equal false # Special handling of "false" and "0"
      prop.validate("1").should.equal true
      prop.validate("0").should.equal false # Special handling of "false" and "0"
      prop.validate(1).should.equal true
      prop.validate(0).should.equal false
      prop.validate(new Date()).should.equal true

    it "should validate checked Strings", ->
      prop = new Property(Checked.String)
      prop.validate("sdf").should.equal Property.INVALID_VALUE
      prop.validate(123).should.equal Property.INVALID_VALUE
      prop.validate(new Checked.String("sdf")).should.equal "sdf"

    it "should validate checked Integers", ->
      prop = new Property(Checked.Number)
      prop.validate("sdf").should.equal Property.INVALID_VALUE
      prop.validate(123).should.equal Property.INVALID_VALUE
      prop.validate(new Checked.Number(123)).should.equal 123
      prop.validate(new Checked.Number(123.321)).should.equal 123.321

    it "should validate Dates", ->
      prop = new Property(Date)
      timestamp = 1234567890000
      prop.validate(timestamp).getTime().should.eql 1234567890000
      prop.validate(new Date(timestamp)).getTime().should.eql 1234567890000
      prop.validate("2009/02/14 00:31:30").getTime().should.eql 1234567890000
      prop.validate("asdf").should.equal Property.INVALID_VALUE

    it "should validate Arrays", ->
      prop = new Property(Array, {})
      prop.validate([ {}, {} ]).should.eql [ {}, {} ]
      prop.validate({}).should.equal Property.INVALID_VALUE
      prop.validate("").should.equal Property.INVALID_VALUE

    it "should validate Objects", ->
      prop = new Property(Object, {})
      prop.validate(a: 1).should.eql a: 1
      prop.validate([]).should.eql []
      prop.validate("").should.equal Property.INVALID_VALUE
      prop.validate(123).should.equal Property.INVALID_VALUE




# prop.validate(new Date()).should.equal(Property.INVALID_VALUE);