
var dataProxy = require("../lib")
  , DataProxy = dataProxy.Class
  , Schema = dataProxy.Schema
  , http = require("http");
  ;

describe('DataProxy', function() {
  it('should already be an instance', function() {
    dataProxy.should.be.instanceof(DataProxy);
  });
  describe('options', function() {
    it('should be configurable in constructor', function() {
      var dataProxy;

      dataProxy = new DataProxy();
      dataProxy.options.should.eql({ host: '', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dataProxy = new DataProxy({ });
      dataProxy.options.should.eql({ host: '', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dataProxy = new DataProxy({ host: "test" });
      dataProxy.options.should.eql({ host: 'test', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dataProxy = new DataProxy({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
      dataProxy.options.should.eql({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
    });
    it('should be configurable with configure()', function() {
      var dataProxy = new DataProxy();

      dataProxy.configure({ host: "test" });
      dataProxy.options.host.should.equal("test");

      dataProxy.configure({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
      dataProxy.options.should.eql({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
    });
  });
  describe("post", function() {
    it("should use the passed options", function() {
      var opts, dataProxy;
      http.request = function(options) {
        opts = options;
        return { on: function() { }, end: function() { }, write: function() { } }
      };

      opts = {};
      dataProxy = new DataProxy();
      dataProxy.post('/');
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '/', headers: {} });

      opts = {};
      dataProxy = new DataProxy();
      dataProxy.post('/some/path');
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '/some/path', headers: {} });

      opts = {};
      dataProxy = new DataProxy();
      dataProxy.configure({ pathPrefix: '/prefix', queryStringSeparator: ';' })
      dataProxy.post('/some/path', { port: 8080, query: { a: 1, b: 'test' } });
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '/prefix/some/path?a=1;b=test', headers: {} });
    });
    it("should use the right body format", function() {
      var opts, dataProxy, writtenBody;
      http.request = function(options) {
        opts = options;
        return { on: function() { }, end: function() { }, write: function(body) { writtenBody = body; } }
      };
      dataProxy = new DataProxy();


      dataProxy.post("/test", { body: { a: "test" }, bodyFormat: "plain" });
      writtenBody.should.eql("[object Object]");
      dataProxy.post("/test", { body: { a: "test" }, bodyFormat: "urlencoded" });
      writtenBody.should.eql("a=test");
      dataProxy.post("/test", { body: { a: "test" }, bodyFormat: "json" });
      writtenBody.should.eql('{"a":"test"}');
      dataProxy.post("/test", { body: { a: "test" } });
      writtenBody.should.eql('{"a":"test"}');

      dataProxy.post("/test", { body: "abc", bodyFormat: "plain" });
      writtenBody.should.eql("abc");
      dataProxy.post("/test", { body: "abc", bodyFormat: "urlencoded" });
      writtenBody.should.eql("abc");
      dataProxy.post("/test", { body: "abc", bodyFormat: "json" });
      writtenBody.should.eql('"abc"');
      dataProxy.post("/test", { body: "abc" });
      writtenBody.should.eql('"abc"');


      var schema = new Schema({ username: String, age: Number });
      var UserModel = schema.model('User');
      var user = new UserModel({ username: 'test', age: 26});

      dataProxy.post("/test", { body: user, bodyFormat: "plain" });
      writtenBody.should.eql("[object Object]");
      dataProxy.post("/test", { body: user, bodyFormat: "urlencoded" });
      writtenBody.should.eql("username=test&age=26");
      dataProxy.post("/test", { body: user, bodyFormat: "json" });
      writtenBody.should.eql('{"username":"test","age":26}');
      dataProxy.post("/test", { body: user });
      writtenBody.should.eql('{"username":"test","age":26}');

    });
    describe("JSON", function() {
      var contentType, data;

      var request = function(options, reqCallback) {
        var res = {
            setEncoding: function() { },
            headers: { 'content-type': contentType },
            on: function(type, callback) {
              switch (type) {
                case "data":
                  callback(data);
                  break;
                case "end":
                  callback();
                  break;
              }
            }
          , end: function() { }
          , write: function() { }
        }
        setTimeout(function() { reqCallback(res); }, 1);

        return { on: function() { }, end: function() { }, write: function() { } }
      };

      it("should correctly be parsed if content type is application/json", function(done) {
        var dataProxy;

        http.request = request;

        contentType = 'application/json';
        data = '{ "some": "json" }';
        
        dataProxy = new DataProxy();
        dataProxy.post('/', { }, function(response) {
          response.dataObject.should.eql({ some: 'json' });
          response.data.should.eql(data);
          done();
        });

      });
      it("should call the errorCallback if the JSON is incorrect", function(done) {
        var dataProxy;

        http.request = request;

        contentType = 'application/json';
        data = '{ fblal }';
        
        dataProxy = new DataProxy();
        dataProxy.post('/', { }, null, function(err, response) {
          err.message.should.equal("The JSON couldn't be parsed.");
          response.data.should.equal('{ fblal }');
          done();
        });

      });
      it("should not be parsed if content type is not application/json", function(done) {
        var dataProxy;

        http.request = request;

        contentType = 'text/plain';
        data = '{ fblal }';
        
        dataProxy = new DataProxy();
        dataProxy.post('/', { }, function(response) {
          response.data.should.equal('{ fblal }');
          done();
        });

      });
    });
  });
});