import React from 'react'
import { useState } from 'react';
import './Sidebar.scss';
import { Link } from 'react-router-dom';
import { 
  MdOutlineLogout,
  MdOutlineHistory,
  MdBarChart,
  MdHome,
} from 'react-icons/md';
import { FaUserMd, FaCalendarPlus } from 'react-icons/fa';

function Sidebar() {
  const [activeMenuItem, setActiveMenuItem] = useState(
    sessionStorage.getItem('activeMenu') === null ? 'Rendez-vous' : sessionStorage.getItem('activeMenu')
  );

  const handleMenuItemActive = (menuItem) => {
    setActiveMenuItem(menuItem);
    sessionStorage.setItem('activeMenu', menuItem);
  };

  return (
    <nav className="sidebar sidebar-show" dir='ltr'>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <FaUserMd size={30} color="#2196f3" />
          <span className="sidebar-brand-text">Admin</span>
        </div>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <ul className="menu-list">

          <li className="menu-item">
              <Link
                to="/admin/appointments"
                className={`menu-link ${activeMenuItem === "Rendez-vous" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("Rendez-vous")}
              >
                <span className="menu-link-icon">
                  <MdHome size={22} />
                </span>
                <span className="menu-link-text">Rendez-vous</span>
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
                className={`menu-link ${activeMenuItem === "Nouveau rendez-vous" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("Nouveau rendez-vous")}
              >
                <span className="menu-link-icon">
                  <FaCalendarPlus size={20} />
                </span>
                <span className="menu-link-text">Nouveau rendez-vous</span>
              </Link>
            </li>



            <li className="menu-item">
              <Link
                to="/admin/statistics"
                className={`menu-link ${activeMenuItem === "statistiques" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("statistiques")}
              >
                <span className="menu-link-icon">
                  <MdBarChart size={28} />
                </span>
                <span className="menu-link-text">statistiques</span>
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
                className={`menu-link ${activeMenuItem === "Historique" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("Historique")}
              >
                <span className="menu-link-icon">
                  <MdOutlineHistory size={22} />
                </span>
                <span className="menu-link-text">Historique</span>
              </Link>
            </li>

            <li className="menu-item">
              <Link
                to="/"
                className={`menu-link ${activeMenuItem === "Déconnexion" ? "active" : ""}`}
                onClick={() => {handleMenuItemActive("Déconnexion");
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('accountId');
                  sessionStorage.removeItem('activeMenu');
                }}
              >
                <span className="menu-link-icon">
                  <MdOutlineLogout size={22} />
                </span>
                <span className="menu-link-text">Déconnexion</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;
