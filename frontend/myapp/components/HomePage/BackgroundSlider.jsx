import { useEffect, useState } from 'react'
import imageSlider from './photos/imageSlider';
import {useNavigate} from 'react-router-dom'
import './BackgroundSlider.scss';
function BackgroundSlider() {
  let [counter,setCounter] = useState(0);
  const navigate = useNavigate();
  const bgImageStyle ={
    backgroundImage: `url(${imageSlider[counter]})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: '100%',
  };

  useEffect(()=>{
         nextSlide();
  },[counter])

  const nextSlide=()=>{
   
   const timer = setTimeout(()=>{
       // console.log('counter = '+counter);
      if(counter===3)
        setCounter(0);
      else 
      setCounter(counter+1);

    },3000)

    return ()=>clearTimeout(timer);
  }
    return (
    imageSlider[counter] && (
    <div className='countainer-style'>
      {/*
                  <div className="loginButtonContainer">
      <button className="loginButton1" onClick={()=>{
        navigate('/login')
      }}>Login</button>
      </div> 
      */}
      <div style={bgImageStyle} ></div>
      
      <div className="description">
        <p className='h1'><span className='DZ'>Dambri</span> Ice Cream</p>
        <p>
        Welcome to Ice Cream Shop DZ, where every scoop is a celebration of flavors! Indulge in our handcrafted ice creams made with the finest ingredients.
        </p>
      <button className="ShopButton" onClick={()=>{
        navigate('/shop');
      }}>Shop</button>
      {/*
      <button className="SignUpButton" onClick={()=>{
        navigate('/signUp')
      }}>SignUp</button> */}
      </div>
</div>
    )
  )
}

export default BackgroundSlider
