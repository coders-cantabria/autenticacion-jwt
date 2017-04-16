var token = window.localStorage.getItem('token') || '';

// Login
document.querySelector('.login__btn').addEventListener('click', function() {
    var urlLogin = window.location.origin + '/api/login';
    var params = {
        name: document.querySelector('.login__name').value,
        password: document.querySelector('.login__pwd').value
    };

    post(urlLogin, params).then(function(res) {
        var response = JSON.parse(res);
        log(res);
        if (response.token) {
            token = response.token;
            window.localStorage.setItem('token', response.token);
        }
    }, function(error) {
        log(error);
    });
});

// Check
document.querySelector('.check').addEventListener('click', function() {
    var url = window.location.origin + '/api/content';
    get(url, token).then(function(response) {
        log(response);
    }, function(error) {
        log(error);
    });
});

// Log
function log(text) {
    console.log(text);
    document.querySelector('.log').innerHTML = text;
}
// Ajax
function get(url, token) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        if (token !== '') {
            req.setRequestHeader('token', token);
        }
        req.onload = function() {
            if (req.status === 200) {
                resolve(req.response);
            }
            reject(req.response);
        };
        req.onerror = function() {
            reject('error');
        };
        req.send();
    });
}

function post(url, params) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('POST', url);
        req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        req.onload = function() {
            if (req.status === 200) {
                resolve(req.response);
            }
            reject(req.response);
        };
        req.onerror = function() {
            reject('error');
        };
        req.send(JSON.stringify(params));
    });
}