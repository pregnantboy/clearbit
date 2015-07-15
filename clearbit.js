var clearbit = require('clearbit')(process.env.CLEARBIT_API_KEY);
var airtable = require('./airtable');

function lookupPersonCompany(email, callback) {
	clearbit.PersonCompany.find({
			email: email,
			stream: false
		})
		.then(function(reply) {
			airtable.storeNewUser(email, reply.person, reply.company);
			var output = '';
			output += ('>>>>>>>PERSON<<<<<<<<<\n');
			output += (JSON.stringify(reply.person, null, 3));
			output += ('\n>>>>>>COMPANY<<<<<<<<<\n');
			output += (JSON.stringify(reply.company, null, 3));
			callback(output);
		})
		.catch(clearbit.Person.NotFoundError, function(err) {
			callback(JSON.stringify(err));
		})
		.catch(function(err) {
			callback(JSON.stringify(err));
		});
}

exports.lookupPersonCompany = lookupPersonCompany;