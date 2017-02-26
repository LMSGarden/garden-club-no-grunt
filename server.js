/**
 * Dependencies
 */

var http = require('http');
var path = require('path');

var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

// Added by Diego - Used for contact form
var nodemailer = require('nodemailer');


/**
 * Variables
 */

// Debug flag
const debug = true;


/**
 * App
 */

var app = express();


/**
 * Port
 */

app.set('port', process.env.PORT || 3000);



/**
 * Middleware
 */

/* Debug if on localhost */
if (debug) {
  var morgan = require('morgan');
  app.use(morgan('dev'));
}

/* Gzip Compression */
app.use(compression());

/* Serve Static Public Content */
app.use(serveStatic( path.join(__dirname, 'public') ));

/* Handlebars Template Engine */
app.engine('html', handlebars({ extname: '.html' }));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

/* Handle POST Requests/URL Encoding */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/**
 * Top-level Router Object
 */

var router = {
  index: require('./routes/index'),
  store: require('./routes/index'),
  projects: require('./routes/projects'),
  contact: require('./routes/contact')
};


/**
 * Route Handlers
 */

app.get('/', router.index.view);
app.get('/store.html', router.store.view);
app.get('/projects.html', router.projects.view);
app.get('/contact.html', router.contact.view);

//Implementing POST for contact form
app.post('/contact', function(req, res){

let transporter = nodemailer.createTransport({
service: 'Gmail',
auth:{
user: 'diegodummytester@gmail.com',
pass: 'thisisadummy123'
}

});

let mailOptions = {
from: req.body.email,
to: 'lincolnschoolgardenclub@gmail.com',
subject: 'Contact Form from user <' + req.body.name +'>',
text: req.body.context
};

if (!req.body.phone.trim() || !req.body.email.trim() || !req.body.name.trim() || !req.body.context.trim()){
res.end("failed");
}

else{
transporter.sendMail(mailOptions, (error, info) =>{
if (error) {
res.end("failed");
}
res.end("done");
});
}
}
);

app.use(function(req, res) {
  res.status(404);

  // Respond with html page
  if (req.accepts('html')) {
    res.redirect('/404.html');
    return;
  }

  // Respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // Default to plain-text
  res.type('txt').send('Not found');
});


/**
 * Create Server and Listen
 */

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

