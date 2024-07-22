const express = require("express");
const db = require('../db/config');

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const UserRepository = require('./user/userRepository.js');
const confirmRepository = require('./user/userRepository.js');
const ordenRepository = require('./ordenes/ordenRepository.js');
const mercadopago = require("mercadopago");
const { MercadoPagoConfig, Preference } = require('mercadopago');

require('dotenv').config()
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());


const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })

app.get("/", (req, res) => res.send("Portamedallas!"));

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

app.post('/api/profile/edit', (req, res) => {
	try{
		const data = db.execute(`UPDATE usuarios
			SET
				user_phone = '',
				user_dir = ''
			WHERE
				user_mail = ''`);
	} catch (error){
		throw new Error('There was an error on updating the account');
	}
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
		throw new Error('there was an error ');
	}
})


app.post("/process_payment/", async (req, res) => {

	console.log(req.body.price);

	try {
		const body = {
			items: [
				{
					title: req.body.title,
					quantity: 1,
					unit_price: req.body.price,
					currency_id: 'COP',
				}
			],
			back_urls: {
				success: `https://portamedallas.vercel.app/order/success?id=${req.body.id}`,
				failure: `https://portamedallas.vercel.app/cart`,
				pending: `https://portamedallas.vercel.app/order/success?id=${req.params.id}`
			},
			auto_return: "approved",
		};

		const preference = new Preference(client);

		const result = await preference.create({ body });

		console.log(result.id)

		res.status(200).json({ id: result.id });

	} catch (err) {
		console.log("There was an error :( :", err);
		res.status(400).json(err);
	}
});

/* app.post("/api/orden/createold", async (req, res) => {
	//const id = (req.body.id === "{}" ? "empty" : req.body.id);
	//console.log(id);
	try{
		const order = await ordenRepository.create();
		console.log(order)
		res.status(200).send(json(order).data.rows)
	}catch(error){
		res.status(400).send(error);
	}
}) */

app.post("/api/orden/create", async (req, res) => {
	try{
		const order = await ordenRepository.create(req.body.id);
		console.log(order)
		res.status(200).send(order);
	}catch(err){
		res.status(500).send(err);
	}

})

app.post("/api/orden/update", async (req, res) => {
	//console.log(req.body);
	const order = {
		order_id: req.body.id,
		price: req.body.precio,
		pedido: req.body.pedido,
		user: req.body.first,
		user_id: req.body.user_id,
		dir: req.body.second,
		estado: 1
	}

	//console.log(order)
	try{
		const pedido = await ordenRepository.add(order)
		res.status(200).json(pedido);
	} catch (error){
		res.status(400).send(error);
	}
})

app.post("/api/orden/update-state/:id", async (req, res) => {
	const id = req.params.id;
	try{
		const update = await ordenRepository.updateState(id, req.body.state)
	}catch(err){
		res.status(400).send(err)
	}
})

app.get("/api/orden/get/:id", async (req, res) => {
	
	console.log('the id is: ', req.params.id)
	
	try{
		const order = await ordenRepository.getOrden(req.params.id)
		console.log(order);
		res.status(200).json(order.rows[0])
	} catch (error) {
		res.status(400).send(error);
	}
})

app.get("/api/orden/user/:id", async (req, res) => {
	try{
		const order = await ordenRepository.getUserOrdenes(req.params.id)
		//console.log(order.rows);
		res.status(200).json(order)
	} catch (error) {
		res.status(400).send(error);
	}
})

app.get("/api/orden/get", async (req, res) => {
	try{
		const order = await ordenRepository.getAllOrdenes()
		res.status(200).json(order)
	} catch (error) {
		res.status(400).send(error);
	}
})

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;