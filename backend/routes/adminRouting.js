import express  from 'express';
import database from '../config/database.js';
import multer from 'multer';
import bodyParser from 'body-parser';

import dotenv from 'dotenv';
const upload = multer();
dotenv.config();

const adminRouter = express.Router();
adminRouter.use(bodyParser.json());
adminRouter.use(express.json());
adminRouter.use(bodyParser.urlencoded({ extended: true }));



adminRouter.get('/getRoutesData',(req,res)=>{
  try {

    const sql = 'CALL getRoutesData()';

    database.query(sql,(err,result)=>{
      if(err){
        console.log(err);
        return res.status(500).json({error:'There was an error during fetching routes data'});
      }
      else {

    const getCurrentCreateRoutes = 'CALL getAllCurrentRoutes()';

    database.query(getCurrentCreateRoutes,(err,queryResult)=> {
      if(err) {
        console.log(err);
        return res.status(500).json({error:'There was an error during fetching created routes'});
      }
      else {
       
         for(let i=0;i<queryResult[0].length;i++) {
               
                queryResult[0][i].internalStations = queryResult[0][i].internalStations != null ? queryResult[0][i].internalStations.split(',') : [];
                queryResult[0][i].buses = queryResult[0][i].buses != null ? queryResult[0][i].buses.split(',') : [];
                queryResult[0][i].goSchedules = queryResult[0][i].goSchedules != null ? queryResult[0][i].goSchedules.split(',') : [];
                queryResult[0][i].backSchedules = queryResult[0][i].backSchedules != null ? queryResult[0][i].backSchedules.split(',') : []
              
         }
        return res.status(200).json({stations:result[0],buses:result[1],universitySections:result[2],currentCreatedRoutes:queryResult[0]});
      }
    })
      }
    })
  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:'There was an error during fetching routes data'});
  }
})


const arrayToString = (array) => {
 // console.log("input = "+array + " type = "+typeof(array));
  let returnedString = '';
  returnedString = array.join(',');
//  console.log("returned = "+returnedString + " type = "+typeof(returnedString));  
  return returnedString;
}

adminRouter.post('/addNewRoute',async (req,res)=>{
  try {
     //  console.log(req.body);    
    const {ID_UNIV,ID_STATION,internalStations,buses,goSchedules,backSchedules} = req.body;
    const internalStationsString = arrayToString(internalStations);
    const busesString = arrayToString(buses);
    const goTimeString = arrayToString(goSchedules);
    const backTimeString = arrayToString(backSchedules);
    
    const checkSql = 'CALL checkRoute(?,?)';

    database.query(checkSql,[ID_UNIV,ID_STATION],(err,checkResult)=>{
      if(err){
        console.log(err);
        res.status(500).json({error:'There was an error during adding new route'})
      }
      else {
            
          if(checkResult[0].length<=0){
            const sql = 'CALL addNewRoute(?,?,?,?,?,?)';
    
            database.query(sql,[ID_UNIV,ID_STATION,internalStationsString,busesString,goTimeString,backTimeString],(err,result)=>{
              if(err){
                console.log(err);
                return res.status(500).json({error:'There was an error during adding new route'});
              }
              else {
                if(result[2].affectedRows>4){
                  console.log('New route was added successfully');
                  return res.status(200).json({message:`New route was added successfully`,relationId:result[0][0].lastRelationId,buses:result[1]});
                }
                else {
                  console.log('New route was not added successfully');
                  return res.status(400).json({error:`New route was not added successfully`});
                }
              } 
            })
        
          }
          else {
             console.log(`This route is already covered`);
             return res.status(200).json({message:'Exist'});
          }

        
      }
    })
  
            



  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:'There was an error during adding new route'});
  }
    
})


adminRouter.post('/deleteRoute',async (req,res)=>{
  try {
    const {routeId} = req.body;

    const sql = 'CALL deleteRoute(?)';
    
    database.query(sql,[routeId],(err,result)=>{
      if(err){
        console.log(err);
        return res.status(500).json({error:'There was an error during deleting route'});
      }
      else {
    //    console.log('buses = '+result[0]);
        if(result[1].affectedRows>0){
          console.log('Route was deleted successfully');
          return res.status(200).json({message:`Route was deleted successfully`,buses:result[0]});
        }
        else {
          console.log('Route was not deleted successfully');
          return res.status(400).json({error:`Route was not deleted successfully`});
        }
      } 
    })
  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:'There was an error during deleting route'});
  }
})

// Tomorrow I need to finish this one here wichis updating a route
adminRouter.post('/editRoute',async (req,res)=>{
  try {
         //   console.log(req.body);
          const relationId = req.body.routeId;
          //     const mainStationId = req.body.mainStationId;
               const oldBusesString = arrayToString(req.body.oldBuses);
               const {ID_UNIV,ID_STATION,internalStations,buses,goSchedules,backSchedules} = req.body.newRoute;
               const internalStationsString = arrayToString(internalStations);
               const busesString = arrayToString(buses);
               const goTimeString = arrayToString(goSchedules);     
               const backTimeString = arrayToString(backSchedules);
        
               console.log(req.body);

 /*   const checkSql = 'CALL checkRoute(?,?)';

    database.query(checkSql,[ID_UNIV,ID_STATION],(err,checkResult)=>{
      if(err){
        console.log(err);
        res.status(500).json({error:'There was an error during adding new route'})
      }
      else {
          
        if(checkResult[0].length<=0){*/
          const sql = 'CALL updateRoute(?,?,?,?,?,?,?,?)';
          database.query(sql,[relationId,ID_UNIV,ID_STATION,internalStationsString,oldBusesString,busesString,goTimeString,backTimeString],(err,result)=>{
                
              if(err) {
               console.log(err.sqlMessage);
            //   return res.status(500).json({error:'There was an error during editing route'});
              }
              else {
          //      console.log('affected = '+result[1].affectedRows);
           //     console.log('buses = '+result[0]);
                if(result[1].affectedRows>0){
                 console.log('Route was edited successfully');
                 return res.status(200).json({message:'Route was edited successfully',buses:result[0]});
                }
                else {
              //   console.log(result);
                 console.log('Route was not edited successfully');
                 return res.status(400).json({error:'Route was not edited successfully'});
                }
              }
          })
   //     }
        /*
        else {
          console.log('There is already route from main station to this university section');
          return res.status(200).json({message:'Exist'});
        }*/
        
  //    }
//    })


  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:'There was an error during editing route'});
  }
})


const stringToArray = (array) =>{
  return array.split(',');
}
adminRouter.get('/getPathsData',(req,res)=>{

  try {
       const sql = 'CALL getPathsData()';
       database.query(sql,(err,paths)=>{
         if(err){
           console.log(err);
           return res.status(500).json({error:`There was a servor error during fetching paths data`})
         }
         else {
         // console.log(paths[0]);
          let pathsData = [];
      
          
          paths[0].forEach(element => {
            const drivers = element.busesInfo.split(',');
            let busesInfo = [];
            for(let i=0;i<drivers.length;i++) {
             let busInfo = {
                busNumber:drivers[i].split(' - ')[0],
                driverName:drivers[i].split(' - ')[1],
                driverPhone:drivers[i].split(' - ')[2],
              }
            //  console.log(busInfo);
              busesInfo.push(busInfo);
            }
          //  console.log("drivers = "+drivers);
            let path = {
              id:element.id,
              section:element.section,
              mainStation:element.mainStation,
              internalStations:stringToArray(element.internalStations),
              busesInfo:busesInfo,
            }
            pathsData.push(path);
          });
      //    console.log(pathsData);

           return res.status(200).json({paths:pathsData});
         }
       })
  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:`There was a servor error during fetching paths data`})
  }
})

adminRouter.get('/getStatisticsData',(req,res)=>{
  try {

    const sql = 'CALL calculateStatistics()';

    database.query(sql,(err,resutl)=>{
      if(err){
        console.log(err);
        return res.status(400).json({error:`There was a servor error during fetching statistics data`});
      }
      else {
       // console.log(resutl);
        return res.status(200).json({statistics:resutl});
      }
    })

  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:`There was a servor error during fetching statistics data`})
  }
})

adminRouter.get('/getUniversitySections',(req,res)=>{
  try {
    const sql = 'CALL getUniversitySections()';

    database.query(sql,(err,universitySections)=>{

      if(err){
        console.log(err);
        return res.status(500).json({error:'There was a servor error with the server'});
      }
      else{
        
        return res.status(200).json({universitySections:universitySections[0]});
      }
    });
  }
  catch(err){
    console.log(err);
    return res.status(500).json({error:'There was a servor error during fetching university sections'})
  }
})

export default adminRouter;

