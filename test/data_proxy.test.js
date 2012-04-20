
var dataProxy = require("../lib")
  , DataProxy = dataProxy.Class
  , http = require("http");
  ;

describe('DataProxy', function() {
  it('should already be an instance', function() {
    dataProxy.should.be.instanceof(DataProxy);
  });
  describe('options', function() {
    it('should be configurable in constructor', function() {
      var dp;

      dp = new DataProxy({ });
      dp.options.should.eql({ host: '', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dp = new DataProxy({ host: "test" });
      dp.options.should.eql({ host: 'test', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dp = new DataProxy({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
      dp.options.should.eql({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
    });
    it('should be configurable with configure()', function() {
      var dp = new DataProxy();

      dp.options.should.eql({ host: '', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dp.configure({ host: "test" });
      dp.options.should.eql({ host: 'test', port: 80, pathPrefix: '', queryStringSeparator: '&' });

      dp.configure({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
      dp.options.should.eql({ host: "test", port: 8080, pathPrefix: '/hi', queryStringSeparator: ';' });
    });
  });
  describe("post", function() {
    it("should use the passed options", function() {
      var opts;
      http.request = function(options) {
        opts = options;
        return { on: function() { }, end: function() { }, write: function() { } }
      };

      opts = {};
      var dp = new DataProxy();
      dp.post();
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '', headers: {} });

      opts = {};
      var dp = new DataProxy();
      dp.post('/some/path');
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '/some/path', headers: {} });

      opts = {};
      var dp = new DataProxy();
      dp.configure({ pathPrefix: '/prefix', queryStringSeparator: ';' })
      dp.post('/some/path', { port: 8080, query: { a: 1, b: 'test' } });
      opts.should.eql({ host: '', port: 80, method: 'GET', path: '/prefix/some/path?a=1;b=test', headers: {} });


    });
  });
});