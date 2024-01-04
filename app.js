'use strict';

const express = require('express'),
	pug = require('pug'),
	bodyParser = require('body-parser'),
	favicon = require('serve-favicon')(`${__dirname}/public/favicon.png`),
	publicDir = express.static(`${__dirname}/public`),
	viewDir = `${__dirname}/views`,
	port = (process.env.PORT || 3000),
	mysql = require('mysql'),
	myConnection = require('express-myconnection'),
	dbOptions = {
		host: "localhost",
		user: "root",
		password: "",
		port: 3306,
		database: "indentation_war"
	},
	conn = myConnection(mysql, dbOptions, 'request');
	
let app = express();

app.set('views', viewDir);
app.set('view engine', 'pug');
app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(publicDir);
app.use(favicon);
// Usara el middleware de express-myConnection
app.use(conn);


app.get('/', (req, res, next) => {
	req.getConnection((err, conn) => {
		conn.query("SELECT * FROM team", (error, data) => {
			if(!error){
				res.render('index', {
					title: "Indentation War",
					data: data
				});
			}else { console.log(error) }
		});
	});
});

app.get('/agregar', (req, res, next) => {
	res.render('add', { title: "Agregar Contacto" });
});

/*
	Todo dato que venga por parte del cliente/navegador se recibe por req
		- Con req trabajamos todos los middleware's que sean manipulacion de datos p.e. getConnection
	Toda respuesta al cliente/navegador la enviamos por res
*/
app.post('/', (req, res, next) => {
	//console.log( req.body );
	req.getConnection((err, conn) => {
		let contacto = {
			id: 0,
			name: req.body.name_txt,
			twitter: req.body.twitter_txt,
			country: req.body.country_txt,
			side: req.body.side_txt
		};

		conn.query("INSERT INTO team SET ?", contacto, (err, data) => {
			if(!err){
				res.redirect('/');
			}else{
				console.log(err);
				res.redirect('/agregar');
			}
		})
	});
});

app.get('/editar/:id', (req, res, next) => {
	let id = req.params.id;

	req.getConnection((err, conn) => {
		conn.query('SELECT * FROM team WHERE id = ?', id, (err, data) => {
			if(!err){
				/*console.log(data)
				res.render('add', {
					title: "Editando usuario",
					data: data,
					edit: true
				})*/
				res.render('edit', {
					title: "Editando Contacto",
					data: data
				})
			}else{
				console.log(err);
				res.redirect('/');
			}
		});
	});
});



app.post('/actualizar/:id', (req, res, next) => {
	req.getConnection((err, conn) => {
		let contacto = {
			id: req.body.id,
			name: req.body.name_txt,
			twitter: req.body.twitter_txt,
			country: req.body.country_txt,
			side: req.body.side_txt
		};

		conn.query("UPDATE team SET ? WHERE id = ?", [contacto, contacto.id], (err, data) => {
			if(!err){
				res.redirect('/');
			}else{
				console.log(err);
				res.redirect('/editar/:id');
			}
		})
	});
});

app.post('/eliminar/:id', (req, res, next) => {
	req.getConnection((err, conn) => {
		let id = req.params.id;

		conn.query("DELETE FROM team WHERE id = ?", id, (err, data) => {
			if(!err){
				res.redirect('/');
			}else{
				return next( new Error('Registro no Encontrado') );
			}
		});
	});
});

app.use((req, res, next) => {
	let err = new Error();
	err.status = 404;
	err.statusText = "Not Found";

	console.log(err);

	res.render('error', {
		error: err
	});
});



app.listen(port, () => console.log('Se esta ejecutando en http://localhost:%d', port))