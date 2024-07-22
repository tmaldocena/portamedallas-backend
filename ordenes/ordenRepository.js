const db = require('../db/config.js');
const crypto = require('crypto');

class ordenRepository {
    static async create(id) {

        console.log(id);
        if (id !== "") { return id }
        //console.log('nuevo id');

        const newId = crypto.randomUUID();
        try {
            const data = await db.execute(`INSERT INTO ordenes (orden_id, orden_estado) VALUES ('${newId}', 0);`)
            console.log(data);
            return newId;
        } catch (error) {
            throw new Error('We could not add your new order: ', error);
        }
    }

    static async addInfo(newOrder) {
        //? id = id creado de la orden, que se lo tengo que guardar al user al crear la orden (luego del checkout)
        //? user = el id del usuario + el formulario del checkout (separé el user_id)
        //? dir = la direccion del formulario del checkout
        //? price = precio total de la orden
        //? pedido = lo que contiene el carrito básicamente (quizas guardar las id de los productos y cantidad)

        //* { id, user, dir, price, pedido, estado }
        /* const newOrder = {
            user: JSON.stringify(user),
            dir: JSON.stringify(dir),
            price,
            pedido: JSON.stringify(pedido),
            estado
        } */

        try {
            //const order = db.execute(`SELECT * FROM ordenes WHERE orden_id = ${id}`)
            const orderUpdated = db.execute(`
                UPDATE ordenes 
                SET 
                    orden_comprador = '${newOrder.user}',
                    user_id = '${newOrder.user_id}'
                    orden_dir = '${newOrder.dir}',
                    orden_precio = ${newOrder.price},
                    orden_pedido = '${newOrder.pedido}',
                    orden_estado = ${newOrder.estado}
                WHERE
                    orden_id = '${newOrder.order_id}'
                RETURNING 
                    orden_id AS id;
            `)

            return orderUpdated;
        } catch (error) {
            throw new Error('There was an error at the update of the order.')
        }

    }

    static async add(newOrder) {
        try {
            //const order = db.execute(`SELECT * FROM ordenes WHERE orden_id = ${id}`)
            const orderUpdated = db.execute(`
                UPDATE ordenes 
                SET 
                    orden_comprador = '${newOrder.user}',
                    user_id = '${newOrder.user_id}',
                    orden_dir = '${newOrder.dir}',
                    orden_precio = ${newOrder.price},
                    orden_pedido = '${newOrder.pedido}',
                    orden_estado = ${newOrder.estado}
                WHERE
                    orden_id = '${newOrder.order_id}'
                RETURNING 
                    orden_id AS id;
            `)

            return orderUpdated;
        } catch (error) {
            throw new Error('There was an error at the update of the order.')
        }
    }

    static async updateState(id, state) {
        try {
            const order = await db.execute(`UPDATE ordenes SET orden_estado = '${state}' WHERE orden_id = '${id}';`)

            return order;
        } catch (err) {
            throw new Error('We could not update your order.')
        }
    }

    static async getOrden(id) {
        console.log(id);
        try {

            const order = await db.execute(`SELECT * FROM ordenes WHERE orden_id = '${id}';`)
            return order;

        } catch (error) {
            throw new Error('Order not found');
        }

    }
    static async getUserOrdenes(id) {
        console.log(id);
        try {

            const orders = await db.execute(`SELECT * FROM ordenes WHERE user_id = '${id}';`)
            console.log(orders);
            //const pedidos = await db.execute(`SELECT * FROM ordenes `)
            return orders.rows;

        } catch (error) {
            throw new Error('Orders not found');
        }

    }

    static async getAllOrdenes() {
        try {
            const orders = await db.execute(`SELECT * FROM ordenes;`)
            return orders.rows;
        } catch (error) {
            throw new Error('No existen órdenes');
        }
    }
}

module.exports = ordenRepository;