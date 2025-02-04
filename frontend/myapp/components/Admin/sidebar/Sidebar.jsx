import React from 'react'
import { useState } from 'react';
import './Sidebar.scss';
import { Link } from 'react-router-dom';
import { 
  MdOutlineHome,
  MdOutlineLogout,
  MdOutlineHistory,
  MdOutlinePersonAdd,
  MdCalendarToday,
  MdPeople,
  MdBarChart,
  MdSettings
} from 'react-icons/md';
import { FaUserMd, FaCalendarPlus } from 'react-icons/fa';

function Sidebar() {
  const [activeMenuItem, setActiveMenuItem] = useState(
    sessionStorage.getItem('activeMenu') === null ? 'home' : sessionStorage.getItem('activeMenu')
  );

  const handleMenuItemActive = (menuItem) => {
    setActiveMenuItem(menuItem);
    sessionStorage.setItem('activeMenu', menuItem);
  };

  return (
    <nav className="sidebar sidebar-show">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <FaUserMd size={30} color="#2196f3" />
          <span className="sidebar-brand-text">Errazi Admin</span>
        </div>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <ul className="menu-list">
            <li className="menu-item">
              <Link
                to="/admin"
                className={`menu-link ${activeMenuItem === "home" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("home")}
              >
                <span className="menu-link-icon">
                  <MdOutlineHome size={28} />
                </span>
                <span className="menu-link-text">Dashboard</span>
              </Link>
            </li>
        {/*
        
            <li className="menu-item">
              <Link
                to="/admin/doctors"
                className={`menu-link ${activeMenuItem === "doctors" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("doctors")}
              >
                <span className="menu-link-icon">
                  <MdOutlinePersonAdd size={22} />
                </span>
                <span className="menu-link-text">Manage Doctors</span>
              </Link>
            </li>
        */}

            <li className="menu-item">
              <Link
                to="/admin/create-reservation"
                className={`menu-link ${activeMenuItem === "create-reservation" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("create-reservation")}
              >
                <span className="menu-link-icon">
                  <FaCalendarPlus size={20} />
                </span>
                <span className="menu-link-text">New Reservation</span>
              </Link>
            </li>

            <li className="menu-item">
              <Link
                to="/admin/appointments"
                className={`menu-link ${activeMenuItem === "appointments" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("appointments")}
              >
                <span className="menu-link-icon">
                  <MdCalendarToday size={22} />
                </span>
                <span className="menu-link-text">Appointments</span>
              </Link>
            </li>

   {/*
               <li className="menu-item">
              <Link
                to="/admin/patients"
                className={`menu-link ${activeMenuItem === "patients" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("patients")}
              >
                <span className="menu-link-icon">
                  <MdPeople size={22} />
                </span>
                <span className="menu-link-text">Patients</span>
              </Link>
            </li>

  
            <li className="menu-item">
              <Link
                to="/admin/statistics"
                className={`menu-link ${activeMenuItem === "statistics" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("statistics")}
              >
                <span className="menu-link-icon">
                  <MdBarChart size={22} />
                </span>
                <span className="menu-link-text">Statistics</span>
              </Link>
            </li>
 */}

          </ul>
        </div>

        <div className="sidebar-menu sidebar-menu2">
          <ul className="menu-list">
            <li className="menu-item">
              <Link
                to="/admin/history"
                className={`menu-link ${activeMenuItem === "history" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("history")}
              >
                <span className="menu-link-icon">
                  <MdOutlineHistory size={22} />
                </span>
                <span className="menu-link-text">History</span>
              </Link>
            </li>

 {/**
  * 
  *             <li className="menu-item">
              <Link
                to="/admin/settings"
                className={`menu-link ${activeMenuItem === "settings" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("settings")}
              >
                <span className="menu-link-icon">
                  <MdSettings size={22} />
                </span>
                <span className="menu-link-text">Settings</span>
              </Link>
            </li>
  * 
  */}

            <li className="menu-item">
              <Link
                to="/"
                className={`menu-link ${activeMenuItem === "logout" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("logout")}
              >
                <span className="menu-link-icon">
                  <MdOutlineLogout size={22} />
                </span>
                <span className="menu-link-text">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
