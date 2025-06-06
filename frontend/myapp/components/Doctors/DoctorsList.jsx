import React, { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorsList.scss';
import { FaUserMd, FaStar, FaGlobe, FaClock, FaCalendarCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import { MdEmail } from 'react-icons/md';
import { useAppointmentBooking } from '../../hooks/useAppointmentBooking';

function DoctorsList() {
  const navigate = useNavigate();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const {loading,error,doctors} = useAppointmentBooking();

  // ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']


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

  if(loading) {
    return ;
  }

  if(error) {
    return ;
  }

  return (
        doctors ? (
          <div className="doctors-list-container" dir='rtl'>
          <div className="doctors-header">
            <h1>{t.doctors.title}</h1>
            <p>{t.doctors.subtitle}</p>
                 {/*
                             <button className="language-toggle" onClick={toggleLanguage}>
              <FaGlobe className="icon" />
              {currentLanguage.toUpperCase()}
            </button>
                 */}
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
                  <div className="availability">
                    <h3>متوفر في</h3>
                    <ul>
                      {doctor.medecin_availability.split('').map((key,index) => (
                        
                          doctor.medecin_availability[index]==='1' ? <li key={`${key}-${days[index]}`}>{days[index]}</li> : null
                        
                      ))}
                    </ul>
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
        ) : (
          <>
                <div className="doctors-list-container">
                <div className="doctors-header">
            <h1>{t.doctors.title}</h1>
            <p>{t.doctors.subtitle}</p>
            <button className="language-toggle" onClick={toggleLanguage}>
              <FaGlobe className="icon" />
              {currentLanguage.toUpperCase()}
            </button>
          </div>
            <h1 style={{textAlign:'center'}}>{t.doctors.noData}</h1>
            </div>
          </>
        )
  );
}

export default DoctorsList;
