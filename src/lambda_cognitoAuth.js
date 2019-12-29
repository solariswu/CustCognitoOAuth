const https = require('https');
const querystring = require('querystring');
const url = require('url');

const base_url = 'github.yungangwu.myinstance.com';

const auth_path = '/oauth2/authorize';

const query_param = querystring.stringify({
    'response_type': 'token',
    'client_id': '7nca7db89qqeddmt2rh90587c5',
    'redirect_uri': 'https://upauthtest.yungangwu.myinstance.com/profile.html',
    'state': 'STATE',
    'scope': 'openid'
});

function loginPost (loginUri, cookieHeader, csrf, username, password) {

    var loc = url.parse(loginUri);

    return new Promise((resolve, reject) => {
        var postData = querystring.stringify({
            '_csrf': csrf,
            'username': username,
            'password': password
        });

        var loginOptions = {
            host: loc.hostname,
            method: 'POST',
            path: loc.pathname+loc.search,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': cookieHeader
            }
        };

        const req = https.request(loginOptions, (res) => {
            //res.setEncoding('utf8');

            console.log ('res.statusCode:', res.statusCode);
            
            if (res.statusCode == 302) {
                return resolve (res.headers.location);
            }

            //only 302 is expected
            return reject(new Error('statusCode=' + res.statusCode));

        });

        req.on('error', (e) => {
          reject(e.message);
        });

        // send the request
        req.write(postData);
        req.end();
    });
}


exports.handler = async (event) => {
    
   return new Promise((resolve, reject) => {
        const options = {
            host: base_url,
            path: auth_path+'?'+query_param,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            if (res.statusCode == 302) {
              var tokenCookieString = res.headers['set-cookie'];

              resolve(res.headers.location+','+tokenCookieString);
            }
          
            // reject on bad status
            if (res.statusCode < 200 || res.statusCode > 302) {
              return reject(new Error('statusCode=' + res.statusCode));
            }
        });

        req.on('error', (e) => {
          reject(e.message);
        });

        // send the request
        req.write('');
        req.end();
    }).then(function(response1) {
        var response = response1 + '';
        var uri = response.split(',')[0];
        var tokenCookieString = response.split(',')[1];
        var csrfToken = response.split(',')[1].split(';')[0].split('=')[1];

        return loginPost (uri, tokenCookieString, csrfToken, 'ygwu', '963717');
         
    });
}
