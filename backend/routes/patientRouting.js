import express from 'express';
import database from '../config/database.js';
import bodyParser from 'body-parser';
import multer from 'multer';
import { encryptWithFixedIV,decryptWithFixedIV } from '../encryptionMethods/encryptionDecryptionMethods.js';

import dotenv from 'dotenv';

const upload = multer();
dotenv.config();
const patientRouting = express.Router();
const secretKey = process.env.SECRET_KEY;

patientRouting.use(bodyParser.json());
patientRouting.use(express.json());
patientRouting.use(bodyParser.urlencoded({ extended: true }));

// here we're checking the product Quantity in Db 

patientRouting.post('/checkProductQuantity',(req,res)=>{
  try {
    
   const id = req.body.productId;
 
   const sql = 'CALL CheckProductQuantity(?)';
 
   database.query(sql,[id],(err,quantityResponse)=>{
 
     if(err) {
       throw(err);
     }

        res.json({dbRes:quantityResponse[0][0].quantity});    
   })
  }
  catch(err){
    console.log(err);
   throw(err);
  }
   
 })
 

 // here where we handle an order that contain only one product 
 patientRouting.post('/orderProduct',async (req,res)=>{
    try {
   const productId = req.body.productId;
   const customerFullName = req.body.customerFullName;
   const phoneNumber = req.body.customerPhoneNumber;
   const flavours = req.body.orderFlavours;
 const orderQuantity = req.body.orderQuanititySent;
 const orderPrice = req.body.orderPrice;
 const orderDate = req.body.orderDate;
 
   let updateQuantitySql = 'CALL UpdateProductQuantity(?,?)'
 
    await new Promise((resolve, reject) => {
     database.query(updateQuantitySql,[orderQuantity,productId],(err, updateQuantityResponse) => {
         if (err) {
             reject(err);
         } else {
                 console.log("item quantity was successfully updated in the shop");
             //    console.log(updateQuantityResponse);

                 req.io.emit('updateProductQuantity',{productId:productId,orderQuantitySent:orderQuantity})
                 resolve();
         }
     });
 }).then(()=>{
   
 })
 .catch((err)=>{
   console.log(err);
 })


let lastInsertOrderId;
 let addOrderSql = "CALL InsertNewOrder(?,?,?,?)";
  await new Promise((resolve, reject) => {
     database.query(addOrderSql, [customerFullName,orderPrice,orderDate,phoneNumber], (err, ordersResponse) => {
         if (err) {
             console.log('Error while inserting order:', err);
             reject(err);
         } else {
             console.log('Order was successfully made and sent to the shop');
             lastInsertOrderId = ordersResponse[0][0].order_Id; // Getting the last inserted ID if auto-increment is set

             req.io.emit('newOrderAdded',{order_Id:lastInsertOrderId , customerFullName:customerFullName , customerTelephone:phoneNumber , orderPrice:orderPrice , order_Date:orderDate , orderState:"In queue"})

             resolve(ordersResponse[0][0]);
         }
     });
 }).then((res)=>{
  // console.log(res);
 })
 .catch((err)=>{
   console.log(err);
   throw err;
 })

 let addOrderItems = "CALL InsertOrderItems(?,?,?,?,?)";
 await new Promise((resolve, reject) => {
  database.query(addOrderItems, [lastInsertOrderId,productId,flavours,orderQuantity,orderPrice], (err, orderItemsResponse) => {
      if (err) {
          console.log('Error while inserting order:', err);
          reject(err);
      } else {
          console.log('Order was successfully added to the order_items');;
          resolve(orderItemsResponse.protocol41);
      }
  });
}).then((res)=>{
console.log(res);
})
.catch((err)=>{
console.log(err);
})

    res.json({orderId:lastInsertOrderId,clientName:customerFullName,phoneNumber:phoneNumber,productId:productId,flavours:flavours,orderQuantity:orderQuantity,orderPrice:orderPrice, message:'the order was successfully made'});

    }
    catch (err) {
     console.log("Problem is = \n"+err);
    }
 })


 // here where we can hanle an order that contain 1 or * products

 patientRouting.post('/orderMultipleProducts',async(req,res)=>{

try {

 /// const customerUsername = encryptWithFixedIV(req.body.storedAccountId,secretKey);
 const customerFullName = req.body.fullName;
  const totalPrice = req.body.totalPrice;
  const customerPhoneNumber = req.body.phoneNumber;
  const now = new Date(Date.now());
  const orderDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  console.log(orderDate);
  
  const chart = req.body.chartProducts;
  
  let orderProductsAndQuantities = [];

// updating the quantities of the ordered products
  let updateChartProductsQuantitySql = 'CALL UpdateProductQuantity(?,?)'
  await new Promise ((resolve,reject)=>{
    const promises = [];
    
    chart.forEach((product)=>{
      const { chartProductId,chartProductQuantity } = product;

      const promise = new Promise((resolve,reject) => {

        database.query(updateChartProductsQuantitySql,[chartProductQuantity,chartProductId],(err,responseUPdate)=>{
          if(err){
            console.log('Database error ', err);
            reject(err);
            return
          }
          resolve(responseUPdate);
        })
      })

      const orderedProduct = {
        productId: chartProductId,
        productQuantity: chartProductQuantity,
      };

      orderProductsAndQuantities.push(orderedProduct);
      promises.push(promise);


    })

    Promise.all(promises)
    .then((results)=>{
      console.log("All chart products quantity has been updated");


      req.io.emit('updateProductsQuantities',{orderProducts:orderProductsAndQuantities});

      resolve(results);
    })
    .catch((err)=>{
      console.log("Error updating chart products quantities",err);
      reject(err);
    })
  })


//  inserting the order and getting its id in return by giving the customer username , totalPrice and the date 
  
let lastInsertOrderId;
 let addOrderSql = "CALL InsertNewOrder(?, ?, ?,?)";
 await new Promise((resolve, reject) => {
    database.query(addOrderSql, [customerFullName,totalPrice,orderDate,customerPhoneNumber], (err, ordersResponse) => {
        if (err) {
            console.log('Error while inserting order:', err);
            reject(err);
        } else {
            console.log('Chart Order was successfully made and sent to the shop');
            lastInsertOrderId = ordersResponse[0][0].order_Id; // Get the last inserted ID if auto-increment is set
            resolve();

            req.io.emit('newOrderAdded',{order_Id:lastInsertOrderId , customerFullName:customerFullName , customerTelephone:customerPhoneNumber , orderPrice:totalPrice , order_Date:orderDate , orderState:"In queue"})
        }
    });
}).then(()=>{
})
.catch((err)=>{
  console.log(err);
})



// inserting the chart products using the same order  

 let insertChartProductsSql = "CALL InsertOrderItems(?,?,?,?,?)";
  await new Promise((resolve, reject) => {
  const promises = [];
  chart.forEach((product) => {
      const { chartProductId, chartProductFlavours, chartProductQuantity, chartProductPrice } = product;
      const values = [lastInsertOrderId,chartProductId, chartProductFlavours, chartProductQuantity, chartProductPrice];

      const promise = new Promise((resolve, reject) => {
        database.query(insertChartProductsSql, values , (err, result) => {
              if (err) {
                  console.error('Database query error:', err);
                  reject(err);
                  return;
              }
              resolve(result[0]);
          });
      });
      promises.push(promise);
  });

  Promise.all(promises)
      .then((results) => {
          console.log(`All chart products inserted successfully in Db for order ${lastInsertOrderId}`);
          resolve(results);
      })
      .catch((error) => {
          console.error('Error inserting chart Produts:', error);
          reject(error);
      });

         return res.json({message:"All chart products inserted successfully in Db for order",orderId:lastInsertOrderId,clientName:customerFullName,phoneNumber:customerPhoneNumber});
});


}
catch(err){
  console.log(err);
  throw err;
}

 })


 patientRouting.post('/getOrdersForMyaccount',(req,res)=>{

  const accountId = encryptWithFixedIV(req.body.accountId,secretKey);

  let getMyOrdersSql = `CALL GetOrdersForMyaccount(?)`;

  database.query(getMyOrdersSql,[accountId],(err,myOrders)=>{

    if(err){
      console.log(err);
      return err;
    }
    else {
      res.json({myOrders:myOrders[0]});
    }
  })

 });


 patientRouting.post('/addNewAppointment',(req,res)=>{
  const patientName = req.body.name;
  const patientPhone = req.body.phone;
  const PatientGender = req.body.gender;
  const patientAge = req.body.age;
  const doctorId = req.body.doctorId;
  const reservationDate = req.body.date;
  //console.log("Gender "+req.body.gender)
 const genderToDb = req.body.gender == 'male' ? 0 : 1;
  const sql = 'CALL addNewReservation(?,?,?,?,?,?)';

  database.query(sql,[patientName,patientPhone,genderToDb,patientAge,doctorId,reservationDate],(err,resutl)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
          
     const lastInsertId = resutl[0][0].reservation_Id;
      console.log('reservation was made successfully');
      req.io.emit('newReservationAdded',{
        reservation_Id:lastInsertId,
        patient_NomPrenom:patientName,
        patient_Telephone:patientPhone,
        patient_Genre:PatientGender =='male' ? 0 : 1,
        patient_Age:patientAge,
        nomPrenom:resutl[1][0].nomPrenom,
        reservation_Date:reservationDate,
        reservation_Etat:0 });

      return res.json({success:"reservation was made successfully",reservationId:lastInsertId,clientName:patientName,phoneNumber:patientPhone,gender:PatientGender,age:patientAge,doctorFullName:resutl[1][0].nomPrenom});
    }
  })
 })


 export default patientRouting;