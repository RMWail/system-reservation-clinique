import express from 'express';
import database from "../config/database.js";
import multer from 'multer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
const upload = multer();
dotenv.config();


const superAdminRouter = express.Router();
superAdminRouter.use(bodyParser.json());
superAdminRouter.use(express.json());
superAdminRouter.use(bodyParser.urlencoded({ extended: true }));




superAdminRouter.get('/getClinicDoctors',(req,res)=>{

    const sql = 'CALL GetClinicDoctors()';
  
    database.query(sql,(err,doctors)=>{
      if(err){
        console.log(err);
  
        res.status(500).json({error:'Error during fetching doctors from server'});
      }
      else {
       // console.log(doctors[0]);
        res.status(200).json(doctors[0]);
      }
    })
  })
  
  superAdminRouter.post('/addNewDoctor',(req,res)=>{
    const {nomPrenom,medecin_Genre,medecin_Specialite,medecin_Experience,medecin_availability,medecin_Email,medecin_Telephone} = req.body;
  
  
      const sql = 'CALL addNewDoctor(?,?,?,?,?,?,?)';
  
    database.query(sql,[nomPrenom,medecin_Genre,medecin_Telephone,medecin_Email,medecin_Specialite,medecin_Experience,medecin_availability],(err,result)=>{
      if(err) {
        console.log(err);
        return res.status(500).json({error:"Error appeared durring adding a new doctor to the database"});
      }
      else {
          console.log('new doctor was added successfully');
          return res.status(200).json({message:`doctor ${nomPrenom} was added successfully`});
      }
    })
   
  
  })
  
  superAdminRouter.post('/deleteDoctor',(req,res)=>{
  
    const doctorId = req.body.doctorId;
  
    const sql = 'CALL deleteDoctor(?)';
  
    database.query(sql,[doctorId],(err,result)=>{
      if(err){
        console.log(err);
        return res.status(500).json({error:"Error appeared durring deleting the doctor from the database"});
      }
      else {
        console.log("affected rows = "+result.affectedRows);
        if(result.affectedRows > 0){
          console.log('doctor was deleted successfully');
          return res.status(200).json({message:'This doctor was deleted successfully'})
        }
      }
    })
  
  })
  
  
  superAdminRouter.post('/editDoctor',(req,res)=>{
  
    const {nomPrenom,medecin_Genre,medecin_Specialite,medecin_Experience,medecin_availability,medecin_Email,medecin_Telephone,medecin_Id} = req.body;
  
    const sql = 'CALL updateDoctorInfo(?,?,?,?,?,?,?,?)';
  
    database.query(sql,[nomPrenom,medecin_Genre,medecin_Telephone,medecin_Email,medecin_Specialite,medecin_Experience,medecin_availability,medecin_Id],(err,result)=>{
  
      if(err){
        console.log(err);
        return res.status(500).json({error:'There was error appeared during updating doctor info'});
      }
      else {
        console.log("affected rows = "+result.affectedRows);
        if(result.affectedRows>0) {
          console.log('doctor info was updated successfully');
          return res.status(200).json({message:'Doctor information was updated successfully'})
        }
      }
    })
  })
  
  superAdminRouter.get('/doctorsStats',(req,res)=>{
  
    let sqlStats = 'CALL GetReservationsStats()';
  
    database.query(sqlStats, (err, stats) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error fetching stats' });
      } else {
        const reservationsGeneralStats = stats[0][0];
      //  console.log(reservationsGeneralStats);
        const sql = 'CALL getMostActiveDoctors(4)';
  
        database.query(sql,(err,result)=>{
          if(err){
            console.log(err);
            return res.status(500).json({error:'Error appeared durring fetching doctors stats'});
          }
          else {
          // console.log('active doctors = '+result[0][0].medecin_Id);
           
            return res.status(200).json({generalStats:reservationsGeneralStats,doctorsStats:result[0]})
          }
        })
      }
  
    } )
  
  })


  export default superAdminRouter;