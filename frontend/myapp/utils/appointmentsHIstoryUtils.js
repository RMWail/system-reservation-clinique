
export const getStatusClass = (status) => {
    switch (status) {
      case 1: return 'status-confirmed';
      case 0: return 'status-pending';
      case -1: return 'status-cancelled';
      default: return '';
    }
  };

export const getGenderClass = (gender) => {
    switch (gender) {
        case 0 : return 'status-male';
        case 1 : return 'status-female';
       default : return '';
    }
  }

export const getDoctorInfo = (appointment)=>{

      return `${appointment.split(':')[0]} : ${appointment.split(':')[1]}`;
    
  }