import express  from 'express';
import database from '../config/database.js';
import multer from 'multer';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
const upload = multer();
dotenv.config();

const stationManagementRouter = express.Router();
stationManagementRouter.use(bodyParser.json());
stationManagementRouter.use(express.json());
stationManagementRouter.use(bodyParser.urlencoded({ extended: true }));



stationManagementRouter.get('/getAllStations',(req,res)=>{
    const sql = 'CALL getTousArrets()';
  
    database.query(sql,(err,result)=>{
      if(err){
        console.log(err);
        return res.status(500).json({error:'Error appeared during fetching stations'});
      }
      else {
        return res.status(200).json({stations:result[0]});
      }
    })
  })  
  
  stationManagementRouter.post('/addStation',(req,res)=>{
    try {
      const station = req.body.name;
      
    const addStationSql = 'CALL addNewStation(?)';
  
    database.query(addStationSql,[station],(err,result)=>{
  
      if(err){
        console.log(err);
        return res.status(400).json({error:`Operation failed because of server error`});
      }
      else {
  
      //  console.log("affected rows = "+result[1].affectedRows);
        if(result[1].affectedRows>0){
          console.log('new station was added successfully');
          return res.status(200).json({newStationId:result[0][0].arret_Id,message:`New station was added successfully`});
        }
        else {
          console.log('new station was not added successfully');
          return res.status(400).json({error:`New station was not added successfully`});
        }
      }
  
    })
    
  
    } catch(err){
      console.log(err);
      return res.status(500).json({error:`Operations failed because of server error`});
    }
  })
  
  stationManagementRouter.post('/updateStation',(req,res)=>{
    try {
      console.log(req.body);
      const stationId = req.body.id;
      const station = req.body.name;
      
    const updateStationSql = 'CALL updateStation(?,?)';
  
    database.query(updateStationSql,[stationId,station],(err,result)=>{
  
      if(err){
        console.log(err);
        return res.status(400).json({error:`Operation failed because of server error`});
      }
      else {
        if(result.affectedRows>0){
          console.log('station was updated successfully');
          return res.status(200).json({message:`Station was updated successfully`});
        }
        else {
          console.log('station was not updated successfully');
          return res.status(400).json({error:`Station was not updated successfully`});
        }
      }
  
    })
    
  
    } catch(err){
      console.log(err);
      return res.status(500).json({error:`Operations failed because of server error`});
    }
  })
  
  stationManagementRouter.post('/deleteStation',(req,res)=>{
    try {
      
      const stationId = req.body.stationId;
  
      const deleteStationSql = 'CALL deleteStation(?)';
  
      database.query(deleteStationSql,[stationId],(err,result)=>{
        if(err){
          console.log(err);
          return res.status(400).json({error:`Operation failed because of server error`});
        }
        else {
          if(result.affectedRows>0){
            console.log('station was deleted successfully');
            return res.status(200).json({message:`Station was deleted successfully`});
          }
          else {
            console.log('station was not deleted successfully');
            return res.status(400).json({error:`Station was not deleted successfully`});
          }
        }
      })
  
    } catch(err){
      console.log(err);
      return res.status(500).json({error:`Operations failed because of server error`});
    }
  })




export default stationManagementRouter;