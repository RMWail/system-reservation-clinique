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



// patientRouting.post('/addNewAppointment',createReservation)


patientRouting.post('/addNewAppointment',(req,res)=>{
    const patientName = req.body.name;
    const patientPhone = req.body.phone;
    const PatientGender = req.body.gender;
    const patientAge = req.body.age;
    const doctorInfo = req.body.doctorInfo;
    const reservationDate = req.body.date;
    const doctorId = req.body.doctorId;
  
  
   // console.log("arg 1 name = "+doctorInfo.split(':')[0]);
   // console.log("arg 2 speciality = "+doctorInfo.split(':')[1]);
   // console.log("arg 3 experience = "+doctorInfo.split(':')[2]);
  
  //  console.log("doctor info = "+req.body.doctorInfo);
     
  
    
    
     const genderToDb = req.body.gender == 'male' ? 0 : 1;
    const sql = 'CALL addNewReservation(?,?,?,?,?,?,?)';
  
    database.query(sql,[patientName,patientPhone,genderToDb,patientAge,doctorInfo,reservationDate,doctorId],(err,resutl)=>{
      if(err){
        console.log(err);
        return err;
      }
      else {
    //        console.log(resutl);
       const lastInsertId = resutl[0][0].reservation_Id;
       const nbr_reservation = resutl[1][0].nbr_reservation;
       const reserv_Order = resutl[2][0].reserv_Order;
    //   console.log('number of reservations before = '+nbr_reservation);
       
        console.log('reservation was made successfully');
        req.io.emit('newReservationAdded',{
          reservation_Id:lastInsertId,
          reserv_Order:reserv_Order,
          patient_NomPrenom:patientName,
          patient_Telephone:patientPhone,
          patient_Genre:PatientGender =='male' ? 0 : 1,
          patient_Age:patientAge,
          medecin_Nom_Speciality:doctorInfo,
          reservation_Date:reservationDate,
          reservation_Etat:0 });
          
        return res.status(200).json({reservationNbr:nbr_reservation});
      }
    })
  
    
   })
  

 export default patientRouting;