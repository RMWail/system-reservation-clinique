import { useState, useEffect } from 'react';

import { universityService} from '../services/universityService'


export const useUniversity =()=>{
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [universitySections, setUniversitySections] = useState([]);

    const fetchUniversities = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await universityService.getAllUniversities();
          setUniversitySections(
            response.universitySections.map(({ univSection_Id, univ_name, modifyAvailability,  deleteAvailability}) => ({
              id: univSection_Id,
              name: univ_name,
              modify:modifyAvailability,
              delete:deleteAvailability,
            }))
          );
        } catch (error) {
          setError(error.message);
          console.error('Error fetching universities:', error);
          
        }
        finally {
          setLoading(false);
        }
      };

      
  useEffect(() => {
    fetchUniversities();
  }, []);


  const addUniversity = async (university) => {

    const serviceAddResponse = await universityService.addUniversitySection(university);
   console.log('serviceAddResponse = ',serviceAddResponse);
    if(serviceAddResponse.status==200){
              
      setUniversitySections((prev) => [
        ...prev, 
        { id: serviceAddResponse.data.newUnivId, name: university.name }
    ]);
    }

return serviceAddResponse

};

const updateUniversity = async (updatedUniversity)=>{
  
    const serviceUpdateResponse = await universityService.updateUniversitySection(updatedUniversity)
    console.log("UPDATE STATUS = "+serviceUpdateResponse.status);
    if(serviceUpdateResponse.status == 200){


      setUniversitySections(prev => prev.map(university => 
        university.id == updatedUniversity.id ? { ...updatedUniversity, id: university.id } : university
          ));
    }

    return serviceUpdateResponse

}

const deleteUniversity = async (stationId)=>{

const serviceDeleteResponse = await stationService.deleteStation(stationId)
 console.log('STATION DELETE STATUS = ',serviceDeleteResponse.status);

 if(serviceDeleteResponse.status == 200){
    setStations((prev)=>prev.filter(station=>station.id!==stationId));
  
 }
return serviceDeleteResponse;
};


  return {universitySections, loading, error, addUniversity, updateUniversity}

}

