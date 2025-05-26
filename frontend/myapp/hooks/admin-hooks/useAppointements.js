import {useQuery,useMutation,useQueryClient,} from '@tanstack/react-query'
import { appointmentsService } from "../../services/admin-services/appointmentsService";


export const useAppointments = ()=> {

 const queryClient = useQueryClient();


 const {data,isLoading,isError} = useQuery({
    queryKey: ['appointments'],

    queryFn: async()=>{

        const response = await appointmentsService.getAppointments();

        if(response.status != 200) {
            throw new Error(response.message || 'Error during fetching appointements');
        }
        return response.data;
       
    },
    staleTime:Infinity,  
 })

 const updateAppointementMutation = useMutation({
    mutationFn: async({appointmentId,status})=>{
        return await appointmentsService.appointmentAction(appointmentId,status);
        
    },
    onSuccess: (response)=>{

        if(response.status == 200){
          //  queryClient.invalidateQueries(['appointments']);

            queryClient.setQueryData(['appointments'],(oldAppointments)=>{
                if (!oldAppointments) return []; 
                
                return oldAppointments.map(appointement=>
                    appointement.reservation_Id == response.data.appoitementId ? {...appointement,reservation_Etat:response.data.newStatus}:appointement
                )
            })
        }
    }
 })


 return {
    appointments: data || [],
    loading:isLoading,
    error:isError,
    updateAppointementStatus:updateAppointementMutation.mutateAsync,
 }

}