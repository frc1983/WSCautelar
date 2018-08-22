var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  db = require('./database/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', require('ejs').renderFile);

require('./app/controllers/index')(app);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.get('/', function (req, res) {
  if (db) {
    res.render('index.html', { pageCountMessage: 123, dbInfo: "fabio" });
  } else {
    res.render('index.html', { pageCountMessage: null });
  }
});

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
