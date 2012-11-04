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
Q = require "q"




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
      debug: off
      defaultContentType: "application/json" # If no content type or bodyFormat is provided.
      charset: "utf-8"

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
  # - `headers` Object An object containing additional headers. The `Content-Type` header will automatically be overwritten. To set it use the `contentType` option.
  # 
  # `path` The path to request with a leading slash.
  # `options` An options object for the request
  post: (path, options) ->
    options = options or {}
    headers = options.headers or {}

    contentType = options.contentType ? @options.defaultContentType

    if options.body
      options.body = options.body.data if options.body instanceof Model
      options.method = "POST"
      switch options.bodyFormat
        when "plain"
          options.body = options.body.toString()
          contentType = "text/plain" unless options.contentType?
        when "urlencoded"
          options.body = querystring.stringify options.body
          contentType = "application/x-www-form-urlencoded" unless options.contentType?
        else # json
          options.body = JSON.stringify options.body
          contentType = "application/json" unless options.contentType?

    headers["Content-Type"] = "#{contentType}; charset=#{@options.charset}"

    queryString = (if options.query then "?" + querystring.stringify(options.query, @options.queryStringSeparator) else "")

    completeOptions =
      host: @options.host
      port: @options.port ? (if @options.protocol == "http" then 80 else 443)
      method: options.method or "GET"
      path: (@options.pathPrefix or "") + (path or "") + queryString
      headers: headers

    console.log "REQUEST ==> \n", completeOptions if @options.debug
    console.log "BODY ==> \n", options.body if @options.debug and options.body

    # Now choosing the right protocol.
    protocol = if @options.protocol == "http" then http else https

    deferred = Q.defer()

    handleError = (err, formattedResponse) ->
      err = new Error err if typeof err == "string"
      err.response = formattedResponse
      deferred.reject err

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

        if res.headers?["content-type"] and res.headers["content-type"].indexOf("application/json") is 0
          try
            formattedResponse.dataObject = JSON.parse(formattedResponse.data)
            if options.receiveAs
              try
                formattedResponse.record = new options.receiveAs(formattedResponse.dataObject)
                formattedResponse.dataObject = formattedResponse.record.data
              catch err
                handleError err, formattedResponse
                return
          catch err
            handleError "The JSON couldn't be parsed.", formattedResponse
            return
        else if options.receiveAs
          handleError "Couldn't receive as " + options.receiveAs.modelName + " because response wasn't JSON.", formattedResponse
          return

        if res.statusCode >= 400
          handleError "The backend returned " + res.statusCode, formattedResponse
        else
          deferred.resolve formattedResponse

    )
    req.on "error", (e) ->
      handleError e, { statusCode: 400, headers: [], data: null }

    req.write options.body if options.body
    req.end()

    # Return the promise
    deferred.promise


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

