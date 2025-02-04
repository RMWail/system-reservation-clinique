import React,{ useState,useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import  io  from 'socket.io-client';
import './Shop.scss'
import axios from 'axios'


function Row(props) {
  const { row , cachedOrderDetails , setCachedOrderDetails } = props;
  const [open, setOpen] = useState(false);
  const [orderDetails,setOrderDetails] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  const toggleOpen = () => setOpen((prev) => !prev);

  const getMyOrdersDetails = (orderId) => {

    // Fetch data only if not already cached and we're opening the row
    if (!open && !cachedOrderDetails[orderId]) {
      axios.post(`${apiUrl}/getOrderProducts`, { orderId })
        .then((res) => {
          console.log('request made');
          setOrderDetails(res.data.productsOrder);
          setCachedOrderDetails((prev) => ({
            ...prev,
            [orderId]: res.data.productsOrder,
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (cachedOrderDetails[orderId]) {
      
      setOrderDetails(cachedOrderDetails[orderId]);
    }

    toggleOpen(); // Toggle open state afterward
  };


  return (
    <React.Fragment>
      <TableRow className='custom-table-row'>
        <TableCell >
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => getMyOrdersDetails(row.order_Id)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" style={{textAlign: 'center'}}> 
        {row.order_Id}
        </TableCell>
        <TableCell align="right" style={{textAlign: 'center'}}>{row.order_Date}</TableCell>
        <TableCell  align="right" style={{color: row.orderState==='Completed' ? '#2196F3' : row.orderState==='Ready' ? '#4CAF50' :'#F44336',textAlign:'center'}}>{row.orderState}</TableCell>
        <TableCell align="right" style={{textAlign: 'center'}}>{row.orderPrice}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" color='orangered'>
                Products
              </Typography>
              <Table size="small" aria-label="purchases" className='insideTable'>
                <TableHead>
                  <TableRow style={{fontSize: 'large'}}>
                    <TableCell style={{textAlign:'center',fontSize:'large'}}>Product_Id</TableCell>
                    <TableCell style={{textAlign:'center',fontSize: 'large'}}>Name</TableCell>
                    <TableCell style={{textAlign:'center',fontSize: 'large'}}>Type</TableCell>
                    <TableCell style={{textAlign:'center',fontSize: 'large'}}>Flavours</TableCell>
                    <TableCell style={{textAlign:'center',fontSize: 'large'}}>Amount</TableCell>
                    <TableCell style={{textAlign:'center',fontSize: 'large'}}>Price DA</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className='insideTableBody'>
                  {
              orderDetails.map((historyRow,index) => {
     return (
      <TableRow key={index} style={{height: '100px'}}>
      <TableCell component="th" scope="row" style={{textAlign:'center'}}>
        {historyRow.item_Id}
      </TableCell>
      <TableCell style={{textAlign:'center'}}>{historyRow.item_name}</TableCell>
      <TableCell style={{textAlign:'center'}}>{historyRow.item_type}</TableCell>
      <TableCell style={{textAlign:'center'}} className='insideTableFlavours'>{historyRow.flavourDescription}</TableCell>
      <TableCell style={{textAlign:'center'}}>{historyRow.itemQuantity}</TableCell>
      <TableCell style={{textAlign:'center',color:'orangered'}}>
        {historyRow.itemPrice}
      </TableCell>
    </TableRow>
     )
   })
            
                  }
                </TableBody>

              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

 function CollapsibleTable({accountId}) {
  const apiUrl = import.meta.env.VITE_API_URL;
 // console.log('account in CollapsibleTable = '+accountId);
const [rows,setRows] = useState([]);
const [cachedOrderDetails,setCachedOrderDetails] = useState({});

// console.log('hello from CollapsibleTable')

  useEffect(()=>{

    axios.post(`${apiUrl}/getOrdersForMyaccount`,{accountId:accountId})
    .then((res)=>{
     // console.log('my orders = '+res.data.myOrders[0].order_Id);
     setRows(res.data.myOrders);
    })

        
  },[]);  


  return (
         rows.length> 0 ? (
              <>
       <div className="oldOrdersTitle">My orders</div>
          <TableContainer component={Paper} style={{marginTop:'50px'}}>
          <Table aria-label="collapsible table">
            <TableHead>
              <TableRow className='custom-table-head-row'>
              <TableCell >Details</TableCell>
                <TableCell style={{textAlign: 'center'}}>order Id</TableCell>
    { /*           <TableCell align="right">Price</TableCell>*/}
                <TableCell style={{textAlign: 'center'}}>Date</TableCell>
                <TableCell style={{textAlign: 'center'}}>State</TableCell>
                <TableCell style={{textAlign: 'center'}}>total price DA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
    
                <Row key={row.order_Id} row={row} cachedOrderDetails={cachedOrderDetails} setCachedOrderDetails={setCachedOrderDetails}/>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
              </>
         ) : (
          <h1 className='haveNoOrders'>You have no orders yet </h1>
         )
  );
}

export default CollapsibleTable;