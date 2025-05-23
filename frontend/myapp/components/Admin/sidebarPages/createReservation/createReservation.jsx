import React, { useState, useEffect } from 'react'
import './createReservation.scss'
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaPlusCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast,Toaster } from 'sonner';

function CreateReservation() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
 // const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [doctors,setDoctors] = useState([]);
  const [errors,setErrors] = useState({});
  const [indexDay,setIndexDay] = useState(null);
  useEffect(() => {
  /*  const admin = sessionStorage.getItem('admin');
    if (admin === 'yesAdmin') {
      sessionStorage.setItem('activeMenu', 'create reservation');
    } else {
      navigate('/admin/login');
    } */

    // Fetch doctors list
    fetchDoctors();
  }, []);


  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getClinicDoctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const initialFormData = {
    name: '',
    phone: '',
    gender: '',
    age: '',
    doctorId: '',
    doctorInfo: '',
    date: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isVisible, setVisible] = useState(true);

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevData) => {
    let updatedData = { ...prevData, [name]: value };

    if (name === 'doctorId') {
      const doctor = doctors.find((doctor) => doctor.medecin_Id == Number(value));     
      if (doctor) {
        updatedData.doctorInfo = `${doctor.nomPrenom} : ${doctor.medecin_Specialite} : ${doctor.medecin_Experience}`;
      } else {
        updatedData.doctorInfo = ''; // Reset if no doctor is found
      }
    }

    return updatedData;
  });
};


    // Add maxDate calculation
    const getMaxDate = () => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7); // Add 7 days to current date
      return maxDate;
    };

  const handleDateChange = (date) => {
    if (!date) return;
    setIndexDay(date.getDay()); 
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    setSelectedDate(date);
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,  // Store the formatted string
    }));
  };

  const isValidString = (test)=>{
    const re = /^(([a-zA-Z ]+)())$/
    return re.test(String(test));
  }
  
  const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }

  const handleCancel = () => {
    setFormData(initialFormData);
    setSelectedDate(null);
    setErrors({});
    setIndexDay(null);
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();
    
    const validationErrors = {};

    if(!formData.name.trim()){
      validationErrors.name = "Patient name is required";
    }

    if(!isValidString(formData.name)) {
      validationErrors.name = 'Please put a valid full name !';
     }

     if(!isValidTelephone(formData.phone)){
      validationErrors.phone = 'Please enter a valid telephone starts with 05 or 06 or 07 !';
     }

     if(formData.gender ==='') {
      validationErrors.gender = 'Please choose a gender!';
     }
     if(formData.age ==''){
      validationErrors.age = 'Please choose the age!';
     }
     if(formData.age < 0) {
      validationErrors.age = 'Please choose a valid age!';
     } 
     if(formData.doctorId == undefined){
      validationErrors.doctor = 'Please choose a doctor for the appointement!'
     }
     if(formData.doctorId ==''){
      validationErrors.doctor = 'Please choose a doctor for the appointement!'
     }
     if(formData.doctorInfo ==''){
      validationErrors.doctor = 'Please choose a doctor for the appointement!'
     }
     
     if(formData.date == null) {
      validationErrors.date = 'Please choose a date for the appointement!'
     }
     
     if(formData.date != null && (formData.doctorId != undefined && formData.doctorId !='') ) {
      const doctor = doctors.find((doctor)=>doctor.medecin_Id == formData.doctorId);
      if(doctor.medecin_availability[indexDay]!=='1'){
       validationErrors.date = 'The doctor is not available on this day,please choose another date!';
       Swal.fire({
         icon:'warning',
         iconColor:'orange',
         title:'Doctor unavailable',
         text:`Doctor ${doctor.nomPrenom} does not work on this day`,
         showConfirmButton:false,
         timer:3500,
       })
           
      }
     }

     setErrors(validationErrors);

    if(Object.keys(validationErrors).length === 0) {
      Swal.fire({
        title: "Create Reservation",
        text: "Are you sure you want to create this reservation?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2196f3",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, create it!"
      }).then((result) => {
        if (result.isConfirmed) {
          axios.post(`${apiUrl}/addNewAppointment`, formData)
            .then((response) => {
            //  console.log(response.data.success);
              setIndexDay(null);
              Swal.fire({
                title: "Success!",
                text: "Reservation was created successfully.",
                icon: "success",
                iconColor: "green",
                showConfirmButton: false,
                timer: 3000,
              });
              setFormData(initialFormData);
              setVisible(false);
              setSelectedDate(null);
            })
            .catch((error) => {
              Swal.fire({
                icon:'error',
                title:'Oops',
                html:'<span style="color:red">Network error,operation has failed Please try again Later!</span>',
                showConfirmButton:false,
                timer:4000,
              })
            });
        }
      });
    }
  };

  return (
      <>
          <Toaster position="top-center" richColors=""/>
    <div className='reservationControllerFather'>
      
      <div className={`addReservationCard`}>
        <h2 className="formTitle">Create New Reservation</h2>
        <form onSubmit={handleCreateReservation}>
          <div className="formGroup">
            <input 
              type="text" 
              placeholder='Full Name' 
              name='name' 
              value={formData.name} 
              onChange={handleChange}
              
            />
            {errors.name && <span style={{color:'red'}}>{errors.name}</span>}
          </div>

          <div className="formGroup">
            <input 
              type="tel" 
              placeholder='Phone Number' 
              name='phone' 
              value={formData.phone} 
              onChange={handleChange}
              
            />
              {errors.phone && <span style={{color:'red'}}>{errors.phone}</span>}
          </div>

          <div className="formRow">
            <div className="formGroup">
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <span style={{color:'red'}}>{errors.gender}</span>}
            </div>

            <div className="formGroup">
              <input 
                type="number" 
                placeholder='Age' 
                name='age' 
                value={formData.age} 
                onChange={handleChange}
              />
                {errors.age && <span style={{color:'red'}}>{errors.age}</span>}
            </div>
          </div>

          <div className="formGroup">
            <select 
              name="doctorId" 
              value={formData.doctorId} 
              onChange={handleChange}
              
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.medecin_Id} value={doctor.medecin_Id}>
                  Dr. {doctor.nomPrenom} - {doctor.medecin_Specialite}
                </option>
              ))}
            </select>
            {errors.doctor && <span style={{color:'red'}}>{errors.doctor}</span>}
          </div>

          <div className="formGroup">
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              showTimeSelect={false}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select Date"
              minDate={new Date()}
              maxDate={getMaxDate()}
              className="datePicker"
              filterDate={date => date.getDay() !== 5} // Optionally exclude Sundays
            />           
          </div>
          {errors.date && <span style={{color:'red'}}>{errors.date}</span>}
          <div className="buttonContainer">
            <div className="buttonGroup">
              <button type="submit" className='createButton'>Create Reservation</button>
              <button type="button" className='cancelButton' onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
      </>
  );
}

export default CreateReservation;
