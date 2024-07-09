const db = require('../db/config.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class UserRepository {
    static async create({ name, password, email }) {
        console.log({name, password, email});

        Validation.username(name);
        Validation.email(email);
        Validation.password(password);

        const data = await db.execute(`SELECT EXISTS ( SELECT 1 FROM usuarios WHERE user_mail = '${email}' ) as exist;`);
        if (data.rows[0].exist === 1) throw new Error('The mail is already in use');

        const id = crypto.randomUUID();
        const hashedPass = await bcrypt.hash(password, 10);

        //console.log(hashedPass);

        try {
            const insert = await db.execute(`INSERT INTO usuarios (user_id, user_name, user_password, user_mail) VALUES ("${id}", "${name}", "${hashedPass}", "${email}");`)
            //console.log(id);
            return id;
        } catch (err) {
            throw new Error('Creating new user unsuccessfully, ', err);
        }
    }

    static async login({ email, password }){

        Validation.email(email);
        Validation.password(password);

        try {
            const data = await db.execute(`SELECT * FROM usuarios WHERE user_mail = '${email}';`)
            
            if(data.rows.length === 0){
                throw new Error('El usuario no existe');
            }
            
            const user = data.rows[0];
/* 
            console.log(user);
            console.log(password)
            console.log(bcrypt.compare (password, user.user_password, ));*/

            console.log(user.user_password);


            const isValid = await bcrypt.compareSync(password, user.user_password);
            if(!isValid){ throw new Error("La contraseña es incorrecta"); }


            return {
                id: user.user_id,
                email: user.user_mail,
                name: user.user_name,
                phone: user.user_phone,
                dir: user.user_dir
            };
            
        }catch (error){
            throw new Error ('There was an error', error);
        }
    }
}

class Validation {
    static username(name){
        if(typeof name !== 'string') throw new Error('Name is not a string');
        if(name.length < 2) throw new Error('Name is not long enough');
    }

    static email(email) {
        if (typeof email != 'string') throw new Error('Email is not a string');
        if (email.length < 3) throw new Error('Email is not long enough');
    }

    static password(password) {
        if (typeof password != 'string') throw new Error('Password is not a string')
        if (password.length < 5) throw new Error('Password has to be longer than 5 characters');
    }
}

module.exports = UserRepository