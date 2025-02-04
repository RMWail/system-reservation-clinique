import React, {useRef, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgetPassword.scss';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast,Toaster } from 'sonner';
function ForgetPassword() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const emailRef = useRef(null);
  const [email,setEmail] = useState('');
  const navigate = useNavigate('');


  const setError=(element,message)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    errorDisplay.style.fontSize = '15px';
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
   }
 
   const setSuccess=(element)=>{
     const inputControl = element.parentElement;
     const errorDisplay = inputControl.querySelector('.error'); 
     if(errorDisplay){
       errorDisplay.innerText='';
     }
     inputControl.classList.remove('error');
     inputControl.classList.add('success');
    }

    const isValidEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }


    const checkingEmailAccount = async (email)=>{
      await axios.post(`${apiUrl}/checkEmail`,{email:email})
      .then((response)=>{
       console.log(`response = ${response.data.answer}`)
       if(response.data.answer=='no'){
        toast.warning('Please put your registration email',{
          style: {
            color: 'red',
            fontWeight: 'bold',
          },
        })
         setError(emailRef.current,("Wrong email"))
            return -1;
       }
       else if(response.data.answer=='yes'){
         setSuccess(emailRef.current);
         return 1;
       }
         
      })
      .catch((err)=>{
       console.log("Error = "+err);
       return -1;
      })
    }

    const handleSubmit = async (e) =>{
     e.preventDefault();
     if(isValidEmail(email)){

      if(checkingEmailAccount(email)!=-1){
      
        await axios.post(`${apiUrl}/sendResetLinkToGmail`,{email:email})
        .then((response)=>{
          console.log(response.data.answer);
          if(response.data.answer=='Success'){
            Swal.fire({
              position: "top",
              icon: "success",
              title: "Success",
              text: "A reset password link was sent to your Gmail account",
              showConfirmButton: false,
              timer: 4500,
              width: '400px',
              customClass: {
                popup: 'custom-swal-popup-success',
                title: 'custom-swal-title-success',
              },
              background: 'white', // Light green background for success
            });
            
           }
          else if(response.data.answer=='exist'){
         /*   toast.warning('You already have a valid password reset link in your Gmail account',{
              style: {
                color: 'orange',
                fontWeight: 'bold',
              },
            }) */
              Swal.fire({
                position: "top",
                icon: "warning",
                iconColor:"red",
                title: `<h3 style="color: red; font-size: 18px; font-weight: bold; margin-bottom: 10px;">Warning</h3>`,
                html: `<p style="color: #FFA500; font-size: 16px; font-weight: 800; line-height: 1.5;">A valid password reset link has already been sent to your Gmail account. You can only request one reset link per day. Please check your email to proceed 
.</p>`, //
                showConfirmButton: false,
                timer: 6500,
                width: "400px",
               
            });
            
          } 
           else {
            Swal.fire({
              position: "top",
              icon: "error",
              title: "Error",
              text: "Error occurred during sending email. Please try again.",
              showConfirmButton: false,
              timer: 4500,
              width: '400px',
              customClass: {
                popup: 'custom-swal-popup-error',
                title: 'custom-swal-title-error',
              },
              background: '#ffe6e6', // Light red background for error
            });
           }
        })
        .catch((err)=>{
          console.log(err);
          Swal.fire({
            position: "top",
            icon: "warning",
            title: "Warning",
            text: "An error occurred. Please try again later.",
            showConfirmButton: false,
            timer: 4500,
            width: '400px',
            customClass: {
              popup: 'custom-swal-popup-warning',
              title: 'custom-swal-title-warning',
            },
            background: '#fff5e6', // Light orange background for warning
          });
        })
      
      }
      else {
        setError(emailRef.current,("There was error during checking your Gmail account"));
      }

     }
     else {
      setError(emailRef.current,("Invalid Email"));
     }
    }



  return (
     <>
         <Toaster position="top-center" richColors=""/>
    <div className='FatherLogin'>
           <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="customerName" style={{color:'orangered'}}>Your Email Account</label>
        <input type="text" placeholder='Enter Your Email'value={email} onChange={(e)=>{setEmail(e.target.value);
         // console.log(email);
        }}ref={emailRef}/>
        <div className="error"></div>
        </div>

        <div className="input-group">
      <button className='confirmButton' onClick={handleSubmit}>Send</button>
     </div>

        </form>
    </div>
     </>
  )
}

export default ForgetPassword
