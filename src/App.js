const { Pool, Client } = require("pg");
const express = require('express');
const session = require('express-session');
const path = require('path');

const credentials = {
    user: "root",
    host: "dpg-cecefjpgp3jl5ttj7a4g-a.oregon-postgres.render.com",
    database: "reviewshub",
    password: "IfRTo0JO9P3vxzT6kxYQnTcNPzOffWyv",
    port: 5432,
    ssl:true
}


const app = express();


function App() {
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login3.html'));
});


// http://localhost:3000/auth
app.post('/auth', async function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty

	if (username && password) {
        console.log("all good")
		// Execute SQL query that'll select the account from the database based on the specified username and password
		const results = await (async () => {
            console.log(username, password)
            const client = new Client(credentials);
            await client.connect();
            let sql = "SELECT * FROM public.users WHERE email = '" + username + "' AND password = '" + password + "'" 
            console.log(sql)
            const results = await client.query(sql)
            await client.end();
            return results
        })()

        if (results.rows.length > 0) {

            // Authenticate the user
			request.session.loggedin = true;
			request.session.username = username;
			// Redirect to home page
			response.redirect('/home');
        } else {
            response.send('Incorrect username and/or Password!')
        }
        response.end(); 
    }
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});
}

