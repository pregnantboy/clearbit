var Airtable = require('airtable');
var base = new Airtable({
	apiKey: process.env.AIRTABLE_API_KEY
}).base('appl3PDTbAFwSoPOJ');
var async = require('async');
var requestify = require('requestify');

function enqueueAllUsers(callback) {
	var allUsers = [];
	base('Table 1').list(null, null, {
		view: 'Main View'
	}, function(err, records, newOffset) {
		if (err) {
			console.log(err);
			return;
		}
		async.each(records, function(record, callback2) {
				console.log(record.get('Name'));
				allUsers.push(record.get('Name'));
				callback2();
			},
			function(err) {
				if (err) {
					console.log('error retrieving info from user base');
				} else {
					console.log('finished retrieving');
					callback(null, allUsers);
				}
			});
	});
}

function sendPostRequest(email, callback) {
	console.log('call');
	requestify.request('http://localhost:8000', {
			method: 'POST',
			body: {
				q:email,
			},
			auth:{
				username:'zapier',
				password:'Z8tTYRzbX#gP3E{rjkbU'
			}
		})
		.then(function(response) {
			//console.log(response);
			callback(null, response);
			return;
		});
}


function storeAllUsers(allUsers, done) {
	async.whilst(
		function() {
			return allUsers.length > 0;
		},
		function(callback) {
			async.waterfall([
					function(callback2) {
						sendPostRequest(allUsers[0], callback2);
					},
					function(result, callback2) {
						if (result !== 'error') {
							allUsers.shift();
							callback2(null, "finished one user");
						} else {
							callback2(null, "error. retrying");
						}
					}
				],
				function(err, result) {
					console.log(result, ' remaining:', allUsers.length);
					setTimeout(function() {
						callback();
					}, 3000);
				});
		},
		function(err) {
			console.log(err);
		}
	);
	done('done');
}

function beginAutomator() {
	async.waterfall([
		function(callback) {
			enqueueAllUsers(callback);
		},
		function(users, callback) {
			storeAllUsers(users, callback);
		},
		function(callback){
			console.log
		}
	], function(err, result) {
		console.log(result);
	});
}

exports.beginAutomator = beginAutomator;