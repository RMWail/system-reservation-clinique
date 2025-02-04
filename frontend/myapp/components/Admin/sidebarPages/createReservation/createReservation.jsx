import React, { useState, useEffect } from 'react'
import './createReservation.scss'
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaPlusCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function CreateReservation() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
 // const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [doctors,setDoctors] = useState([]);
  /*const [doctors] = useState([
    { id: 1, name: "Dr. Sarah Johnson", specialization: "Cardiologist" },
    { id: 2, name: "Dr. Michael Chen", specialization: "Pediatrician" },
    // Add more doctors as needed
  ]); */

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

  

  // Add maxDate calculation
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7); // Add 7 days to current date
    return maxDate;
  };

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
    date: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isVisible, setVisible] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    if (!date) return;
  
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  
    console.log("Formatted Date:", formattedDate);
    
    setSelectedDate(date);
    setFormData((prevData) => ({
      ...prevData,
      date: formattedDate,  // Store the formatted string
    }));
  };
  

  const handleCreateVisible = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setFormData(initialFormData);
    setSelectedDate(null);
  };

  const handleCreateReservation = (e) => {
    e.preventDefault();

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
            console.log(response.data.success);
            Swal.fire({
              title: "Success!",
              text: "Reservation was created successfully.",
              icon: "success",
              iconColor: "#2196f3",
              showConfirmButton: false,
              timer: 3000,
            });
            setFormData(initialFormData);
            setVisible(false);
            setSelectedDate(null);
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "Error!",
              text: "Failed to create reservation.",
              icon: "error"
            });
          });
      }
    });
  };

  return (
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
              required
            />
          </div>

          <div className="formGroup">
            <input 
              type="tel" 
              placeholder='Phone Number' 
              name='phone' 
              value={formData.phone} 
              onChange={handleChange}
              required
            />
          </div>

          <div className="formRow">
            <div className="formGroup">
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="formGroup">
              <input 
                type="number" 
                placeholder='Age' 
                name='age' 
                value={formData.age} 
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="formGroup">
            <select 
              name="doctorId" 
              value={formData.doctorId} 
              onChange={handleChange}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.medecin_Id} value={doctor.medecin_Id}>
                  Dr. {doctor.nomPrenom} - {doctor.medecin_Specialite}
                </option>
              ))}
            </select>
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
              required
              filterDate={date => date.getDay() !== 5} // Optionally exclude Sundays
            />
          </div>

          <div className="buttonContainer">
            <div className="buttonGroup">
              <button type="submit" className='createButton'>Create Reservation</button>
              <button type="button" className='cancelButton' onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateReservation;
