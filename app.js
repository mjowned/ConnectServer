'use strict';

var express = require('express')
var app = express();
var http = require('http').Server(app);
var hbs = require('hbs');
var fs = require('fs');

var passport = require('passport');
var ConnectRoles = require('connect-roles');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');


//Data Access Layer
var mongoose = require('mongoose');
if (process.env.NODE_ENV == "production") {
	console.log("[Mongo] Using Production DB");
	mongoose.connect('mongodb://admin:admin@ds139438.mlab.com:39438/connect-cms'); // DEV database
}
else {
	console.log("[Mongo] Using Development DB");
	mongoose.connect('mongodb://localhost:27017/connect-cms'); // Local database
}
mongoose.Promise = require('q').Promise;

//Load the models
require('./api/models/user');
require('./api/models/photo');
require('./api/models/service');
require('./api/models/geolocation');

// var Q = require('q');

// var geolocationsPromise = require('../api/helpers/fillTestData').fillGeolocationsPromise(true);
// var photosPromise = require('../api/helpers/fillTestData').fillPhotosPromise(true);
// var servicesPromise = require('../api/helpers/fillTestData').fillServicesPromise(true);
// var usersPromise = require('../api/helpers/fillTestData').fillUsersPromise(true);
// /Data Access Layer
var SwaggerExpress = require('swagger-express-mw');

// Register Handlebars partials
//hbs.registerPartial('partial', fs.readFileSync(__dirname + '/views/partial.hbs', 'utf8'));
hbs.registerPartials(__dirname + '/views/partials');

// Fill Testdata
if (process.env.NODE_ENV == "production") {
	require('./api/helpers/fillTestData').fillTestData(false);
} else{
	require('./api/helpers/fillTestData').fillTestData(true);
}

// Routes
// app.use('/users', require('./api/routes/users')(handleError));

// Handlebars 
app.set('view engine', 'html');
app.engine('html', hbs.__express); 

require('./config/passport/passport')(passport); // pass passport for configuration

// Set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Required for passport
app.use(session({ secret: 'this-is-the-secret-cookie-for-our-connect-app' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Required for connect-roles
var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
    	res.render('html-error', {code: 403, text: "Access Denied"});
    } else {
    	res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});
app.use(user.middleware());

//anonymous users can only access the home page
//returning false stops any more rules from being
//considered
user.use(function (req, action) {
	if (!req.isAuthenticated()) return action === 'access home page';
})

//moderator users can access private page, but
//they might not be the only ones so we don't return
//false if the user isn't a moderator
user.use('access CRUD', function (req) {
	if (req.user.role === 'moderator') {
	  return true;
	}
})

//admin users can access all pages
user.use(function (req) {
	if (req.user.role === 'admin') {
	  return true;
	}
});

// Make the public folder public
app.use(express.static("public"));

//routes ======================================================================
require('./routes/routes.js')(app, user, passport); // load our routes and pass in our app and fully configured passport

var config = {
  appRoot: __dirname // required config
};


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  var server = app.listen(port);

  var io = require('./routes/sockets').listen(server);

});

module.exports = app; // for testing