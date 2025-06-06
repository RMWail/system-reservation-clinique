import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../../services/admin-services/statisticsService";



export const useStatistics = ()=> {
  
    const {data,isLoading,isError} = useQuery({
        queryKey:[`statistics`],
        queryFn: async()=>{

            const response = await statisticsService.getStatistics();
            if(response.status != 200) {
                throw new Error(response.message || 'Error during fetching statistics');
            }
            console.log(response.data);
            return response.data;
           
        },
        staleTime:Infinity,
    })

    return {
        statistics:data,
     //   generalStats:data.genralStats,
     //   monthlyStats:data.monthsDetailsStats,
        loading:isLoading,
        error:isError,
    }
}