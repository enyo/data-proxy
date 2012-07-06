###
Copyright(c) 2012 Matias Meno <m@tias.me>
###


# Dependencies
crypto = require "crypto"
querystring = require "querystring"
http = require "http"
https = require "https"
Model = require "./model"
Schema = require "./schema"
Property = require "./property"
Checked = require "./checked_types"





# Helper function to deep extend objects
deepExtend = (object, extenders...) ->
  return { } unless object?
  for other in extenders
    for own key, val of other
      unless object[key]? and typeof val is "object"
        object[key] = val
      else
        object[key] = deepExtend object[key], val
  object




# The DataProxy is in charge of communicating with the backend.
class DataProxy

  constructor: (options) ->
    @options =
      protocol: "http"
      host: ""
      pathPrefix: "" # Without trailing slash
      queryStringSeparator: "&"

    @configure options if options?


  # Configures the proxy.
  #
  # Possible options are:
  #
  # - `host` String Only the host. Either the ip, or the hostname. eg: `10.0.0.200`
  # - `port` Integer **Default: 80**
  # - `pathPrefix` String Eg: `/backend_20110906_01_18_g7c65465_1323548513` Defaults to an empty string.
  # - `queryStringSeparator` String Should be `&` or `;`. **Default is `&`**
  configure: (options) ->
    @options = deepExtend @options, options


  # Posts a request to the backend and returns the formatted response.
  # 
  # Possible values for the options object are:
  # 
  # - `body` mixed An optional body to submit.
  # - `bodyFormat` String One of: `plain`, `urlencoded` or `json`. The proxy will take the provided body object and transform
  # it accordingly. Defaults to `json`.
  # - `query` Object An object containing query parameters to be transferred in the path
  # - `headers` Object An object containing additional headers. If `body` is provided, the `Content-type` header will automatically be overwritten for urlencoded an JSON.
  # 
  # `path` The path to request with a leading slash.
  # `options` An options object for the request
  # `callback` Gets `err` and `response` object as parameters.
  post: (path, options, callback) ->
    options = options or {}
    headers = options.headers or {}

    if options.body
      options.body = options.body.data if options.body instanceof Model
      options.method = "POST"
      switch options.bodyFormat
        when "plain"
          options.body = options.body.toString()
        when "urlencoded"
          options.body = querystring.stringify options.body
          headers["Content-Type"] = "application/x-www-form-urlencoded"
        else # json
          options.body = JSON.stringify options.body
          headers["Content-Type"] = "application/json"
    queryString = (if options.query then "?" + querystring.stringify(options.query, @options.queryStringSeparator) else "")

    completeOptions =
      host: @options.host
      port: @options.port ? (if @options.protocol == "http" then 80 else 443)
      method: options.method or "GET"
      path: (@options.pathPrefix or "") + (path or "") + queryString
      headers: headers

    # Now choosing the right protocol.
    protocol = if @options.protocol == "http" then http else https

    req = protocol.request(completeOptions, (res) ->
      res.setEncoding "utf8"
      data = ""
      res.on "data", (chunk) ->
        data += chunk

      res.on "end", ->
        formattedResponse =
          statusCode: res.statusCode
          headers: res.headers
          data: data

        if res.headers["content-type"].indexOf("application/json") is 0
          try
            formattedResponse.dataObject = JSON.parse(formattedResponse.data)
            if options.receiveAs
              try
                formattedResponse.record = new options.receiveAs(formattedResponse.dataObject)
                formattedResponse.dataObject = formattedResponse.record.data
              catch err
                callback err, formattedResponse
                return
          catch err
            callback new Error("The JSON couldn't be parsed."), formattedResponse
            return
        else if options.receiveAs
          callback new Error("Couldn't receive as " + options.receiveAs.modelName + " because response wasn't JSON."), formattedResponse
          return
        if res.statusCode >= 400
          callback new Error("The backend returned " + res.statusCode), formattedResponse
        else
          callback undefined, formattedResponse

    )
    req.on "error", (e) ->
      callback e, { statusCode: 400, headers: [], data: null }

    req.write options.body if options.body
    req.end()


# Exposing the proxy.
module.exports = exports = new DataProxy

# Exposing the constructor.
module.exports.Class = DataProxy

# Exposing the Model.
module.exports.Model = Model

# Exposing the Schema.
module.exports.Schema = Schema

# Exposing the Property.
module.exports.Property = Property

# Exposing the Checked object.
module.exports.Checked = Checked

