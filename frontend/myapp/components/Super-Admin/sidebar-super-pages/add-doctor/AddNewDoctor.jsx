import './AddNewDoctor.scss';
import axios from 'axios';
import swal from 'sweetalert2';
import React,{ useState } from 'react';
import { isValidString,isValidTelephone,isValidEmail} from '../../../../utils/formValidation';
function AddNewDoctor() {
   const apiUrl = import.meta.env.VITE_API_URL;
    const days = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const specialityOptions = ['Gynecology and Obstetrics','Pediatrics','Ophthalmology','Internal Medicine','Cardiology','Urology','Gastroenterology',
      'Orthopedic Surgery','Neurology','Dermatology','Neurosurgery','Otorhinolaryngology (ENT)','Rheumatology','Oncology','Anesthesiology','Dentist'];
    const [errors,setErrors] = useState({});

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

      if(Object.keys(validationErrors).length === 0) {
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
              swal.fire({
                title:"Success",
                icon:"success",
                text:`${res.data.message}`,
                showConfirmButton:false,
                timer:3500,
              })
              
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
            .catch((err)=>{
              swal.fire({
                icon:'error',
                title:'Oops',
                html:'<span style="color:red">Network error ,Please try again Later! </span>',
                showConfirmButton:false,
                timer:4000,
              })
            })
            
          }
        })
      }

  };

    return (
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
                onClick={() => {setErrors({})}}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
}

export default AddNewDoctor;