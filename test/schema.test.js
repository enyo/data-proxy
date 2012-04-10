
var Schema = require('../lib/schema')
  , Model = require('../lib/model')
  , Property = require('../lib/property')
  , Checked = require('../lib/checked_types');

describe('Schema', function() {
  describe('model()', function() {
    it('should return a valid Model constructor', function() {
      var schema = new Schema({});
      var TestModel = schema.model('ModelName');
      TestModel.should.be.an.instanceof(Function);
      TestModel.modelName.should.equal('ModelName');
      TestModel.prototype.schema.should.equal(schema);
      TestModel.__proto__.should.equal(Model);
    });
  });
  describe('parseDefinition()', function() {
    it ('should parse a single property property', function() {
      var schema = new Schema({})
        , definitionProperty;

      definitionProperty = schema.parseDefinition(String);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(String);

      definitionProperty = schema.parseDefinition(Number);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(Number);

      definitionProperty = schema.parseDefinition(Boolean);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(Boolean);

      definitionProperty = schema.parseDefinition(Date);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(Date);

      definitionProperty = schema.parseDefinition(Checked.String);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(Checked.String);

      definitionProperty = schema.parseDefinition(Checked.Number);
      definitionProperty.should.be.instanceof(Property);
      definitionProperty.type.should.equal(Checked.Number);
    });
    it ('should parse object types properly', function() {
      var schema = new Schema({})
        , parsed = schema.parseDefinition({ a: String, b: Number, c: Date, d: Boolean });

      parsed.should.be.instanceof(Property);
      parsed.type.should.equal(Object);

      parsed.child.a.should.be.instanceof(Property);
      parsed.child.b.should.be.instanceof(Property);
      parsed.child.c.should.be.instanceof(Property);
      parsed.child.d.should.be.instanceof(Property);
      parsed.child.a.type.should.equal(String);
      parsed.child.b.type.should.equal(Number);
      parsed.child.c.type.should.equal(Date);
      parsed.child.d.type.should.equal(Boolean);
      parsed.child.a.required.should.not.be.true;
      parsed.child.b.required.should.not.be.true;
      parsed.child.c.required.should.not.be.true;
      parsed.child.d.required.should.not.be.true;
      parsed.child.a.private.should.not.be.true;
      parsed.child.b.private.should.not.be.true;
      parsed.child.c.private.should.not.be.true;
      parsed.child.d.private.should.not.be.true;
    });
    it ('should interpret object types with key names ending with _ as required and properties starting with $ as private', function() {
      var schema = new Schema({})
        , parsed = schema.parseDefinition({ $a_: String, $b_: Number, c_: Date, d_: Boolean });

      parsed.child.a.should.be.instanceof(Property);
      parsed.child.b.should.be.instanceof(Property);
      parsed.child.c.should.be.instanceof(Property);
      parsed.child.d.should.be.instanceof(Property);
      parsed.child.a.required.should.be.true;
      parsed.child.b.required.should.be.true;
      parsed.child.c.required.should.be.true;
      parsed.child.d.required.should.be.true;
      parsed.child.a.private.should.be.true;
      parsed.child.b.private.should.be.true;
      parsed.child.c.private.should.be.false;
      parsed.child.d.private.should.be.false;
    });
    it ('should interpret array properties properly', function() {
      var schema = new Schema({})
        , parsed = schema.parseDefinition({ myArray: [{ a: Number, b_: Date }], myRequiredArray_: [{ a: String }], arrayWithBasicType: [String] });

      parsed.child.myArray.should.be.instanceof(Property);
      parsed.child.myRequiredArray.should.be.instanceof(Property);

      parsed.child.myArray.type.should.equal(Array);
      parsed.child.myRequiredArray.type.should.equal(Array);

      parsed.child.myArray.required.should.not.be.true;
      parsed.child.myRequiredArray.required.should.be.true;

      parsed.child.myArray.child.should.be.instanceof(Property);
      parsed.child.myRequiredArray.child.should.be.instanceof(Property);
      parsed.child.arrayWithBasicType.child.should.be.instanceof(Property);

      parsed.child.myArray.child.type.should.equal(Object);
      parsed.child.myRequiredArray.child.type.should.equal(Object);
      parsed.child.arrayWithBasicType.child.type.should.equal(String);

      parsed.child.myArray.child.child.a.should.be.instanceof(Property);
      parsed.child.myArray.child.child.a.type.should.equal(Number);
      parsed.child.myArray.child.child.b.type.should.equal(Date);
      parsed.child.myArray.child.child.b.required.should.be.true;

    });
    it ('should interpret object properties properly', function() {
      var schema = new Schema({})
        , parsed = schema.parseDefinition({ myObject: { a: Number, b_: Date }, myRequiredObject_: { a: String } });

      parsed.child.myObject.should.be.instanceof(Property);
      parsed.child.myRequiredObject.should.be.instanceof(Property);

      parsed.child.myObject.type.should.equal(Object);
      parsed.child.myRequiredObject.type.should.equal(Object);

      parsed.child.myObject.required.should.not.be.true;
      parsed.child.myRequiredObject.required.should.be.true;

      parsed.child.myObject.child.a.should.be.instanceof(Property);
      parsed.child.myObject.child.a.type.should.equal(Number);
      parsed.child.myObject.child.b.type.should.equal(Date);
      parsed.child.myObject.child.b.required.should.be.true;
    });
  });
});