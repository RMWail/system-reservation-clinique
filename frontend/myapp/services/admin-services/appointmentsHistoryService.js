import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;



export const appointmentsHistoryService = {


    getAppointmentsHistory: async ()=> {

        try {

            const response = await axios.get(`${apiUrl}/getAppointmentsHistory`);
            return response;
        }
        catch(err){
            return err;
        }
    },


    
}