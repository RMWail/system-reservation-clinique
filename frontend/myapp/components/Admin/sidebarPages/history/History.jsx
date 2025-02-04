import React, { useEffect, useRef, useState } from 'react'
import './History.scss';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';
import {FiEye} from 'react-icons/fi'
import { MdOutlineHistory,MdClose, MdHistory } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
function History() {
  const [orderId,setOrderId] = useState('');
  const [totalPrice,setTotalPrice] = useState(0);
  const [orderProducts,setOrderProducts] = useState([]);
  const [pieChartData,setPieChartData] = useState([]);
  const [customerFullName,setCustomerFullName] = useState('');
  const [phoneNumber,setPhoneNumber] = useState('');
  const [ordersStats,setOrdersStats] = useState([]);
  const [serach,setSearch] = useState('');
  const historyTableRef = useRef('');
  const ordersTableRef = useRef('');
  const historyCardContainerRef = useRef('');
  const [historyOfOrders,setHistoryOfOrders] = useState([]);
  const navigate = useNavigate('');    
  const [totalNbrOrders,setTotalNbrOrders] = useState(0);
  const admin = sessionStorage.getItem('admin');
  const [historyBtnText,setHistoryBtnText] = useState('history');
  const apiUrl = import.meta.env.VITE_API_URL;
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

   useEffect( ()=>{
   
       
    if(admin==='yesAdmin'){
      sessionStorage.setItem('activeMenu','History');
      getHistoryData(apiUrl);
  
      console.log(ordersStats);
      
    }
    else{
      navigate('/admin/login')
    }


   },[]);


const getHistoryData = async (apiUrl) =>{
 await axios.get(`${apiUrl}/getHistory`)
  .then( (res)=>{
    console.log('total ='+res.data.totalNbrOfOrders);
   setTotalNbrOrders(res.data.totalNbrOfOrders);

    let dataArray = [];
  for(let i=0 ;i<res.data.stats.length;i++){
    const orderData = {
      id : i,
      value: calculateStatPersentage(res.data.stats[i].orders_nbr,res.data.totalNbrOfOrders),
      nbrOrders: res.data.stats[i].orders_nbr,
      color: '',
      label: ''
   }
      if(res.data.stats[i].orderState==='Completed'){
        orderData.color='#2196F3';
        orderData.label='completed orders:';
         dataArray.push(orderData);
      }
      else if(res.data.stats[i].orderState==='Ready') {
        orderData.color='#4CAF50';
        orderData.label='ready orders:';
         dataArray.push(orderData);
      }
      else {
        orderData.color='#F44336';
        orderData.label='rejected orders:';
         dataArray.push(orderData);
      }
  }
      setPieChartData(dataArray);
   

   setOrdersStats(res.data.stats)
 //  console.log(totalNbrOrders);


  }) 
  .catch((err)=>{
   console.log(err);
   throw err;
  })
}


 const calculateStatPersentage = (value,totalNbrOfOrders) =>{
    
    //  console.log("value in calculate = "+value);
    //  console.log("total orders in calculate = "+totalNbrOrders);
       const result = parseFloat(((value / totalNbrOfOrders) * 100).toFixed(2));
    //   console.log("result in calculate = "+result);
       return result;
    
}


  const handleGetHistory =()=>{

    axios.get(`${apiUrl}/getOrdersHistory`)
    .then((res)=>{
   //   console.log(res.data);
      setHistoryOfOrders(res.data);
      setHistoryBtnText('refresh')
    })
    .catch((err)=>{
      console.log(err);
      return err;
    })

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

   const closeHistoryOrder = ()=>{
    setCustomerFullName('');
    if(historyCardContainerRef.current){
      historyCardContainerRef.current.classList.remove('visible');
      setTotalPrice(0);
     } 
     }

   const openHistoryOrder = (orderId,orderTotalPrice,customerFullName,orderState,phoneNumber)=>{

      console.log("order state = "+orderState);
      setOrderId(orderId);
      setTotalPrice(orderTotalPrice);
      setCustomerFullName(customerFullName)
      setPhoneNumber(phoneNumber);
        if(orderId){
  
  
          axios.post(`${apiUrl}/getOrderProducts`,{orderId:orderId})
          .then((res)=>{
            console.log(res.data.productsOrder)
            setOrderProducts(res.data.productsOrder);
           // console.log('Products = \n');
          })
          .catch((err)=>{
      
            console.log(err);
            return err;
          })
        
  
        }
       if(historyCardContainerRef.current){
        historyCardContainerRef.current.classList.add('visible');
       }
  
    }

    const giveMeMyStats = (nameOfStat) => {
     
      
      for(let i=0;i<ordersStats.length;i++){
        if(nameOfStat===ordersStats[i].orderState)
          return ordersStats[i].orders_nbr;      
      }
      return 0;
    
    }
  
  return (
    
  <>
 {
       totalNbrOrders > 0 ? (
        ordersStats.length > 0 && (  <div className='historyContainer'>
          
    
          <div className="historyHeader">
     
             <div className="headerBody">
             <div className="historyStatsContainer">
    
    <div className="upperHistoryStatsContainer">
    
    <div className="historyCardUp">
    
    <div className="cardTitle">
    
    <p className='textTitle' style={{color : 'black'}}>Total orders:</p>
    <p className='nbrOrders'>{totalNbrOrders}</p>
    </div>
    </div>
    
    <div className="historyCard" style={{marginLeft: '10%'}}>
    
    <div className="cardTitle">
    
    <p className='textTitle' style={{color:'#2196F3'}}>Completed orders:</p>
    <p className='nbrOrders'>{giveMeMyStats('Completed')}</p>
    
    </div>
    </div>
    
    
    <div className="historyCard">
    
    <div className="cardTitle">
    
    <p className='textTitle' style={{color: '#4CAF50'}}>Ready orders:</p>
    <p className='nbrOrders'>{giveMeMyStats('Ready')} </p>
    </div>
    </div>
    
    </div>
    
    <div className="downHistoryStatsContainer">
    <div className="historyCardDown">
    
    <div className="cardTitle">
    
    <p className='textTitle' style={{color : '#F44336'}}>Rejected orders:</p>
    <p className='nbrOrders'>{giveMeMyStats('Rejected')}</p>
    </div>
    </div>
    </div>
    
    </div>
    
    <div className="pieChartContainer">
     {/*totalNbrOrders >0*/}
    {
      totalNbrOrders > 0 && (
        <PieChart 
    series={[
    {
    arcLabel: (item) => `${item.value}%`,
    arcLabelMinAngle: 35,
    arcLabelRadius: '60%',
    data: pieChartData,
    highlightScope: { fade: 'global', highlight: 'item' },
    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
    valueFormatter: (item)=>`${item.nbrOrders} order`
    },
    ]}
    
    height={280}
    />
      )
    }
    </div>
    
             </div>
    
          <div className="headerTitle">
            <p>Shop stats for {new Date().getFullYear()}</p>
          </div>
    
          </div>
          <div className="historyBody">
    
    
          <div className="getHistoryBtn" onClick={handleGetHistory}>
            <h3><MdOutlineHistory size={35}/></h3>
         <span>{historyBtnText}</span>
          </div>
    
        {
          historyOfOrders.length>0 ? (
            <div className="searchAndHistoryContainer">
            <div  className="serachBarHistory">
               <input id='searchInput' placeholder='Search orders' onChange={(e)=>setSearch(e.target.value)} type="text" />
             </div>
       
             <table className='historyOrdersTable' ref={historyTableRef}>
                 <thead className='historyOrdersTableHeading'>
                   <tr className='tableRowOrders'>
                     {TABLE_HEADSOrders?.map((th, index) => (
                       <th key={index} className='historyTableHeadOrders'>{th}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                 {
              
              historyOfOrders.filter((order)=>{
                
                return serach.toLowerCase()==='' || compareSearchWithOrderId(order.order_Id,serach) || order.customerFullName.toLowerCase().includes(serach.toLowerCase()) || order.customerTelephone.includes(serach.toLowerCase());
              })
              .map((order,index) => {
                return  (
       
                     <tr key={index} className='historyTableRowOrderProducts'>
                       <td className='historyTableDataOrders'>{order.order_Id}</td>
                       <td className='historyTableDataFlavourOrders'>{order.customerFullName}</td>
                       <td className='historyTableDataOrders'>{order.customerTelephone}</td>
                       <td className='historyTableDataOrders'>{order.orderPrice}</td>
                       <td className='historyTableDataOrders'>{order.order_Date}</td>
       
                       <td className="historyTableDataOrdersOperation">
           <button className="historyViewBtn" onClick={()=>openHistoryOrder(order.order_Id,order.orderPrice,order.customerFullName,order.orderState,order.customerTelephone)}>
           <FiEye size={22}/>
           </button>
       
                       </td>        
                       <td className='historyTableDataOrders' style={{
                        color: order.orderState==="In queue" ? "gray" : order.orderState==="Ready" ? "rgb(19, 192, 68)"  : order.orderState==="Completed" ? "#007BFF" : "red"
                       }}>{order.orderState}</td>    
                     </tr>
                   
                 )
             })
            }
         
       
                 </tbody>
               </table>
            </div>
          ) : (
            <>
            </>
          )
        }
    
    <div className="historyOrderCardContainer" ref={historyCardContainerRef}>
            <div className="historyOrderCard">
              <button className="closeOrderDetails" onClick={closeHistoryOrder}><MdClose size={34} /></button>
               
                          <div className="orderInformation">
                          <h2 className='orderId'>order_id : <span>{orderId}</span></h2>
                          <h2 className='orderId'>client : <span>{customerFullName}</span></h2>
                          <h2 className='phoneNumber'>phone : <span>{phoneNumber}</span></h2>
                        </div>
                 
               {
    
    <table className='historyProductsTable' ref={ordersTableRef}>
              <thead className='productsTableHeading'>
                <tr className='tableRowOrders'>
                  {TABLE_HEADSProducts?.map((th, index) => (
                    <th key={index} className='tableHeadProducts' style={{color: 'black'}}>{th}</th>
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
    
    
            <h3 className='historyOrderTotalPrice'>Total: <span>{totalPrice}DA</span></h3>
                
            </div>
          </div>
          
            </div>      
        </div> 
        )
       ) : (
              <div className="noHistoryYet">
                <MdHistory size={60} />
                <h1>No history Yet </h1>
              </div>
       )
 }
  </>
  )
}

export default History

