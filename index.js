#!/usr/bin/env node

var preAuth = require('http-auth');
var basic = preAuth.basic({
  realm: "Restricted Access. Please login to proceed."
}, function(username, password, callback) {
  callback((username === "zapier" && password === "Z8tTYRzbX#gP3E{rjkbU"));
});

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var clearbit = require('./clearbit');
var automator = require('./automator.js');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('port', (8000));

//Getting POST params in node: http://stackoverflow.com/questions/5710358/how-to-get-post-a-query-in-express-js-node-js
app.use(preAuth.connect(basic));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.route('/')
  // POST requests handler.
  .post(function(request, response) {
    var searchEmail = request.body.q;
    console.log('POST:' + searchEmail);
    if (!searchEmail) {
      response.render('index.html', {
        data: ""
      }); //response.send("Usage:/?q=email");
    } else if (searchEmail === 'run') {
      automator.beginAutomator();
      response.end();
      return;
    } else {
      respond(searchEmail, response);
    }

  })
  // GET requests handler.
  .get(function(request, response) {

    var searchEmail = request.query.q;
    console.log('GET:' + searchEmail);
    if (!searchEmail) {
      response.render('./index.html', {
        data: ""
      }); //response.send("Usage:/?q=email");
    } else if (searchEmail === 'run') {
      automator.beginAutomator();
      response.end();
      return;
    } else {
      respond(searchEmail, response);
    }
  });
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function respond(searchEmail, response) {
  clearbit.lookupPersonCompany(searchEmail, function(outputData) {
    response.render('./index.html', {
      data: outputData
    });
  });
}