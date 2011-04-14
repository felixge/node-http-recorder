fs = require "fs"
http = require "http"
Stream = require("stream").Stream

module.exports = class HttpRecorder extends Stream
  constructor: ->
    @_port = null
    @_dir = null

    @_connections = []
    @_requests = []
    @_httpServer = null

  record: (@_port = 8040, @_dir = process.cwd(), cb) ->
    @_httpServer = http
      .createServer()
      .on("connection", (connection) => @_record connection)
      .on("request", (req, res) => @_receiveAndRespond req, res)
      .listen(@_port, cb)

    console.log "Recording on port #{ @_port } to #{ @_dir }"

  _receiveAndRespond: (req, res) ->
    id = @_connections.indexOf req.connection
    id = if id is -1 then "unknown"  else id + 1

    console.log "<- connection ##{ id }: #{ req.method } #{ req.url }"

    req.on "end", =>
      @_respond res

  _respond: (res) ->
    res.writeHead 200,
      server: "http-recorder"
      connection: "close"
    res.end "Recorded"

  _record: (connection) ->
    @_connections.push connection

    id = @_connections.length
    console.log "<- connection ##{ id }: established"

    name = "connection_#{ id }.http"
    path = "#{ @_dir }/#{ name }"
    file = fs.createWriteStream path

    start = new Date

    connection.pipe file

    file.on "close", ->
      duration = new Date - start
      console.log(
        "-> connection ##{ id }: recorded to #{ duration } ms"
      )
