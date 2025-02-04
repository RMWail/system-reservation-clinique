import express  from 'express';
import database from '../config/database.js';
import multer from 'multer';
import bodyParser from 'body-parser';
import { encryptWithFixedIV,decryptWithFixedIV } from '../encryptionMethods/encryptionDecryptionMethods.js';

import dotenv from 'dotenv';
const upload = multer();
dotenv.config();

const adminRouter = express.Router();
const secretKey = process.env.SECRET_KEY;
adminRouter.use(bodyParser.json());
adminRouter.use(express.json());
adminRouter.use(bodyParser.urlencoded({ extended: true }));

// get all the items from the database 

adminRouter.get('/getItems',(req,res)=>{

  try {
   
    let sql = 'SELECT * FROM GetItems ';
    database.query(sql,(err,result)=>{

      if(err){
        console.log(err);
        throw err;
      }
      result.forEach(item=>{
        if(item.item_photo){
          const imageData = item.item_photo;
          const base64String = Buffer.from(imageData).toString('base64');
          item.item_photo=base64String;
        }
      })
      res.json({items:result});
    })
  }
  catch(err){
    console.log(err)
    res.status(500).json({message:err});
  }

})

// Add a new item to the shop

adminRouter.post('/createItem',upload.single('productPhoto'),async(req,res)=>{

  try {
    const itemName = req.body.productName;
    const itemType = req.body.productType;
    const itemPrice = req.body.productPrice;
    const itemPhoto = req.file.buffer;
    const itemDescription = req.body.productDescription
    const itemFlavourAvailability = req.body.productFlavours.toLowerCase() === 'yes' ? 1 : 0;
    const itemQuantity = req.body.productQuantity;
   
    let sql = 'CALL InsertNewItem(?,?,?,?,?,?,?)'

    database.query(sql,[itemName,itemType,itemDescription,itemPrice,itemPhoto,itemFlavourAvailability,itemQuantity],(err,result)=>{
      if(err){
        console.log(err);
        throw err;
      }
      else {             
        const imageData = itemPhoto;
        const base64String = Buffer.from(imageData).toString('base64');
      const card ={
        item_Id : result[0][0].item_Id,
        item_name: itemName,
        item_type: itemType,
        item_description: itemDescription,
        item_price: itemPrice,
        item_photo: base64String,
        flavours: itemFlavourAvailability,
        quantity: itemQuantity,
      }
       //   console.log('added Item_id to socket = '+card.item_Id);
      req.io.emit('updateShopItemCreated',{newCard:card});

      console.log("\n item was successfully added to the shop");
      res.json({response:"item was successfully added to the shop"});
      }
    })
  
  }
  catch(err){
    console.log(err);
    res.status(500).send({message: err});
  }
  
})


//modify an item from the shop by modifying its inputs 

adminRouter.post('/modifyItem',upload.single('productPhoto'),async(req,res)=>{

  try {
   // console.log("counter = "+req.body.counter)
    const item_Id = req.body.productId;
    const item_name = req.body.productName;
    const item_type = req.body.productType;
    const item_price = req.body.productPrice;
    const item_photo = req.body.counter > 0 ? req.file.buffer : null;
    const item_quantity = req.body.productQuantity;
    const item_description = req.body.productDescription;
    const counterForSocket = req.body.counter;
    let item_flavourAvailability; 
    if(req.body.productFlavours!=="0" && req.body.productFlavours!=="1"){
      if(req.body.productFlavours.toLowerCase()==="no")
        item_flavourAvailability = 0;
      else if(req.body.productFlavours.toLowerCase()==="yes")
      item_flavourAvailability = 1;
    }
    else{
      if(req.body.productFlavours==="0")
      item_flavourAvailability = 0;
    else
      item_flavourAvailability =1;
    }
    console.log("flavours = "+item_flavourAvailability);

      let sql;
    let params;

    if (req.body.counter > 0 && req.file) {
      // Photo is provided

       sql = `CALL UpdateItemInfoWithPhoto(?,?,?,?,?,?,?,?)`;
      params = [item_name, item_type, item_description, item_price, item_photo, item_flavourAvailability,item_quantity, item_Id];
    } else {
      // No photo
       sql = `CALL UpdateItemInfoWithoutPhoto(?,?,?,?,?,?,?)`;
       
      params = [item_name, item_type, item_description, item_price, item_flavourAvailability, item_quantity, item_Id];
    }

    
    database.query(sql,params,async (err,result)=>{

      if(err){
        console.log(err);
        throw err;
      }
      else {
        let base64String;
        console.log('counter for socket = '+counterForSocket);
     if(counterForSocket > 0){
       base64String = Buffer.from(item_photo).toString('base64');
     }

      const card ={
        item_Id : item_Id,
        item_name: item_name,
        item_type: item_type,
        item_description: item_description,
        item_price: item_price,
        item_photo: counterForSocket >0 ? base64String : null,
        flavours: item_flavourAvailability,
        quantity: item_quantity,
      }

       await req.io.emit('updateShopItemModified')

        console.log("item was updated successfuly in the shop \n");
        return res.send("item updated successfuly");
      }
    })
   
  }
  catch(err){
    console.log(err);
    throw err;
  }

})

//delete an item from the shop

adminRouter.post('/deleteItem',(req,res)=>{

 try {

  const deleteUnnecessaryData = `CALL DeleteItem(?)`;


  database.query(deleteUnnecessaryData,[req.body.id],(err,result)=>{

    if(err){
      console.log(err);
      throw(err);
    }
  else {
        
    console.log("\n item was successfully deleted from the shop");

    req.io.emit('updateShopItemDeleted',{productId:req.body.id});

    return res.json({response:'item was successfully deleted from the shop'});
  }
  })

 }
 catch(err){
  console.log(err);
  throw err;
 }

})

adminRouter.get('/getOrders',(req,res)=>{

  try {

    let getOrdersSql = "SELECT * FROM PendingOrders";

   database.query(getOrdersSql,(err,getOrdersResponse)=>{

    if(err){
      console.log(err);
      res.send('error occur during fetching order from DB')
    }


    getOrdersResponse.forEach(order=>{
      if(order.customerUsername){
        order.customerUsername = decryptWithFixedIV(order.customerUsername,secretKey);
      }
    })

    res.json({orders:getOrdersResponse})
   })

  }
  catch(err) {
    console.error(err);
  }
})


adminRouter.post('/getOrderProducts',(req,res)=>{
 
   const getOrderProductsSql = `CALL GetOrderProducts(?)`;
 
   database.query(getOrderProductsSql,[req.body.orderId],(err,orderItemsRes)=>{

      if(err){
        console.log(err);
        return err;
      }
      else {
        res.json({productsOrder:orderItemsRes[0]})
      }
   })

  
})


adminRouter.post('/orderIsReady',(req,res)=>{

  const now = new Date(Date.now());
const currentDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours()}:${now.getMinutes()}`;

    let sqlMakeOrderReady = 'CALL MakeOrderReady(?,?,?)'

     database.query(sqlMakeOrderReady,[req.body.newOrderState,currentDate,req.body.orderId],(err,updateStateRes)=>{
       if(err) {
         console.log('there was error when update order state = ',err);
          return err;
       }
       else {      
      
         req.io.emit('updateOrderSate',{orderId:req.body.orderId,newState:req.body.newOrderState});

   /*
    const room = req.body.customerUsername;
    const message = req.body.newOrderState === "Rejected" ?
  `Your order ${req.body.orderId} was rejected` :
  `Your order ${req.body.orderId} is ${req.body.newOrderState}`;


  req.io.to(room).emit('toShopIsReady', {
    customerUsername: req.body.customerUsername,
    orderId: req.body.orderId,
    orderState: req.body.newOrderState,
    message,
    room
  }, (ack) => {
    if (ack) {
      console.log('Message was successfully received by shop component');
    } else {
      console.log('Failed to deliver the message to shop component');
    }
  });  */

   
         res.send(`order state was updated successfully to --> ${req.body.newOrderState}`);
       }
     })
 


});

adminRouter.get('/getSalesStats',async (req,res)=>{
let revenueStats = [];
  const now = new Date(Date.now());
  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const today = `${currentMonth}-${now.getDate().toString().padStart(2, '0')}`

  let sqlRevenues = `CALL GetRevenues(?,?,?)`;

  await new Promise( (resolve,reject) =>{


    database.query(sqlRevenues, [currentYear,currentMonth,today], (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
      
        resolve(result);
      }
    });
  

  })
  .then((result)=>{

    revenueStats = result[0];
  })
  .catch((err)=>{
    console.log(err);
    throw err;
  })

const months = Array.from({ length: 12 }, (_, i) => `${currentYear}-${(i + 1).toString().padStart(2, '0')}`);


const getMonthlyRevenue = async (month) => {
  return  new Promise((resolve, reject) => {
    const sql = `CALL GetMonthlyRevenue(?)`;
    database.query(sql, [month], (err, result) => {
      if (err) reject(err);
      else {
  
      resolve({ month, revenue: result[0][0].monthRevenue});
    }
    });
  });
};

const revenuePromises = months.map(async (month) => await getMonthlyRevenue(month));
let monthsRevenues = [];
Promise.all(revenuePromises)
  .then((monthlyRevenues) => {


    const monthsNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];



    for(let i=0;i<monthsNames.length;i++){

      const barData = {
        monthName:monthsNames[i],
        revenue:monthlyRevenues[i].revenue
      }
         monthsRevenues.push(barData);
    }

  })
  .catch((err) => {
    console.error("Error retrieving monthly revenues:", err);
    res.status(500).json({ error: "Error retrieving monthly revenues" });
  });

  let sqlMostSaledProducts = `CALL GetMostSaledProducts (4)`;

let queryResultProducts = [];
  await new Promise((resolve,reject)=>{

    database.query(sqlMostSaledProducts,(err,queryResult)=>{
      if(err){
        console.log(err);
        reject(err);
      }
      else {
   
          queryResultProducts = queryResult[0];
          resolve(queryResult);
      }
    })

  })

let mostSaledProducts = [];

 let sqlToGetMostSaledProduct = 'CALL GetMostSaledProductInfo(?)';

await new Promise((resolve, reject) => {
  const promises = [];
  queryResultProducts.forEach((product) => {
      const {item_Id} = product;
      
      const promise = new Promise((resolve, reject) => {
        database.query(sqlToGetMostSaledProduct, [item_Id] , (err, result) => {
              if (err) {
                  console.error('Database query error:', err);
                  reject(err);
                  return;
              }
              else {
          
              resolve(result[0]);
              }
          });
      });
      promises.push(promise);
  });

  Promise.all(promises)
      .then((results) => {

         for(let i=0;i<results.length;i++){
          const imageData = results[i][0]!==null ? results[i][0].item_photo :null;
          const base64String = imageData!==null ? Buffer.from(imageData).toString('base64') : null;
          results[i][0].item_photo = base64String;

          results[i].push(queryResultProducts[i].total_quantity_ordered);
         
         }

          mostSaledProducts = results;
          resolve(results);
      })
      .catch((error) => {
          console.error('Error in finding products:', error);
          reject(error);
      });

});

  res.json({revenueStats:revenueStats,yearMonthlyRevenues:monthsRevenues,mostSaledProducts:mostSaledProducts})
})

adminRouter.get('/getHistory',async(req,res)=>{

  const currentYear = new Date().getFullYear();

   let sqlStatHistory = `CALL ordersStatusHistory(?)`

  await new Promise((resolve,reject)=>{

    database.query(sqlStatHistory,[currentYear],(err,databaseResult)=>{
      if(err){
        console.log(err);
        reject(err);
      }
      else {
        resolve(databaseResult);
      }
    })

  })
  .then((result)=>{

   let totalNbrOfOrders = 0;
   for(let i=0;i<result[0].length;i++){
      totalNbrOfOrders+= result[0][i].orders_nbr;
   }
     res.json({stats:result[0],totalNbrOfOrders:totalNbrOfOrders});
  })
  .catch((err)=>{
    console.log(err);
    return err;
  })


})

adminRouter.get('/getOrdersHistory',(req,res)=>{

  let getOrdersSql = "SELECT * FROM ordersHistory";

   database.query(getOrdersSql,(err,orders)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
     // console.log(orders.customerTelephone);
      res.send(orders);    
    }
   })


})

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

  const sql = 'CALL getAllExistingAppointements()';

  database.query(sql,(err,allAppointements)=>{
    if(err){
      console.log(err);
      res.status(500).json({error:'Error from server during fetching data'});
    }
    else {
     // console.log(allAppointements[0]);
      return res.json(allAppointements[0]);
    }

  })
})


adminRouter.post('/appointementAction',(req,res)=>{

  const appoitementId = req.body.appointmentId;
  const status = req.body.status ==='confirmed' ? 1 : -1;

 // console.log('appoitmentId = '+appoitementId +" status = "+status);

 const now = new Date(Date.now());
const actionDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
console.log("action date = "+actionDate);

  let updateAppointmentSql = 'CALL updateAppointmentStatus(?,?,?)';

  database.query(updateAppointmentSql,[appoitementId,status,actionDate],(err,result)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
      console.log(`appointement state was updated with success to ${status}`);
      res.json({result:result,newStatus:status})
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


adminRouter.get('/getClinicDoctors',(req,res)=>{

  const sql = 'CALL GetClinicDoctors()';

  database.query(sql,(err,doctors)=>{
    if(err){
      console.log(err);

      res.status(500).json({error:'Error during fetching doctors from server'});
    }
    else {
     // console.log(doctors[0]);
      res.json(doctors[0]);
    }
  })
})



export default adminRouter;

