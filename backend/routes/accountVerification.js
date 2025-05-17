import express from 'express';
import database from '../config/database.js'
import { encryptWithFixedIV,decryptWithFixedIV } from '../encryptionMethods/encryptionDecryptionMethods.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();
const router = express.Router();

const secretKey = process.env.SECRET_KEY;





function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}





router.post('/accountVerification',async(req,res)=>{
  console.log(req.body.email);
  console.log(req.body.otp);
  const encryptedEmail = encryptWithFixedIV(req.body.email,secretKey);
  const encryptedOtp = encryptWithFixedIV(req.body.otp,secretKey);
  console.log(encryptedEmail);
  console.log(encryptedOtp);

  let sql = 'CALL SelectGmailBasedOnOtpCode(?)';

  database.query(sql,[encryptedEmail,encryptedOtp],(err,result)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {

      if(result[0].length>0){
         if(result[0][0].Gmail!=null && result[0][0].otp_code==encryptedOtp){
          console.log('otp code is valid');

             let sql = 'CALL UpdateAccountVerification(?)';

             database.query(sql,[encryptedEmail],(err,verifyAccountResult)=>{
              if(err){
                console.log(err);
                return err;
              }
              else {
                
                 if(verifyAccountResult.affectedRows>=1){
                  console.log('account was successfully verified')

                  return res.json({answer:1});
                 }
              }
             })
          
         }

         else if(result[0][0].Gmail!=null && result[0][0].otp_code!==encryptedOtp){
          console.log('otp code is wrong');
          return res.json({answer:0});
        }
      }

      else {
        console.log('otp code has expired');
        return res.json({answer:-1});
      }
    }
  })
  
})

router.post('/sendOtpCode',async(req,res)=>{
  const GmailAccount = req.body.email;
  let USERNAME = '';

  if(req.body.username!==''){
     USERNAME = decryptWithFixedIV(req.body.username,secretKey);
  }
  else {
    let sql = 'CALL GetUsernameByGmail(?)';
      await new Promise((resolve,reject)=>{

        database.query(sql,encryptWithFixedIV(GmailAccount,secretKey),(err,result)=>{
          if(err){
            console.log("Error in Getting username = "+err);
            reject(err);

          }
          else {         
            resolve(result[0][0].customerUsername);
          }
        })

      })
      .then((result)=>{       
        USERNAME = decryptWithFixedIV(result,secretKey);
        console.log('USERNAME = '+USERNAME);
      })
      .catch((err)=>{
        console.log(err);
        return res.json({Error:'Error in DB'})
      })
  }



  let OTP_CODE = generateOTP();
  let OTP_CODE_TO_EMAIL = OTP_CODE;
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Add 10 minutes
  const formattedOtpExpiry = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}:${String(expiryDate.getHours()).padStart(2, '0')}:${String(expiryDate.getMinutes()).padStart(2, '0')}`;
     OTP_CODE = await encryptWithFixedIV(OTP_CODE,secretKey);

     console.log("Email = "+GmailAccount);
     console.log("Username = "+USERNAME);
     console.log("Expiry date = "+formattedOtpExpiry);
      let sql = 'CALL UpdateOtpCode(?,?,?)';
      
      database.query(sql,[OTP_CODE,formattedOtpExpiry,encryptWithFixedIV(GmailAccount,secretKey)],(err,resultOfUpdate)=>{
        if(err){
          console.log(err);
          return res.json({Error:'Error in DB'});
        }
        else {
          console.log(resultOfUpdate);
           if(resultOfUpdate.affectedRows>0){
             console.log('Otp code was updated successfully');

             const transporter = nodemailer.createTransport({
              service: process.env.EMAIL_SERVICE,
              auth: {
                  user: process.env.SHOP_EMAIL,
                  pass: process.env.SHOP_EMAIL_PASS,
              },
            });
            
         //   console.log('to verifiy email = '+req.body.email);
            var mailOptions = {
              from: process.env.SHOP_EMAIL,
              to: GmailAccount,
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
                return res.json({answer:'Error'});
              } else {
                console.log('Email was sent successfully : ' + info.response);
                return res.json({answer:'Success',email:decryptWithFixedIV(GmailAccount,secretKey)});
              }
            });

           }
        }
      })


})


export default router ;