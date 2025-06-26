import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import './AppointmentBooking.scss';
import swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import addAmiriFont  from './myFont';
import { useAppointmentBooking } from '../../hooks/useAppointmentBooking';
import { isValidString,isValidTelephone } from '../../utils/formValidation';

function AppointmentBooking() {
  const location = useLocation();
  const navigate = useNavigate('');
  const selectedDoctorId = location.state?.doctorId;
  const selectedDoctorInfo = `${location.state?.doctorName} : ${location.state?.specialization}`;
  const {loading,error,doctors,addNewAppointement} = useAppointmentBooking();
  const [selectedDate, setSelectedDate] = useState(null);
  const [indexDay,setIndexDay] = useState(null);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  
  const [errors,setErrors] = useState({});

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
      validationErrors.name = "الرجاء وضع الاسم الكامل باللغة العربية أو اللاتينية!"
    }
 
    if(!isValidString(formData.name)){
      validationErrors.name = 'الرجاء وضع الاسم الكامل باللغة العربية أو اللاتينية!';
    }
    if(!isValidTelephone(formData.phone)){
      validationErrors.phone = 'الرجاء وضع رقم هاتف صالح!';
    }

    if(formData.doctorId ===''){
      validationErrors.doctor = 'الرجاء اختيار الطبيب للموعد!';
    }
    if(formData.doctorInfo ==''){
      validationErrors.doctor = 'الرجاء اختيار الطبيب للموعد!';
    }

    if(formData.gender === ''){
      validationErrors.gender = 'الرجاء اختيار الجنس!';
    }

    if(formData.age < 0 || formData.age =='' || formData.age > 200) {
      validationErrors.age = 'من فضلك ضع عمر!';
    }

    if(formData.date == null ) {
       validationErrors.date = 'الرجاء اختيار تاريخ للموعد!';
    }

 
     if(formData.date != null) {
      
    const doctor = doctors.find((doctor)=>doctor.medecin_Id == formData.doctorId);
    

   if(doctor.medecin_availability[indexDay]!=='1'){
    validationErrors.date = 'الطبيب غير متاح في هذا اليوم، يرجى اختيار تاريخ آخر!';
    swal.fire({
      icon:'warning',
      iconColor:'orange',
      title:'الطبيب غير متاح',
      text:`الطبيب ${doctor.nomPrenom} غير متاح في هذا اليوم!`,
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
          
            const addNewAppointementResponse = await addNewAppointement(formData);
          //  console.log(`add appointement response = `+addNewAppointementResponse);
            if(addNewAppointementResponse.status == 200) {
         
              const data = addNewAppointementResponse.data;
              setIndexDay(null);
              swal.fire({
                title: t.appointment.successTitle,
                text: t.appointment.successMessage,
                icon: 'success',
                showConfirmButton: true,
                confirmButtonText: t.appointment.downloadTicket,
                confirmButtonColor: '#2196f3',
                customClass: {
                  title: 'titleSuccess',
                },
              })
              .then((res)=>{
                if(res.isConfirmed){
              const now = new Date(Date.now());
              const reservationOnlineDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

              const doc = new jsPDF();
              addAmiriFont.call(doc);
              doc.setFont('Amiri-Bold');
              
              const pageWidth = doc.internal.pageSize.getWidth();
              const isRTL = currentLanguage === 'ar'; // true for Arabic
              
              // --- Set base X position ---
              let dataX = isRTL ? pageWidth - 15 : 15;
              
              // --- Title ---
              doc.setFontSize(24);
              const title = t.appointment.pdfTitle;
              const titleWidth = doc.getTextWidth(title);
              const titleX = isRTL ? pageWidth - ((pageWidth - titleWidth) / 2) : (pageWidth - titleWidth) / 2;
              
              doc.text(title, titleX, 20, { align: isRTL ? 'right' : 'left' });
              
              // --- Reservation info ---
              doc.setFontSize(12); // 
              doc.text(`${t.appointment.reservedOnline} `, dataX, 40, { align: isRTL ? 'right' : 'left' });
              isRTL ? doc.text(` ${reservationOnlineDate} : `, dataX-72.5, 40) : doc.text(`: ${reservationOnlineDate}`, dataX+35, 40 ) ;
              doc.text(`${t.appointment.reservationDate} `, dataX, 50, { align: isRTL ? 'right' : 'left' });
              isRTL ? doc.text(` ${formData.date} : `, dataX-45, 50) : doc.text(`: ${formData.date}`, dataX+33, 50 ) ;
              // --- Reservation ID ---
              doc.setFontSize(18);
              doc.text(`${t.appointment.reservationId} : ${data.reservationNbr}`, dataX, 75, { align: isRTL ? 'right' : 'left' });
              
              // --- Patient + doctor info ---
              doc.setFontSize(15);
              doc.setTextColor(0, 0, 0);
              doc.text(`${t.appointment.patient} : ${formData.name}`, dataX, 90, { align: isRTL ? 'right' : 'left' });
              doc.text(`${t.appointment.doctor} : ${formData.doctorInfo}`, dataX, 100, { align: isRTL ? 'right' : 'left' });
              doc.text(`${t.appointment.telephone} : ${formData.phone}`, dataX, 110, { align: isRTL ? 'right' : 'left' });
              doc.text(`${t.appointment.gender} : ${t.appointment[formData.gender]}`, dataX, 120, { align: isRTL ? 'right' : 'left' });
              doc.text(`${t.appointment.age} : ${formData.age}`, dataX, 130, { align: isRTL ? 'right' : 'left' });
              
              // --- Footer ---
              doc.setFontSize(13);
              doc.setTextColor(102, 102, 102);
              const footerX = isRTL ? 50 : pageWidth - 60;
              doc.text(t.appointment.clinicTeam, footerX, 150, { align: isRTL ? 'right' : 'left' });
              
              // --- Border ---
              doc.setDrawColor('black');
              doc.setLineWidth(0.5);
              doc.rect(10, 10, pageWidth - 20, 280);
              
              // --- Save file ---
              doc.save(`reservation-ticket-${data.reservationNbr}.pdf`);
              
                  navigate('/');// the hole world is talking about this 
                }
                else {
                  navigate('/doctors');
                }
              })
            }

            if(addNewAppointementResponse.code =='ERR_NETWORK'){
          //    swal.fire(`${t.admin.alerts.operationFailed}`,`${t.admin.stations.errorNetwork}`,'error');
              swal.fire(`Operation failed`,`Failed becuase of a network error`,'error');
            }
       else if(addNewAppointementResponse.code =='ERR_BAD_REQUEST'){
        swal.fire(`Operation Failed`,`Failed because of a bad request `,'error');
       
      }
        }
      })
    }

  };

  if(loading) {
    return //;
  }

  if(error) {
    return // ;
  }

  return (
    <div className="appointment-booking" dir='rtl'>
      <div className="booking-container">
        <div className="header-with-language">
          <h1>حجز موعد</h1>
          {/*
                    <button className="language-toggle" onClick={toggleLanguage}>
            <FaGlobe className="icon" />
            {currentLanguage.toUpperCase()}
          </button>
          */}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">الاسم الكامل</label>
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
            <label htmlFor="phone">رقم الهاتف</label>
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
            <label htmlFor="doctorId">اختر الطبيب</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              
            >
              <option value="">اختر الطبيب</option>
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
            <label htmlFor="gender">الجنس</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              
            >
              <option value="">اختر الجنس</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            {errors.gender && <span style={{color:'red'}}>{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">العمر</label>
            <input

              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              
            />
            {errors.age && <span style={{color:'red'}}>{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date">التاريخ المفضل</label>

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
             // filterDate={date => date.getDay() /*!== 5 */} // Optionally exclude Sundays
            />   
          </div>
          {errors.date && <span style={{color:'red'}}>{errors.date}</span>}
          <button type="submit" className="submit-btn">
          حجز موعد
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;
