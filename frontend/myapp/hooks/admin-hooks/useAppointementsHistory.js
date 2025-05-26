import {useQuery,useMutation,useQueryClient,} from '@tanstack/react-query';
import {appointmentsHistoryService} from '../../services/admin-services/appointmentsHistoryService';



export const useAppointementHistory = ()=> {

    const queryClient = useQueryClient();

const {data,isLoading,isError} = useQuery({
    queryKey:['allAppointments'],
    queryFn: async ()=>{

        const response = await appointmentsHistoryService.getAppointmentsHistory();
        if(response.status !==200){
            throw new Error(response.message || "Error fetching doctors");
        }
        console.log('fetch data in appointemnts history');
        return response.data;

    },
    staleTime:Infinity,
})

return {
    reservations: data || [],
    loading:isLoading,
    error:isError,
   
}

}