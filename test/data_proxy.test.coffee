
globalDataProxy = require "../lib"
DataProxy = globalDataProxy.Class
Schema = globalDataProxy.Schema
Model = globalDataProxy.Model
http = require "http"
https = require "https"



describe "DataProxy", ->
  it "should already be an instance", ->
    globalDataProxy.should.be["instanceof"] DataProxy

  describe "options", ->
    it "should be configurable in constructor", ->
      dataProxy = new DataProxy()
      dataProxy.options.should.eql
        protocol: "http"
        host: ""
        pathPrefix: ""
        queryStringSeparator: "&"
        debug: false
        defaultContentType: 'application/json'
        charset: "utf-8"

      dataProxy = new DataProxy({})
      dataProxy.options.should.eql
        protocol: "http"
        host: ""
        pathPrefix: ""
        queryStringSeparator: "&"
        debug: false
        defaultContentType: 'application/json'
        charset: "utf-8"

      dataProxy = new DataProxy(host: "test")
      dataProxy.options.should.eql
        protocol: "http"
        host: "test"
        pathPrefix: ""
        queryStringSeparator: "&"
        debug: false
        defaultContentType: 'application/json'
        charset: "utf-8"

      dataProxy = new DataProxy
        protocol: "https"
        host: "test"
        port: 8080
        pathPrefix: "/hi"
        queryStringSeparator: ";"
        debug: yes
        defaultContentType: 'application/json'
        charset: "ISO-666"

      dataProxy.options.should.eql
        protocol: "https"
        host: "test"
        port: 8080
        pathPrefix: "/hi"
        queryStringSeparator: ";"
        debug: yes
        defaultContentType: 'application/json'
        charset: "ISO-666"


    it "should be configurable with configure()", ->
      dataProxy = new DataProxy()
      dataProxy.configure host: "test"
      dataProxy.options.host.should.equal "test"
      dataProxy.configure
        protocol: "https"
        host: "test"
        port: 8080
        pathPrefix: "/hi"
        queryStringSeparator: ";"
        defaultContentType: 'application/json'
        charset: "ISO-666"

      dataProxy.options.should.eql
        protocol: "https"
        host: "test"
        port: 8080
        pathPrefix: "/hi"
        queryStringSeparator: ";"
        debug: no
        defaultContentType: 'application/json'
        charset: "ISO-666"



  describe "post()", ->
    it "should use the passed options", ->
      opts = undefined
      http.request = (options) ->
        opts = options
        on: ->
        end: ->
        write: ->

      opts = {}
      dataProxy = new DataProxy()
      dataProxy.post "/"
      opts.should.eql
        host: ""
        port: 80
        method: "GET"
        path: "/"
        headers:
          'Content-Type': 'application/json; charset=utf-8'

      opts = {}
      dataProxy = new DataProxy()
      dataProxy.post "/some/path"
      opts.should.eql
        host: ""
        port: 80
        method: "GET"
        path: "/some/path"
        headers:
          'Content-Type': 'application/json; charset=utf-8'

      opts = {}
      dataProxy = new DataProxy()
      dataProxy.configure
        pathPrefix: "/prefix"
        queryStringSeparator: ";"

      dataProxy.post "/some/path",
        port: 8080
        query: { a: 1, b: "test" }

      opts.should.eql
        host: ""
        port: 80
        method: "GET"
        path: "/prefix/some/path?a=1;b=test"
        headers:
          'Content-Type': 'application/json; charset=utf-8'


    it "should use https if it has been specified as protocol", (done) ->
      https.request = (options) ->
        options.port.should.eql 443
        done()
        return {
          on: ->
          end: ->
          write: ->
        }

      opts = {}
      dataProxy = new DataProxy
        protocol: 'https'
      dataProxy.post "/"


    it "should use the right body format", ->
      opts = undefined
      writtenBody = undefined
      http.request = (options) ->
        opts = options
        on: ->

        end: ->

        write: (body) ->
          writtenBody = body

      dataProxy = new DataProxy()
      dataProxy.post "/test",
        body:
          a: "test"

        bodyFormat: "plain"

      writtenBody.should.eql "[object Object]"
      dataProxy.post "/test",
        body:
          a: "test"

        bodyFormat: "urlencoded"

      writtenBody.should.eql "a=test"
      dataProxy.post "/test",
        body:
          a: "test"

        bodyFormat: "json"

      writtenBody.should.eql "{\"a\":\"test\"}"
      dataProxy.post "/test",
        body:
          a: "test"

      writtenBody.should.eql "{\"a\":\"test\"}"
      dataProxy.post "/test",
        body: "abc"
        bodyFormat: "plain"

      writtenBody.should.eql "abc"
      dataProxy.post "/test",
        body: "abc"
        bodyFormat: "urlencoded"

      writtenBody.should.eql "abc"
      dataProxy.post "/test",
        body: "abc"
        bodyFormat: "json"

      writtenBody.should.eql "\"abc\""
      dataProxy.post "/test",
        body: "abc"

      writtenBody.should.eql "\"abc\""
      schema = new Schema(
        username: String
        age: Number
      )
      UserModel = schema.model("User")
      user = new UserModel(
        username: "test"
        age: 26
      )
      dataProxy.post "/test",
        body: user
        bodyFormat: "plain"

      writtenBody.should.eql "[object Object]"
      dataProxy.post "/test",
        body: user
        bodyFormat: "urlencoded"

      writtenBody.should.eql "username=test&age=26"
      dataProxy.post "/test",
        body: user
        bodyFormat: "json"

      writtenBody.should.eql "{\"username\":\"test\",\"age\":26}"
      dataProxy.post "/test",
        body: user

      writtenBody.should.eql "{\"username\":\"test\",\"age\":26}"

    it "should return a record if receiveAs is specified", (done) ->
      data = undefined
      http.request = (options, reqCallback) ->
        res =
          setEncoding: ->
          headers:
            "content-type": "application/json"
          on: (type, callback) ->
            switch type
              when "data"
                callback data
              when "end"
                callback()
          end: ->
          write: ->

        setTimeout (->
          reqCallback res
        ), 1
        on: ->
        end: ->
        write: ->

      schema = new Schema(
        username: String
        age: Number
      )
      UserModel = schema.model("User")
      data = "{ \"username\": \"test\", \"age\": \"26\"}"
      dataProxy = new DataProxy()
      dataProxy.post("/", receiveAs: UserModel)
      .then (response) ->
        response.data.should.eql data
        response.dataObject.should.eql
          username: "test"
          age: 26

        response.record.should.be["instanceof"] Model
        response.record.data.should.eql
          username: "test"
          age: 26

        done()


    describe "JSON", ->
      contentType = undefined
      data = undefined
      request = (options, reqCallback) ->
        res =
          setEncoding: ->

          headers:
            "content-type": contentType

          on: (type, callback) ->
            switch type
              when "data"
                callback data
              when "end"
                callback()

          end: ->

          write: ->

        setTimeout (->
          reqCallback res
        ), 1
        on: ->

        end: ->

        write: ->

      it "should correctly be parsed if content type is application/json", (done) ->
        http.request = request
        contentType = "application/json"
        data = "{ \"some\": \"json\" }"
        dataProxy = new DataProxy()
        dataProxy.post("/", {}).then (response) ->
          response.dataObject.should.eql some: "json"
          response.data.should.eql data
          done()


      it "should call the error callback if the JSON is incorrect", (done) ->
        http.request = request
        contentType = "application/json"
        data = "{ fblal }"
        dataProxy = new DataProxy()
        dataProxy.post("/", {}).fail (err) ->
          err.message.should.equal "The JSON couldn't be parsed."
          err.response.data.should.equal "{ fblal }"
          done()


      it "should not be parsed if content type is not application/json", (done) ->
        http.request = request
        contentType = "text/plain"
        data = "{ fblal }"
        dataProxy = new DataProxy()
        dataProxy.post("/", {}).then (response) ->
          response.data.should.equal "{ fblal }"
          done()




