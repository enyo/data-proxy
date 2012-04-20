
var dataProxy = require("../lib")
  , DataProxy = dataProxy.Class
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
});