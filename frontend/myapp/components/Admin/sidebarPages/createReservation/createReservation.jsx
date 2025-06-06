import React, { useState, useEffect } from 'react'
import './createReservation.scss'
import Swal from 'sweetalert2';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast,Toaster } from 'sonner';
import { isValidString,isValidTelephone } from '../../../../utils/formValidation';
import { useAppointmentBooking } from '../../../../hooks/useAppointmentBooking';
import LoadingData from '../../../loadingData/LoadingData';
import LoadingError from '../../../loadingError/LoadingError';


function CreateReservation() {
  const {loading,error,doctors,addNewAppointement} = useAppointmentBooking();
    const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [selectedDate, setSelectedDate] = useState(null);


  const [errors,setErrors] = useState({});
  const [indexDay,setIndexDay] = useState(null);

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
      const doctor = doctors.find((doctor) => doctor.medecin_Id == String(value));     
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
      validationErrors.name = "Le nom du patient est requis!";
    }

    if(!isValidString(formData.name)) {
      validationErrors.name = 'Veuillez indiquer un nom complet valide !';
     }

     if(!isValidTelephone(formData.phone)){
      validationErrors.phone = 'Veuillez entrer un numéro de téléphone valide !';
     }

     if(formData.gender =='') {
      validationErrors.gender = 'Veuillez choisir un sexe !';
     }
     if(formData.age ==''){
      validationErrors.age = 'Veuillez choisir l\'age !';
     }
     if(formData.age < 0) {
      validationErrors.age = 'Veuillez choisir l\'age !';
     } 

     if(formData.doctorId == undefined){
      console.log("yes1");
      validationErrors.doctor = 'Veuillez choisir un médecin pour le rendez-vous!'
     }
     if(formData.doctorId ==''){
      console.log("yes2");
      validationErrors.doctor = 'Veuillez choisir un médecin pour le rendez-vous!'
     }
     if(formData.doctorInfo ==''){
      console.log("yes3");
      validationErrors.doctor = 'Veuillez choisir un médecin pour le rendez-vous!'
     }
     
     if(formData.date == null) {
      validationErrors.date = 'Veuillez choisir une date pour le rendez-vous!'
     }
     
     if(formData.date != null && (formData.doctorId != undefined && formData.doctorId !='') ) {
      const doctor = doctors.find((doctor)=>doctor.medecin_Id == formData.doctorId);
   if(doctor.medecin_availability[indexDay]!=='1'){
    validationErrors.date = 'Le médecin n\'est pas disponible ce jour-là, veuillez choisir une autre date !';
    Swal.fire({
      icon:'warning',
      iconColor:'orange',
      title:'Le médecin n\'est pas disponible ce jour-là',
      text:`Le médecin ${doctor.nomPrenom} n\'est pas disponible ce jour-là!`,
      showConfirmButton:false,
      timer:3500,
    })
   }
     }

     setErrors(validationErrors);

    if(Object.keys(validationErrors).length === 0) {
      Swal.fire({
        title: "Créer une réservation",
        text: "Êtes-vous sûr de vouloir créer cette réservation?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2196f3",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, créer!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const addNewAppointementResponse = await addNewAppointement(formData);
          //  console.log(`add appointement response = `+addNewAppointementResponse);
            if(addNewAppointementResponse.status == 200) {

              Swal.fire({
                title: `Succès!`,
                text: `Vous avez réservé un rendez-vous avec succès!`,
                icon: 'success',
                iconColor:"green",
                showConfirmButton:false,
                timer:3500,
              })

              setFormData(initialFormData);
              setVisible(false);
             setSelectedDate(null);              
            }

             if(addNewAppointementResponse.code =='ERR_NETWORK'){
                //    swal.fire(`${t.admin.alerts.operationFailed}`,`${t.admin.stations.errorNetwork}`,'error');
                Swal.fire(`Oops`,`Network error,operation has failed Please try again Later!`,'error');
               }
            else if(addNewAppointementResponse.code =='ERR_BAD_REQUEST'){
                    Swal.fire(`Oops`,`Failed because of a bad request `,'error');
                  }
        }
      });
    }
  };

  if(loading) {
   return (
    <LoadingData />
   );
  }

  if(error) {
    return (
      <LoadingError />
    );
  }

  return (
      <>
          <Toaster position="top-center" richColors=""/>
    <div className='reservationControllerFather' dir='ltr'>
      
      <div className={`addReservationCard`}>
        <h2 className="formTitle">Créer une nouvelle réservation</h2>
        <form onSubmit={handleCreateReservation}>
          <div className="formGroup">
            <input 
              type="text" 
              placeholder='Nom et Prénom' 
              name='name' 
              value={formData.name} 
              onChange={handleChange}
              
            />
            {errors.name && <span style={{color:'red'}}>{errors.name}</span>}
          </div>

          <div className="formGroup">
            <input 
              type="tel" 
              placeholder='Télephone' 
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
                <option value="">Choisir le genre</option>
                <option value="male">Homme</option>
                <option value="female">Famme</option>
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
              <option value="">Choisir un médecin</option>
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
              placeholderText="Choisir la date"
              minDate={new Date()}
              maxDate={getMaxDate()}
              className="datePicker"
              filterDate={date => date.getDay() !== 5} // Optionally exclude Sundays
            />           
          </div>
          {errors.date && <span style={{color:'red'}}>{errors.date}</span>}
          <div className="buttonContainer">
            <div className="buttonGroup">
              <button type="submit" className='createButton'>Créer </button>
              <button type="button" className='cancelButton' onClick={handleCancel}>Annulé</button>
            </div>
          </div>
        </form>
      </div>
    </div>
      </>
  );
}

export default CreateReservation;
