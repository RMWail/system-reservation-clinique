import mysql from 'mysql2';
import dotenv from 'dotenv';
import {Sequelize} from 'sequelize';
dotenv.config();
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;

/*

const database = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  {
    host:DB_HOST,
    dialect:'mysql',
  }
)

database.authenticate().then(()=>{
  console.log("Database connected successfully");
}).catch((error)=>{
  console.error("Unabale to connect to the database: "+error);
})
*/


const urlDb = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

//const database = mysql.createConnection(urlDb);

const database = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: 'utf8mb4_0900_ai_ci'
});

database.connect((err)=>{

  if(err){
    throw err;
  }
  console.log("connected successfuly to the online db ");
});


export default database;
