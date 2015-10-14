var http = require( 'http' )
var path = require( 'path' )
var express = require( 'express' )
var app = express( )
var swig = require( 'swig' )
var lessMiddleware = require( 'less-middleware' )
var Flickr = require( 'flickrapi' )
var flickrApi

swig.setDefaults( { cache: false } )

app.engine( 'html', swig.renderFile )
app.set( 'view engine', 'html' )
app.set( 'views', path.join( __dirname, 'views' ) )
app.use( lessMiddleware( path.join( __dirname, 'less' ), {
  dest: path.join( __dirname, 'public' ),
  options: {
    compiler: {
      compress: true
    }
  },
  preprocess: {
    path: function( pathname, req ) {
      return pathname.replace( '/css/', '/' )
    }
  },
  debug: true,
  force: true
} ) )
app.use( express.static( __dirname + '/public', { maxAge: 86400 } ) )

var server = http.createServer( app ).listen( 8000 )

app.get( '/(:page.html)?', function( req, res ) {
  req.query.page = req.params.page ? req.params.page : 'index'
  var file = path.join( __dirname, 'views', req.query.page + '.html' )
  res.render( file )
} )

app.get( '/api/', function( req, res ) {

  console.log( req.query )
  flickrOptions = {
    api_key: 'a99cba99eef3af6246310d9690f2c05f',
    secret: 'a074a6975c11a256'
  }
  
  Flickr.tokenOnly(flickrOptions, function(error, flickr) {
    if( ! error ) {
      flickr.photos.search( {
        tags: req.query.q,
        page: req.query.page || 1,
        per_page: req.query.size || 5
      }, function(err, result) {
        var photos = [ ]
        result.photos.photo.forEach( function( photo ) {
          photo.url = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'
          photos.push( photo )
        } )
        res.json( photos )
      } )
    } else {
      res.send( error )
    }
  } )
} )

app.get( '*', function( req, res ) {
  req.query.page = '404'
  var file = path.join( __dirname, 'views',  req.query.page + '.html' )
  res.render( file )
} )



