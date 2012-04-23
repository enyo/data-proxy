/*!
 * Copyright(c) 2012 Matias Meno <m@tias.me>
 */

/**
 * Dependencies
 */
var _ = require('underscore')
  , crypto = require('crypto')
  , querystring = require('querystring')
  , http = require('http')
  , Model = require('./model')
  , Schema = require('./schema')
  , Property = require('./property')
  , Checked = require('./checked_types');

/**
 * The DataProxy is in charge of communicating with the backend.
 * 
 * @param {Object} options See configure() for possible options.
 */
var DataProxy = function(options) {
  this.options = _.extend({
      host: ''
    , port: 80
    , pathPrefix: '' // Without trailing slash
    , queryStringSeparator: '&'
  }, options || { });
};

/**
 * Configures the proxy.
 * 
 * Possible options are:
 * 
 *   - `host` String Only the host. Either the ip, or the hostname. eg: `10.0.0.200`
 *   - `port` Integer **Default: 80**
 *   - `pathPrefix` String Eg: `/backend_20110906_01_18_g7c65465_1323548513` Defaults to an empty string.
 *   - `queryStringSeparator` String Should be `&` or `;`. **Default is `&`**
 * 
 * 
 * @param  {Object} options
 */
DataProxy.prototype.configure = function(options) {
  this.options = _.extend(this.options, options);
};


/**
 * Posts a request to the backend and returns the formatted response.
 * 
 * Possible values for the options object are:
 * 
 *   - `body` mixed An optional body to submit.
 *   - `bodyFormat` String One of: `plain`, `urlencoded` or `json`. The proxy will take the provided body object and transform
 *                         it accordingly. Defaults to `json`.
 *   - `query` Object An object containing query parameters to be transferred in the path
 *   - `headers` Object An object containing additional headers. If `body` is provided, the `Content-type` header will automatically be overwritten.
 * 
 * @param  {String} path The path to request with a leading slash.
 * @param  {Object} options An options object for the request
 * @param  {Function} successCallback Gets the `response` object as first parameter
 * @param  {Function} errorCallback Gets `err` and `response` object as parameters. If no callback is provided
 *                                  a default callback is generated that simply throws the error.
 */
DataProxy.prototype.post = function(path, options, successCallback, errorCallback) {
  var options = options || { } 
    , headers = options.headers || { }
    , errorCallback = errorCallback || function(err) { throw err; };

  if (options.body) {
    options.method = 'POST';
    switch (options.bodyFormat) {
      case 'plain':
        options.body = options.body.toString();
        headers['Content-Type'] = 'text/plain';
        break;
      case 'urlencoded':
        options.body = querystring.stringify(options.body);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        break;
      case 'json':
      default:
        options.body = JSON.stringify(options.body);
        headers['Content-Type'] = 'application/json';
        break;
    }
  } 

  var queryString = options.query ? '?' + querystring.stringify(options.query, this.options.queryStringSeparator) : '';

  var completeOptions = {
      host: this.options.host
    , port: this.options.port
    , method: options.method || 'GET'
    , path: (this.options.pathPrefix || '') + (path || '') + queryString
    , headers: headers
  };

  var req = http.request(completeOptions, function(res) {
    res.setEncoding('utf8');
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function() {
      var formattedResponse = { statusCode: res.statusCode, headers: res.headers, data: data };
      if (res.headers['content-type'].indexOf('application/json') === 0) {
        try {
          formattedResponse.dataObject = JSON.parse(formattedResponse.data);
        }
        catch (err) {
          errorCallback(new Error("The JSON couldn't be parsed."), formattedResponse);
          return;
        }
      }

      if (res.statusCode >= 400) {
        errorCallback(new Error("The backend returned " + res.statusCode), formattedResponse);
      }
      else {
        successCallback(formattedResponse);
      }
    });
  });

  req.on('error', function(e) {
    errorCallback(e);
  });

  if (options.body) {
    req.write(options.body);
  }

  req.end();
};


/**
 * Exposing the proxy.
 * @type {DataProxy}
 */
module.exports = exports = new DataProxy;

/**
 * Exposing the constructor.
 * @type {Function}
 */
module.exports.Class = DataProxy;


/**
 * Exposing the Model.
 * @type {Function}
 */
module.exports.Model = Model;

/**
 * Exposing the Schema.
 * @type {Function}
 */
module.exports.Schema = Schema;

/**
 * Exposing the Property.
 * @type {Function}
 */
module.exports.Property = Property;

/**
 * Exposing the Checked object.
 * @type {Object}
 */
module.exports.Checked = Checked;


