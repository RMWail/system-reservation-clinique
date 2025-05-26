

// I'm here validating the users name where it should be in ar or latin letters
export const  isValidString = (test) => {
    if (!test || typeof test !== 'string') return false;
  
    const firstChar = test.trim().charAt(0);
  
    const arabicRegex = /^[\p{Script=Arabic} ]+$/u;
    const latinRegex = /^[a-zA-Z ]+$/;
  
    if (/[\p{Script=Arabic}]/u.test(firstChar)) {
      return arabicRegex.test(test);
    } else if (/[a-zA-Z]/.test(firstChar)) {
      return latinRegex.test(test);
    }
  
    return false;
  };
  
  export const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }

 export const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }