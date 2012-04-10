
var Checked = require("../lib/checked_types")
  , _ = require("underscore");

describe("CheckedType", function() {
  describe("String", function() {
    it("should cubclass CheckedType", function() {
      var checkedString = new Checked.String("test string");
      (checkedString instanceof Checked.Type).should.be.true;
      (checkedString instanceof Checked.String).should.be.true;
    });
    it("should properly implement valueOf", function() {
      var checkedString = new Checked.String("test string");
      checkedString.valueOf().should.equal("test string");
    });
    it("should properly implement toString", function() {
      var checkedString = new Checked.String("test string");
      checkedString.toString().should.equal("test string");
    });
    it("should error if anything but string is provided in constructor", function() {
      var checkedString
        , errorMessage = "CheckedString has to be provided with a String.";
      (function() {
        checkedString = new Checked.String();
      }).should.throw(errorMessage);
      (function() {
        checkedString = new Checked.String(123);
      }).should.throw(errorMessage);
      (function() {
        checkedString = new Checked.String(true);
      }).should.throw(errorMessage);
      (function() {
        checkedString = new Checked.String(function() { });
      }).should.throw(errorMessage);
    });
  });
  describe("Number", function() {
    it("should cubclass CheckedType", function() {
      var checkedNumber = new Checked.Number(123);
      (checkedNumber instanceof Checked.Type).should.be.true;
      (checkedNumber instanceof Checked.Number).should.be.true;
    });
    it("should properly implement valueOf", function() {
      var checkedNumber = new Checked.Number(1234);
      checkedNumber.valueOf().should.equal(1234);
      checkedNumber = new Checked.Number(1234.123);
      checkedNumber.valueOf().should.equal(1234.123);
    });
    it("should properly implement toString", function() {
      var checkedNumber = new Checked.Number(1234);
      checkedNumber.toString().should.equal("1234");
      checkedNumber = new Checked.Number(1234.123);
      checkedNumber.toString().should.equal("1234.123");
    });
    it("should error if anything but string is provided in constructor", function() {
      var checkedNumber
        , errorMessage = "CheckedNumber has to be provided with a Number.";
      (function() {
        checkedNumber = new Checked.Number();
      }).should.throw(errorMessage);
      (function() {
        checkedNumber = new Checked.Number("abc");
      }).should.throw(errorMessage);
      (function() {
        checkedNumber = new Checked.Number(true);
      }).should.throw(errorMessage);
      (function() {
        checkedNumber = new Checked.Number(function() { });
      }).should.throw(errorMessage);
    });
  });
});