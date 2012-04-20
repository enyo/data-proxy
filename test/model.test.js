
var Schema = require('../lib/schema')
  , Model = require('../lib/model')
  , Checked = require('../lib/checked_types');

describe('Model', function() {
  it('can be properly instantiated with flat data', function() {
    var schema = new Schema({ some: Number, data: Number });
    var UserModel = schema.model('User');

    var testData = { some: 1, data: 2 };

    var user = new UserModel(testData);

    user.should.be.an.instanceof(Model);
    user.data.should.eql(testData);

    user.constructor.modelName.should.equal('User');
  });
  it("can be properly instantiated with embedded data", function() {
    var schema = new Schema({ address: { street: String, country: { name: String } }, names: [String], hobbies: [{ name: String }] });
    var UserModel = schema.model('User');

    var data = { address: { street: "street name", country: { name: "France" } }, names: ["Mat", "John", "Bryan"], hobbies: [{ name: "programming"}, { name: "singing" }]};
    var user = new UserModel(data);

  });

  describe('validate()', function() {
    it('can validate basic type properties', function() {
      var schema = new Schema({ username_: String, password_: String, name: String, date: Date, active: Boolean });
      var UserModel = schema.model('User');

      var user = new UserModel();

      (function() {
        user.setData({  });
      }).should.throw("Validation error in 'User.username': Undefined Key");
      
      (function() {
        user.setData({ username: null });
      }).should.throw("Validation error in 'User.username': Undefined Value");
      
      (function() {
        user.setData({ username: 'enyo' });
      }).should.throw("Validation error in 'User.password': Undefined Key");

      (function() {
        user.setData({ username: 'enyo', password: "test", blabla: true });
      }).should.throw("Validation error in 'User.blabla': Invalid Key");

      (function() {
        user.setData({ username: 'enyo', password: 'test', name: function() { } });
      }).should.throw("Validation error in 'User.name': Invalid Value");
      
      user.setData({ username: 'enyo', password: 'test' }); // Should not throw anything
      user.data.should.eql({ username: 'enyo', password: 'test' });

      user.setData({ username: 'enyo2', password: 'test3', name: 'Matias Meno' });
      user.data.should.eql({ username: 'enyo2', password: 'test3', name: 'Matias Meno' });


      var date = new Date();
      user.setData({ username: 'enyo', password: 'test', name: 'Matias Meno', date: date, active: true });
      user.data.should.eql({ username: 'enyo', password: 'test', name: 'Matias Meno', date: date, active: true });

    });
    it('can validate checked type properties', function() {
      var schema = new Schema({ userId: Checked.Number, password: Checked.String });
      var UserModel = schema.model('User');

      var user = new UserModel();

      (function() {
        // not checked
        user.setData({ userId: 123, password: "some pass." });
      }).should.throw("Validation error in 'User.userId': Invalid Value");
      (function() {
        // Wrong Checked type
        user.setData({ userId: new Checked.String("123"), password: "some pass" });
      }).should.throw("Validation error in 'User.userId': Invalid Value");
      (function() {
        user.setData({ userId: new Checked.Number(123), password: "some pass" });
      }).should.throw("Validation error in 'User.password': Invalid Value");

      user.setData({ userId: new Checked.Number(123), password: new Checked.String("some pass") });

      user.data.should.eql({ userId: 123, password: "some pass" });
    });
    it("can validate embedded properties", function() {
      var schema = new Schema({ address_: { street: String, country_: { name_: String } }, names: [String], hobbies: [{ name: String }] });
      var UserModel = schema.model('User');

      var user = new UserModel();

      (function() {
        user.setData({  });
      }).should.throw("Validation error in 'User.address': Undefined Key");
      (function() {
        user.setData({ address: { country: { } } });
      }).should.throw("Validation error in 'User.address.country.name': Undefined Key");
      (function() {
        user.setData({ address: { country: { name: "hi" } }, names: ["abc", 123, new Date(), 34] }); // 123 is a valid string value.
      }).should.throw("Validation error in 'User.names.2': Invalid Value");
      (function() {
        user.setData({ address: { country: { name: "hi" } }, hobbies: ["bla"] });
      }).should.throw("Validation error in 'User.hobbies.0': Invalid Value");
      (function() {
        user.setData({ address: { country: { name: "hi" } }, testValue: '' });
      }).should.throw("Validation error in 'User.testValue': Invalid Key");

    });

    it("should use the provided errorCallback", function() {
      var schema = new Schema({ id_: Number, password_: String })
        , UserModel = schema.model('User')
        , calls
        , errors;

      errors = [];

      var user = new UserModel({ }, function(path, errorCode) {
        errors.push({ path: path, errorCode: errorCode });
      });
      errors.should.eql([ { path: 'User.id', errorCode: Model.UNDEFINED_KEY }, { path: 'User.password', errorCode: Model.UNDEFINED_KEY } ]);

      errors = [];
      var user = new UserModel({ id: 24 }, function(path, errorCode) {
        errors.push({ path: path, errorCode: errorCode });
      });
      errors.should.eql([ { path: 'User.password', errorCode: Model.UNDEFINED_KEY } ]);

      errors = [];
      var user = new UserModel({ id: 24, password: "abc" }, function(path, errorCode) {
        calls ++;
      });
      errors.should.be.empty;

      calls = 0;
      errors = [];
      var user = new UserModel({ id: 24, password: new Date() }, function(path, errorCode) {
        errors.push({ path: path, errorCode: errorCode });
      });
      errors.should.eql([ { path: 'User.password', errorCode: Model.INVALID_VALUE } ]);

    });

  });
});

