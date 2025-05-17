import React, { useState,useEffect } from 'react';
import './DoctorsManagement.scss';
import axios from 'axios';
import swal from 'sweetalert2';
function DoctorsManagement() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const days = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const specialityOptions = ['Gynecology and Obstetrics','Pediatrics','Ophthalmology','Internal Medicine','Cardiology','Urology','Gastroenterology',
    'Orthopedic Surgery','Neurology','Dermatology','Neurosurgery','Otorhinolaryngology (ENT)','Rheumatology','Oncology','Anesthesiology'];
  const [doctors,setDoctors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal,setShowEditModal] = useState(false);
  const [errors,setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chosenDoctor, setChosenDoctor] = useState({
    medecin_Id : "",
    nomPrenom: '',
    medecin_Genre: '',
    medecin_Telephone: '',
    medecin_Email: '',
    medecin_Specialite: '',
    medecin_Experience:0,
    medecin_availability: '',
  });

  useEffect(()=>{
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${apiUrl}/getClinicDoctors`);
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors()
  },[]);


 

  const isValidString = (test)=>{
    const re = /^(([a-zA-Z ]+)())$/
    return re.test(String(test));
  }

  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }


  


  const [newDoctor, setNewDoctor] = useState({
    nomPrenom: '',
    medecin_Genre:'',
    medecin_Specialite: '',
    medecin_Experience: 0,
    medecin_availability:'0000000',
    medecin_Email: '',
    medecin_Telephone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleModifyInput = (e) => {
    const {name ,value} = e.target;
    setChosenDoctor(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvailabilityChange = (day,index) => {
    
    setNewDoctor(prev => ({
      ...prev,
        medecin_availability:(previous => {
          let newAvailabilityString = previous.split('');  // Convert string to array
          newAvailabilityString[index] = newAvailabilityString[index] === '1' ? '0' : '1'; // Toggle between '1' and '0'
          return  newAvailabilityString.join('');  // Convert array back to string
        })(prev.medecin_availability),
    }));
  };

  const handleModifyAvailabilityChange = (day,index) => {
    setChosenDoctor(prev => ({
      ...prev,
        medecin_availability:(previous => {
          let newAvailabilityString = previous.split('');  // Convert string to array
          newAvailabilityString[index] = newAvailabilityString[index] === '1' ? '0' : '1'; // Toggle between '1' and '0'
          return  newAvailabilityString.join('');  // Convert array back to string
        })(prev.medecin_availability),
    }));
  }


  const handleAddDoctor = (e) => {
    e.preventDefault();

    const validationErrors = {};
    if(!newDoctor.nomPrenom.trim()){
     validationErrors.nomPrenom = 'Full name is required';
    }
    if(!isValidString(newDoctor.nomPrenom)) {
     validationErrors.nomPrenom = 'Please put a valid full name !';
    }
    if(newDoctor.medecin_Genre ==='') {
     validationErrors.medecin_Genre = 'Please choose doctor gender !';
    }
    if(!isValidTelephone(newDoctor.medecin_Telephone)){
     validationErrors.medecin_Telephone = 'Please enter a valid telephone starts with 05 or 06 or 07 !';
    }
    if(!isValidEmail(newDoctor.medecin_Email)){
     validationErrors.medecin_Email = 'Please enter a valid email !';
    }
    if(newDoctor.medecin_Specialite===''){
     validationErrors.medecin_Specialite = 'Please choose doctor speciality !';
    }
    if(newDoctor.medecin_Experience<0){
     validationErrors.medecin_Experience = 'Please enter a valid number of doctor experience in years'
    }
    if(newDoctor.medecin_availability==='0000000') {
     validationErrors.medecin_availability = 'Please choose doctor working days!';
    }
    setErrors(validationErrors);

    if(Object.keys(validationErrors).length ===0){
      swal.fire({
        title: 'Confirmation',
        text: 'Are you sure to add a new doctor with these informations?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#2196f3',
        customClass: { title: 'alertOrderTitle' },
      })
      .then((res)=>{
        if(res.isConfirmed){
          axios.post(`${apiUrl}/addNewDoctor`,newDoctor)
          .then((res)=>{
            setShowAddModal(false);
            swal.fire({
              title:"Success",
              icon:"success",
              text:`${res.data.message}`,
              showConfirmButton:false,
              timer:3500,
            })
            .then(()=>{
            
            setDoctors(prev => [...prev, { ...newDoctor}]);
            setNewDoctor({
              nomPrenom: '',
              medecin_Genre:0,
              medecin_Specialite: '',
              medecin_Experience: 0,
              medecin_availability:'0000000',
              medecin_Email: '',
              medecin_Telephone: ''
            });
      
            })
              
          })
          .catch((err)=>{
            setShowAddModal(false);
            swal.fire({
              icon:'error',
              title:'Oops',
              html:'<span style="color:red">Network error,operation has failed Please try again Later!</span>',
              showConfirmButton:false,
              timer:4000,
            })
          })
          
        }
      })
  
    }
    
  };

  const handleDeleteDoctor = (doctorId) => {

    swal.fire({
      icon:'warning',
      iconColor:'red',
      title:`Delete`,
      color:'black',
      text:`Are you sure you want to delete this doctor completely?`,
      confirmButtonText:`Confirm`,
      showCancelButton:true,
      confirmButtonColor: "#2196f3",
      cancelButtonColor: "#d33",
      customClass : {
           title:'alertDeleteDoctorTitle',
      }
    })
    .then((res)=>{
      if(res.isConfirmed){

        axios.post(`${apiUrl}/deleteDoctor`,{doctorId:doctorId})
        .then((res)=>{
          swal.fire({
            icon:'success',
            title:'Success',
            color:'black',
            text:`${res.data.message}`,
            showConfirmButton:false,
            timer:3500,
          })
          setDoctors(doctors.filter(doctor => doctor.medecin_Id !== doctorId));
        })
        .catch((err)=>{
          swal.fire({
            icon:'error',
            title:'Oops',
            html:'<span style="color:red">Network error,operation has failed Please try again Later!</span>',
            showConfirmButton:false,
            timer:4000,
          })
        })
 
          
        
      }
    })


  };

  const editDoctorModal = (e,operation,doctorId) => {
    e.preventDefault();
    const doctor = doctors.find((doctor)=>doctor.medecin_Id === doctorId);

    if(doctor){
      setChosenDoctor({
        medecin_Id:doctor.medecin_Id,
        nomPrenom:doctor.nomPrenom,
        medecin_Genre:doctor.medecin_Genre,
        medecin_Telephone:doctor.medecin_Telephone,
        medecin_Email:doctor.medecin_Email,
        medecin_Specialite:doctor.medecin_Specialite,
        medecin_Experience:doctor.medecin_Experience,
        medecin_availability:doctor.medecin_availability,
      })
    }

    console.log('d_Id in edit  ='+doctorId);
      if(operation===1){
        setShowEditModal(true);
        
      }
      else {
        setShowEditModal(false);
        
      }
  }

  const handleEditDoctor = (e)=>{
      e.preventDefault();

      const validationErrors = {};
      if(!chosenDoctor.nomPrenom.trim()){
       validationErrors.nomPrenom = 'Full name is required';
      }
      if(!isValidString(chosenDoctor.nomPrenom)) {
       validationErrors.nomPrenom = 'Please put a valid full name !';
      }
      if(chosenDoctor.medecin_Genre ==='') {
       validationErrors.medecin_Genre = 'Please choose doctor gender !';
      }
      if(!isValidTelephone(chosenDoctor.medecin_Telephone)){
       validationErrors.medecin_Telephone = 'Please enter a valid telephone starts with 05 or 06 or 07 !';
      }
      if(!isValidEmail(chosenDoctor.medecin_Email)){
       validationErrors.medecin_Email = 'Please enter a valid email !';
      }
      if(chosenDoctor.medecin_Specialite===''){
       validationErrors.medecin_Specialite = 'Please choose doctor speciality !';
      }
      if(chosenDoctor.medecin_Experience<0){
       validationErrors.medecin_Experience = 'Please enter a valid number of doctor experience in years'
      }
      if(chosenDoctor.medecin_availability==='0000000') {
       validationErrors.medecin_availability = 'Please choose doctor working days!';
      }
      setErrors(validationErrors);
        
      if(Object.keys(validationErrors).length === 0) {
        
      swal.fire({
        title: 'Confirmation',
        text: 'Are you sure to edit this doctor information?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        confirmButtonColor: '#2196f3',
        customClass: { title: 'alertOrderTitle' },
      })
      .then((res)=>{
        if(res.isConfirmed){
          axios.post(`${apiUrl}/editDoctor`,chosenDoctor)
          .then((res)=>{
            swal.fire({
              title:"Success",
              icon:"success",
              text:`${res.data.message}`,
              showConfirmButton:false,
              timer:3500,
            })
            .then(()=>{
            setDoctors(doctors.filter(doctor => doctor.medecin_Id !== chosenDoctor.medecin_Id));
            setDoctors(prev => [...prev, { ...chosenDoctor}]);
            setShowEditModal(false);
            setChosenDoctor({
              nomPrenom: '',
              medecin_Genre:0,
              medecin_Specialite: '',
              medecin_Experience: 0,
              medecin_availability:'0000000',
              medecin_Email: '',
              medecin_Telephone: ''
            });
      
            })
              
          })
          .catch((err)=>{
            setShowEditModal(false);
            swal.fire({
              icon:'error',
              title:'Oops',
              html:'<span style="color:red">Network error,operation has failed Please try again Later! </span>',
              showConfirmButton:false,
              timer:4000,
            })
          })
          
        }
      })
      }
  }


  if(loading) {
    return (
      <div className="doctors-management">
      <div className="management-header">
      <h1>Chargement de données ...</h1>
      </div>
      </div>
    )
  }

  if(error) {
    return (
      <div className="doctors-management">
      <div className="management-header">
      <p style={{ color: "red" }}>Aucune donnée disponible en raison d'une erreur de connection</p>;
      </div>
      </div>
    )
  }



  return (
    <div className="doctors-management">
      <div className="management-header">
        <h1>Doctors Management</h1>
        <button className="add-doctor-btn" onClick={() => setShowAddModal(true)}>
          Add New Doctor
        </button>
      </div>

      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div key={doctor.medecin_Id} className="doctor-card">
            <div className="doctor-info">
              <h2>Dr.{doctor.nomPrenom}</h2>
              <p className="specialization">{doctor.medecin_Specialite}</p>
              <p className="experience">Experience: {doctor.medecin_Experience}</p>
              <p className="contact">Email: {doctor.medecin_Email}</p>
              <p className="contact">Phone: {doctor.medecin_Telephone}</p>
              <div className="availability">
                <h3>Available on:</h3>
                <ul>
                  {doctor.medecin_availability.split('').map((key,index) => (
                    
                      doctor.medecin_availability[index]==='1' ? <li key={`${key}-${days[index]}`}>{days[index]}</li> : null
                    
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-actions">
              <button className="edit-btn" onClick={(e)=>editDoctorModal(e,1,doctor.medecin_Id)}>Edit</button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteDoctor(doctor.medecin_Id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
        <div className="modal">
          <h2>Add New Doctor</h2>
          <form onSubmit={handleAddDoctor}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="nomPrenom"
                value={newDoctor.nomPrenom}
                onChange={handleInputChange}
                
              />
              {errors.nomPrenom && <span style={{color:'red'}}>{errors.nomPrenom}</span>}
            </div>

            <div className="form-group">
          <label htmlFor="doctorId">Gender</label>
          <select
            name="medecin_Genre"
            value={newDoctor.medecin_Genre}
            onChange={handleInputChange}
            
          >
           {/** <option value="">Select a doctor</option> */}
           <option value=''>Select a gender</option>
              <option value={0}>
                male
              </option>
              <option value={1}>
                female
              </option>
          
          </select>
          {errors.medecin_Genre && <span style={{color:'red'}}>{errors.medecin_Genre}</span>}
        </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="medecin_Telephone"
                value={newDoctor.medecin_Telephone}
                onChange={handleInputChange}
                
              />
              {errors.medecin_Telephone && <span style={{color:'red'}}>{errors.medecin_Telephone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="medecin_Email"
                value={newDoctor.medecin_Email}
                onChange={handleInputChange}
                
              />
               {errors.medecin_Email && <span style={{color:'red'}}>{errors.medecin_Email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <select
              id='specialization'
              name='medecin_Specialite'
              value={newDoctor.medecin_Specialite}
              onChange={handleInputChange}
              
              >
                <option value="">Select a specialization</option>
                {
                    specialityOptions.map((option,index)=>{
                        return <option key={index}>{option}</option>
                    })
                }

              </select>
              {errors.medecin_Specialite && <span style={{color:'red'}}>{errors.medecin_Specialite}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <input
                type="number"
                id="experience"
                name="medecin_Experience"
                value={newDoctor.medecin_Experience}
                onChange={handleInputChange}
                min={0}
              />
              {errors.medecin_Experience && <span style={{color:'red'}}>{errors.medecin_Experience}</span>}
            </div>

          
          
            <div className="form-group">
              <label>Availability</label>
              <div className="availability-checkboxes">
                {days.map((day,index) => (
                  <label key={index} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newDoctor.medecin_availability[index] ==='1'}
                      onChange={() => handleAvailabilityChange(day,index)}
                    />
                    {day}
                  </label>
                ))}
              </div>
              {errors.medecin_availability && <span style={{color:'red'}}>{errors.medecin_availability}</span>}
            </div>
        

            <div className="modal-actions">
              <button type="submit" className="submit-btn">Add Doctor</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {setShowAddModal(false);
                  setErrors({})}}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

   {
    showEditModal && chosenDoctor.medecin_Id &&(
      <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Doctor Card Information</h2>
        <form onSubmit={(e)=>{handleEditDoctor(e)}}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
       //     defaultValue={doctors[selectedDoctor].nomPrenom}
              type="text"
              id="name"
              name="nomPrenom"
              value={chosenDoctor.nomPrenom}
              onChange={handleModifyInput}
            />
            {errors.nomPrenom && <span style={{color:'red'}}>{errors.nomPrenom}</span>}
          </div>

          <div className="form-group">
        <label htmlFor="doctorId">Gender</label>
        <select
          name="medecin_Genre"
          value={chosenDoctor.medecin_Genre}
          onChange={handleModifyInput}
          
        >
         {/** <option value="">Select a doctor</option> */}
         {
          chosenDoctor.medecin_Genre === 0 ? (
              <>
                        <option value={0}>male</option>
                        <option value={1}>female</option>
              </>
          ) : (
             <>
                         <option value={1}>female</option>
                         <option value={0}>male</option>
             </>
          )
         }
        
        </select>
        {errors.medecin_Genre && <span style={{color:'red'}}>{errors.medecin_Genre}</span>}
      </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="medecin_Telephone"
              value={chosenDoctor.medecin_Telephone}
              onChange={handleModifyInput}
              
            />
              {errors.medecin_Telephone && <span style={{color:'red'}}>{errors.medecin_Telephone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="medecin_Email"
              value={chosenDoctor.medecin_Email}
              onChange={handleModifyInput}
              
            />
              {errors.medecin_Email && <span style={{color:'red'}}>{errors.medecin_Email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <select
            id='specialization'
            name='medecin_Specialite'
            value={chosenDoctor.medecin_Specialite}
            onChange={handleModifyInput}
            
            >
              
                <option>{chosenDoctor.medecin_Specialite}</option>
                {
                specialityOptions.filter(speciality=>speciality != chosenDoctor.medecin_Specialite).map(speciality=>(
                      
                      <option>{speciality}</option>
                    ))
                }
              

            </select>
            {errors.medecin_Specialite && <span style={{color:'red'}}>{errors.medecin_Specialite}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experience</label>
            <input
              type="number"
              id="experience"
              name="medecin_Experience"
              min={0}
              value={chosenDoctor.medecin_Experience}
              onChange={handleModifyInput}
              required
            />
             {errors.medecin_Experience && <span style={{color:'red'}}>{errors.medecin_Experience}</span>}
          </div>

        
        
          <div className="form-group">
            <label>Availability</label>
            <div className="availability-checkboxes">
              {days.map((day,index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={chosenDoctor.medecin_availability[index] ==='1'}
                    onChange={() => handleModifyAvailabilityChange(day,index)}
                  />
                  {day}
                </label>
              ))}
            </div>
            {errors.medecin_availability && <span style={{color:'red'}}>{errors.medecin_availability}</span>}
          </div>
      

          <div className="modal-actions">
            <button type="submit" className="submit-btn">Edit Doctor</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={(e)=>{editDoctorModal(e,2,null);
                setErrors({})
              }}
            >
              Cancel Edit
            </button>
          </div>
        </form>
      </div>
    </div>
    )
   }

    </div>
  );
}

export default DoctorsManagement;
