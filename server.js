//Student Number: 221144029
//Please use this information to test
// Name: Batsile, Password:Password123 ID Number:123456789101

const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

function serveForm(res) {
    fs.readFile('protectaccess.html', 'utf8', function(err, data) {
        if (err) {
            res.writeHead(500);
            res.end('Could not load form');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

function checkName(name) {
    return name.trim() !== '' && /\D/.test(name);
}

function checkPassword(password) {
    return /^(?=.*[a-zA-Z])(?=.*\d).{10,}$/.test(password);
}

function checkID(id) {
    return /^\d{3}-\d{3}-\d{3}-\d{3}$/.test(id) || /^\d{12}$/.test(id);
}

function maskPassword(password) {
    return password.replace(/./g, '*');
}

function cleanID(id) {
    return id.replace(/[-.]/g, '');
}

const server = http.createServer(function(req, res) {

    if (req.method === 'GET' && req.url === '/protectaccess') {
        serveForm(res);
    }

    else if (req.method === 'GET' && req.url === '/protectaccess.css') {
        fs.readFile('protectaccess.css', 'utf8', function(err, data) {
            if (err) {
                res.writeHead(404);
                res.end('CSS not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    }

    else if (req.method === 'POST' && req.url === '/protectaccess') {

        var body = '';

        req.on('data', function(chunk) {
            body += chunk.toString();
        });

        req.on('end', function() {

            const formData = querystring.parse(body);

            var name = formData.name || '';
            var password = formData.pw || '';
            var idNumber = formData.IDnumber || '';

            var nameOk = checkName(name);
            var passwordOk = checkPassword(password);
            var idOk = checkID(idNumber);

            var valid = false;
            if (nameOk == true && passwordOk == true && idOk == true) {
                valid = true;
            }

            var maskedPassword = maskPassword(password);
            var displayID = cleanID(idNumber);

            var headingColor = '';
            var headingText = '';
            var resultText = '';

            if (valid == true) {
                headingText = 'Successful.';
                headingColor = 'green';
                resultText = 'Successful.\n' + name + ', ' + maskedPassword + ', ' + displayID;
            } else {
                headingText = 'Access Denied! Invalid data.';
                headingColor = 'red';
                resultText = 'Access Denied! Invalid data.\n' + name + ', ' + maskedPassword + ', ' + displayID;
            }

            fs.writeFile('accessresults.txt', resultText, function(err) {
                if (err) {
                    console.log('Could not save result');
                }
            });

            fs.readFile('accessresults.txt', 'utf8', function(err, savedData) {

                var displayContent = savedData;
                if (err) {
                    displayContent = resultText;
                }

                var html = '<!DOCTYPE html><html><head><title>Access Result</title></head><body>';
                html = html + '<h1 style="color: ' + headingColor + ';">' + headingText + '</h1>';
                html = html + '<p>' + name + ', ' + maskedPassword + ', ' + displayID + '</p>';
                html = html + '<pre>' + displayContent + '</pre>';
                html = html + '<a href="/protectaccess">Go Back</a>';
                html = html + '</body></html>';

                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            });
        });
    }

    else {
        res.writeHead(404);
        res.end('Oops! page not found :(');
    }
});

server.listen(3000, function() {
    console.log('Server running at http://localhost:3000/protectaccess');
});