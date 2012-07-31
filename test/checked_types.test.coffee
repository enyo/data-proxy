Checked = require("../lib/checked_types")

describe "CheckedType", ->
  describe "String", ->
    it "should cubclass CheckedType", ->
      checkedString = new Checked.String("test string")
      (checkedString instanceof Checked.Type).should.be["true"]
      (checkedString instanceof Checked.String).should.be["true"]

    it "should properly implement valueOf", ->
      checkedString = new Checked.String("test string")
      checkedString.valueOf().should.equal "test string"

    it "should properly implement toString", ->
      checkedString = new Checked.String("test string")
      checkedString.toString().should.equal "test string"

    it "should error if anything but string is provided in constructor", ->
      checkedString = undefined
      errorMessage = "CheckedString has to be provided with a String."
      (->
        checkedString = new Checked.String()
      ).should["throw"] errorMessage
      (->
        checkedString = new Checked.String(123)
      ).should["throw"] errorMessage
      (->
        checkedString = new Checked.String(true)
      ).should["throw"] errorMessage
      (->
        checkedString = new Checked.String(->
        )
      ).should["throw"] errorMessage


  describe "Number", ->
    it "should cubclass CheckedType", ->
      checkedNumber = new Checked.Number(123)
      (checkedNumber instanceof Checked.Type).should.be["true"]
      (checkedNumber instanceof Checked.Number).should.be["true"]

    it "should properly implement valueOf", ->
      checkedNumber = new Checked.Number(1234)
      checkedNumber.valueOf().should.equal 1234
      checkedNumber = new Checked.Number(1234.123)
      checkedNumber.valueOf().should.equal 1234.123

    it "should properly implement toString", ->
      checkedNumber = new Checked.Number(1234)
      checkedNumber.toString().should.equal "1234"
      checkedNumber = new Checked.Number(1234.123)
      checkedNumber.toString().should.equal "1234.123"

    it "should error if anything but string is provided in constructor", ->
      checkedNumber = undefined
      errorMessage = "CheckedNumber has to be provided with a Number."
      (->
        checkedNumber = new Checked.Number()
      ).should["throw"] errorMessage
      (->
        checkedNumber = new Checked.Number("abc")
      ).should["throw"] errorMessage
      (->
        checkedNumber = new Checked.Number(true)
      ).should["throw"] errorMessage
      (->
        checkedNumber = new Checked.Number(->
        )
      ).should["throw"] errorMessage


