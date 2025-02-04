import React, { useEffect, useState } from 'react'
import './Sales.scss'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDollarSign } from 'react-icons/fi'
import { AiOutlineStop } from "react-icons/ai"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Sales() {
  const navigate = useNavigate('');
  const currentYear = new Date().getFullYear();
  const [totalRevenue,setTotalRevenue] = useState(0);
  const [thisYearRevenue,setYearRevenue] = useState(0);
  const [thisMonthRevenue,setThisMonthRevenue] = useState(0);
  const [todayRevenue,setTodayRevenue] = useState(0);
  const [data,setData] = useState([]);
  const [mostSaledProducts,setMostSaledProducts] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL    
  useEffect(()=>{
      
    const admin = sessionStorage.getItem('admin');

    if(admin==='yesAdmin'){
      sessionStorage.setItem('activeMenu','Sales');

      axios.get(`${apiUrl}/getSalesStats`)
      .then((res)=>{
       setTotalRevenue(res.data.revenueStats[0].total_revenue);
       setYearRevenue(res.data.revenueStats[0].yearRevenue);
       setThisMonthRevenue(res.data.revenueStats[0].monthRevenue);
       setTodayRevenue(res.data.revenueStats[0].todayRevenue);
       setData(res.data.yearMonthlyRevenues)
       setMostSaledProducts(res.data.mostSaledProducts);
     //   console.log(res.data.mostSaledProducts[0][0]);
     //   console.log(res.data.mostSaledProducts[0][1]);
      })
      .catch((err)=>{
       console.log(err);
         throw err;
      })
     
    }
    else {
      navigate('/admin/login');
    }

  },[]);


  return (
    <div className='salesContainer'>
    
     <div className="salesHeader">

      <div className="saleCardsFather">
      <div className="saleCard">
  
  <div className="cardTitle">

  <p className='textTitle'>Total revenue: </p>
  <span><FiDollarSign size={25}/></span> 
  <p className='revenueVal'>{totalRevenue}  <span>DA</span></p>
  </div>
        </div>

        
        <div className="saleCard">
  
  <div className="cardTitle">

  <p className='textTitle'>This year : </p>
  <span><FiDollarSign size={25}/></span> 
  <p className='revenueVal'>{thisYearRevenue}  <span>DA</span></p>
  </div>
        </div>


        
      <div className="saleCard">
  
      <div className="cardTitle">

<p className='textTitle'>This month : </p>
<span><FiDollarSign size={25}/></span> 
<p className='revenueVal'>{thisMonthRevenue}  <span>DA</span></p>

</div>
        </div>

        
      <div className="saleCard">
  
  <div className="cardTitle">

<p className='textTitle'>Today : </p>
<span><FiDollarSign size={25}/></span> 
<p className='revenueVal'>{todayRevenue}  <span>DA</span></p>
  </div>
        </div>
      </div>
       
     </div>

    <div className="salesBody">
     <div className="chartsContainer">
      
     <div className="barChartContainer">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="orange" activeBar={<Rectangle fill="pink" stroke="blue" />} />
        </BarChart>
      </ResponsiveContainer>
      </div>

     <div className="progressBarChartContainer">

     <div className="progress-bar">
      <div className="progress-bar-list">
        {mostSaledProducts?.map((product,index) => {
          return (
            <div className="progress-bar-item" key={product[0].item_Id}>
              <div className="bar-item-info">
                {
                product[0].item_photo!==null ? (
             <img src={`data:image/png;base64,${product[0].item_photo}`} alt="" />
                ) : (
                  <div className='deletedProduct'>
                  <AiOutlineStop size={80} style={{
                    color:'red',
                    marginLeft:'20px'}}/>
                    <h3>deleted product</h3>
                  </div>
                )
        }
                <p className="bar-item-info-name">{product[0].
item_name}</p>
                <p className="bar-item-info-value">
                  {product[1]}
                </p>
              </div>
              <div className="bar-item-full">
                <div
                  className="bar-item-filled"
                  style={{
                    width: `${product[1]}%`, // that mean the width of the line that will fill the bar is the percentValue % by the real width of the bar 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

     </div>


     </div>

      <div className="chartsTitles">

        <div className="barChartTitle">
          <span className='barChartTitleText'>Monthly Revenue Bar Chart of {currentYear}</span>
        </div>

        <div className="progressBarTitle">
        <h4 className="progressBarTitleText">Most wanted products</h4>
      </div>

      </div>

    </div>
    </div>
  )
}

export default Sales
