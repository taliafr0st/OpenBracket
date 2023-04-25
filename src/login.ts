import express = require('express');
import session = require('express-session');
import path = require('path');
import {User, UserTable} from './classes/user';

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: false
}));

declare module "express-session" {
	interface SessionData {
	  userid: number;
	}
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (request : express.Request, response : express.Response) => {
	response.sendFile(path.join(__dirname + './views/login.html'));
});

app.post('/auth', (request : express.Request, response : express.Response) => {
	let username = request.body.username;
	let password = request.body.password;
	if (username && password) {
		UserTable.getUserByName(username)
		.then( u => {

			const pswdChk = u.comparePassword(password);
			if (pswdChk) {
				response.send(pswdChk)
			}
			request.session.loggedIn = true;
			request.session.user = u;

			response.redirect('/dashboard');
				
			response.end();
		})
		.catch( err => {
			response.send(err)
		});
	} else {
		response.send('Please enter your details!');
		response.end();
	}
});