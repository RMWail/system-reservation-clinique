
export const getStatusColor = (status) => {
    //  console.log('status = '+status);
      switch (status) {
        case 'confirmed': return 'status-confirmed';
        case 'pending': return 'status-pending';
        case 'cancelled': return 'status-cancelled';
        default: return '';
      }
    };
  
export const getGenderColor = (gender) => {
   // console.log('gender = '+gender);
     switch (gender) {
      case 0: return 'status-male';
      case 1 : return 'status-female';
      default: return '';
     }
   }

export const getDoctorInfo = (appointment,value)=>{
    if(value==0){
      return appointment.split(':')[0];
    } 
    else {
      return `${appointment.split(':')[0]} : ${appointment.split(':')[1]}`;
    }
  }   