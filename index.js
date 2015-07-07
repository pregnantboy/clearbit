#!/usr/bin/env node

var clearbit = require('clearbit')('a59eaed57622cd6392ed0af98f0140cf');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
    var email = request.query.q;
    if (!email) {
      response.send('Usage:/?q=[email]')
    }
    clearbit.PersonCompany.find({email: email, stream: true})
      .then(function (reply) {
        response.setHeader('Content-Type', 'application/json');
        response.write('>>>>>>>PERSON<<<<<<<<<\n');
        response.write(JSON.stringify(reply.person,null,3));
        response.write('\n>>>>>>COMPANY<<<<<<<<<\n');
        response.write(JSON.stringify(reply.company,null,3));
      })
      .catch(clearbit.Person.NotFoundError, function (err) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(err));
      })
      .catch(function (err) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(err));
      });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

