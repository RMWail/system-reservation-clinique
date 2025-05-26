
import {useQuery,useMutation,useQueryClient,} from '@tanstack/react-query'
import { AppointmentBookingService } from "../services/appointmentBookingService";


export const useAppointmentBooking = ()=>{

    const queryClient = useQueryClient();

    const {data,isLoading,isError} = useQuery({
        queryKey: ['doctors'],
        queryFn: async ()=>{
            const response = await AppointmentBookingService.getClinicDoctors();

            if(response.status !==200){
                throw new Error(response.message || "Error fetching doctors");
            }
          //  console.log('data in hook',response.data);
            return response.data;
        },
        staleTime: Infinity,
    })


    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const addAppointementMutation = useMutation({
        mutationKey: ['appointments'],
        mutationFn: async(newAppointement) => {
            return await AppointmentBookingService.addNewAppointement(newAppointement);
        },
        onSuccess: (response, newAppointement) => {
            if(response.status ==200) {
               
            }
        }
    })




    return {
        doctors: data || [],
        loading: isLoading,
        error: isError,
        addNewAppointement: addAppointementMutation.mutateAsync,
        
    }


}