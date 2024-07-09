const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./db/config.js');
const UserRepository = require('./user/userRepository.js');
const confirmRepository = require('./user/userRepository.js');
const mercadopago = require("mercadopago");
const { MercadoPagoConfig, Preference } = require('mercadopago');
const http = require('http');


require('dotenv').config()


const app = express()
app.use(cors(), express.json());
app.use(cookieParser());

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

// Create a server object
const server = http.createServer((req, res) => {
    // Set the response header
    res.writeHead(200, {'Content-Type': 'text/plain'});
    // Write some text to the response
    res.end('Welcome to my simple Node.js app!');
});

app.post((req, res, next) => {
	const token = req.cookies.access_token;

	req.session = { user: null };

	try {
		data = jwt.verify(token, SECRET_KEY);
		req.session.user = data;
	} catch (err) {
		req.session.user = null;
	}

	next()
})

const port = process.env.PORT || 3000


app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.get("/api/products", async (_, res) => {
	try {
		const data = await db.execute("SELECT * FROM productos;");
		console.log(data);
		res.status(200).json(data.rows);
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "An error occurred while fetching data." });
	}
});

app.get("/api/products/:id", async (req, res) => {
	try {
		const data = await db.execute(`SELECT DISTINCT * FROM productos WHERE product_id = "${req.params.id}";`);
		console.log(data.rows[0]);
		res.status(200).json(data.rows[0]);
	} catch (err) {
		console.log("Error at fetching product: ", err);
		res.status(500).json({ error: "There was an error while fetching data." });
	}
})

app.get("/api/products/:id/slug", async (req, res) => {
	try {
		const data = await db.execute(`SELECT product_slug FROM productos WHERE product_id = "${req.params.id}";`);
		res.status(200).json(data.rows[0]);
	} catch (err) {
		console.log("Error at fetching product: ", err);
		res.status(500).json({ error: "There was an error while fetching data." });
	}
})

app.post("/api/register", async (req, res) => {
	console.log(req.body);
	const { name, password, email } = req.body;
	try {
		const id = await UserRepository.create({ name, password, email });
		console.log(id);
		res.status(200).send({ id })
	} catch (err) {
		res.status(400).send(err)
	}
})

app.post("/api/logout", (req, res) => {
	res.clearCookie('access_token').redirect('/');
})

app.post("/api/login", async (req, res) => {
	const { email, password } = req.body;
	//console.log(process.env.SECRET_KEY)
	try {
		const user = await UserRepository.login({ email, password })
		const token = jwt.sign(
			{ id: user.id, name: user.name, phone: user.phone, dir: user.dir }, process.env.SECRET_KEY,
			{ expiresIn: '1h' }
		)
		res.status(200)
			/*  		.cookie('access_token', token, {
						httpOnly: true,
						domain: 'localhost',
						sameSite: 'none',
						//secure: process.env.NODE_ENV === 'production',
						maxAge: 1000 * 60 * 60
					}) */
			.send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
})

app.post("/api/sending", async (req, res) => {
	try {
		const mail = await confirmRepository.send();
	} catch (err) {
		throw new Error('there was an error ', err);
	}
})


app.post("/process_payment", async (req, res) => {

	//console.log(req.body);

	try {
		const body = {
			items: [
				{
					title: req.body.title,
					quantity: 1,
					unit_price: 100,
					currency_id: 'ARS',
				}
			],
			back_urls: {
				success: "https://portamedallas.vercel.app/",
				failure: "https://portamedallas.vercel.app/contacto",
				pending: "https://portamedallas.vercel.app/tienda"
			},
			auto_return: "approved",
		};

		const preference = new Preference(client);

		const result = await preference.create({ body });

		console.log(result)

		res.json({ id: result.id });

	} catch (err) {
		console.log("There was an error :( :", err);
		res.status(400).json(err);
	}
});

// Crear un objeto de preferencia
/* 	let preference = new Preference({
		// el "purpose": "wallet_purchase" solo permite pagos registrados
		// para permitir pagos de guests puede omitir esta propiedad
		"purpose": "wallet_purchase",
		"items": [
			{
				"id": "ID-1234",
				"title": "La Prueba",
				"quantity": 1,
				"unit_price": 100
			}
		]) */

/* 	Preference.create(preference)
		.then(function (response) {
			// Este valor es el ID de preferencia que se enviará al ladrillo al inicio
			const preferenceId = response.body.id;
			console.log(preferenceId);
		}).catch(function (error) {
			console.log(error);
		}); */


app.listen(port, () => {
	console.log(`Listening to port: ${port} :D`)
})

