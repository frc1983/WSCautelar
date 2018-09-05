var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  db = require('./database/index'),
  fileUpload = require('express-fileupload');

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.engine('html', require('ejs').renderFile);
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true
}));

require('./app/controllers/index')(app);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function (req, res) {
  if (db) {
    res.render('index.html', { info: "Ok" });
  } else {
    res.render('index.html', { info: "Error" });
  }
});

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Server error!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
