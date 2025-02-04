import  React, { useEffect, useRef, useState } from 'react'
import {toast} from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import './Orders.scss'
import {MdClose } from 'react-icons/md';
import {FiCheckCircle, FiEye} from 'react-icons/fi'
import  io  from 'socket.io-client';
import axios from 'axios';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { AiOutlineInbox } from 'react-icons/ai';
function Orders() {
  const [orders,setOrders] = useState([]);
  const [orderId,setOrderId] = useState('');
  const [totalPrice,setTotalPrice] = useState(0);
  const [cachedOrdersDetails,setCachedOrdersDetails] = useState({});
  const [orderProducts,setOrderProducts] = useState([]);
  const [orderState,setOrderState] = useState('');
  const [customerFullName,setCustomerFullName] = useState('');
  const [phoneNumber,setPhoneNumber] = useState('');
  const ordersTableRef = useRef('');
  const orderCardContainerRef = useRef('');
  const socketRef = useRef('');
  const [serach,setSearch] = useState('');
  const navigate = useNavigate('');
  const apiUrl = import.meta.env.VITE_API_URL
  
  useEffect(()=>{

    
    const admin = sessionStorage.getItem('admin');

    if(admin==='yesAdmin'){
      axios.get(`${apiUrl}/getOrders`)
      .then((res)=>{
     //   console.log("Orders \n"+res.data.orders);
        setOrders(res.data.orders);
      })
      .catch((err)=>{
        console.log(err);
      }) 
    }
    else {
      navigate('/admin/login')
    }

    sessionStorage.setItem('activeMenu','Orders');
            
    socketRef.current = io(`${apiUrl}`,{
      auth: {secret: 'this is from Order component'},
      query: {data:'Order.jsx'}
    })


  //  socketRef.current.emit('fromOrderComponent','hello from Order');

    socketRef.current.on('newOrderAdded',newOrder=>{
      console.log('newOrder event has been added '+newOrder);

        toast.info(`New order was made by ${newOrder.customerFullName}`, {
          position: "bottom-left",
          duration: 5000,
          className: "toastClass",
       });
      setOrders((previousOrders)=>[...previousOrders,newOrder]);
    })

    socketRef.current.on('updateOrderSate',data=>{
      const updatedOrderId = data.orderId;
      const updatedState = data.newState;

      setOrders(previousOrders=>
        previousOrders.map(order=>
          order.order_Id===updatedOrderId ? {...order, orderState : updatedState } : order       
        )
      )
    })

    socketRef.current.on('serverOrderIsReady', (data) => {
      console.log('Emitting fromOrders with data:');
      socketRef.current.emit('fromOrders', data);
    });
    

  }, [socketRef]);

  
  const TABLE_HEADSOrders = [
    // the head of the table
    "Order id",
    "Full Name",
    "Telephone",
    "Price",
    "Date",
    "Operation",
    "State",
  ];


  const TABLE_HEADSProducts = [
    "Product Id",
    "Name",
    "Type",
    "Flavours",
    "Quantity",
    "Price",
  ]

  const openOrder = (orderId,orderTotalPrice,customerFullName,orderState,phoneNumber)=>{

    setOrderId(orderId);
    setTotalPrice(orderTotalPrice);
    setCustomerFullName(customerFullName)
    setOrderState(orderState);
    setPhoneNumber(phoneNumber);
  //  console.log('cache length = '+cachedOrdersDetails.length);

      if(!cachedOrdersDetails[orderId]){


        axios.post(`${apiUrl}/getOrderProducts`,{orderId:orderId})
        .then((res)=>{
          console.log("request made");
          setOrderProducts(res.data.productsOrder);
          setCachedOrdersDetails((prev)=>({
            ...prev,
            [orderId]:res.data.productsOrder,
        }));
         // console.log('Products = \n');
        })
        .catch((err)=>{
    
          console.log(err);
          return err;
        })
      
      }
      else {
        console.log("request not made");
        setOrderProducts(cachedOrdersDetails[orderId]);

      }
     if(orderCardContainerRef.current){
      orderCardContainerRef.current.classList.add('visible');
     }

  }

  const closeOrder = ()=>{
    setOrderState('');
    if(orderCardContainerRef.current){
      orderCardContainerRef.current.classList.remove('visible');
      setTotalPrice(0);
     } 
     }

     const makeOrderReady = () =>{
       swal.fire({
        title: 'confirmation',
        text: 'Are you sure the order is Ready',
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'No',
        confirmButtonText: 'Yes',
        
        customClass: {
          
          title: 'alertOrderTitle',
        }
      })
      .then((res)=>{
        if(res.isConfirmed){
       //   socketRef.current.emit('joinRoom',{cutomerUsername:cutomerUsername});
          axios.post(`${apiUrl}/orderIsReady`,{orderId:orderId,newOrderState:"Ready"/*,customerUsername:cutomerUsername*/})
      .then((res)=>{
            closeOrder();
            console.log(res.data);

        swal.fire({
          title: "Ready!",
          html: `Order with <span class="alertDeleteProductFromChart">Id : ${orderId}</span> State was set to  <span class="successHighlight">Ready</span> `,
          icon: "success",
    
          customClass: {
            confirmButton: 'alertOrderConfirmButton2',
          }
               //Thanks for shopping with us Don't forget to retrieve you order!
        })
        
        setOrderId('');
        setCustomerFullName('');
      })
      .catch(err=>{
        console.log(err);
        return err;
      })



        }
      })

     }

     const completeOrder = (order_Id) =>{

      swal.fire({
        title: 'confirmation',
        html: 'Do you really want to <span class="successHighlight">finish</span> the order,is the client there !',
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonText: 'Cancel',
        cancelButtonColor: "red",
        confirmButtonColor: "green",
        confirmButtonText: `Confirm`,
        
        customClass: {
          
          title: 'alertDeleteProductFromChart',
          icon: 'alertOrderIcon',
        }
      }).then((result) => {
        if (result.isConfirmed) {
        //  socketRef.current.emit('joinRoom',{cutomerUsername:cutomerUsername});
          axios.post(`${apiUrl}/orderIsReady`,{orderId:order_Id,newOrderState:"Completed"/*,customerUsername:cutomerUsername*/})
          .then((res)=>{
                closeOrder();
                console.log(res.data);
                swal.fire({
                  title: "Confirmed!",
                  html: 'Order was confirmed as a <span style="color:orangered;">sale</span>',
                  icon: "success",
                  buttonsStyling: {
                    color: "orange",
                  },
                  customClass: {
                    title: 'successHighlight'
                  }
                  
                }) 
                setOrderId('');
                setCustomerFullName('');
              })
              .catch((err)=>{
                console.log(err);
                toast.warning(`error occured while setting order ${orderId} to ready`,{
                  position: "bottom-left",
                })
              })

        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === swal.DismissReason.cancel
        ) {
          swal.fire({
            title: "Cancelled",
            text: "Order confirmation has been canceled",
            icon: "error",
            customClass: {
              confirmButton: "afterCancelBtn"
            }
          });
        }
      });

     }

     const RejectOrder = () =>{
    
       if(orderState!=="Rejected"){
        swal.fire({
          title: "Order reject!",
          html: `Order with <span class="alertDeleteProductFromChart">Id : ${orderId}</span> will be rejected completely `,
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonText: `Yes,I'm sure`,
          
          customClass: {
            
            title: 'alertDeleteProductFromChart',
            icon: 'alertOrderIcon',
            cancelButton: 'alertOrderCancelButton',
            confirmButton: 'alertOrderConfirmButton',
          }
        })
        .then((res)=>{
          if(res.isConfirmed){
            setOrderState('');
         //   socketRef.current.emit('joinRoom',{cutomerUsername:cutomerUsername});
            axios.post(`${apiUrl}/orderIsReady`,{orderId:orderId,newOrderState:"Rejected"/*,customerUsername:cutomerUsername*/})
            .then((res)=>{
                  closeOrder();
              console.log(res.data);
              
              swal.fire({
                title: "Reject!",
                html: `Order with <span class="warningHighlight">Id : ${orderId}</span> State was <span class="warningHighlight">Rejected</span> `,
                icon: "warning",
          
                customClass: {
                  confirmButton: 'alertOrderConfirmButton2',
                }
                     //Thanks for shopping with us Don't forget to retrieve you order!
              })
              setCustomerFullName('');
            })
            .catch(err=>{
              console.log(err);
              toast.warning(`error occured while rejecting the order ${orderId}`,{
                position: "bottom-left",
              })
              return err;
            })
  
          }
        })
       }
      
     }


     const compareSearchWithOrderId = (order_Id,serach)=>{
      const compareOrder_Id = String(order_Id);
      const compareSearchVal = String(serach);
      if(compareOrder_Id.toLocaleLowerCase().includes(compareSearchVal)){
        return true;
      }
      else {
        return false;
      }
     }

  return (
    <div className='orderFather'>

      {
        orders.length > 0 ? (
          <>
              <div className="ordersContainer">
    <div  className="serachBar">
        <input id='searchInput' placeholder='Search orders' onChange={(e)=>setSearch(e.target.value)} type="text" />
      </div>
            
        <table className='ordersTable' ref={ordersTableRef}>
          <thead className='ordersTableHeading'>
            <tr className='tableRowOrders'>
              {TABLE_HEADSOrders?.map((th, index) => (
                <th key={index} className='tableHeadOrders'>{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>

      {
       
        orders.filter((order)=>{
          
          return serach.toLowerCase()==='' || compareSearchWithOrderId(order.order_Id,serach) || order.customerFullName.toLowerCase().includes(serach.toLowerCase()) || order.customerTelephone.includes(serach.toLowerCase());
        })
        .map((order,index) => {
          return (order.orderState !=="Completed" && order.orderState!=="Rejected") && (

               <tr key={index} className='tableRowOrderProducts'>
                 <td className='tableDataOrders'>{order.order_Id}</td>
                 <td className='tableDataFlavourOrders'>{order.customerFullName}</td>
                 <td className='tableDataOrders'>{order.customerTelephone}</td>
                 <td className='tableDataOrders'>{order.orderPrice}</td>
                 <td className='tableDataOrders'>{order.order_Date}</td>

                 <td className="tableDataOrdersOperation">
      {
       // ()=>completeOrder(order.order_Id)
        order.orderState === "Ready" ? (
         <button className="completeOrder" onClick={()=>openOrder(order.order_Id,order.orderPrice,order.customerFullName,order.orderState,order.customerTelephone)}>
         <FiCheckCircle size={22}/>
         </button>
        )
       : (
        <button className="viewOrderBtn" onClick={()=>openOrder(order.order_Id,order.orderPrice,order.customerFullName,order.orderState,order.customerTelephone)}>
        <FiEye size={22}/>
        </button>
   
       )
      }

                 </td>        
                 <td className='tableDataOrders' style={{
                  color: order.orderState==="In queue" ? "gray" : order.orderState==="Ready" ? "rgb(19, 192, 68)"  : "red"
                 }}>{order.orderState}</td>    
               </tr>
             
           )
       })
      }

          </tbody>
        </table>
        <div className="orderCardContainer" ref={orderCardContainerRef}>
        <div className="orderCard">
          <button className="closeOrderDetails" onClick={closeOrder}><MdClose size={34} /></button>
           
                      <div className="orderInformation">
                      <h2 className='orderId'>order_id : <span>{orderId}</span></h2>
                      <h2 className='orderId'>client : <span>{customerFullName}</span></h2>
                      <h2 className='phoneNumber'>phone : <span>{phoneNumber}</span></h2>
                    </div>
               

             
           {

<table className='productsTable' ref={ordersTableRef}>
          <thead className='productsTableHeading'>
            <tr className='tableRowOrders'>
              {TABLE_HEADSProducts?.map((th, index) => (
                <th key={index} className='tableHeadProducts'>{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>

                         {orderProducts.map((product,index) => {
              return (
                <tr key={index} className='tableRowOrderProducts'>
                  <td className='tableDataProducts'>{product.item_Id}</td>
                  <td className='tableDataProducts'>{product.item_name}</td>
                  <td className='tableDataProducts'>{product.item_type}</td>
                  <td className='tableDataProductsFlavours'>{product.flavourDescription}</td>
                  <td className='tableDataProducts'>{product.itemQuantity}</td>
                  <td className='tableDataProducts'>{product.itemPrice}</td>
                </tr>
              );
            })}

          </tbody>
        </table>
   
           }

        <h3 className='orderTotalPrice'>Total: <span>{totalPrice}DA</span></h3>
            
     <div className="btnsOperations">
     {
     orderState === "Ready" ? (
      <button
        className='finishBtn' disabled style={{ backgroundColor: 'gray', borderRadius:'10px' }} >
        Order is Ready
      </button>
    ) : (
      <button className='finishBtn' onClick={makeOrderReady}>
        Order is Ready
      </button>
    )
     }
     <button className='rejectBtn' onClick={RejectOrder}>Reject order</button>
    {
      orderState ==="Ready" ? (
        <button className='completeOrder' onClick={()=>completeOrder(orderId)}>Finish order</button>
      ) : (
        <>
                <button  className='completeOrder' disabled style={{ backgroundColor: 'gray', borderRadius:'10px' }}>Finish order</button>
        </>
      )
    }

     </div>

        </div>
      </div>
    </div>
    </>
        ) : (
          <>
          <div className="noOrderYet">
            <AiOutlineInbox size={60} />
            <h1>No orders Now </h1>
          </div>
          </>
        )
      }


    </div>
  )
}

export default Orders
