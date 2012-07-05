Schema = require("../lib").Schema
Model = require("../lib").Model
Property = require("../lib").Property
Checked = require("../lib").Checked
describe "Schema", ->
  describe "model()", ->
    it "should return a valid Model constructor", ->
      schema = new Schema({})
      TestModel = schema.model("ModelName")
      TestModel.should.be.an["instanceof"] Function
      TestModel.modelName.should.equal "ModelName"
      TestModel::schema.should.equal schema
      TestModel.__proto__.should.equal Model


  describe "parseDefinition()", ->
    it "should parse a single property property", ->
      schema = new Schema({})
      definitionProperty = undefined
      definitionProperty = schema.parseDefinition(String)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal String
      definitionProperty = schema.parseDefinition(Number)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal Number
      definitionProperty = schema.parseDefinition(Boolean)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal Boolean
      definitionProperty = schema.parseDefinition(Date)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal Date
      definitionProperty = schema.parseDefinition(Checked.String)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal Checked.String
      definitionProperty = schema.parseDefinition(Checked.Number)
      definitionProperty.should.be["instanceof"] Property
      definitionProperty.type.should.equal Checked.Number

    it "should parse object types properly", ->
      schema = new Schema({})
      parsed = schema.parseDefinition(
        a: String
        b: Number
        c: Date
        d: Boolean
      )
      parsed.should.be["instanceof"] Property
      parsed.type.should.equal Object
      parsed.child.a.should.be["instanceof"] Property
      parsed.child.b.should.be["instanceof"] Property
      parsed.child.c.should.be["instanceof"] Property
      parsed.child.d.should.be["instanceof"] Property
      parsed.child.a.type.should.equal String
      parsed.child.b.type.should.equal Number
      parsed.child.c.type.should.equal Date
      parsed.child.d.type.should.equal Boolean
      parsed.child.a.isRequired.should.not.be["true"]
      parsed.child.b.isRequired.should.not.be["true"]
      parsed.child.c.isRequired.should.not.be["true"]
      parsed.child.d.isRequired.should.not.be["true"]
      parsed.child.a.isPrivate.should.not.be["true"]
      parsed.child.b.isPrivate.should.not.be["true"]
      parsed.child.c.isPrivate.should.not.be["true"]
      parsed.child.d.isPrivate.should.not.be["true"]

    it "should interpret object types with key names ending with _ as isRequired and properties starting with $ as isPrivate", ->
      schema = new Schema({})
      parsed = schema.parseDefinition(
        $a_: String
        $b_: Number
        c_: Date
        d_: Boolean
      )
      parsed.child.a.should.be["instanceof"] Property
      parsed.child.b.should.be["instanceof"] Property
      parsed.child.c.should.be["instanceof"] Property
      parsed.child.d.should.be["instanceof"] Property
      parsed.child.a.isRequired.should.be["true"]
      parsed.child.b.isRequired.should.be["true"]
      parsed.child.c.isRequired.should.be["true"]
      parsed.child.d.isRequired.should.be["true"]
      parsed.child.a.isPrivate.should.be["true"]
      parsed.child.b.isPrivate.should.be["true"]
      parsed.child.c.isPrivate.should.be["false"]
      parsed.child.d.isPrivate.should.be["false"]

    it "should interpret array properties properly", ->
      schema = new Schema({})
      parsed = schema.parseDefinition(
        myArray: [
          a: Number
          b_: Date
        ]
        myRequiredArray_: [ a: String ]
        arrayWithBasicType: [ String ]
      )
      parsed.child.myArray.should.be["instanceof"] Property
      parsed.child.myRequiredArray.should.be["instanceof"] Property
      parsed.child.myArray.type.should.equal Array
      parsed.child.myRequiredArray.type.should.equal Array
      parsed.child.myArray.isRequired.should.not.be["true"]
      parsed.child.myRequiredArray.isRequired.should.be["true"]
      parsed.child.myArray.child.should.be["instanceof"] Property
      parsed.child.myRequiredArray.child.should.be["instanceof"] Property
      parsed.child.arrayWithBasicType.child.should.be["instanceof"] Property
      parsed.child.myArray.child.type.should.equal Object
      parsed.child.myRequiredArray.child.type.should.equal Object
      parsed.child.arrayWithBasicType.child.type.should.equal String
      parsed.child.myArray.child.child.a.should.be["instanceof"] Property
      parsed.child.myArray.child.child.a.type.should.equal Number
      parsed.child.myArray.child.child.b.type.should.equal Date
      parsed.child.myArray.child.child.b.isRequired.should.be["true"]

    it "should interpret object properties properly", ->
      schema = new Schema({})
      parsed = schema.parseDefinition(
        myObject:
          a: Number
          b_: Date

        myRequiredObject_:
          a: String
      )
      parsed.child.myObject.should.be["instanceof"] Property
      parsed.child.myRequiredObject.should.be["instanceof"] Property
      parsed.child.myObject.type.should.equal Object
      parsed.child.myRequiredObject.type.should.equal Object
      parsed.child.myObject.isRequired.should.not.be["true"]
      parsed.child.myRequiredObject.isRequired.should.be["true"]
      parsed.child.myObject.child.a.should.be["instanceof"] Property
      parsed.child.myObject.child.a.type.should.equal Number
      parsed.child.myObject.child.b.type.should.equal Date
      parsed.child.myObject.child.b.isRequired.should.be["true"]


