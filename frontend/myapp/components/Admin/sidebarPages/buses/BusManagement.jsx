import React, { useState, useEffect, useContext } from 'react';
import { 
  MdDirectionsBus, 
  MdAdd, 
  MdEdit, 
  MdDelete,
  MdSearch,
  MdPerson
} from 'react-icons/md';
import axios from 'axios';
import './BusManagement.scss';
import swal from 'sweetalert2';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';
import LoadingData from '../loadingData/LoadingData.jsx';
import LoadingError from '../loadingError/LoadingError.jsx';

const BusManagement = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [oldBusNbr,setOldBusNbr] = useState('');
  const {currentLanguage} = useLanguage();
  const t  = translations[currentLanguage];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors,setErrors] = useState({});
  const [newBus, setNewBus] = useState({
    ID_BUS:'',
    NUMERO_BUS: '',
    nomChauffeur: '',
    telephoneChauffeur:'',
    valable: true
  });




  useEffect(() => {

    const fetchBuses = async () =>{
      try {
       setLoading(true);
       setError(null);
       const res = await axios.get(`${apiUrl}/getAllBuses`)    
         setBuses(res.data.buses);
      }catch(error) {
       setError(error.message);
      }
      finally{
       setLoading(false);
      }
}

    fetchBuses();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.NUMERO_BUS.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.telephoneChauffeur.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.nomChauffeur.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAvailability = 
      availabilityFilter === 'all' || 
      (availabilityFilter === 'available' && bus.valable==1) ||
      (availabilityFilter === 'unavailable' && bus.valable!=1);

    return matchesSearch && matchesAvailability;
  });

const isValidFullName = (test) => {
  const re = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  return re.test(test.trim());
};
/*
  const isValidString = (test)=>{
    const re = /^[a-zA-Z ]+$/
    return re.test(String(test));
  }
*/

  
  const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }



  const handleEdit = (bus) => {
    
    setOldBusNbr(bus.NUMERO_BUS);
    setEditingBus({ ...bus });  // Clone object to avoid direct mutation
    setNewBus({ ...bus });      // Clone object to avoid direct mutation
    setShowModal(true);
  };
  

  const handleSubmit = () => {
     console.log(newBus.nomChauffeur);
     console.log("validite : "+isValidFullName(newBus.nomChauffeur));
    const validationErrors = {};
      console.log(newBus.NUMERO_BUS);
    if(newBus.NUMERO_BUS<=0){
      validationErrors.NUMERO_BUS = `${t.admin.validationErrors.NUMERO_BUS}`;
    }

    if(!isValidFullName(newBus.nomChauffeur)){
      validationErrors.nomChauffeur = `${t.admin.validationErrors.nomChauffeur}`;
    }

    if(!newBus.telephoneChauffeur.trim()){  
      validationErrors.telephoneChauffeur = `${t.admin.validationErrors.telephoneChauffeur}`;
    }

    if(!isValidTelephone(newBus.telephoneChauffeur)){
      validationErrors.telephoneChauffeur = `${t.admin.validationErrors.telephoneChauffeur}`;
    }
  
    setErrors(validationErrors);

   if(Object.keys(validationErrors).length==0){
    if (editingBus) {

      swal.fire({
        icon:'warning',
        title:`${t.admin.buses.confirm}`,
        html:`<span style=color:'orangered'}>${t.admin.buses.confirmEdit}</span>`,
        showCancelButton:true,
        confirmButtonText:`${t.admin.forms.save}`,
        cancelButtonText:`${t.admin.forms.cancel}`,
        confirmButtonColor:'#e67e22'
      }).then((res)=>{
        
      if(res.isConfirmed){
        axios.post(`${apiUrl}/updateBus`,{newBus,oldBusNbr})
        .then((res)=>{
          if(res.data.message!='Exist'){
            console.log(res.data.message);
            swal.fire({
              icon:'success',
              title:`${t.admin.alerts.success}`,
              text:`${t.admin.buses.editSuccess}`,
              confirmButtonColor:'#e67e22',
              timer:3500,
              showConfirmButton:false,
            })
            setBuses(prev => prev.map(bus => 
              bus.ID_BUS === newBus.ID_BUS ? { ...bus, ...newBus } : bus
            ));
            
            setShowModal(false);
            setNewBus({
              ID_BUS:'',
              NUMERO_BUS: '',
              nomChauffeur: '',
              telephoneChauffeur: '',
              valable: 1
            });
            setOldBusNbr('');
            setEditingBus(null);
          }
          else {
            swal.fire({
              icon:'error',
              title:`${t.admin.buses.busExists}`,
              text:`${t.admin.buses.busExistsMessage}`,
              confirmButtonColor:'#e67e22',
              timer:3500,
              showConfirmButton:false,
            })
            setShowModal(false);
            setNewBus({
              ID_BUS:'',
              NUMERO_BUS: '',
              nomChauffeur: '',
              telephoneChauffeur: '',
              valable: 1
            });
            setOldBusNbr('');
            setEditingBus(null);
          }
           
        })
        .catch((err)=>{
          console.log(err);
          swal.fire({
            icon:'error',
            title:'Error',
            html:`<span style=color:"red"}>${t.admin.buses.errorEditMessage} ${err}</span>`,
            confirmButtonColor:'#e67e22'
          })
  
        })
      }
      })
  
      } 
      else {   
        swal.fire({
          icon:'warning',
          title:`${t.admin.buses.confirmation}`,
          html:`<span style=color:"orangered"}>${t.admin.buses.confirmAdd}</span>`,
          showCancelButton:true,
          confirmButtonText:`${t.admin.buses.confirm}`,
          cancelButtonText:`${t.admin.forms.cancel}`,
          confirmButtonColor:'#e67e22'
        }).then((res)=>{
          
        if(res.isConfirmed){
          axios.post(`${apiUrl}/addNewBus`,newBus)
          .then((res)=>{       
          if(res.data.message!='Exist'){
              swal.fire({
                icon:'success',
                title:`${t.admin.alerts.success}`,
                text:`${t.admin.buses.addSuccess}`,
                confirmButtonColor:'#e67e22',
                timer:3500,
                showConfirmButton:false,
              })
              
              const addedBus = {
                ID_BUS:res.data.busId,
                NUMERO_BUS: newBus.NUMERO_BUS,
                nomChauffeur: newBus.nomChauffeur,
                telephoneChauffeur: newBus.telephoneChauffeur,
                valable: newBus.valable
              }
              setBuses(prev => [...prev, addedBus]);
              setShowModal(false);
              setNewBus({
                NUMERO_BUS: '',
                nomChauffeur: '',
                telephoneChauffeur: '',
                valable: 1
              });  
            }
            else {
              swal.fire({
                icon:'error',
                title:`${t.admin.alerts.error}`,
                html:`<span style=color:"orangered"}>${t.admin.buses.busExistsMessage}</span>`,
                confirmButtonColor:'#e67e22'
              })
            }
             
          })
          .catch((err)=>{
            console.log(err);
            swal.fire({
              icon:'error',
              title:`${t.admin.alerts.error}`,
              html:`<span style=color:"orangered"}>${t.admin.buses.errorAddMessage}</span>`,
              confirmButtonColor:'#e67e22'
            })
            setShowModal(false);
            setNewBus({
              NUMERO_BUS: '',
              nomChauffeur: '',
              telephoneChauffeur: '',
              valable: 1
            });
    
          })
  
        }
  
  
        })
  
      }
   }

  };


  const handleDelete = (busId) => {
    
    swal.fire({
      icon:'warning',
      iconColor:'red',
      title:`${t.admin.buses.confirm}`,
      html:`<span style="color:red">${t.admin.buses.confirmDelete}</span>`,
      showCancelButton:true,
      confirmButtonText:`${t.admin.buses.confirm}`,
      cancelButtonText:`${t.admin.forms.cancel}`,
      confirmButtonColor:'#e67e22'
    }).then((res)=>{
      
    if(res.isConfirmed){
      axios.post(`${apiUrl}/deleteBus`,{busId:busId})
      .then((res)=>{
        
          swal.fire({
            icon:'success',
            title:`${t.admin.alerts.success}`,
            text:`${t.admin.buses.deleteSuccess}`,
            timer:2500,
            showConfirmButton:false,
          })
          setBuses(prev => prev.filter(bus => bus.ID_BUS !== busId));
          setShowModal(false);
          setNewBus({
            NUMERO_BUS: '',
            nomChauffeur: '',
            telephoneChauffeur: '',
            valable: 1
          });
                 
      })
      .catch((err)=>{
        swal.fire({
          icon:`error`,
          title:`${t.admin.alerts.operationFailed}`,
          html:`<span style="color:red">${t.admin.buses.errorDeleteMessage}</span>`,
          timer:4000,
        })
      })

    }
  } 

) };

if(loading){
  return (
    <LoadingData/>
  )
}

if(error) {
  return <LoadingError/>;
}

  return (
        buses && buses.length > 0? (
          <div className="bus-management">
          <div className="bus-header">
            <div className="search-filter">
              <div className="search-box">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={`${t.admin.buses.search}`}
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <select 
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="availability-filter"
              >
                <option value="all">{`${t.admin.buses.filterAll}`}</option>
                <option value="available">{`${t.admin.buses.filterAvailable}`}</option>
                <option value="unavailable">{`${t.admin.buses.filterUnavailable}`}</option>
              </select>
            </div>
            <button className="add-bus-btn" onClick={() => setShowModal(true)}>
              <MdAdd /> {`${t.admin.buses.addBus}`}
            </button>
          </div>
    
          <div className="buses-grid">
            {filteredBuses.map(bus => (
              <div key={bus.ID_BUS} className="bus-card">
                <div className="bus-card-header">
                  <div className="bus-info">
                    <div className="bus-icon">
                      <MdDirectionsBus />
                    </div>
                    <div className="bus-details">
                      <h3>{bus.NUMERO_BUS}</h3>
                      <span className={`availability-badge ${bus.valable==1 ? 'available' : 'unavailable'}`}>
                        {bus.valable==1 ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="bus-actions">
                    <button onClick={() => handleEdit(bus)} className="edit-btn">
                      <MdEdit />
                    </button>
                    <button onClick={() => handleDelete(bus.ID_BUS)} className="delete-btn">
                      <MdDelete />
                    </button>
                  </div>
                </div>
                <div className="driver-info">
                  <div className="driver-icon">
                    <MdPerson />
                  </div>
                  <div className="driver-details">
                    <p className="driver-name">{bus.nomChauffeur}</p>
                    <p className="driver-full-name">{bus.telephoneChauffeur}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
    
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editingBus ?  `${t.admin.buses.editBus}` : `${t.admin.buses.addBus}`}</h2>
                <div className="form-group">
                  <label>{`${t.admin.buses.busNumber}`}</label>
                  <input
                    type="number"
                    value={newBus.NUMERO_BUS}
                    onChange={(e) => setNewBus(prev => ({ ...prev, NUMERO_BUS: e.target.value }))}
                    placeholder={`${t.admin.buses.enter.busNumber}`}
                  />
                  {errors.NUMERO_BUS && <span style={{color:'red'}}>{errors.NUMERO_BUS}</span>}
                </div>
    
                <div className="form-group">
                  <label>{`${t.admin.buses.driverName}`}</label>
                  <input
                    type="text"
                    value={newBus.nomChauffeur}
                    onChange={(e) => setNewBus(prev => ({ ...prev, nomChauffeur: e.target.value }))}
                    placeholder={`${t.admin.buses.enter.driverName}`}
                  />
                  {errors.nomChauffeur && <span style={{color:'red'}}>{errors.nomChauffeur}</span>}
                </div>
    
                <div className="form-group">
                  <label>{`${t.admin.buses.driverPhone}`}</label>
                  <input
                    type="text"
                    value={newBus.telephoneChauffeur}
                    onChange={(e) => setNewBus(prev => ({ ...prev, telephoneChauffeur: e.target.value }))}
                    placeholder={`${t.admin.buses.enter.driverPhone}`}
                  />
                  {errors.telephoneChauffeur && <span style={{color:'red'}}>{errors.telephoneChauffeur}</span>}
                </div>
    
                <div className="modal-actions">
                  <button onClick={() => {
                    setShowModal(false);
                    setEditingBus(null);
                    setNewBus({
                      NUMERO_BUS: '',
                      nomChauffeur: '',
                      telephoneChauffeur: '',
                      valable: true
                    });
                    setErrors({});
                  }} className="cancel-btn">
                    {`${t.admin.forms.cancel}`}
                  </button>
                  <button onClick={handleSubmit} className="submit-btn">
                    {editingBus ? `${t.admin.forms.edit}` : `${t.admin.forms.save}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )
        : (
              <>
              <h1>No buses found</h1>
              </>
        )
  );
};

export default BusManagement;
