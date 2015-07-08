function test() {
    console.log("airtable ready");
}

exports.test = test;

var Airtable = require('airtable');
var base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base('appYJDnuQa910htYR');
var Promise = require('promise');

/*
// Create New Person or Invisible Person Record
*/

// Creates new person record.
function createPerson(email, personData) {
    return new Promise(function (resolve, reject) {
        var json = personData
        console.log('creating new user:', json.name.fullName);
        base('People').create({
            "First Name": json.name.givenName,
            "Last Name": json.name.familyName,
            "Title": json.employment.title,
            "Github handle": json.github.handle,
            "Facebook handle": json.facebook.handle,
            "Twitter handle": json.twitter.handle,
            "Twitter followers": json.twitter.followers,
            "Google+ handle": json.googleplus.handle,
            "Angellist handle": json.angellist.handle,
            "Angellist bio": json.angellist.bio,
            "Klout handle": json.klout.handle,
            "Foursquare handle": json.foursquare.handle,
            "Aboutme handle": json.aboutme.handle,
            "Email": email,
            "Location": json.location,
            "Bio": json.bio,
        }, function (err, record) {
            if (err) {
                reject('createPerson error:' + err);
            } else {
                var currentId = record.id;
                updateAvatar('People', currentId, "Avatar", json.avatar);
                console.log('New person created', currentId);
                resolve(currentId);
            }
        });
    });
}

// Creates new person record with only email.
function createInvisPerson(email) {
    return new Promise(function (resolve, reject) {
        base('People').create({
            "Email": email
        }, function (err, record) {
            if (err) {
                reject('createInvisUser error: ' + err);
            } else {
                var currentId = record.id;
                console.log('New invis person created', currentId);
                resolve(currentId);
            }
        });
    });
}

// Checks if image url is null before updating (prevent null url image error).
function updateAvatar(baseTitle, recordId, columnName, url) {
    if (url != null) {
        var updatedJSON = {};
        updatedJSON[columnName] = [{
            "url": url
        }];
        base(baseTitle).update(recordId, updatedJSON, function (err, record) {
            if (err) {
                console.log(err, baseTitle, recordId, columnName, url);
                return;
            }
            console.log('avatar updated!');
        });
    }
}

// Search for exisiting user.
function searchPerson(email) {
    return new Promise(function (resolve, reject) {
        base('People').list(null, null, {
            view: 'Main View'
        }, function (err, records, newOffset) {
            if (err) {
                reject('searchPerson error', err);
            } else {
                records.forEach(function (record) {
                    var recordEmail = record.get('Email');
                    if (recordEmail != null) {
                        if (recordEmail.toLowerCase() == email.toLowerCase()) {
                            console.log('Found exisiting person', recordEmail);
                            resolve(record.id);
                        }
                    }
                });
                resolve()
            }
        });
    });
}

// Update existing user 
function updateExistingPerson(personId, personData) {
    return new Promise(function (resolve, reject) {
        // Do not update for now.
        console.log('Existing Person updated:', personId);
        resolve(personId);
    });
}

/*
// Create or update company data.
*/

// Search for companies using company name and return record id.
function searchCompany(companyData) {
    return new Promise(function (resolve, reject) {
        var json = companyData;
        base('Companies').list(null, null, {
            view: 'Main View'
        }, function (err, records, newOffset) {
            if (err) {
                reject('searchCompany error', err);
            } else {
                records.forEach(function (record) {
                    var recordName = record.get('Name');
                    if (recordName != null) {
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
    }, function (err, record) {
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
    return new Promise(function (resolve, reject) {
        base('Companies').find(companyId, function (err, record) {
            if (err) {
                reject(err);
            }
            console.log(record.get('People'));
            if (record.get('People') == null) {
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
    getExisitingPeoplePromise.then(function (existingPeople) {
        if (existingPeople.indexOf(personId) == -1) {
            existingPeople.push(personId);
            console.log('existing people: ', existingPeople);
            base('Companies').update(companyId, {
                "People": existingPeople
            }, function (err, record) {
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

    var searchPersonPromise = searchPerson(email);
    var storePersonPromise = searchPersonPromise
        .then(function (personId) {
            //Either creates existing record or create new person record.
            if (personId == null) {
                // If personData is null, store record only with email.
                console.log('new user');
                if (personData == null) {
                    return createInvisPerson(email);
                } else {
                    return createPerson(email, personData);
                }
            } else {
                console.log('exisiting userId:', personId);
                return updateExistingPerson(personId, personData);
            }
        })
        // Handle searchPersonPromise rejection.
        .catch(function (error) {
            console.log(error);
        })

    // Waits till createPerson/InvisPerson/updateExistingPerson completes.
    storePersonPromise
        .then(function (personId) {
            console.log('current person id: ', personId);
        })
        .catch(function (error) {
            console.log(error);
        });

    // If companyData is null, end.
    if (companyData == null) {
        console.log('No company data');
        return;
    }
    var searchCompanyPromise = searchCompany(companyData);

    // Waits till searchCompany and createPerson/InvisPerson/updateExisitngPerson complete.
    Promise
        .all([storePersonPromise, searchCompanyPromise])
        .then(function (idArray) {
            console.log('idArray:', idArray);
            var currentCompanyId = idArray[1];
            var currentPersonId = idArray[0];
            // Either updates exisitng company or create new company record.
            if (currentCompanyId == null) {
                console.log('new company');
                createCompany(companyData, currentPersonId);
            } else {
                console.log('existing company');
                addPersonToCompany(currentCompanyId, currentPersonId);
            }
        })
        // Handle createPersonPromise or searchPersonPromise rejection.
        .catch(function (error) {
            console.log(error + '\n cannot store new user')
        });
}


exports.storeNewUser = storeNewUser;