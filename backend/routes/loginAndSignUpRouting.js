import express from 'express';
import database from '../config/database.js'
import { encryptWithFixedIV,decryptWithFixedIV } from '../encryptionMethods/encryptionDecryptionMethods.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import crypto, { verify }  from 'crypto';
dotenv.config();
const router = express.Router();

const API_CLIENT = process.env.API_CLIENT; 
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const secretKey = process.env.SECRET_KEY;


function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}



router.get('/isUsernameTelephoneExist',(req,res)=>{

  try {  const checkUsername = req.query.checkedUsername;
   const checkTelephone = req.query.checkedTelephone;

   if(checkUsername){
   const sql = 'CALL SelectingUsername(?)';
   database.query(sql,[encryptWithFixedIV(checkUsername,secretKey)],(err,checkResult)=>{
     if(err){
       throw err;
     }
    // console.log('check result = '+checkResult[0].length);
     if(checkResult[0].length>0)
       res.json({answer: 1});
     else 
       res.json({answer: 0});
   })
 }
 if(checkTelephone){
   const sql = 'CALL SelectingPhoneNumber(?)';
   database.query(sql,[encryptWithFixedIV(checkTelephone,secretKey)],(err,checkResult)=>{
     if(err){
       throw err;
     }
 //    console.log('check result = '+checkResult[0].length);
     if(checkResult[0].length>0)
       res.json({answer: 1});
     else 
       res.json({answer: 0});
   })
 }
 }
 catch (err){
   res.status(500).json({message:err});
 }
 
 })

router.post('/checkEmail',(req,res)=>{

  const {email} = req.body;
 
  const sql = 'CALL SelectingEmail(?)';

  database.query(sql,[encryptWithFixedIV(email,secretKey)],(err,result)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
    
    //  console.log('result = '+result)
      if(result[0].length>0){
        return res.json({answer:'yes'})
      }
      else {
        return res.json({answer:'no'})
      }
    }
  })

}) 
 
router.post('/createCustomerAccount',async(req,res)=>{
 
  try {
   let FullName = req.body.FullName;
   let Username = req.body.Username;
   let Telephone = req.body.Telephone;
   let Email = req.body.Email;
   let Password = req.body.Password;
   let OTP_CODE = generateOTP();
   let OTP_CODE_TO_EMAIL = OTP_CODE;
   console.log('fullName = '+FullName);
   console.log('Username = '+Username);
   console.log('Email = '+Email);
    console.log('recieved otp code ='+OTP_CODE);
   let USERNAME = req.body.Username;
   FullName = await encryptWithFixedIV(FullName,secretKey);
   Username = await encryptWithFixedIV(Username,secretKey);
   Telephone = await encryptWithFixedIV(Telephone,secretKey);
   Email = await encryptWithFixedIV(Email,secretKey);
   Password = await encryptWithFixedIV(Password,secretKey);
   OTP_CODE = await encryptWithFixedIV(OTP_CODE,secretKey);

   console.log('encryption otp code ='+OTP_CODE);
   const expiryDate = new Date();
   expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Add 10 minutes
   const formattedOtpExpiry = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}:${String(expiryDate.getHours()).padStart(2, '0')}:${String(expiryDate.getMinutes()).padStart(2, '0')}`;
   

    let sql = 'CALL CreateNewAccount(?,?,?,?,?,?,?)';
 
   database.query(sql,[Username,FullName,Email,Telephone,Password,OTP_CODE,formattedOtpExpiry],(err,insertionResult)=>{
           if(err){
             throw err;
           }
           else {
            console.log('submition has completed successfuly ');
             
     //      console.log(insertionResult);

            const transporter = nodemailer.createTransport({
              service: process.env.EMAIL_SERVICE,
              auth: {
                  user: process.env.SHOP_EMAIL,
                  pass: process.env.SHOP_EMAIL_PASS,
              },
            });
            
            console.log('to verifiy email = '+req.body.Email);
            var mailOptions = {
              from: process.env.SHOP_EMAIL,
              to: req.body.Email,
              subject: 'Verify Your Account',
              html: `
                <html>
                  <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="text-align: center; padding: 20px;">
                      <p style="font-size: 18px; color: #555; margin-bottom: 15px;">
                        <strong>Don't forget to use your registered username <span style="color: #2d87f0; font-weight: bold;">${USERNAME}</span> to log in:</strong> 
                      </p>
                      <h2 style="color: #2d87f0; font-size: 20px;">Thank you for signing up with Ice Cream Shop DZ!</h2>
                      <p style="font-size: 16px; color: #555;">
                        Please verify your email by entering the following code:
                      </p>
                      <h3 style="font-size: 22px; font-weight: bold; color: #e67e22; margin-top: 0; padding-bottom: 5px;">
                        ${OTP_CODE_TO_EMAIL}
                      </h3>
                      <p style="font-size: 18px; color: black; margin-top: 5px;">
                        This code is valid for the next 10 minutes.
                      </p>
                      <p style="font-size: 18px; color: black; margin-top: 5px;">
                        If you did not request this, please ignore this message.
                      </p>
                      <p style="font-size: 18px; color: #2d87f0; margin-top: 5px;">Best regards,<br>Ice Cream Shop DZ Team</p>
                    </div>
                  </body>
                </html>
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
   })
   }
   catch(err){
     console.log(err);
     res.status(500).json({message:err});
   }
 
 })
 

router.post('/logincheck',(req,res)=>{
  try{
  // I need to also get the Gmail to use in order to send the email to the user 
   const UsernamePhone = encryptWithFixedIV(req.body.UsernamePhone,secretKey);
   const Password = encryptWithFixedIV(req.body.Password,secretKey);

  // if(req.body.UsernamePhone===ADMIN_USERNAME && req.body.Password===ADMIN_PASSWORD){
  //   return  res.json({answer:'admin'});
  // }
//   else {
    let sql = 'CALL SelectingPassword(?,?)';
 
    database.query(sql,[UsernamePhone,UsernamePhone],(err,result)=>{
      if(err){
        console.log(err);
        return;
      }
      if(result[0].length>0){
    //    console.log('account verify = '+result[0][0].account_verify);
        const GmailAccount = result[0][0].Gmail;
        const username = result[0][0].customerUsername;
          if(result[0][0].Password===Password && result[0][0].account_verify===1){
           return res.json({account:req.body.UsernamePhone,email:GmailAccount,answer:'admin'})
          }
          else if(result[0][0].Password===Password && result[0][0].account_verify!==1){
            return res.json({account:req.body.UsernamePhone,email:decryptWithFixedIV(result[0][0].Gmail,secretKey),username:username,answer:'unverified'})
          }
          else {
           return res.json({answer:-1});
          }
      }
      else {
        return res.json({answer:0});
      }
    })
  // }
 }
 catch(err){
   console.log(err);
   res.status(500).json({message:err});
 }
 })
 

export default router;