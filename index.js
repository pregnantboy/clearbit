#!/usr/bin/env node

var clearbit = require('clearbit')(process.env.CLEARBIT_KEY);
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 5000));

//Getting POST params in node: http://stackoverflow.com/questions/5710358/how-to-get-post-a-query-in-express-js-node-js
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

app.route('/')
    .post(function(request, response) {
        var email = request.body.q;
        console.log('POST:'+email);
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
    })
    .get(function(request, response) {
        var email = request.query.q;
        console.log('GET:'+email);
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
