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




adminRouter.get('/getAppointments',(req,res)=>{
  
  const now = new Date()
  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
  const sqlAppointements = 'CALL getAllReservationsInfo (?)';

  database.query(sqlAppointements,[today],(err,appointements)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
   //   console.log(appointements[0]);
      res.json(appointements[0]);
    }
  })
})

adminRouter.get('/getAppointmentsHistory',(req,res)=>{

  const sql = 'CALL getAllExistingReservations()';

  database.query(sql,(err,allAppointements)=>{
    if(err){
      console.log(err);
      res.status(500).json({error:'Error from server during fetching data'});
    }
    else {
    //   console.log(allAppointements[0]);
      return res.json(allAppointements[0]);
    }

  })
})


adminRouter.post('/appointementAction',(req,res)=>{

  const appoitementId = req.body.appointmentId;
  const status = req.body.status =='confirmed' ? 1 : -1;

 // console.log('appoitmentId = '+appoitementId +" status = "+status);

 const now = new Date(Date.now());
const actionDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;


  let updateAppointmentSql = 'CALL updateAppointmentStatus(?,?,?)';

  database.query(updateAppointmentSql,[appoitementId,status,actionDate],(err,result)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
      console.log(`appointement state was updated with success to ${status}`);
      res.json({result:result,appoitementId:appoitementId,newStatus:status})
    }
  })

})


adminRouter.get('/reservationsStats', (req, res) => {
  let sqlStats = 'CALL GetReservationsStats()';

  database.query(sqlStats, (err, stats) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error fetching stats' });
    } else {
      const reservationsGeneralStats = stats[0][0];
      const currentYear = new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => `${currentYear}-${(i + 1).toString().padStart(2, '0')}`);
     
      // Define the async function to get monthly stats
      const getMonthlyStatsReservations = async (month) => {
        return new Promise((resolve, reject) => {
          const sql = `CALL getMonthlyReservationsStats(?)`;
          database.query(sql, [month], (err, result) => {
            if (err) reject(err);
            else {
         //     console.log('month = '+month);
           //   console.log("raw result = "+result[0][0]);

              if (result[0] && result[0][0]) {
                const { completed_reservation, pending_reservation, cancelled_reservation } = result[0][0];
      
                resolve({ month, completed_reservation, pending_reservation, cancelled_reservation });
              } else {
                resolve({ month, completed_reservation: 0, pending_reservation: 0, cancelled_reservation: 0 });
              }
            }
          });
        });
      };

      // Create a list of promises to fetch stats for each month
      const revenuePromises = months.map(async (month) => await getMonthlyStatsReservations(month));

      let monthsReservationsStats = [];

 
        Promise.all(revenuePromises)
        .then((monthlyStats) => {

          const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          for (let i = 0; i < monthsNames.length; i++) {
            const barData = {
              monthName: monthsNames[i],
              completed_reservation: monthlyStats[i].completed_reservation ,
              pending_reservation: monthlyStats[i].pending_reservation ,
              cancelled_reservation: monthlyStats[i].cancelled_reservation ,
            };

            monthsReservationsStats.push(barData);
          }

          // Send the result to the client
          res.json({genralStats:reservationsGeneralStats,monthsDetailsStats:monthsReservationsStats});
        })
        .catch((err) => {
          console.error('Error retrieving monthly revenues:', err);
          res.status(500).json({ error: 'Error retrieving monthly revenues' });
        });
    }
  });
});



export default adminRouter;

