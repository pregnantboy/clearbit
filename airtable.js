function test () {
    console.log("airtable read");
}

exports.test = test;

var Airtable = require('airtable');
var base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY}).base('appYJDnuQa910htYR');
var Promise = require('promise');

// Creates new person record.
function createPerson (personData) {
    return new Promise (function (resolve, reject) {
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
            "Email": json.email,
            "Location": json.location,
            "Bio": json.bio,
            "Gravatar": json.gravatar.avatars
        }, function (err, record) {
            if (err) {
                reject ('createPerson error:'+ err); 
            } else {
                var currentId = record.id;
                updateAvatar('People', currentId, 'Avatar', json.avatar);
                console.log('New person created', currentId);
                resolve (currentId);
            }
        });
    });
}

// Checks if image url is null before updating (prevent null url image error).
function updateAvatar (baseTitle, recordId, columnName, url) {
    if (url != null) {
        base(baseTitle).update(recordId, {
            columnName: [{"url": url}]
        }, function (err, record) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('avatar updated!');
        });
    }
}

// Search for companies using company name and return record id.
function searchCompany (companyData) {
    return new Promise (function (resolve, reject) {
        var json = companyData;
        base('Companies').list(3, null, {view: 'Main View'}, function(err, records, newOffset) {
            if (err) { 
                reject('searchCompany error', err); 
            }
            records.forEach(function(record) {
                if (record.get('Name') != null) {
                    if ( record.get('Name').toLowerCase() == json.name.toLowerCase() ) {
                        console.log('Found company', record.get('Name'), record.id);
                        resolve (record.id);
                    }
                }
            });
            resolve();
        });
    });
}

// Create new company record.
function createCompany (companyData, personId) {
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
function getExistingPeople (companyId) {
    return new Promise (function(resolve, reject) {
        base('Companies').find(companyId, function(err, record) {
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

// Add new person to the People column in the company.
function addPersonToCompany (companyId, personId) {
    var getExisitingPersonPromise = getExistingPeople(companyId);
    getExisitingPersonPromise.then( function(existingPeople) {
        existingPeople.push(personId);
        base('Companies').update(companyId, {
            "People": existingPeople
        }, function (err, record) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Existing updated! \n', record.get('People'));
        });
    });
}
    
// Public api to store new user and company data.
function storeNewUser (personData, companyData) {
    var createPersonPromise = createPerson(personData);
    createPersonPromise.then(function (personId) {
        console.log('current person id: ', personId);
    }) 
        .catch(function(error) {
            console.log(error)
        });
    
    if (companyData == null) {
        return;
    }
    var searchCompanyPromise = searchCompany(companyData);
    
    Promise.all([createPersonPromise, searchCompanyPromise])
        .then(function (idArray) {
            console.log(idArray);
            var currentCompanyId = idArray[1];
            var currentPersonId = idArray[0];
            if (currentCompanyId == null) {
                console.log('new company');
                createCompany(companyData, currentPersonId);
            } else {
                console.log('existing company');
                addPersonToCompany(currentCompanyId, currentPersonId);
            }
        })
        .catch(function(error) {
            console.log(error + '\n cannot store new user')
        });
}
    
exports.storeNewUser = storeNewUser;
    
    
    