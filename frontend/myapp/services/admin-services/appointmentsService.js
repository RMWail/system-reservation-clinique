import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;


export const appointmentsService = {
      
    getAppointments: async ()=>{
         try {
            const response = axios.get(`${apiUrl}/getAppointments`);
            return response;
         }
         catch(err){
            return err;
         }

    },

    appointmentAction: async (appointmentId,status)=>{
      try {
      
           const response = axios.post(`${apiUrl}/appointementAction`,{ appointmentId, status});
           return response;
      }
       catch (err){
          return err;
       }
    }
}