import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorsList.scss';
import { FaUserMd, FaStar, FaGlobe, FaClock, FaCalendarCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import axios from 'axios';
import { MdEmail } from 'react-icons/md';
function DoctorsList() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [doctors,setDoctors] = useState([]);

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

 /*
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: t.doctors.specializations.cardiologist,
      experience: "15",
      rating: 4.9,
      reviews: 128,
      location: "Medical Center, Floor 3",
      nextAvailable: "Today",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: t.doctors.specializations.pediatrician,
      experience: "12",
      rating: 4.8,
      reviews: 96,
      location: "Children's Wing, Floor 2",
      nextAvailable: "Tomorrow",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialization: t.doctors.specializations.dermatologist,
      experience: "10",
      rating: 4.7,
      reviews: 84,
      location: "Dermatology Clinic, Floor 1",
      nextAvailable: "Today",
    }
  ]; */

  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    navigate('/AppointmentBooking', {
      state: {
        doctorId: doctor.medecin_Id,
        doctorName: doctor.nomPrenom,
        specialization: doctor.medecin_Specialite,
      }
    });
  };

  return (
    <div className="doctors-list-container">
      <div className="doctors-header">
        <h1>{t.doctors.title}</h1>
        <p>{t.doctors.subtitle}</p>
        <button className="language-toggle" onClick={toggleLanguage}>
          <FaGlobe className="icon" />
          {currentLanguage.toUpperCase()}
        </button>
      </div>

      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div 
            key={doctor.medecin_Id} 
            className="doctor-card"
            onClick={() => handleDoctorClick(doctor)}
          >
            <div className="doctor-card-header">
              <div className="doctor-icon">
                <FaUserMd />
              </div>
              <div className="doctor-badge">
                {doctor.medecin_Specialite}
              </div>
            </div>

            <div className="doctor-card-body">
              <h2>{doctor.nomPrenom}</h2>
              
              <div className="doctor-stats">
                <div className="stat">
                  <FaClock className="icon" />
                  <span>{doctor.medecin_Experience} {t.doctors.experience}</span>
                </div>
           {/*
                           <div className="stat rating">
                  <FaStar className="icon star" />
                  <span>{doctor.rating}</span>
                  <span className="reviews">({doctor.reviews} {t.doctors.reviews})</span>
                </div>
           */}
              </div>

              <div className="doctor-location">
                <MdEmail className="icon" />
                <span>{doctor.medecin_Email}</span>
              </div>

              <div className="doctor-availability">
                <div className="next-available">
                  <FaCalendarCheck className="icon" />
                  <span>{doctor.nextAvailable}</span>
                </div>
              </div>

              <button className="book-appointment-btn">
                {t.nav.book}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsList;
