import React, { useState, useEffect } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';
import './AppointmentBooking.scss';
import axios from 'axios';
import swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { FaGlobe } from 'react-icons/fa';

function AppointmentBooking() {
  const location = useLocation();
  const navigate = useNavigate('');
  const selectedDoctorId = location.state?.doctorId;
  const apiUrl = import.meta.env.VITE_API_URL;
  const [doctors,setDoctors] = useState([]);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  console.log(selectedDoctorId);

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
    date: '',
    age: 0,
    doctorId: selectedDoctorId || '',
  //  reason: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
                doc.text(`${t.appointment.reservationId}: ${data.reservationId}`, 20, 75);
    
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
    
                doc.save(`reservation-ticket-${data.reservationId}.pdf`);
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
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t.appointment.phoneNumber}</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="doctorId">{t.appointment.selectDoctor}</label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.medecin_Id}>
                  {doctor.nomPrenom} - {doctor.medecin_Specialite}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="gender">{t.appointment.gender}</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">{t.appointment.selectGender}</option>
              <option value="male">{t.appointment.male}</option>
              <option value="female">{t.appointment.female}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">{t.appointment.age}</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">{t.appointment.date}</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            {t.appointment.bookAppointment}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBooking;
