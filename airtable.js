function test() {
    console.log("airtable ready");
}

exports.test = test;

var Airtable = require('airtable');
var base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base('appxVL06ZcWgwXjjy');
var Promise = require('promise');

/*
// Create New Person or Invisible Person Record
*/

// Creates new person record.
function createPerson(email, personData, callback) {
    console.log('creating new user:', personData.name.fullName);
    base('People').create({
        "Email": email,
        "First Name": personData.name.givenName,
        "Last Name": personData.name.familyName,
        "Title": personData.employment.title,
        "Github handle": personData.github.handle,
        "Facebook handle": personData.facebook.handle,
        "Twitter handle": personData.twitter.handle,
        "Twitter followers": personData.twitter.followers,
        "Google+ handle": personData.googleplus.handle,
        "Angellist handle": personData.angellist.handle,
        "Angellist bio": personData.angellist.bio,
        "Klout handle": personData.klout.handle,
        "Foursquare handle": personData.foursquare.handle,
        "Aboutme handle": personData.aboutme.handle,
        "Location": personData.location,
        "Bio": personData.bio,
    }, function(err, record) {
        if (err) {
            callback('createPerson error:' + err, null);
        } else {
            var currentId = record.id;
            updatePerson(currentId, personData);
            updateAvatar('People', currentId, "Avatar", personData.avatar);
            console.log('New person created', currentId);
            callback(null,currentId);
        }
    });
}

function updatePerson(recordId, json) {
    base('People').update(recordId, {

    }, function(err, record) {
        console.log(json);
        if (err) {
            console.log('updatePerson for record id' + record.id + ' error' + err);
        } else {
            console.log('Person ', record.id, ' sucessfully updated!');
        }
    });
}
// Creates new person record with only email.
function createInvisPerson(email, callback) {
    base('People').create({
        "Email": email
    }, function(err, record) {
        if (err) {
            callback('createInvisUser error: ' + err, null);
        } else {
            var currentId = record.id;
            console.log('New invis person created', currentId);
            callback(null,currentId);
        }
    });
}

// Checks if image url is null before updating (prevent null url image error).
function updateAvatar(baseTitle, recordId, columnName, url) {
    if (url) {
        var updatedJSON = {};
        updatedJSON[columnName] = [{
            "url": url
        }];
        base(baseTitle).update(recordId, updatedJSON, function(err, record) {
            if (err) {
                console.log(err, baseTitle, recordId, columnName, url);
                return;
            }
            console.log('avatar updated!');
        });
    }
}

// Search for exisiting user.
function searchPerson(email, callback) {
    base('People').list(null, null, {
        view: 'Main View'
    }, function(err, records, newOffset) {
        if (err) {
            callback('searchPerson error'+ err, null);
        } else {
            records.forEach(function(record) {
                var recordEmail = record.get('Email');
                if (recordEmail) {
                    if (recordEmail.toLowerCase() == email.toLowerCase()) {
                        console.log('Found exisiting person', recordEmail);
                        callback(null,record.id);
                    }
                }
            });
            callback(null,null);
        }
    });
}

// Update existing user 
function updateExistingPerson(personId, personData, callback) {
        // Do not update for now.
    console.log('Existing Person updated:', personId);
    callback(null, personId);
}

/*
// Create or update company data.
*/

// Search for companies using company name and return record id.
function searchCompany(companyData) {
    return new Promise(function(resolve, reject) {
        var json = companyData;
        base('Companies').list(null, null, {
            view: 'Main View'
        }, function(err, records, newOffset) {
            if (err) {
                reject('searchCompany error', err);
            } else {
                records.forEach(function(record) {
                    var recordName = record.get('Name');
                    if (recordName) {
                        if (recordName.toLowerCase() == json.name.toLowerCase()) {
                            console.log('Found company', recordName, record.id);
                            resolve(record.id);
                            return;
                        }
                    }
                });
                resolve();
            }
        });
    });
}

// Create new company record.
function createCompany(companyData, personId) {
    var json = companyData;
    base('Companies').create({
        "Name": json.name,
        "URL": json.url,
        "People": [personId],
        "Company Size": json.metrics.employees,
        "Industry": json.category.industry,
        "Description": json.description,
        "Location": json.location,
        "Market Cap": json.metrics.marketCap,
        "Funds Raised": json.metrics.raised,
        "Crunchbase handle": json.crunchbase.handle,
        "Linkedin handle": json.linkedin.handle,
        "Facebook handle": json.facebook.handle,
    }, function(err, record) {
        if (err) {
            console.log('createComapny', err);
            return;
        }
        updateAvatar('Companies', record.id, 'Logo', json.logo);
        console.log('New company ', record.id, ' created! \n');
    });
}

// Get existing people in the company.
function getExistingPeople(companyId) {
    return new Promise(function(resolve, reject) {
        base('Companies').find(companyId, function(err, record) {
            if (err) {
                reject(err);
            }
            console.log(record.get('People'));
            if (!record.get('People')) {
                resolve([]);
            } else {
                resolve(record.get('People'));
            }
        });
    });
}

// Add new person to the existing People column in the company.
function addPersonToCompany(companyId, personId) {
    var getExisitingPeoplePromise = getExistingPeople(companyId);
    getExisitingPeoplePromise.then(function(existingPeople) {
        if (existingPeople.indexOf(personId) == -1) {
            existingPeople.push(personId);
            console.log('existing people: ', existingPeople);
            base('Companies').update(companyId, {
                "People": existingPeople
            }, function(err, record) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Existing company updated! \n', record.get('People'));
                }
            });
        } else {
            console.log('Person already exists in company record');
        }
    });
}

/*
// Public API
*/

// Public api to store new user and company data.
function storeNewUser(email, personData, companyData) {

    aync.waterfall ([
        function(callback) {
            searchPerson(email, callback);
        },
        function (personId, callback) {
            if (!personId) {
                // If personData is null, store record only with email.
                console.log('new user');
                if (!personData) {
                    createInvisPerson(email, callback);
                } else {
                    console.log('creating new person ', personData.name.givenName);
                    createPerson(email, personData, callback);
                }
            } else {
                console.log('exisiting userId:', personId);
                updateExistingPerson(personId, personData, callback);
            }
        },
        function(personId, callback) {
            console.log('current person id: ', personId);
            callback(personId);
        },
        function (personId,)
    // If companyData is null, end.
    if (!companyData) {
        console.log('No company data');
        return;
    }
    var searchCompanyPromise = searchCompany(companyData);

    // Waits till searchCompany and createPerson/InvisPerson/updateExisitngPerson complete.
    Promise
        .all([storePersonPromise, searchCompanyPromise])
        .then(function(idArray) {
            console.log('idArray:', idArray);
            var currentCompanyId = idArray[1];
            var currentPersonId = idArray[0];
            // Either updates exisitng company or create new company record.
            if (!currentCompanyId) {
                console.log('new company');
                createCompany(companyData, currentPersonId);
            } else {
                console.log('existing company');
                addPersonToCompany(currentCompanyId, currentPersonId);
            }
        })
        // Handle createPersonPromise or searchPersonPromise rejection.
        .catch(function(error) {
            console.log(error + '\n cannot store new user');
        });
}


exports.storeNewUser = storeNewUser;