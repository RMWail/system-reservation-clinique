// this is where to put my crud logic

//import Reservation from "../models/reservation.model.js";
import sequelize from "../config/database.js";

export const createReservation = async (req,res)=> {
    try {
        const patientName = req.body.name;
        const patientPhone = req.body.phone;
        const PatientGender = req.body.gender;
        const patientAge = req.body.age;
        const doctorInfo = req.body.doctorInfo;
        const reservationDate = req.body.date;
        const doctorId = req.body.doctorId;

       await sequelize.query('CALL CALL addNewReservation(?,?,?,?,?,?,?)', {
        replacements: [patientName,patientPhone,genderToDb,patientAge,doctorInfo,reservationDate,doctorId],
       }
       );

       const lastInsertId = resutl[0][0]?.reservation_Id;
       const nbr_reservation = resutl[1][0]?.nbr_reservation;
       const reserv_Order = resutl[2][0]?.reserv_Order;
       console.log('reservation was made successfully');
       req.io.emit('newReservationAdded',{
        reservation_Id:lastInsertId,
        reserv_Order:reserv_Order,
        patient_NomPrenom:patientName,
        patient_Telephone:patientPhone,
        patient_Genre:PatientGender =='male' ? 0 : 1,
        patient_Age:patientAge,
        medecin_Nom_Speciality:doctorInfo,
        reservation_Date:reservationDate,
        reservation_Etat:0 });
        
      return res.status(200).json({reservationNbr:nbr_reservation});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:'Server error'+err});
    }
}