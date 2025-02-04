import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHome.scss";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { FaEye, FaWrench } from "react-icons/fa";
import Swal from "sweetalert2";
import io from 'socket.io-client';

function AdminHome() {
  const [cards, setCards] = useState([]);
  const socketRef = useRef('');
  const navigate = useNavigate();
  const cardAvailability = useRef([]);
  const cardDetailRef = useRef(null);
  const cardModifyRef = useRef(null);
  const [counter,setCounter] = useState(0);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {

    const admin = sessionStorage.getItem('admin');
    console.log('admin = '+admin);
       if(admin==='yesAdmin'){
        axios
        .get(`${apiUrl}/getItems`)
        .then((response) => {
     //     console.log(response.data.items);
          setCards(response.data.items);
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
        sessionStorage.setItem('activeMenu','Home');

       }
       else {
        navigate('/admin/login');
       }


       socketRef.current = io(`${apiUrl}`,{
        auth: {secret: 'this is from Admin Home component'},
        query: {data:'AdminHome.jsx'}
      })
  
  
      socketRef.current.on('updateProductQuantity',orderDataToUpdate=>{
        const productId = orderDataToUpdate.productId;
        const orderQuantityGetting = orderDataToUpdate.orderQuantitySent;
       console.log('In AdminHome :')
        console.log("product to be updated "+productId+"and sent quantity = "+orderQuantityGetting);
  
        setCards(previousCards=>
          previousCards.map(item=>
            item.item_Id===productId ? {...item, quantity : item.quantity-orderQuantityGetting } : item       
          )
        )
      })
  
      socketRef.current.on('updateProductsQuantities',orderDataArrayToUpdate=>{
  
        const productsToUpdate = orderDataArrayToUpdate.orderProducts;
  
        for(let i=0;i<productsToUpdate.length;i++){
          console.log(`id = ${productsToUpdate.productId} and sentQuantity = ${productsToUpdate.productQuantity}`)
        }
  
        productsToUpdate.map(product=>{
  
          const productId = product.productId;
          const orderQuantityGetting = product.productQuantity;
  
          console.log("product :"+productId+" quantity = "+orderQuantityGetting);
  
          setCards(previousCards=>
            previousCards.map(item=>
              item.item_Id===productId ? {...item, quantity : item.quantity-orderQuantityGetting } : item       
            )
          )
  
        })
  
      })


  }, []);

  const [chosenCard, setChosenCard] = useState({
    productId: "",
    productName: '',
    productType: '',
    productPrice: '',
    productPhoto: '',
    productDescription: '',
    productFlavours: '',
    productQuantity: '',
  });

  const [newPhoto,setNewPhoto] = useState(null);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setChosenCard((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const hanleImageChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setNewPhoto(file);
    }
    setCounter((prevCounter)=>prevCounter+1);
  };


  const openDetails = (id) => {
    console.log("id in view = " + id);
    const card = cards.find((card) => card.item_Id === id);
    if (card) {
      setChosenCard({
        productId: card.item_Id,
        productName: card.item_name,
        productType: card.item_type,
        productPrice: card.item_price,
        productPhoto: card.item_photo,
        productDescription: card.item_description,
        productFlavours: card.flavours,
        productQuantity: card.quantity,
      });

      if (cardDetailRef.current) {
        cardDetailRef.current.classList.remove("hidden");
        cardDetailRef.current.classList.add("visible");
      }
    }
  };

  const closeDetails = () => {
    if (cardDetailRef.current) {
      cardDetailRef.current.classList.remove("visible");
      cardDetailRef.current.classList.add("hidden");
    }
  };

  const openModify = (id) => {
    console.log("id in modify= " + id);

    const card = cards.find((card) => card.item_Id === id);
    if (card) {
      setChosenCard({
        productId: card.item_Id,
        productName: card.item_name,
        productType: card.item_type,
        productPrice: card.item_price,
        productPhoto: card.item_photo,
        productDescription: card.item_description,
        productFlavours: card.flavours,
        productQuantity: card.quantity,
      });
      if (cardModifyRef.current) {
        cardModifyRef.current.classList.remove("hidden");
        cardModifyRef.current.classList.add("visible");
      }
    }
  };

  const closeModify = () => {
    if (cardModifyRef.current) {
      cardModifyRef.current.classList.remove("visible");
      cardModifyRef.current.classList.add("hidden");
    }
  };


  const handleModify = (e, id) => {
    e.preventDefault();
    console.log("id in modify op = " + id);
    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {

        const formDataToSend = new FormData();
        for (let key in chosenCard) {
          if (key !== 'productPhoto')
          formDataToSend.append(key, chosenCard[key]);
        }
        if(newPhoto){
          formDataToSend.append('productPhoto',newPhoto);
        }

        formDataToSend.append('counter', counter); // Append the counter to FormData

        axios
          .post(`${apiUrl}/modifyItem`,formDataToSend, {
            headers: {
              'Content-Type':'multipart/form-data'
            },
          })
          .then(async(response) => {
            console.log(response.data);
           
            axios
            .get(`${apiUrl}/getItems`)
            .then((response) => {
            //  console.log(response.data.items);
              setCards(response.data.items);
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
            setCounter(0);
            
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
 
          closeModify();
        Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };

  const handleDelete = (id) => {
    console.log("id in delete = " + id);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this and the item will completely deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "orange",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${apiUrl}/deleteItem`,
            { id: id },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            console.log(response.data.response);
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });

        let newCardsArray = cards.filter((card) => card.item_Id !== id);
        setCards(newCardsArray);
        Swal.fire({
          title: "Deleted!",
          text: "Your Item has been deleted.",
          icon: "success",
        });
      }
    });
  };

  const checkAvailability =(index)=>{
    const card = cards[index];
   // console.log(card);
    const inputControl = cardAvailability.current[index]; // Accessing the correct element by index
    if (inputControl) {
     //  console.log("quantity = ",card.quantity);
      if (card.quantity>= 1) {
        inputControl.classList.add('available');
        inputControl.classList.remove('unavailable');
        inputControl.innerText = 'متاح';
      } else {
        inputControl.classList.add('unavailable');
        inputControl.classList.remove('available');
        inputControl.innerText = 'غير متاح';
      }
    }
  }

  return (
    <div className="cardsFatherContainer">
      <div className="cardDetail" ref={cardDetailRef} onClick={closeDetails}>
        {chosenCard.productId && (
          <div className="itemCompleteInformation">
            <div className="closingButton">
              <button onClick={closeDetails}>X</button>
            </div>
            <h1>Product Details</h1>
            <div className="detailsPhoto">
              <ul className="detailList">
                <li className="details">
                  Id:<span>{chosenCard.productId}</span>
                </li>
                <li className="details">
                  Name:<span>{chosenCard.productName}</span>
                </li>
                <li className="details">
                  Type:<span>{chosenCard.productType}</span>
                </li>
                <li className="details">
                  Quantity:<span>{chosenCard.productQuantity}</span>
                </li>
                <li className="details">
                  Price:<span>{chosenCard.productPrice}</span>
                </li>
                <li className="details">
                  Flavours availability:<span>{
                  chosenCard.productFlavours === 0 ? "No" : chosenCard.productFlavours===1 ? "Yes" :"Unknown" 
                  }</span>
                </li>
                <li className="ItemDetailDescription">
                  <span className="desTitle">Description:</span>
                 <span className="desDetail">{chosenCard.productDescription}</span>
                </li>
              </ul>
              <div className="itemDetailPhoto">
                <img
                  src={`data:image/png;base64,${chosenCard.productPhoto}`}
                  alt=""
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="cardModify" ref={cardModifyRef}>
        {chosenCard.productId && (
          <div className="cardModification">
            <div className="closingButton">
              <button onClick={closeModify}>X</button>
            </div>
            <form action="" className="form" onSubmit={(e) => handleModify(e, chosenCard.productId)} encType="multipart/form-data">
              <div className="NameType">

                <div className="product-name">
                  <label>Name</label>
                  <input
                    type="text" placeholder="Product Name"  className="Name" name="productName" value={chosenCard.productName}  onChange={handleChange}
                  />
                </div>

                <div className="product-type">
                  <label htmlFor="">Type</label>
                  <input
                   type="text" placeholder="Product type" className="Type" name="productType" value={chosenCard.productType} onChange={handleChange}
                  />
                </div>
              </div>
              <div className="file-input-container">
                <div className="changePhoto">
                  <label>Change photo</label>
                  <input
                   type="file" className="file-input" name="productPhoto"    onChange={hanleImageChange} accept="image/*"
                  />
                </div>
                
                <img
                    src={`data:image/png;base64,${chosenCard.productPhoto}`} alt=""
                />
              </div>

              <div className="price">
                <label htmlFor="">Price</label>
                <input
                 type="number"  placeholder="DA" min={0} className="changePrice" name="productPrice" value={chosenCard.productPrice} onChange={handleChange}
                />
              </div>
              <div className="quantity">
                <label htmlFor="">Quantity</label>
                <input
                 type="number"  placeholder="quantity" min={0} className="changePrice" name="productQuantity" value={chosenCard.productQuantity} onChange={handleChange}
                />
              </div>

         <div className="flavourss">
         <label id="flavoursLabel">Flavours availability</label>              
              <select 
  name="productFlavours" 
  id="options" 
  value={chosenCard.productFlavours} 
  onChange={handleChange}
>
  {chosenCard.productFlavours === 1 ? (
    <>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </>
  ) : (
    <>
      <option value="No">No</option>
      <option value="Yes">Yes</option>
    </>
  )}
              </select>
         </div>


              <div className="Description">
                <label htmlFor="">Description</label>
                <textarea
                  className="itemDescription"
                  name="productDescription"
                  value={chosenCard.productDescription}
                  onChange={handleChange}
                ></textarea>
              </div>              
              <div className="modifyButtons">
                <input
                  className="cancelModifyButton"
                  value="Cancel"
                  onChange={handleChange}
                  onClick={closeModify}
                />
                <input type="submit" className="updateButton" value="Update" />
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="cards-container">
        {cards &&
          cards.map((card, key) => (
            <div key={key} className="card" onMouseEnter={()=>checkAvailability(key)}>
              <div className="item-photo">
                <img src={`data:image/png;base64,${card.item_photo}`} alt="" />
              </div>
              <div className="item-title">{`${card.item_price} DA ${card.item_type}`}</div>
              <div className="item-description">
                <span ref={(el) => (cardAvailability.current[key] = el)}></span>
                <div className="buttonsContainer">
                  <button
                    className="btnControll"
                    onClick={() => openDetails(card.item_Id)}
                  >
                    <FaEye size={25} />
                  </button>
                  <button className="btnControll">
                    <FaWrench
                      size={25}
                      onClick={() => openModify(card.item_Id)}
                    />
                  </button>
                  <button
                    className="btnControll"
                    onClick={() => handleDelete(card.item_Id)}
                  >
                    <MdDelete size={25} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default AdminHome;
