import React, { useState, useEffect } from 'react'
import './ItemController.scss'
import Swal from 'sweetalert2';
import axios from 'axios';

import { FaPlusCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
function ItemController() {
   const navigate = useNavigate('');
   const apiUrl = import.meta.env.VITE_API_URL;
   useEffect(()=>{

    
    const admin = sessionStorage.getItem('admin');
    if(admin==='yesAdmin'){
      sessionStorage.setItem('activeMenu','add Item');
    }
    else {
      navigate('/admin/login');
    }


   },[]);


  const initialFormData = {
    productName: '',
    productType: '',
    productPrice: '',
    productPhoto: '',
    productDescription: '',
    productFlavours: '',
    productQuantity: 0,
  };

  const [formData,setFormData] = useState({
    productName:'',
    productType:'',
    productPrice:'',
    productPhoto:'',
    productDescription:'',
    productFlavours:'',
    productQuantity: 0,
  });
  const [isVisible,setVisible] = useState(false);

  const handleChange=(e)=>{
    const {name,value} = e.target;
    console.log(e.target.value);
    setFormData((prevData)=>({
      ...prevData,
      [name]: value,
    }));
  }

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      productPhoto: e.target.files[0],
    }));
  };

  
  const handleCreateVisible = ()=>{
    setVisible(true);
  }

  const handleCancel = ()=>{
    setVisible(false);
  }

  const handleCreateItem=(e)=>{
   e.preventDefault();


   Swal.fire({
    title: "Are you sure?",
    text: "Do you want to complete operation!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "orange",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes,"
  }).then((result) => {
    if (result.isConfirmed) {

      const formDataToSend = new FormData();
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      axios.post(`${apiUrl}/createItem`,formDataToSend,{
        headers: {
        'Content-Type':'multipart/form-data'
        }
      })
      .then((response)=>{
        console.log(response)
      })
      .catch((error)=>{
        console.log(error);
      })
      Swal.fire({
        title: "Complete !",
        text: "Your item has been added .",
        icon: "success"
      });
      setFormData(initialFormData);
      setVisible(false);
    }
  });
  }  

  return (
    <div className='itemControllerFather'>
      <div className="createDiv" onClick={handleCreateVisible}>
        <div className='createIcon'>
          <FaPlusCircle size={50} color='gray'/>
          <h2>Create</h2>
        </div>
      </div>
      <div className={`addItemCard ${isVisible ? 'visible' : 'hidden'}`}>
        <form action="" onSubmit={handleCreateItem}>
          <div className="NameType">
          <input type="text" placeholder='Product Name' className='productName'  onChange={handleChange} name='productName' value={formData.productName} required/>
          <input type="text" placeholder='Product type' className='productType' value={formData.productType} name='productType' onChange={handleChange}/>
          </div>
        
        <div className="pricePhoto">
        <input type="number" placeholder='DA' className='productPrice'
        value={formData.productPrice} name='productPrice' onChange={handleChange} required/>
        <input type="file" placeholder='Representation photo' className='productPhoto'  name="productPhoto" onChange={handleFileChange} 
        accept='image/*' required/>
        </div>
        
        <div className="leftSide">
        <h4 id='flavoursAvailability'>this item contains flavours or not : </h4>
          <select name="productFlavours" id="options" value={formData.productFlavours} onChange={handleChange} required>
           <option value="" disabled>Select an option</option>
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>
         <div className="rightSide">
          <h4 id='quantityLabel'>Start quantity:</h4>
         <input type="number" min={0} placeholder='0' className='productQuantity' value={formData.productQuantity} name='productQuantity' onChange={handleChange} required/>
         </div>

          <textarea name="productDescription" value={formData.productDescription} className="productDescription"    onChange={handleChange}>
          </textarea>
          <input type="submit" className='createButton' value='Create' />
        </form>

        <button className='cancelButton' onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default ItemController
