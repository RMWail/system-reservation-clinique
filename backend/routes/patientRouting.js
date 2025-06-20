import express from 'express';
import database from '../config/database.js';
import bodyParser from 'body-parser';
import multer from 'multer';
import {createReservation} from '../controllers/reservationController.js';
import dotenv from 'dotenv';

const upload = multer();
dotenv.config();
const patientRouting = express.Router();

patientRouting.use(bodyParser.json());
patientRouting.use(express.json());
patientRouting.use(bodyParser.urlencoded({ extended: true }));



 patientRouting.post('/addNewAppointment',createReservation)


 export default patientRouting;