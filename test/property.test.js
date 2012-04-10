
var Property = require('../lib/property')
  , _ = require('underscore')
  , Checked = require('../lib/checked_types');

describe('Property', function() {
  it('can be instantiated with a type in constructor', function() {
    var property = new Property(Boolean);
    property.type.should.equal(Boolean);
  }),
  it('throws an exception if the property type is invalid.', function() {
    var validPropertyTypes = [ String, Boolean, Number, Date, Checked.Number, Checked.String ]
      , property
      , validPropertyType
      , i;

    for (i in validPropertyTypes) {
      validPropertyType = validPropertyTypes[i];
      property = new Property(validPropertyType);
      property.type.should.equal(validPropertyType);
      //(property.type === validPropertyType).should.be.true;
      //property.type.should.equal(validPropertyType);
    }

    (function(){
      new Property('InvalidType');
    }).should.throw('Invalid type: InvalidType');

  }),
  it('has shortcut functions for array and object types', function() {
    var array = Property.Array({ a: 1 });
    array.type.should.equal(Array);
    array.should.be.instanceof(Property);
    var object = Property.Object({ a: 1 });
    object.type.should.equal(Object);
    object.should.be.instanceof(Property);
  });
  describe('INVALID_REQUIREMENT', function() {
    it('should be a subclass of Property.INVALID', function() {
      Property.INVALID_REQUIREMENT.should.be.instanceof(Property.INVALID);
    });
  });
  describe('INVALID_VALUE', function() {
    it('should be a subclass of Property.INVALID', function() {
      Property.INVALID_VALUE.should.be.instanceof(Property.INVALID);
    });
  });
  describe('validate()', function() {
    it('should accept null and undefined if required is false', function() {
      _.each([String, Date, Number, Boolean, Array, Object], function(type) {
        var prop = new Property(type, type === Array || type === Object ? {} : undefined);
        (prop.validate(null) === null).should.be.true;
        (prop.validate(undefined) === null).should.be.true;
        prop.required = true;
        prop.validate(null).should.equal(Property.INVALID_REQUIREMENT);
        prop.validate(undefined).should.equal(Property.INVALID_REQUIREMENT);
      });
    });
    it('should validate Strings', function() {
      var prop = new Property(String);
      prop.validate("Hi").should.equal("Hi");
      prop.validate("").should.equal("");
      prop.validate(123).should.equal("123");
      prop.validate(123.43).should.equal("123.43");
      prop.validate(true).should.equal(Property.INVALID_VALUE);
      prop.validate(new Date()).should.equal(Property.INVALID_VALUE);
    });
    it('should validate Numbers', function() {
      var prop = new Property(Number);
      prop.validate(0).should.equal(0);
      prop.validate(123).should.equal(123);
      prop.validate(123.43).should.equal(123.43);
      prop.validate("0").should.equal(0);
      prop.validate("123").should.equal(123);
      prop.validate("123.43").should.equal(123.43);
      prop.validate(true).should.equal(Property.INVALID_VALUE);
      prop.validate(new Date()).should.equal(Property.INVALID_VALUE);
    });
    it('should validate Booleans', function() {
      var prop = new Property(Boolean);
      prop.validate(true).should.equal(true);
      prop.validate(false).should.equal(false);
      prop.validate("some string").should.equal(true);
      prop.validate("true").should.equal(true);
      prop.validate("false").should.equal(false); // Special handling of "false" and "0"
      prop.validate("1").should.equal(true);
      prop.validate("0").should.equal(false); // Special handling of "false" and "0"
      prop.validate(1).should.equal(true);
      prop.validate(0).should.equal(false);
      prop.validate(new Date()).should.equal(true);
    });
    it('should validate checked Strings', function() {
      var prop = new Property(Checked.String);
      prop.validate("sdf").should.equal(Property.INVALID_VALUE);
      prop.validate(123).should.equal(Property.INVALID_VALUE);
      prop.validate(new Checked.String("sdf")).should.equal("sdf");
    });
    it('should validate checked Integers', function() {
      var prop = new Property(Checked.Number);
      prop.validate("sdf").should.equal(Property.INVALID_VALUE);
      prop.validate(123).should.equal(Property.INVALID_VALUE);
      prop.validate(new Checked.Number(123)).should.equal(123);
      prop.validate(new Checked.Number(123.321)).should.equal(123.321);
    });
    it('should validate Dates', function() {
      var prop = new Property(Date);

      var timestamp = 1234567890000;

      prop.validate(timestamp).should.eql(new Date(timestamp));
      prop.validate(new Date(timestamp)).should.eql(new Date(timestamp));
      prop.validate("2009/02/14 00:31:30").should.eql(new Date(timestamp));
      prop.validate("asdf").should.equal(Property.INVALID_VALUE);
    });
    it("should validate Arrays", function() {
      var prop = new Property(Array, { });

      prop.validate([{}, {}]).should.eql([{}, {}]);
      prop.validate({}).should.equal(Property.INVALID_VALUE);
      prop.validate("").should.equal(Property.INVALID_VALUE);
    });
    it("should validate Objects", function() {
      var prop = new Property(Object, { });

      prop.validate({ a: 1 }).should.eql({ a: 1 });
      prop.validate([]).should.eql([]);
      prop.validate("").should.equal(Property.INVALID_VALUE);
      prop.validate(123).should.equal(Property.INVALID_VALUE);
      // prop.validate(new Date()).should.equal(Property.INVALID_VALUE);
    });
  });
});