// Dependecias
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Config
const User = require('./models/user');
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/api-auth');
app.set('secret', 'coderscantabria');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Rutas
app.get('/', (req, res) => {
    res.sendFile('public/index.html', {
        root: __dirname
    });
});

const api = express.Router();

api.post('/login', (req, res) => {

    // Buscamos el usuario que nos llega por parametro.
    User.findOne({
        name: req.body.name
    }, (err, user) => {

        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'No existe ningún usuario con ese nombre.'
            });
        } else {
            // user = {name:'Username',password:'Pass'}
            // Comprobamos que las contrasenas coinciden.
            if (user.password !== req.body.password) {
                res.json({
                    success: false,
                    message: 'Contraseña incorrecta.'
                });
            } else {

                // Eliminamos la contraseña del payload. delete user.password
                user.password = undefined;
                // Login correcto. Creamos token y lo devolvemos en la respuesta.
                var token = jwt.sign(user, app.get('secret'), {
                    expiresIn: 3600 // 1h
                });

                res.json({
                    success: true,
                    message: 'Login correcto.',
                    token: token
                });
            }

        }

    });

});

// Middleware
api.use((req, res, next) => {

    // Recogemos el token de la petición, post / url param / header
    const token = req.body.token || req.params.token || req.headers['token'];

    if (token) {

        // Verificamos si el token es correcto
        jwt.verify(token, app.get('secret'), (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Token erróneo.' });
            } else {
                // Añadimos el decoded payload peticion y permitimos que se acceda al endpoint
                req.decoded = decoded;
                next();
            }
        });

    } else {

        return res.status(403).send({
            success: false,
            message: 'Petición sin token.'
        });

    }

});

// Contenido protegido por el middleware
api.get('/content', (req, res) => {
    console.log(req.decoded);
    res.json({
        success: true,
        message: 'Hola ' + req.decoded._doc.name
    });
});

app.use('/api', api);

// Init
app.listen(port);
console.log('Server running...');