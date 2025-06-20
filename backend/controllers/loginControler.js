import  sequelize  from "../config/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

export const loginCheck = async(req,res)=>{

    try {

        const UsernamePhone = req.body.Username;
        const Password = req.body.Password;


        const [result] = await sequelize.query('CALL SelectingPassword(?)',{
            replacements : [UsernamePhone]
        });

            if(result.length<=0){
                return res.status(404).json({answer:0});
            }
           // console.log(result.admin_password);
            const dbPass = result.admin_password;
            const isMatch = await bcrypt.compare(Password,dbPass);

            if(!isMatch) {
                return res.status(401).json({answer:-1});
            }
            const account = result.admin_username=='adminadmin'?'normal':'super';
            const token = jwt.sign({id: result.admin_username},process.env.JWT_SECRET,{expiresIn:'3h'})
            return res.status(201).json({answer:1,account:account,token:token});
        
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:err});
    }
}