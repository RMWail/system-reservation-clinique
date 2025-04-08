import React, { useState, useEffect } from 'react';
import { MdLocationOn, MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import axios from 'axios';
import './UniversitySection.scss';
import swal from 'sweetalert2';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';
import LoadingData from '../loadingData/LoadingData.jsx';
import LoadingError from '../loadingError/LoadingError.jsx';
import { FaUniversity } from 'react-icons/fa';
import { useUniversity } from '../../../../hooks/useUniversity.js';

const UniversitySection = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {universitySections, loading, error, addUniversity, updateUniversity} = useUniversity();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [errors,setErrors] = useState({});
  const [newUniversity, setNewUniversity] = useState({
    id: '',
    name: '',
    modify:1,
    delete: 1,
  });

    

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredStations = universitySections.filter(university => 
    university.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (university) => {
    setEditingStation(university);
    setNewUniversity({
      id:university.id,
      name:university.name,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
   // e.preventDefault();

    const validationErrors = {};

    if(!newUniversity.name.trim()){
      validationErrors.stationName = `${t.admin.validationErrors.stationName}`;
    }

    setErrors(validationErrors);


    if(Object.keys(validationErrors).length ==0){
      if (editingStation) {
      
        swal.fire({
          icon:'warning',
          title:t.admin.stations.confirmation,
          text:`${t.admin.stations.confirmEdit}`,
          showCancelButton:true,
          confirmButtonText:`${t.admin.stations.confirm}`,
          cancelButtonText:`${t.admin.stations.cancel}`,
          confirmButtonColor:'#e67e22'
         }).then(async(res)=>{
          if(res.isConfirmed){
            const updateUnivResponse = await updateUniversity(newUniversity);
         
            console.log("update univ response = "+updateUnivResponse);
            
            if(updateUnivResponse.status == 200){
              swal.fire({
                icon:'success',
                title:t.admin.stations.success, 
                text:`${t.admin.stations.updateMsg}`, 
                showConfirmButton:false,
                timer:3000,
              });
             }

             if(updateUnivResponse.code =='ERR_NETWORK'){
              swal.fire('Error',`${t.admin.stations.errorNetwork}`,'error');
            }
       else if(updateUnivResponse.code =='ERR_BAD_REQUEST'){
        swal.fire('Error',`${addUnivResponse.response.data.error}`,'error');
       }  

            setShowModal(false);
            setNewUniversity({
              id:'',
              name: '',
            });
            setEditingStation(null);
          }
          
         })
      
      } else {
  
         swal.fire({
          icon:'warning',
          title:t.admin.stations.confirmation,
          text:`${t.admin.univSection.confirmAdd}`,
          showCancelButton:true,
          confirmButtonText:`${t.admin.stations.confirm}`,
          cancelButtonText:`${t.admin.stations.cancel}`,
          confirmButtonColor:'#e67e22'
         }).then(async (res)=>{
          if(res.isConfirmed){
            const addUnivResponse = await addUniversity(newUniversity);
            console.log("add univ response = "+addUnivResponse);

            if(addUnivResponse.status == 200){
              swal.fire({
                icon:'success',
                title:t.admin.stations.success, 
                text:`${t.admin.stations.successMsg}`, 
                showConfirmButton:false,
                timer:3000,
              });
             }
                      
             if(addUnivResponse.code =='ERR_NETWORK'){
              swal.fire('Error',`${t.admin.stations.errorNetwork}`,'error');
            }
       else if(addUnivResponse.code =='ERR_BAD_REQUEST'){
        swal.fire('Error',`${addUnivResponse.response.data.error}`,'error');
       }  
          
            setShowModal(false);
            setNewUniversity({
              id:'',
              name: '',
            });
            setEditingStation(null);
          }
          
         })
  
  
      }
  
    }
          
  };



  const handleDelete = (universityId) => {
    swal.fire({
      icon:'warning',
      iconColor:'red',
      title:t.admin.stations.confirmation,
      text:`${t.admin.stations.confirmDelete}`,
      showCancelButton:true,
      confirmButtonText:`${t.admin.stations.confirm}`,
      cancelButtonText:`${t.admin.stations.cancel}`,
      confirmButtonColor:'#e67e22'
     }).then((res)=>{
      if(res.isConfirmed){
        axios.post(`${apiUrl}/deleteUniversitySection`,{universityId:universityId})
        .then((res)=>{
          if(res.data.message!='Exist'){
            console.log(res.data.message);
            swal.fire({
              icon:'success',
              title:t.admin.stations.success,
              text:`${t.admin.stations.successMsg}`,
              confirmButtonColor:'#e67e22',
              timer:3500,
              showConfirmButton:false,
            })
            setStations(prev => prev.filter(station => station.id !== stationId));
          }
        })
        .catch(error=>{
          console.log(error);
          if(error.code =='ERR_NETWORK'){
            swal.fire('Error',`${t.admin.stations.errorNetwork}`,'error');
          }
     else if(error.code =='ERR_BAD_REQUEST'){
      swal.fire('Error',`${error.response.data.error}`,'error');
     }
           
        })
      }
     })
    
  };

  if(loading) {
    return (
      <LoadingData/>
    )
  }

  if(error) {
    return <LoadingError/>;
  }
  return (
    <div className="stations-management">
      <div className="stations-header">
        <div className="search-box">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder={t.admin.univSection.searchUniv}
            value={searchQuery}
            onChange={handleSearch}
          />
          
        </div>
        <button className="add-station-btn" onClick={() => setShowModal(true)}>
          <MdAdd /> {t.admin.univSection.addUnivSection}
        </button>
      </div>

      <div className="stations-grid">
        {filteredStations.map((universitySection,index) => (
          <div key={index} className="station-card">
            <div className="station-card-header">
              <div className="station-info">
                <div className="station-icon">
                  <FaUniversity />
                </div>
                <div className="station-details">
                  <h3>{universitySection.name}</h3>
                </div>
              </div>
              <div className="station-actions">
                <button onClick={() => handleEdit(universitySection)} className="edit-btn">
                  <MdEdit />
                </button>
       {
          universitySection.delete===1 ? 
                  <button onClick={() => handleDelete(universitySection.id)} className="delete-btn">
                  <MdDelete />
                </button> :
                <>
                </>
       }
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingStation ? t.admin.stations.editStation : t.admin.univSection.addUnivSection}</h2>
            <div className="form-group">
              <label>{t.admin.univSection.univName}</label>
              <input
                type="text"
                value={newUniversity.name}
                onChange={(e) => setNewUniversity(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.admin.stations.enter.stationName}
              />
              {errors.stationName && <span style={{color:'red'}}>{errors.stationName}</span>}
            </div>
            <div className="modal-actions">
              <button onClick={() => {
                setShowModal(false);
                setEditingStation(null);
                setNewUniversity({
                  id:'',
                  name: '',
                });
                setErrors({});
              }} className="cancel-btn">
                {t.admin.forms.cancel}
              </button>
              <button onClick={handleSubmit} className="submit-btn">
                {editingStation ? t.admin.forms.edit : t.admin.forms.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversitySection;
