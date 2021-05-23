"use strict";

var sql = require('mssql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const { prototype } = require('events');




var dbConfig = {
    server: "dtsmartaccess-sqlserver.database.windows.net", // Use your SQL server name
    database: "DTSmartAccess-DB", // Database to connect to
    user: "sqladmin", // Use your username
    password: "3p@hPWSGxStXvn4R!", // Use your password
    port: 1433,
    // Since we're on Windows Azure, we need to set the following options
    options: {
          encrypt: true
      }
   };
   
   var publicDir = require('path').join(__dirname,'/public');

   var app = express();
   app.use(express.static(publicDir))//images
   app.use(session({
       secret: 'secret',
       resave: true,
       saveUninitialized: true
   }));
   app.use(bodyParser.urlencoded({extended : true}));
   app.use(bodyParser.json());
   app.engine('html', require('ejs').renderFile);
   app.set('view engine', 'html');
   
   app.get('/', function(request, response) {
       response.sendFile(path.join(__dirname + '/login.html'));
   });
   
   app.get('/home', function (request, response) {
       response.sendFile(path.join(__dirname + '/home.html'));
   });
   
   app.get('/checklist', function (request, response) {
       response.sendFile(path.join(__dirname + '/checklist.html'));
   });
   
   app.get('/machines', function (request, response) {
       response.sendFile(path.join(__dirname + '/machines.html'));
   });
   
   app.get('/reports', function (request, response) {
       response.sendFile(path.join(__dirname + '/reports.html'));
   });
   
   app.get('/alerts', function (request, response) {
       response.sendFile(path.join(__dirname + '/alerts.html'));
   });
   
   app.get('/sessions', function (request, response) {
       response.sendFile(path.join(__dirname + '/sessions.html'));
   });
   
   //app.get('/users', function (request, response) {
   //    response.sendFile(path.join(__dirname + '/users.html'));
   //});

   var conn = new sql.ConnectionPool(dbConfig);

   app.post('/auth', function(request, response){
    var username = request.body.username;
	var password = request.body.password;
    var role;
    conn.connect().then(function () {
        var req = new sql.Request(conn);
        req.input('inputField1', sql.VarChar, username)
        req.input('inputField2', sql.VarChar, password)
        req.query('SELECT * FROM accounts WHERE UserRole = @inputField1 AND UserPassword = @inputField2').then(function (records) {
            var rec = records.recordset;
            role =  rec[0].UserRole;
            if(role== 'loader'){
                request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/PreuseChecklist');
            }
            else if(role == 'admin') {
                request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
            }
            else if(role == 'mechanic') {
                request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/MaintenanceMech');
            }
            else if(role == 'electrician') {
                request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/MaintenanceElec');
            }
            else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        })
    })

   });

   app.get('/home', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(path.join(__dirname + '/home.html'));
		console.log('Welcome back, ' + request.session.username + '!');
		
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/PreuseChecklist', function (request, response) {
	response.sendFile(path.join(__dirname + '/public/checkbox.html'));
});

app.get('/MaintenanceElec', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/User/Electrician.html'));
});

app.get('/MaintenanceMech', function (request, response) {
	response.sendFile(path.join(__dirname + '/public/User/MaintenanceMech.html'));
});


app.get('/authorised', function (request, response) {
	response.sendFile(path.join(__dirname + '/public/authorised.html'));
});

app.post('/checkbox', function(request, response) {
	var username = request.body.check;
	console.log(username)
	response.redirect('/authorised');

});

app.get('/users', function(req, res) {
        var uudata
		conn.connect().then(function() {
        var req = new sql.Request(conn); 
        req.query('SELECT * FROM accounts ').then(function(records){
        uudata= records;
        console.log(records.recordset);    
        })   
        })
		
        res.render(__dirname + "/users.html", {uudata:uudata});

 });
 app.post('/checkbox', function(request, response) {
	var username = request.body.check;
	console.log(username)
	response.redirect('/authorised');

});

app.get('/checkboxfile', function (request, response) {
	response.sendFile(path.join(__dirname + '/public/user/checkbox.html'));
});

app.get('/logout', function (request,response){
    request.session.loggedin = false;
    response.redirect('/');
})
app.listen(8080)