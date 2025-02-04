import express from 'express';
import database from '../config/database.js'
import { encryptWithFixedIV,decryptWithFixedIV } from '../encryptionMethods/encryptionDecryptionMethods.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
dotenv.config();
const router = express.Router();

const API_CLIENT = process.env.API_CLIENT; 
const secretKey = process.env.SECRET_KEY;

// you already have an active password reset link to update your password 

router.post('/sendResetLinkToGmail',(req,res)=>{

  const {email} = req.body;
  const encryptedEmail=encryptWithFixedIV(email,secretKey);

const checkingLinkSql = 'CALL checkTokenForGmail(?)';

  database.query(checkingLinkSql,encryptedEmail,(err,checkResult)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {

       if(checkResult[0].length<=0){
         
       const token = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: '1h' });

       // Format expiry date
       const expiryDate = new Date();
       expiryDate.setHours(expiryDate.getHours() + 24); // Add 24 hours (1 day)
       const formattedExpiry = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}:${String(expiryDate.getHours()).padStart(2, '0')}:${String(expiryDate.getMinutes()).padStart(2, '0')}`;
       
      // console.log("Expiry Date:", formattedExpiry);
       
   //    console.log('expiry date format = ' + formattedExpiry);
       

      let sql = 'CALL UpdateToken(?,?,?)';

      database.query(sql,[token,formattedExpiry,encryptedEmail],(err,setTokenResult)=>{
        if(err){
          console.log(err);
          return err;
        }
        else {         
       //    console.log('Token result = '+setTokenResult);
           if(setTokenResult.affectedRows>0){
            console.log('Token was updated successfully');
            const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.SHOP_EMAIL,
            pass: process.env.SHOP_EMAIL_PASS,
        },
      });
      
      var mailOptions = {
        from: process.env.SHOP_EMAIL,
        to: email,
        subject: 'Password Reset link',
        text: `${API_CLIENT}/reset-password/${email}/${token}`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(`Email error = ${error}`);
        } else {
          console.log('Email was sent successfully : ' + info.response);
          return res.json({answer:'Success'});
        }
      });
            

           }
    
        }
      })



       }
       else {
       //  console.log('You already have a password reset link in your Gmail account');
         return res.json({answer:'exist'});
       } 
    }
  })

})



router.post('/reset-password',async (req,res)=>{
  const {email,token,password}=req.body;
  const encryptedEmail=encryptWithFixedIV(email,secretKey)
  const encryptedPass = encryptWithFixedIV(password,secretKey);

  let getUserbyEmailAndToken = 'CALL SelectTokenDateByEmailAndToken(?,?)';

  database.query(getUserbyEmailAndToken,[encryptedEmail,token],async(err,resultOfQuery)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
    //  console.log(resultOfQuery[0]);

      if(resultOfQuery[0].length>0){
 
        let updatePasswordSql = 'CALL UpdateUserPassword(?,?)';

        await new Promise((resolve,reject)=>{
          database.query(updatePasswordSql,[encryptedPass,encryptedEmail],(err,updatePasswordResult)=>{
            if(err){
              console.log(err);
              reject(err);
             
            }
            else {
              
               console.log('User password has been updated successfully');
               resolve(updatePasswordResult[0])
            }
          })
  
        })
        .then(()=>{
          return res.json({answer:'Your password has been updated successfully'});
        })
        .catch((err)=>{
          console.log(err);
          return err;
        })


      }
      else {
        console.log('User reset password link has expired');
       return res.json({answer:'Your reset password link has expired'});
      }

    }
  })


})


export default router;