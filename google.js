var google = require('google');
google.resultsPerPage = 3;
var blacklistedDomains = ["facebook", "linkedin", "techcrunch", "crunchbase", "wikipedia", "youtube", "amazon"];
var Promise = require('promise');
var _ = require('underscore');



function getDomainUsingCompanyName(companyName) {
    return new Promise(function(resolve, reject) {
        google(companyName, function(err, next, results) {
            if (err) {
                reject(err);
            } else {
                var chosenResult = _.find(results, function(result) {
                    var url = result.link;
                    if (url) {
                        var domain;
                        //find & remove protocol (http, ftp, etc.) and get domain
                        if (url.indexOf("://") > -1) {
                            domain = url.split('/')[2];
                        } else {
                            domain = url.split('/')[0];
                        }

                        //find & remove port number
                        domain = domain.split(':')[0];
                        domain = domain.toLowerCase();
                        console.log('inspecting domain: ' + domain);
                        var resultOfInspection = isDomainApproved(domain, companyName);
                        console.log('domain inspected', domain, resultOfInspection);
                        return resultOfInspection;
                    }
                });
                if (chosenResult) {
                    console.log('chosen domain', chosenResult.link);
                    resolve([chosenResult.link, chosenResult.title]);
                } else {
                    resolve();
                }
            }
        });
    });
}

function getCompanyNameUsingDomain(companyDomain) {
    return new Promise(function(resolve, reject) {
        google(companyDomain, function(err, next, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results[0].title);
            }
        });
    });
}

function isDomainApproved(domain, companyName) {
    return _.every(blacklistedDomains, function(blacklistedDomain) {
        console.log(domain, companyName, blacklistedDomain);
        var result = (domain.indexOf(blacklistedDomain) === -1) && (companyName.indexOf(blacklistedDomain) === -1);
        return result;
    });
}

exports.getCompanyNameUsingDomain = getCompanyNameUsingDomain;
exports.getDomainUsingCompanyName = getDomainUsingCompanyName;