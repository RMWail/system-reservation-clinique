import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BackgroundSlider.scss';

const imageSlider = [
  '/images/university-bus1.jpg',
  '/images/university-bus2.jpg',
  '/images/university-campus.jpg',
  '/images/students-bus.jpg'
];

function BackgroundSlider() {
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  const bgImageStyle = {
    backgroundImage: `url(${imageSlider[counter]})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    height: '100%',
  };

  useEffect(() => {
    nextSlide();
  }, [counter]);

  const nextSlide = () => {
    const timer = setTimeout(() => {
      setCounter(counter === imageSlider.length - 1 ? 0 : counter + 1);
    }, 5000);

    return () => clearTimeout(timer);
  };

  return (
    imageSlider[counter] && (
      <div className='container-style'>
        <div style={bgImageStyle}></div>
        <div className="description">
          <h1>University Bus Control System</h1>
          <p>
            Welcome to the administrative dashboard for managing university transportation.
            Monitor and control bus schedules, routes, and student transportation efficiently.
          </p>
          <button className="dashboard-button" onClick={() => {
            navigate('/admin/dashboard');
          }}>Access Dashboard</button>
        </div>
      </div>
    )
  );
}

export default BackgroundSlider;
