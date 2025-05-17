import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import './AppointmentBooking.scss';
import axios from 'axios';
import swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { FaGlobe } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function AppointmentBooking() {
  const location = useLocation();
  const navigate = useNavigate('');
  const selectedDoctorId = location.state?.doctorId;
  const selectedDoctorInfo = `${location.state?.doctorName} : ${location.state?.specialization}`;
  const apiUrl = import.meta.env.VITE_API_URL;
  const [doctors,setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [indexDay,setIndexDay] = useState(null);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  console.log("Dr Info = "+selectedDoctorInfo);
  const [errors,setErrors] = useState({});

  useEffect(()=>{

    fetchDoctors();
    
  },[]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getClinicDoctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    date: null,
    age: '',
    doctorId: selectedDoctorId || '',
    doctorInfo: selectedDoctorInfo || '',
  //  reason: ''
  });

  const isValidString = (test)=>{
    const re = /^(([a-zA-Z ]+)())$/
    return re.test(String(test));
  }
  
  const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }


  const handleInputChange = (e) => {
    
    const { name, value } = e.target;
  
    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: value };
  
      if (name == 'doctorId') {
        
        const doctor = doctors.find((doctor) => doctor.medecin_Id ==  Number(value));     

        if (doctor) {
          updatedData.doctorInfo = `${doctor.nomPrenom} : ${doctor.medecin_Specialite} : ${doctor.medecin_Experience}`;
        } else {
          updatedData.doctorInfo = ''; // Reset if no doctor is found
        }
      }
  
      return updatedData;
    });
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7); // Add 7 days to current date
    return maxDate;
  };

  const handleDateChange = (date) => {
    if (!date) return;
   setIndexDay(date.getDay()); 
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
   // console.log("Formatted Date:", formattedDate);
    
    setSelectedDate(date);
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,  // Store the formatted string
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};

    if(!formData.name.trim()){
      validationErrors.name = "Please enter your name !"
    }
 
    if(!isValidString(formData.name)){
      validationErrors.name = 'Please put a valid full name!';
    }
    if(!isValidTelephone(formData.phone)){
      validationErrors.phone = 'Please put a valid telephone!';
    }

    if(formData.doctorId ===''){
      validationErrors.doctor = 'Please choose a doctor for the appointement!';
    }
    if(formData.doctorInfo ==''){
      validationErrors.doctor = 'Please choose a doctor for the appintement!';
    }

    if(formData.gender === ''){
      validationErrors.gender = 'Please choose your gender!';
    }

    if(formData.age < 0 || formData.age =='' || formData.age > 200) {
      validationErrors.age = 'Please put a valid age!';
    }

    if(formData.date == null ) {
       validationErrors.date = 'Please choose a date for the appointement!';
    }

 
     if(formData.date != null) {
      
    const doctor = doctors.find((doctor)=>doctor.medecin_Id == formData.doctorId);
    

   if(doctor.medecin_availability[indexDay]!=='1'){
    validationErrors.date = 'The doctor is not available on this day,please choose another date!';
    swal.fire({
      icon:'warning',
      iconColor:'orange',
      title:'Doctor unavailable',
      text:`Doctor ${doctor.nomPrenom} does not work on this day!`,
      showConfirmButton:false,
      timer:3500,
    })
   }
     }



    setErrors(validationErrors);
     
    if(Object.keys(validationErrors).length ===0 ) {
      swal.fire({
        title: t.appointment.confirmTitle,
        text: t.appointment.confirmText,
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: t.appointment.cancel,
        confirmButtonText: t.appointment.confirm,
        confirmButtonColor: '#2196f3',
        customClass: {
          title: 'alertOrderTitle',
          icon: 'alertOrderIcon',
          cancelButton: 'alertOrderCancelButton',
        }
      })
      .then(async(res)=>{
        if(res.isConfirmed){
          try {
            await axios.post(`${apiUrl}/addNewAppointment`,formData)
            .then((res)=>{
              console.log(res.data);
              const data = res.data;
              setIndexDay(null);
              swal.fire({
                title: t.appointment.successTitle,
                text: t.appointment.successMessage,
                icon: 'success',
                showConfirmButton: true,
                confirmButtonText: t.appointment.downloadTicket,
              })
              .then((res)=>{
                if(res.isConfirmed){
              const now = new Date(Date.now());
              const reservationDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                  const doc = new jsPDF();
      
                  // Page Title
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(24);
                  const title = t.appointment.pdfTitle;
                  const pageWidth = doc.internal.pageSize.getWidth();
                  const titleWidth = doc.getTextWidth(title);
                  const titleX = (pageWidth - titleWidth) / 2;
                  doc.text(title, titleX, 20);
      
                  // Reservation Date
                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'normal');
                  doc.text(`${t.appointment.reservedOnline} : ${reservationDate}`, 15, 40);
                  doc.text(`${t.appointment.reservationDate}: ${formData.date}`, 15, 50);
      
                  // Reservation ID Section with a Box
                  doc.setFontSize(16);
                  doc.setTextColor(0, 102, 204);
                  doc.setFillColor(240, 240, 240);
                  doc.rect(15, 60, 180, 25, 'F');
                  doc.text(`${t.appointment.reservationId}${data.reservationNbr}`, 20, 75);
      
                  // Patient and Doctor Information
                  doc.setFontSize(12);
                  doc.setTextColor(0, 0, 0);
                  doc.text(`${t.appointment.patient}: ${data.clientName}`, 15, 90);
                  doc.text(`${t.appointment.doctor}: ${data.doctorFullName}`, 15, 100);
                  doc.text(`${t.appointment.telephone}: ${data.phoneNumber}`, 15, 110);
                  doc.text(`${t.appointment.gender}: ${data.gender}`, 15, 120);
                  doc.text(`${t.appointment.age}: ${data.age}`, 15, 130);
      
                  // Footer Information
                  doc.setFontSize(11);
                  doc.setTextColor(102, 102, 102);
                  doc.text(t.appointment.clinicTeam, 160, 180);
      
                  // Adding a border
                  doc.setDrawColor('black');
                  doc.setLineWidth(0.5);
                  doc.rect(10, 10, pageWidth - 20, 280);
      
                  doc.save(`reservation-ticket-${data.reservationNbr}.pdf`);
                  navigate('/');
                }
                else {
                  navigate('/doctors');
                }
              })
            })
            .catch((err)=>{
              console.log(err);
            })
          } catch (error) {
            console.error('Error booking appointment:', error);
            alert('Error booking appointment. Please try again.');
          }
        }
      })
    }

  };

  return (
    <div className="appointment-booking">
      <div className="booking-container">
        <div className="header-with-language">
          <h1>{t.appointment.title}</h1>
          <button className="language-toggle" onClick={toggleLanguage}>
            <FaGlobe className="icon" />
            {currentLanguage.toUpperCase()}
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t.appointment.fullName}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              
            />
            {errors.name && <span style={{color:'red'}}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t.appointment.phoneNumber}</label>
            <input
              type="tel"
              placeholder='05 - 06 - 07'
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              
            />
            {errors.phone && <span style={{color:'red'}}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="doctorId">{t.appointment.selectDoctor}</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              
            >
              <option value="">Select a doctor</option>
              <option></option>
              {doctors.map(doctor => (
                <option key={doctor.medecin_Id} value={doctor.medecin_Id}>
                  {doctor.nomPrenom} - {doctor.medecin_Specialite}
                </option>
              ))}
            </select>
            {errors.doctor && <span style={{color:'red'}}>{errors.doctor}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">{t.appointment.gender}</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              
            >
              <option value="">{t.appointment.selectGender}</option>
              <option value="male">{t.appointment.male}</option>
              <option value="female">{t.appointment.female}</option>
            </select>
            {errors.gender && <span style={{color:'red'}}>{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">{t.appointment.age}</label>
            <input

              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              
            />
            {errors.age && <span style={{color:'red'}}>{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">{t.appointment.date}</label>

       <DatePicker
              defaultValue={null}
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
          <button type="submit" className="submit-btn">
            {t.appointment.bookAppointment}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;
