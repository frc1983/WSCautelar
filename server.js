var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  db = require('./database/index');

const Counts = require('./models/counts')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function (req, res) {
  if (db) {
    var count = new Counts();
    count.ip = req.ip;
    count.createdAt = Date.now();
    Counts.create(count);
    Counts.countDocuments(function (err, count) {
      if (err) {
        console.log('Error running count. Message:\n' + err);
      }
      res.render('index.html', { pageCountMessage: count, dbInfo: req.ip });
    });
  } else {
    res.render('index.html', { pageCountMessage: null });
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    Counts.countDocuments(function (err, count) {
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
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
