import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUniversity, FaBus, FaPhone, FaGlobe, FaClock, FaRoute, FaUserGraduate } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import './HomePage.scss';
import { MdEmail, MdLocationOn } from 'react-icons/md';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];

  const backgroundSlides = [
    {
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3',
      title: t.home.slides.welcome,
    },
    {
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3',
      title: t.home.slides.transport,
    },
    {
      image: 'https://images.unsplash.com/photo-1613896527026-f195d5c818ed?ixlib=rb-4.0.3',
      title: t.home.slides.connect,
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === backgroundSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">
      <div className="background-slider">
        {backgroundSlides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay"></div>
            <h2 className="slide-title">{slide.title}</h2>
          </div>
        ))}
      </div>

      <nav className="navbar">
        <div className="nav-logo">
          <FaBus className="icon" style={{ marginRight: '10px', color: '#1a73e8' }} />
          {t.navLogo}
        </div>
        <div className="nav-links">
          <a href="#about">{t.nav.about}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#contact">{t.nav.contact}</a>
          <button className="language-toggle" onClick={toggleLanguage}>
            <FaGlobe className="icon" />
            {currentLanguage.toUpperCase()}
          </button>
        </div>
      </nav>

      <section className="hero">
        <h1>{t.home.hero.title}</h1>
        <p>{t.home.hero.subtitle}</p>
      </section>

      <section id="about" className="about">
        <h2>{t.home.about.title}</h2>
        <div className="about-content">
          <div className="about-text">
            <FaUniversity className="icon" style={{ fontSize: '2.5rem', color: '#1a73e8', marginBottom: '1rem' }} />
            <h3>{t.home.about.mission}</h3>
            <p>{t.home.about.description}</p>
          </div>
          <div className="about-text">
            <FaRoute className="icon" style={{ fontSize: '2.5rem', color: '#1a73e8', marginBottom: '1rem' }} />
            <h3>{t.home.about.routes}</h3>
            <p>{t.home.about.routesDesc}</p>
          </div>
          <div className="about-text">
            <FaUserGraduate className="icon" style={{ fontSize: '2.5rem', color: '#1a73e8', marginBottom: '1rem' }} />
            <h3>{t.home.about.students}</h3>
            <p>{t.home.about.studentsDesc}</p>
          </div>
        </div>
      </section>

      <section id="services" className="about">
        <h2>{t.home.services.title}</h2>
        <div className="about-content">
          <div className="about-text">
            <FaBus className="icon" style={{ fontSize: '2.5rem', color: '#1a73e8', marginBottom: '1rem' }} />
            <h3>{t.home.services.fleet}</h3>
            <p>{t.home.services.fleetDesc}</p>
          </div>
          <div className="about-text">
            <FaClock className="icon" style={{ fontSize: '2.5rem', color: '#1a73e8', marginBottom: '1rem' }} />
            <h3>{t.home.services.schedule}</h3>
            <p>{t.home.services.scheduleDesc}</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>{t.home.contact.title}</h2>
        <div className="contact-content">
          <div className="contact-info">
            <FaPhone className="icon" />
            <h3>{t.home.contact.office}</h3>
            <p>+213 XX XX XX XX</p>
          </div>
       
          <div className="contact-info">
            <MdEmail className="icon" />
            <h3>{t.home.contact.email}</h3>
            <p>transport@univ-biskra.dz</p>
          </div>

          <div className="contact-info">
            <MdLocationOn className="icon" />
            <h3>{t.home.contact.location}</h3>
            <p>{t.home.contact.address}</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t.home.footer.about}</h3>
            <p>{t.home.footer.description}</p>
          </div>
          <div className="footer-section">
            <h3>{t.home.footer.quickLinks}</h3>
            <a href="#about">{t.nav.about}</a>
            <a href="#services">{t.nav.services}</a>
            <a href="#contact">{t.nav.contact}</a>
          </div>
          <div className="footer-section">
            <h3>{t.home.footer.contact}</h3>
            <p>{t.home.contact.address}</p>
            <p>transport@univ-biskra.dz</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p> 2025 {t.home.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
