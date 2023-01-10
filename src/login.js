const express = require('express');
const session = require('express-session');
const path = require('path');
const { UserTable } = require('./classes/user');

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + './views/login.html'));
});

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		UserTable.getUserByUsername(function(user, error) {
			if (error) {
                response.send(error)
            }
            const pswdChk = user.comparePassword(password);
            if (pswdChk) {
                response.send(pswdChk)
            }
            request.session.loggedIn = true;
            request.session.username = username;

            response.redirect('/dashboard');
				
			response.end();
		}, username);
	} else {
		response.send('Please enter your details!');
		response.end();
	}
});