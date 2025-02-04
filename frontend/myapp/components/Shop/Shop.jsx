import { useNavigate } from 'react-router-dom';
import React,{ useState,useRef,useEffect } from 'react';

import { Link } from 'react-router-dom';
import {  MdAccountCircle, MdOutlineLogout} from 'react-icons/md';
import { FaBagShopping } from "react-icons/fa6";
import { FaCartPlus, FaShoppingCart,FaClipboardList} from 'react-icons/fa';
import { MdAddBox, MdDelete} from 'react-icons/md'
import swal from 'sweetalert2'
import { toast,Toaster } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Shop.scss'
import axios from 'axios'
import io from 'socket.io-client';
import CollapsibleTable from './CollapsibleTable';



function Shop() {
  

  const [cards, setCards] = useState([]);
  const socketRef = useRef('');
  const navigate = useNavigate();
  const [storedAccountId,setStoredAccountId] = useState(null);
  const availabilityRef = useRef([]);
  const orderProductRef = useRef(null);
  const oldOrdersRef = useRef(null);
  const orderChartRef = useRef(null);
  const orderQuantityRef = useRef(null);
  const orderFullNameRef = useRef('');
  const orderFullNameRef2 = useRef('');
  const orderPhoneNumberRef = useRef('');
  const orderPhoneNumberRef2 = useRef('');
  const productFlavourOptions = useRef(null);
  const [flavour,setFlavour] = useState('chocalate');
  const [flavours,setFlavours] = useState([]);
  const [orderButton,setOrderButton] = useState('');
  const [totalPrice,setTotalPrice] = useState(0);
  const [orderQuanitity,setOrderQuanity] = useState(1);
  const [fullName,setFullName] = useState('');
  const [phoneNumber,setPhoneNumber] = useState('');
  const [chart,setChart] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL
    
  useEffect(() => {
    
    const accountId = sessionStorage.getItem("accountId");
    setStoredAccountId(sessionStorage.getItem("accountId"));
    console.log('account = '+accountId);

    //    console.log("account = "+accountId);
        axios.get(`${apiUrl}/getItems`)
          .then((response) => {
    //        console.log(response.data.items);
            setCards(response.data.items);
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
   

          socketRef.current = io(`${apiUrl}`,{
            auth: {secret: 'this is from Order component'},
            query: {data:'Order.jsx'}
          })  
      
       //   socketRef.current.emit('joinRoom',{cutomerUsername:accountId});  
          socketRef.current.on('updateProductQuantity',orderDataToUpdate=>{
            const productId = orderDataToUpdate.productId;
            const orderQuantityGetting = orderDataToUpdate.orderQuantitySent;
            console.log('In Shop component :') ;
            console.log("product to be updated "+productId+"and sent quantity = "+orderQuantityGetting);
      
            setCards(previousCards=>
              previousCards.map(item=>
                item.item_Id===productId ? {...item, quantity : item.quantity-orderQuantityGetting } : item       
              )
            )
          })
      
          socketRef.current.on('updateProductsQuantities',orderDataArrayToUpdate=>{
      
            const productsToUpdate = orderDataArrayToUpdate.orderProducts;
            console.log('In Shop component :') ;
    
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
      
            
          socketRef.current.on('updateShopItemCreated',data=>{
      
            console.log('new Added card = '+data.newCard.item_Id+' with name = '+data.newCard.item_name);
            setCards(previousCards => {
              const updatedCards = [...previousCards, data.newCard];
              console.log('Updated cards:', updatedCards);
              return updatedCards;
            });
          })
    
          socketRef.current.on('updateShopItemDeleted',deletedProduct=>{
            axios
            .get(`${apiUrl}/getItems`)
            .then((response) => {
     
              closeOrder();
              closeChartOrder();
              setCards(response.data.items);
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
      
            
          })
         
          socketRef.current.on('updateShopItemModified', () => {

            axios
            .get(`${apiUrl}/getItems`)
            .then((response) => {
     
              closeOrder();
              closeChartOrder();
              setCards(response.data.items);
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
     
    
          });
    
      /*
          socketRef.current.on('toShopIsReady',(data) => {
            console.log('recieved fromOrders in shop');
            
             if(data.room===sessionStorage.getItem("accountId")){
              console.log('Socket accepted');
      
           //    console.log('server is ready '+data.orderState+"  "+data.message);
               const orderState = data.orderState;
               const msg = data.message;
               const order_Id = data.orderId;
               if(orderState==="Rejected"){
                setNotification('Rejected');
                 toast.info(`${msg}`,{
                   duration: 10000,
                   position: "bottom-left",
                   className: "warningToast",
                 });
               }
               else if(orderState==="Ready"){
                 console.log("Yes");
                 setNotification('Ready');
                 
                 toast.success(`shop: ${msg} you can retrieve it`,{
                   duration: 10000,
                   position: "bottom-left",
                   className: "successToast",
                 })
               }
               else {
                setNotification('Completed');
                 toast.success(`shop: your order ${order_Id} was completed , enjoy your time`,{
                   duration: 10000,
                   position: "bottom-left",
                   className: "successToast",
                 })
               }
              //   console.log('serverOrderIsReady order_Id = '+order_Id);
       
             }
             else {
              console.log('Socket not accepted');

             }
           }) 

      */
           
     
  }, [socketRef]);


  const flavourOptions = [
  {text :"chocalate" , value:1},
  {text :"strawberry" , value:2},
  {text :"lemon" , value:3},
  {text :"pistachio" , value:4},
  {text :"coffee" , value:5},
  {text :"caramel" , value:6},
  {text :"vanilla" , value:7},
  {text :"peach" , value:8},
  {text :"besswax" , value:9},
  {text :"batter" , value:10},
  {text :"raspberry" , value:11},
  {text :"mixed" , value:12},
  ]

  const TABLE_HEADS = [
    // the head of the table
    "product",
    "Name",
    "flavours",
    "Quantity",
    "Price",
    "Action",
  ];

  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('accountId');
  });


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


  const setError=(value,element,message)=>{
    if(value===1){
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    errorDisplay.style.fontSize = '15px';
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
    }
    else {
      const inputControl = element.parentElement;
      const errorDisplay = inputControl.querySelector('.quantityError');
      errorDisplay.innerText = message;
      errorDisplay.style.fontSize = '15px';
      inputControl.classList.add('quantityError');
      inputControl.classList.remove('success');
    }
   }

   const setSuccess=(value,element)=>{
        if(value===1){
          if(element) {
            const inputControl = element.parentElement;
            const errorDisplay = inputControl.querySelector('.error'); 
            if(errorDisplay){
              errorDisplay.innerText='';
            }
            inputControl.classList.remove('error');
            inputControl.classList.add('success');
           }
        }

        else {
          const inputControl = element.parentElement;
          const errorDisplay = inputControl.querySelector('.quantityError'); 
          if(errorDisplay){
            errorDisplay.innerText='';
          }
          inputControl.classList.remove('quantityError');
          inputControl.classList.add('success');
        }
    }



  const checkAvailabitily = (index) => {
    const card = cards[index];
    const inputControl = availabilityRef.current[index]; // Accessing the correct element by index
    if (inputControl) {

      if (card.quantity >= 1) {
        inputControl.classList.add('available');
        inputControl.classList.remove('unavailable');
        inputControl.innerText = 'متاح';
      } else {
        inputControl.classList.add('unavailable');
        inputControl.classList.remove('available');
        inputControl.innerText = 'غير متاح';
      }
    }
  };

  const openOrder = (id,buttonVal)=>{
    setFlavour('chocalate');
    if(buttonVal===1){
      setOrderButton(1)
      console.log(`order function was lunched at ${id} item`);
    }
  else { 
  setOrderButton(2)
 //   console.log(`add to chart function was lunched at ${id} item`);
  }
    setOrderQuanity(1);
    const card = cards.find((card) => card.item_Id === id);
    console.log(card);
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
      console.log("product flavours "+chosenCard.productFlavours);

    if(orderProductRef.current){
      orderProductRef.current.classList.remove("hidden");
      orderProductRef.current.classList.add("visible");
    }
  }

}

  const closeOrder = ()=>{
   // console.log(`close function was lunched at ${id} item`);
         if(orderProductRef.current){
          orderProductRef.current.classList.remove("visible");
          orderProductRef.current.classList.add("hidden");
          setFlavour('');
          setFlavours([]);
          setFullName('');
          setPhoneNumber('');
         }
    setOrderButton('');
  }

  const openChartOrder =()=>{
 //    closeOrder();
    if(orderChartRef.current){
      orderChartRef.current.classList.add("visible");
      orderChartRef.current.classList.remove("hidden");
    }
  }
  const closeChartOrder = ()=>{


        if(orderChartRef.current){
          orderChartRef.current.classList.remove("visible")
          orderChartRef.current.classList.add("hidden")
        }

  }

  const handleSelectFlavour = (e) => {
    // Find the selected flavour object based on its value (ID)
    const selectedFlavour = flavourOptions.find(option => option.value == e.target.value);
    
    // Set the flavour to the flavour text (e.g., "chocolate" instead of its ID)
    setFlavour(selectedFlavour ? selectedFlavour.text : null);
  };

  const addFlavour = (choice) => {

    console.log("wanted = "+choice);
   if(flavours.length<=4){
    if (choice && !flavours.includes(choice)) {
      setFlavours([...flavours, choice]);
    }
  }
  else {

    setError(1,orderProductRef.current,"You can only put 5 flavours");    
      setTimeout(()=>{
      
        setSuccess(1,orderProductRef.current);

      },2000)


  }

  };

  const deleteFlavour = (choice) =>{
   // console.log("wanted = "+choice);
     let newFlavours = flavours.filter((flavour)=> flavour!=choice);
     setFlavours(newFlavours);
  //   console.log('flavours after delete = '+flavours);
  }

  const handleChange = (e) => {
   // const {name, value} = e.target;
   if(e.target.value===0) {
    setOrderQuanity(1);
   e.target.value=1; 
  }
   else
    setOrderQuanity(e.target.value);
  };
  const validFullName = (data) => {
    const regularExpression = /^[A-Za-z]+( [A-Za-z]+)*$/;
    
    // Check if the length of the data is <= 40 characters
    if (data.length > 50 || data.length<3) {
        return false;
    }

    // Check if the data matches the regular expression
    return regularExpression.test(String(data));
};



  const orderOneProductNow = async (id)=>{
    const card = cards.find((card) => card.item_Id === id);
   if(validFullName(fullName)){
    setSuccess(2,orderFullNameRef.current);
     if(isValidTelephone(phoneNumber)){
      let dbQuantity;
      await axios.post(`${apiUrl}/checkProductQuantity`,{productId:card.item_Id,quantity:card.quantity})
      .then((res)=>{
        dbQuantity =  res.data.dbRes;
      })
      .catch((err)=>{
        console.log(err);
      })
      
      console.log("db quantity of One Product = "+dbQuantity);
      if(dbQuantity<orderQuanitity) {
  
        setError(2,orderQuantityRef.current,` there is only ${dbQuantity} available in stock`);
       setTimeout(()=>{
        setSuccess(2,orderQuantityRef.current);
       },2000);
      }
      else {
  
        swal.fire({
          title: 'confirmation',
          text: 'Do you want to confirm ordering',
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: 'cancel',
          confirmButtonText: 'confirm',
          
          customClass: {
            
            title: 'alertOrderTitle',
            icon: 'alertOrderIcon',
            cancelButton: 'alertOrderCancelButton',
            confirmButton: 'alertOrderConfirmButton',
          }
        })
        .then((result) => {
          if (result.isConfirmed) {
            const now = new Date(Date.now());
    axios.post(`${apiUrl}/orderProduct`,{
      customerUsername:storedAccountId,
      customerFullName:fullName,
      customerPhoneNumber:phoneNumber,
      productId:card.item_Id,
      orderFlavours:flavours.length> 0 ? flavoursAsString(flavours) : 'original',
      orderQuanititySent:orderQuanitity>0 ? orderQuanitity : 1,
      orderPrice:orderQuanitity>0 ? card.item_price*orderQuanitity : card.item_price,
      orderDate:`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours()}:${now.getMinutes()}`,
    })
    
    .then((response)=>{
     // console.log('sending Date = '+orderDate);
       console.log(response.data.message);
     
       swal.fire({
        title: "ordered!",
        html: `Your product has been ordered <span class="successHighlight">successfully</span> `,
        icon: "success",
  
        customClass: {
          confirmButton: 'alertOrderConfirmButton2',
        }
             //Thanks for shopping with us Don't forget to retrieve you order!
             // with id : <span class="warningHighlight">${response.data.orderId}</span> !
      }).then(()=>{
        swal.fire({
          html: `Thanks for shopping with us <span class="warningHighlight">Don't forget to take your ticket order to retrieve</span> your order`,
          icon: "success",
          customClass: {
            confirmButton: 'alertOrderConfirmButton2',
          }
        }
        );
      })
      .then(()=>{
        const now = new Date(Date.now());
        const orderDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const tableColumns = ["Item-Id","Flavours","Quantity", "Price"];
        const tableRows = [];
        const doc = new jsPDF();
        doc.setFontSize(24);
        const title = "Order Receipt";
        const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width
        const titleWidth = doc.getTextWidth(title); // Get the width of the title text
        const titleX = (pageWidth - titleWidth) / 2; // Calculate the X position for centering
        doc.text(title, titleX, 20); // Render the centered title
        doc.setFontSize(12);
        doc.text(`Date: ${orderDate}`, 160,10);
        // Adjust "Order ID" text with a bit more margin from the left
        doc.setFontSize(22);
        doc.text(`Order ID: ${response.data.orderId}`, 30, 40); // Increased the X position to 30 for more left margin
        doc.setFontSize(12);
        doc.text(`Client: ${response.data.clientName}`,15,50);
        doc.text(`Telephone: ${response.data.phoneNumber}`,130,50);
        // Add data to the table
        tableRows.push([response.data.productId,response.data.flavours,response.data.orderQuantity, response.data.orderPrice]);
        
        // Render the table
        doc.autoTable({
          startY: 60, // Y position where the table starts
          head: [tableColumns], // Table header
          body: tableRows, // Table data
        });
        
        // Add the thank you and retrieval advice text below the table
        const finalY = doc.autoTable.previous.finalY + 10; // Get Y position after the table, adding a little space
        doc.setFontSize(14);
        doc.text(`total : ${response.data.orderPrice} da`,150,finalY+7);
       // finalY+=10;
       doc.setFontSize(13);
        doc.text("Thank you for your purchase!", 30, finalY+20);
        doc.text("Please make sure to retrieve your order from our shop center.", 30, finalY + 25);
        doc.setFontSize(11);
        doc.setTextColor(255, 69, 0);
        doc.text('Dambri-Ice-Cream-team',160,finalY+40);
        doc.save(`order-ticket-${response.data.orderId}.pdf`);
       setFullName('');
       setPhoneNumber('');
      })
  
    })
    .catch((err)=>{
      console.log(err);
      throw err;
    })
  
     closeOrder(id);
          }
        })
    }
     }
     else {
      setError(2,orderPhoneNumberRef.current,"Invalid phone number")
      setTimeout(()=>{
        setSuccess(2,orderPhoneNumberRef.current);
    },3000);
     }
   }
  else {
    setError(2,orderFullNameRef.current,"Invalid Full Name");

    setTimeout(()=>{
        setSuccess(2,orderFullNameRef.current);
    },3000);
  }
}

const flavoursAsString = (flavoursArray)=>{
  let flavours = '';
  for(let i=0;i<flavoursArray.length;i++){
     if(i==0){
      flavours = flavours + flavoursArray[i];
     }
     else {
      flavours = flavours+' , '+flavoursArray[i];
     }
  }
  return flavours;
}

const addProductToChartProdcts =  (chart,newProduct)=>{
  
  // sameFlavours(chart[i].chartProductFlavours,newProduct.chartProductFlavours)===0
  let i=0;
  for(i=0;i<chart.length;i++){
    if(chart[i].chartProductId===newProduct.chartProductId && sameFlavours(stringToArray(chart[i].chartProductFlavours),stringToArray(newProduct.chartProductFlavours))===0){

      console.log('YES YES');

      setChart((prevChart) => 
        prevChart.map(product =>
          product.chartProductId === newProduct.chartProductId 
            ? {
                ...product,
                chartProductQuantity: product.chartProductQuantity + newProduct.chartProductQuantity,
                chartProductPrice: product.chartProductPrice + newProduct.chartProductPrice,
              }
            : product
        )
      );

      break;
    }
  }

  if(i===chart.length){
     setChart((prevChart)=>[...prevChart,newProduct]);
  }
  setTotalPrice((preValue)=>preValue+newProduct.chartProductPrice);         
// await setChart((prevChart)=>[...prevChart,newProduct]);
}

const sameFlavours = (chartProductFlavours,newProductFlavours)=>{

  console.log('lenght = '+newProductFlavours.length);

  if(chartProductFlavours.length!==newProductFlavours.length)
    return -1;

  let checker = newProductFlavours.length;
  console.log('checker before = '+checker);
  
  for(let i=0;i<newProductFlavours.length;i++){
  
      for(let j=0;j<chartProductFlavours.length;j++){
        if(newProductFlavours[i]===chartProductFlavours[j]){
          checker--;
          break;
        }
      }
      if(checker===0)
        return checker;
  }
  console.log('checker after = '+checker);

  return checker;

}

function stringToArray(inputString) {
  return inputString.split(',').map(item => item.trim());
}

/*
function doesItemExist(item, itemsString) {
  const itemsArray = itemsString.split(',').map(str => str.trim());
  return itemsArray.includes(item.trim());
}*/


  const addToChart = async(id)=>{
  //  console.log(chosenCard);
    const card = cards.find((card)=>card.item_Id===id);
    let dbQuantity;
    await axios.post(`${apiUrl}/checkProductQuantity`,{productId:card.item_Id,quantity:card.quantity})
    .then((res)=>{
     // console.log("Quantity in DB = "+res.data.dbRes);
      dbQuantity =  res.data.dbRes;
    })
    .catch((err)=>{
      console.log(err);
    })
    
    if(dbQuantity<orderQuanitity) {

      setError(2,orderQuantityRef.current,`Only ${dbQuantity} available in stock`);
     setTimeout(()=>{
      setSuccess(2,orderQuantityRef.current);
     },2000);
    }
    else {
     
      
      swal.fire({
        title: 'confirmation',
        text: 'Do you want to add it to you chart ?',
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'cancel',
        confirmButtonText: 'confirm',
        
        customClass: {
          
          title: 'alertOrderTitle',
          icon: 'alertOrderIcon',
          cancelButton: 'alertOrderCancelButton',
          confirmButton: 'alertOrderConfirmButton',
        }
      })
      .then((res)=>{
        if(res.isConfirmed){
          const newProduct = {
            chartProductId: card.item_Id,
            chartProductName: card.item_name,
            chartProductPhoto: card.item_photo,
            chartProductFlavours: flavours.length> 0 ? flavoursAsString(flavours) : 'original',
            chartProductQuantity: Number(orderQuanitity > 0 ? orderQuanitity : 1),
            chartProductPrice: orderQuanitity > 0 ? card.item_price * orderQuanitity : card.item_price,
          };


          addProductToChartProdcts(chart,newProduct);

        swal.fire({
          title: "added!",
          html: `Your order has been added to your <span class="successHighlight">chart</span> `,
          icon: "success",
    
          customClass: {
            confirmButton: 'alertOrderConfirmButton2',
          }
               //Thanks for shopping with us Don't forget to retrieve you order!
        })

          closeOrder(id);
        //  console.log(chart);
        }
      })

    }

  }

  const deleteProductFromChart = (index)=>{
   console.log("idnex = "+index);

  
  swal.fire({
    title: 'confirmation',
    text: 'Do you really want to delete this product from your chart',
    icon: 'warning',
    showCancelButton: true,
    showConfirmButton: true,
    cancelButtonText: 'No',
    confirmButtonText: 'Yes',

    customClass: {
      title: 'alertDeleteProductFromChart',
    }
    
  })
  .then((res)=>{
    if(res.isConfirmed){
    
      let newProductCharts = [];
      let j=0;
      for (let i=0;i<chart.length;i++){
        if(i!==index){
          newProductCharts[j]=chart[i];
          j++;
        }
          
      }
      setTotalPrice(totalPrice-chart[index].chartProductPrice);
      setChart(newProductCharts);

    }
  })

  }

  const orderMultipleProducts = async()=>{
      console.log('order mutltiple products fct was lunched');
      console.log('full name = '+fullName);
      console.log('phone number = '+phoneNumber);
      if(validFullName(fullName)){
         setSuccess(1,orderFullNameRef2.current);
         
         if(isValidTelephone(phoneNumber)){
          if(chart.length>=1){

            swal.fire({
              title: 'confirmation',
              text: 'Do you really want to order all the products in your chart ?',
              icon: 'warning',
              showCancelButton: true,
              showConfirmButton: true,
              cancelButtonText: 'cancel',
              confirmButtonText: 'confirm',
              
              customClass: {
                
                title: 'alertOrderTitle',
                icon: 'alertOrderIcon',
                cancelButton: 'alertOrderCancelButton',
                confirmButton: 'alertOrderConfirmButton',
              }
            })
            .then((res)=>{
              if(res.isConfirmed){
                  console.log(chart);
      
                  let chartProducts = [];
      
                  for(let i=0;i<chart.length;i++){
                    const newProduct = {
      
      
                      chartProductId: chart[i].chartProductId,
                      chartProductFlavours: chart[i].chartProductFlavours,
                      chartProductQuantity: chart[i].chartProductQuantity,
                      chartProductPrice: chart[i].chartProductPrice,
      
                    }
                    chartProducts.push(newProduct);
                  }          
      
              axios.post(`${apiUrl}/orderMultipleProducts`,{fullName,totalPrice,chartProducts,phoneNumber})
              .then((res)=>{
                console.log(res.data.message);
      
                swal.fire({
                  title: "ordered!",
                  html: `Your products has been ordered <span class="successHighlight">successfully</span> `,
                  icon: "success",
            
                  customClass: {
                    confirmButton: 'alertOrderConfirmButton2',
                  }
                       //Thanks for shopping with us Don't forget to retrieve you order!
                }).then(()=>{
                  swal.fire({
                    html: `Thanks for shopping with us <span class="warningHighlight">Don't forget to take your ticket order to retrieve</span> your order`,
                    icon: "success",
                    customClass: {
                      confirmButton: 'alertOrderConfirmButton2',
                    }
                  }
                  );
                })
                .then(()=>{
                  const now = new Date(Date.now());
                  const orderDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}:${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                  const tableColumns = ["Item-Id","Flavours","Quantity", "Price"];
                  const tableRows = [];
                  const doc = new jsPDF();
                  doc.setFontSize(24);
                  const title = "Order Receipt";
                  const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width
                  const titleWidth = doc.getTextWidth(title); // Get the width of the title text
                  const titleX = (pageWidth - titleWidth) / 2; // Calculate the X position for centering
                  doc.text(title, titleX, 20); // Render the centered title
                  doc.setFontSize(12);
                  doc.text(`Date: ${orderDate}`, 160,10);
                  // Adjust "Order ID" text with a bit more margin from the left
                  doc.setFontSize(22);
                  doc.text(`Order ID: ${res.data.orderId}`, 30, 40); // Increased the X position to 30 for more left margin
                  doc.setFontSize(12);
                  doc.text(`Client: ${res.data.clientName}`,15,50);
                  doc.text(`Telephone: ${res.data.phoneNumber}`,130,50);
                  
                  // Add data to the table
                   for(let i=0;i<chartProducts.length;i++){
                    tableRows.push([chartProducts[i].chartProductId,
                      chartProducts[i].chartProductFlavours,
                      chartProducts[i].chartProductQuantity,
                      chartProducts[i].chartProductPrice]);
                   }
                  
                  // Render the table
                  doc.autoTable({
                    startY: 60, // Y position where the table starts
                    head: [tableColumns], // Table header
                    body: tableRows, // Table data
                  });
                  
                  // Add the thank you and retrieval advice text below the table
                  let finalY = doc.autoTable.previous.finalY + 10; // Get Y position after the table, adding a little space
                  doc.setFontSize(14);
                  doc.text(`total : ${totalPrice} da`,150,finalY+7);
                 // finalY+=10;
                 doc.setFontSize(13);
                  doc.text("Thank you for your purchase!", 30, finalY+20);
                  doc.text("Please make sure to retrieve your order from our shop center.", 30, finalY + 25);
                  doc.setFontSize(11);
                  doc.setTextColor(255, 69, 0);
                  doc.text('Dambri-Ice-Cream-team',160,finalY+40);
                  doc.save(`order-ticket-${res.data.orderId}.pdf`);          
                  setFullName('');
                  setPhoneNumber('');
                  setTotalPrice(0);
                  setChart([]);
                  setOrderQuanity(1);          
                  closeChartOrder();
                 
        
      
                })
              })    
              .catch((err)=>{
                console.log(err);
              })
              }
            })
          }
         }
         else {
          setError(2,orderPhoneNumberRef2.current,"Invalid phone number")
          setTimeout(()=>{
            setSuccess(2,orderPhoneNumberRef2.current);
        },3000);
         }
      }
      else {
        setError(2,orderFullNameRef2.current,"Invalid Full Name");

        setTimeout(()=>{
            setSuccess(2,orderFullNameRef2.current);
        },3000);

      }


     
  }
 /*
  const openMyOldOrdersList = ()=>{
    if(oldOrdersRef.current){
      setOpenMyOrders(true);
      oldOrdersRef.current.classList.remove("hidden");
      oldOrdersRef.current.classList.add("visible");
    }
  }
*/


const isValidTelephone = (telephone) => {
  const re = /^(0[5|6|7][0-9]{8})$/
  return re.test(String(telephone));
}
  


return (
  <>
  <Toaster />
  {

            <>
            <div className='shop'>

            <div className="accountChart">
 {/*<img src={accountLogo} alt="" />
            <div className="account">
             
              <span><MdAccountCircle size={50} onClick={openChartOrder} color='orangered'/></span>
              <h4>{storedAccountId}</h4>
            </div>
*/}
         <div className="accountOperations">
         <div className="chart">
           {/*<img className='chartLogo' src={chartLogo} alt="" onClick={openChartOrder}/> */}
           <span><FaBagShopping size={39} onClick={openChartOrder}/></span>
           <p className="chartSize" onClick={openChartOrder} style={{background:chart.length>0 ?'orangered':''}}>{chart.length>0 ? chart.length:''}</p>
           </div>
           {/*#2196F3 

           <div className="accountAllOrders">
           <span><FaClipboardList   size={39} onClick={openMyOldOrdersList}/></span>
           <p onClick={openMyOldOrdersList} style={{background:notification==='Completed'?'#2196F3': notification==='Ready'?'#4CAF50': notification==='Rejected'?'#F44336':''}} >
            {notification!=='' ? '!': ''}</p>           
           </div>
*/}
           
           <div className="logOut">
              <Link to="/" >
            <span> <MdOutlineLogout size={39} /></span>
             </Link>
            </div>
         </div>


            </div>
              <div className='cards-container'>
                {cards.map((card, key) => {
                  return (
                    <div key={key} className="Product" onMouseEnter={() => checkAvailabitily(key)}>
                      <div className="itemPhoto">
                        <img src={`data:image/png;base64,${card.item_photo}`} alt="" />
                      </div>
                      <div className="itemTitle">{`${card.item_name}`}</div>
                      <div className="itemDescription">
                        <span
                          ref={(el) => (availabilityRef.current[key] = el)} // Assign ref to the correct index
                        ></span>
                        <div className="productDetailsDescription">
                          <div className="price">
                            <p>{`${card.item_price}`} <span>DA</span></p>
                          </div>
                          <div className="buy">
                          <button className='orderProductNow' onClick={() => openOrder(card.item_Id,1)}>
                             order now
                            </button>
                            <button className='addProductToChart' onClick={() => openOrder(card.item_Id,2)}>
                              <FaCartPlus  />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
        
              <div className="orderProductCard" ref={orderProductRef}>
                <div className="orderProduct" ref={productFlavourOptions}>
                  {chosenCard.productId && (
                    <>
                      <button className='closeButton' onClick={closeOrder} style={{ display: 'block' }}>X</button>
        
                      <div className="orderedProductPhoto">
                      <img
                          src={`data:image/png;base64,${chosenCard.productPhoto}`}
                          alt=""
                        />
                        <h3>{chosenCard.productName}</h3>
                     </div>
                     
                      { chosenCard.productFlavours === 1 ? (
                        <>
                      <h3 className='flavours'>Choose your flavours:</h3>
                      <select className='yourOptions' onChange={handleSelectFlavour}>
                        {flavourOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                      <button className='addFlavour' onClick={() => addFlavour(flavour)}><MdAddBox size={26}/></button>
                        
                      
        
                  <ul className="chosenFlavours">
                        {flavours.map((flavour, index) => (
                          <li key={index} className='choseFlavour'>
                            <button className='deleteFlavour'onClick={() => deleteFlavour(flavour)}>x</button>
                            <p className='flavourName'>{flavour}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="error"></div>
                      
                      </>
          
          ) : (
            <>
            </>
          )}
         <div className="quantityPrice">
          
        <div className="orderQuantity" ref={orderQuantityRef}>
                        <label htmlFor="">Quantity</label>
                        <input
                         type="number"  placeholder="1" min={0} className="orderQuantityNumber" name="orderQuanitity" value={orderQuanitity} 
                        onChange={handleChange}/>
        
          <div className="quantityError"></div>              
                      </div>

         <div className="orderPrice">
           <label htmlFor="">Price: <span>{orderQuanitity>1 ? (chosenCard.productPrice*orderQuanitity) :(chosenCard.productPrice)}</span></label>
          </div>         
          </div>  
            <>
            {
              orderButton === 1 ? (
                 <>
                <div className='orderOwnerFullName'>
                <label htmlFor="">Your full name</label>
                <input type="text" placeholder='Enter full Name' name='fullName' value={fullName} ref={orderFullNameRef} onChange={(e)=>setFullName(e.target.value)}/>
                <div className="quantityError"></div>
            </div>    
            <div className='orderOwnerFullName'>
                <label htmlFor="">Your phone number</label>
                <input type="text" placeholder='Enter phone number' name='phoneNumber' value={phoneNumber} ref={orderPhoneNumberRef} onChange={(e)=>setPhoneNumber(e.target.value)}/>
                <div className="quantityError"></div>
            </div> 
                 </>
              ) : (
                <></>
              )
            }
            </>
             
            <>
            { orderButton === 1 ? (
              <button className='orderOneNow' onClick={()=>orderOneProductNow(chosenCard.productId)}>order</button>
            )
            :(
              <button className='orderProducts' onClick={()=>addToChart(chosenCard.productId)}>add to chart</button>
            )

          }
            </>

                    </>
                  )}
                </div>
              </div>
              
        {/*
                      <div className="oldOrdersCard" ref={oldOrdersRef}>
              <button className='chartCloseButton' onClick={closeMyOldOrdersList} style={{ display: 'block' }}>X</button>
                   
              {
                openMyOrders===true ? (
                  <CollapsibleTable accountId={storedAccountId}/>
                )
                :<>
                </>
              }
              </div>
        */}

              <div className="chartCard" ref={orderChartRef}>
              <button className='chartCloseButton' onClick={closeChartOrder} style={{ display: 'block' }}>X</button>

           {
            chart && Object.keys(chart).length > 0 ?(
              <>
                       <div className='chartInformation'>

<div className="numberOfProducts">
      <p>Number of products : <span>{chart.length}</span></p>
</div>

<div className="totalPrice">
     <p>Total price : <span>{totalPrice} DA</span></p>            
<button className='chartOrderButton' onClick={orderMultipleProducts}>
order all
</button> 
</div>

</div>



<div className="customerInformation">
           { /* Customer's Full Name */}
            <div className="customerName">
              <label htmlFor="">Your full Name:</label>
              <input type="text" id="customerFullName" placeholder="Enter full name" name='fullName' value={fullName} ref={orderFullNameRef2} onChange={(e)=>setFullName(e.target.value)}
              />
              <div className="quantityError"></div>  
            </div>
            
            {/* Customer's Phone Number */} 
            <div className="customerPhone">
              <label htmlFor="">Your phone Number:</label>
              <input 
                type="text" 
                
                placeholder="Enter phone number" 
                name='phoneNumber' value={phoneNumber} ref={orderPhoneNumberRef2} onChange={(e)=>setPhoneNumber(e.target.value)}
              />
              <div className="quantityError"></div>  
            </div>
        </div>


<table className='chartProductsTable'>
<thead className='chartProductsTableHeading'>
<tr className='tableRowChartProducts'>
{TABLE_HEADS?.map((th, index) => (
  <th key={index} className='tableHeadChartProducts'>{th}</th>
))}
</tr>
</thead>
<tbody>
{chart.map((product,index) => {
return (
  <tr key={index} className='tableRowChartProducts'>
  <td className='tableDataProductPhoto'><img src={`data:image/png;base64,${product.chartProductPhoto}`} alt="" /></td>
    <td className='tableDataChartProducts'>{product.chartProductName}</td>
    <td className='tableDataFlavoursChartProducts'>{product.chartProductFlavours}</td>
    <td className='tableDataChartProducts'>{product.chartProductQuantity}</td>
    <td className='tableDataChartProducts'>{product.chartProductPrice}</td>

    <td className="tableDataChartProducts">
<button className="DeleteChartButton" onClick={()=>deleteProductFromChart(index)} >
<MdDelete size={20}/>
</button>


    </td>
  </tr>
);
})}
</tbody>
</table>
              </>
            ) :(
              <>

<div className='chartInformation'>
</div>
 <div className="fatherEmptychart">
 <span className='chartEmptyIcon'><FaShoppingCart size={40}/></span>
 <p className='chartIsEmpty'>You chart is empty now</p>
 </div>
              </>
            )

           }
              </div>
        
              <div className="footer"></div>
            </div>
            </>
          
  }  
  </>
);

}
export default Shop





