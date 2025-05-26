import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;


export const statisticsService = {

    getStatistics: async()=>{
        try {

            const response = await axios.get(`${apiUrl}/reservationsStats`);
         //   console.log("data = "+response.data);
            return response;
        }
         catch(err){
            return err;
         }
    }

}