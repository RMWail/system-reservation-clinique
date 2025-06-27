import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaClock, FaPhone, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import './HomePage.scss';
import { MdEmail } from 'react-icons/md';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentLanguage, toggleLanguage } = useLanguage();
  const t = translations[currentLanguage];

  const backgroundSlides = [
    {
      image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
      title: t.backgroundSlides.expertCare,
    },
    {
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: t.backgroundSlides.modernFacilities,
    },
    {
      image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      title: t.backgroundSlides.caringStaff,
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
        <div className="nav-logo">Remadna clinique</div>
        <div className="nav-links">
          <a href="#about">{t.nav.about}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#contact">{t.nav.contact}</a>
          <Link to="/doctors" className="book-btn">{t.nav.book}</Link>
             {/*
                       <button className="language-toggle" onClick={toggleLanguage}>
            <FaGlobe className="icon" />
            {currentLanguage.toUpperCase()}
          </button>
             */}
        </div>
      </nav>

      <section className="hero">
        <h1>{t.hero.title}</h1>
        <p>{t.hero.subtitle}</p>
        <Link to="/doctors" className="cta-button">{t.hero.cta}</Link>
      </section>

      <section id="services" className="services">
        <h2>{t.services.title}</h2>
        <div className="service-cards">
          <div className="service-card">
            <FaUserMd className="icon" />
            <h3>{t.services.expertDoctors.title}</h3>
            <p>{t.services.expertDoctors.description}</p>
          </div>
          <div className="service-card">
            <FaCalendarAlt className="icon" />
            <h3>{t.services.easyScheduling.title}</h3>
            <p>{t.services.easyScheduling.description}</p>
          </div>
          <div className="service-card">
            <FaClock className="icon" />
            <h3>{t.services.service247.title}</h3>
            <p>{t.services.service247.description}</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <h2>{t.about.title}</h2>
        <div className="about-content">
          <div className="about-text">
            <p>{t.about.description}</p>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>{t.contact.title}</h2>
        <div className="contact-content">
          <div className="contact-info">
            <FaPhone className="icon" />
            <h3>{t.contact.emergency}</h3>
            <p>+1 (555) 123-4567</p>
          </div>
       
          <div className="contact-info">
            <MdEmail className="icon" />
            <h3>{t.contact.emergency}</h3>
            <p>remadnaclinique@gmail.com</p>
          </div>
          
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MediCare</h3>
            <p>{t.footer.slogan}</p>
          </div>
          <div className="footer-section">
            <h3>{t.footer.quickLinks}</h3>
            <a href="#about">{t.nav.about}</a>
            <a href="#services">{t.nav.services}</a>
            <a href="#contact">{t.nav.contact}</a>
          </div>
          <div className="footer-section">
            <h3>{t.footer.contactInfo}</h3>
            <p>123 Medical Center Dr.</p>
            <p>remadnaclinique@medicare.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
