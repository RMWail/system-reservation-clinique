import { Sequelize,DataTypes } from "sequelize";
import database from "../config/database.js";



const Reservation = database.define("reservations",{

    reservation_Id : {
      type:DataTypes.STRING(36),
      primaryKey:true,
      allowNull:false,
     // defaultValue:DataTypes.UUIDV4
    },

    reservation_order : {
    type:DataTypes.INTEGER,
    autoIncrement:true,
    allowNull:false,
    },

    patient_NomPrenom : {
    type:DataTypes.STRING(70),
    allowNull:false,
    },

    patient_Telephone : {
    type:DataTypes.STRING(11),
    allowNull:false,
    }, 

    patient_Genre : {
    type: DataTypes.TINYINT,
    allowNull: false,
    },

    patient_Age : {
     type: DataTypes.INTEGER,
     allowNull:false,
    },
    medecin_Id : {
       type:DataTypes.STRING(36),
       allowNull:false,
    },
    medecin_Nom_Speciality: {
     type:DataTypes.STRING, // means DataTypes.STRING(255)
     allowNull:false,
    },
    reservation_Date : {
     type:DataTypes.STRING(20),
     allowNull:false,
    },
    reservation_Etat : {
     type:DataTypes.TINYINT,
     allowNull:false,
     defaultValue:0,
    },
    reservation_FinDate : {
     type:DataTypes.STRING(20),
     allowNull:true,
    } , 
        tableName:'reservations',
        freezeTableName:true,
        timestamps:false,
})

module.exports = Reservation ;