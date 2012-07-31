Schema = require("../lib").Schema
Model = require("../lib").Model
Checked = require("../lib").Checked

describe "Model", ->
  it "can be properly instantiated with flat data", ->
    schema = new Schema(
      some: Number
      data: Number
    )
    UserModel = schema.model("User")
    testData =
      some: 1
      data: 2

    user = new UserModel(testData)
    user.should.be.an["instanceof"] Model
    user.data.should.eql testData
    user.constructor.modelName.should.equal "User"

  it "can be properly instantiated with embedded data", ->
    schema = new Schema(
      address:
        street: String
        country:
          name: String

      names: [ String ]
      hobbies: [ name: String ]
    )
    UserModel = schema.model("User")
    data =
      address:
        street: "street name"
        country:
          name: "France"

      names: [ "Mat", "John", "Bryan" ]
      hobbies: [
        name: "programming"
      ,
        name: "singing"
      ]

    user = new UserModel(data)

  describe "setData()", ->
    it "should set the sanitized values", ->
      schema = new Schema(
        username: String
        age: Number
        date: Date
        active: Boolean
        names: [ String ]
        stuff: [ a: Number ]
      )
      UserModel = schema.model("User")
      user = new UserModel()
      user.setData
        username: 123
        age: "38"
        date: "2012-01-10"
        active: 1
        names: [ 123, 321, "hi" ]
        stuff: [ a: "123" ]

      user.data.should.eql
        username: "123"
        age: 38
        date: new Date("2012-01-10")
        active: true
        names: [ "123", "321", "hi" ]
        stuff: [ a: 123 ]

      schema = new Schema(String)
      OneDimensionModel = schema.model("OneDimension")
      oneDimension = new OneDimensionModel()
      oneDimension.setData "Test"
      oneDimension.data.should.eql "Test"
      oneDimension.setData 123
      oneDimension.data.should.eql "123"


  describe "validate()", ->
    it "can validate basic type properties", ->
      schema = new Schema(
        username_: String
        password_: String
        name: String
        date: Date
        active: Boolean
      )
      UserModel = schema.model("User")
      user = new UserModel()
      (->
        user.setData {}
      ).should["throw"] "Validation error in 'User.username': Undefined Key"
      (->
        user.setData username: null
      ).should["throw"] "Validation error in 'User.username': Undefined Value"
      (->
        user.setData username: "enyo"
      ).should["throw"] "Validation error in 'User.password': Undefined Key"
      (->
        user.setData
          username: "enyo"
          password: "test"
          blabla: true

      ).should["throw"] "Validation error in 'User.blabla': Invalid Key"
      # (->
      #   user.setData
      #     username: "enyo"
      #     password: "test"
      #     name: ->

      # ).should["throw"] "Validation error in 'User.name': Invalid Value"
      # user.setData # Should not throw anything
      #   username: "enyo"
      #   password: "test"

      # user.data.should.eql
      #   username: "enyo"
      #   password: "test"

      # user.setData
      #   username: "enyo2"
      #   password: "test3"
      #   name: "Matias Meno"

      # user.data.should.eql
      #   username: "enyo2"
      #   password: "test3"
      #   name: "Matias Meno"

      # date = new Date()
      # user.setData
      #   username: "enyo"
      #   password: "test"
      #   name: "Matias Meno"
      #   date: date
      #   active: true

      # user.data.should.eql
      #   username: "enyo"
      #   password: "test"
      #   name: "Matias Meno"
      #   date: date
      #   active: true


    it "can validate checked type properties", ->
      schema = new Schema(
        userId: Checked.Number
        password: Checked.String
      )
      UserModel = schema.model("User")
      user = new UserModel()
      
      # not checked
      (->
        user.setData
          userId: 123
          password: "some pass."

      ).should["throw"] "Validation error in 'User.userId': Invalid Value"
      
      # Wrong Checked type
      (->
        user.setData
          userId: new Checked.String("123")
          password: "some pass"

      ).should["throw"] "Validation error in 'User.userId': Invalid Value"
      (->
        user.setData
          userId: new Checked.Number(123)
          password: "some pass"

      ).should["throw"] "Validation error in 'User.password': Invalid Value"
      user.setData
        userId: new Checked.Number(123)
        password: new Checked.String("some pass")

      user.data.should.eql
        userId: 123
        password: "some pass"


    it "can validate embedded properties", ->
      schema = new Schema(
        address_:
          street: String
          country_:
            name_: String

        names: [ String ]
        hobbies: [ name: String ]
      )
      UserModel = schema.model("User")
      user = new UserModel()
      (->
        user.setData {}
      ).should["throw"] "Validation error in 'User.address': Undefined Key"
      (->
        user.setData address:
          country: {}

      ).should["throw"] "Validation error in 'User.address.country.name': Undefined Key"
      # 123 is a valid string value.
      (->
        user.setData
          address:
            country:
              name: "hi"

          names: [ "abc", 123, new Date(), 34 ]

      ).should["throw"] "Validation error in 'User.names.2': Invalid Value"
      (->
        user.setData
          address:
            country:
              name: "hi"

          hobbies: [ "bla" ]

      ).should["throw"] "Validation error in 'User.hobbies.0': Invalid Value"
      (->
        user.setData
          address:
            country:
              name: "hi"

          testValue: ""

      ).should["throw"] "Validation error in 'User.testValue': Invalid Key"

    it "should use the provided errorCallback", ->
      schema = new Schema(
        id_: Number
        password_: String
      )
      UserModel = schema.model("User")
      errors = undefined
      errors = []
      user = new UserModel({}, (path, errorCode) ->
        errors.push
          path: path
          errorCode: errorCode

      )
      errors.should.eql [
        path: "User.id"
        errorCode: Model.UNDEFINED_KEY
      ,
        path: "User.password"
        errorCode: Model.UNDEFINED_KEY
      ]
      errors = []
      user = new UserModel(
        id: 24
      , (path, errorCode) ->
        errors.push
          path: path
          errorCode: errorCode

      )
      errors.should.eql [
        path: "User.password"
        errorCode: Model.UNDEFINED_KEY
      ]
      errors = []
      user = new UserModel(
        id: 24
        password: "abc"
      , (path, errorCode) ->
        errors.push {}
      )
      errors.should.be.empty
      errors = []
      user = new UserModel(
        id: 24
        password: new Date()
      , (path, errorCode) ->
        errors.push
          path: path
          errorCode: errorCode

      )
      errors.should.eql [
        path: "User.password"
        errorCode: Model.INVALID_VALUE
      ]


