import express from 'express';
import database from '../config/database.js'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
dotenv.config();
const router = express.Router();

const API_CLIENT = process.env.API_CLIENT; 

// you already have an active password reset link to update your password 

router.post('/sendResetLinkToGmail',(req,res)=>{

  const {email} = req.body;
  

const checkingLinkSql = 'CALL checkTokenForAdminGmail(?)';

  database.query(checkingLinkSql,email,(err,checkResult)=>{
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

      database.query(sql,[token,formattedExpiry,email],(err,setTokenResult)=>{
        if(err){
          console.log(err);
          return res.status(500).json({error:'Error updating token'});
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
        text: `
         Hello,

    We received a request to reset your password for your account. To update your password, please click the link below:
    
    ${API_CLIENT}/reset-password/${email}/${token}
    
    This link will expire in 24 hours, so please make sure to reset your password before then.

    If you didn't request a password reset, you can safely ignore this email.

    Best regards,
    Your Shop Team
        `
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
           else {
            return res.status(401).json({error:'Error updating token'});
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
  const hashedPass = await bcrypt.hash(password,10);

  let getUserbyEmailAndToken = 'CALL SelectTokenDateByEmailAndToken(?,?)';

  database.query(getUserbyEmailAndToken,[email,token],async(err,resultOfQuery)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
    //  console.log(resultOfQuery[0]);

      if(resultOfQuery[0].length>0){
 
        let updatePasswordSql = 'CALL UpdateUserPassword(?,?)';

        await new Promise((resolve,reject)=>{
          database.query(updatePasswordSql,[hashedPass,email],(err,updatePasswordResult)=>{
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