import React, { useState } from 'react';
import './DoctorsManagement.scss';

function DoctorsManagement() {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      experience: "15 years",
      availability: ["Monday", "Wednesday", "Friday"],
      email: "sarah.johnson@clinic.com",
      phone: "+1234567890"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Pediatrician",
      experience: "12 years",
      availability: ["Tuesday", "Thursday", "Saturday"],
      email: "michael.chen@clinic.com",
      phone: "+1234567891"
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: '',
    experience: '',
    availability: [],
    email: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day) => {
    setNewDoctor(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    setDoctors(prev => [...prev, { ...newDoctor, id: prev.length + 1 }]);
    setShowAddModal(false);
    setNewDoctor({
      name: '',
      gender:'',
      specialization: '',
      experience: 0,
      availability: [],
      email: '',
      phone: ''
    });
  };

  const handleDeleteDoctor = (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
    }
  };

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
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-info">
              <h2>{doctor.name}</h2>
              <p className="specialization">{doctor.specialization}</p>
              <p className="experience">Experience: {doctor.experience}</p>
              <p className="contact">Email: {doctor.email}</p>
              <p className="contact">Phone: {doctor.phone}</p>
              <div className="availability">
                <h3>Available on:</h3>
                <ul>
                  {doctor.availability.map((day, index) => (
                    <li key={index}>{day}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-actions">
              <button className="edit-btn">Edit</button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteDoctor(doctor.id)}
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
                  name="name"
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
            <label htmlFor="doctorId">Gender</label>
            <select
              id="doctorId"
              name="doctorId"
              value={newDoctor.gender}
              onChange={handleInputChange}
              required
            >
             {/** <option value="">Select a doctor</option> */}
                <option>
                  male
                </option>
                <option>
                  female
                </option>
            
            </select>
          </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newDoctor.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newDoctor.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <select
                id='specialization'
                name='specialization'
                value={newDoctor.specialization}
                onChange={handleInputChange}
                required
                >
                  <option value=""></option>
                  <option>Gynecology and Obstetrics</option>
                  <option>Pediatrics</option>
                  <option>Ophthalmology</option>
                  <option>Internal Medicine</option>
                  <option>Cardiology</option>
                  <option>Urology</option>
                  <option>Gastroenterology</option>
                  <option>Orthopedic Surgery</option>
                  <option>Neurology</option>
                  <option>Dermatology</option>
                  <option>Neurosurgery</option>
                  <option>Otorhinolaryngology (ENT)</option>
                  <option>Rheumatology</option>
                  <option>Oncology</option>
                  <option>Anesthesiology</option>

                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  min={0}
                  value={newDoctor.experience}
                  onChange={handleInputChange}
                  required
                />
              </div>

            {/*
            
              <div className="form-group">
                <label>Availability</label>
                <div className="availability-checkboxes">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <label key={day} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newDoctor.availability.includes(day)}
                        onChange={() => handleAvailabilityChange(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            */}

              <div className="modal-actions">
                <button type="submit" className="submit-btn">Add Doctor</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsManagement;
