import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;


export const AppointmentBookingService = {

    getClinicDoctors: async()=>{
        try {
                  
        const response = await axios.get(`${apiUrl}/getClinicDoctors`);
        return response; 
        }
        catch(err){
            return err;
        }
    },


    addNewAppointement: async(Appointement)=> {
        try {
          
            const response = await axios.post(`${apiUrl}/addNewAppointment`,Appointement);
            return response ;
        }
        catch(err){
            return err;
        }
    }



};

