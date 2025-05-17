import React from 'react'
import { useState } from 'react';
import './SidebarSuper.scss';
import { Link } from 'react-router-dom';
import { 
  MdOutlineHome,
  MdOutlineLogout,
  MdOutlineHistory,
  MdOutlinePersonAdd,
  MdCalendarToday,
  MdPeople,
  MdBarChart,
  MdSettings,
  MdNewReleases,
  MdPlusOne,
  Md4gPlusMobiledata,
  MdAdd
} from 'react-icons/md';
import { FaUserMd, FaCalendarPlus } from 'react-icons/fa';

function SidebarSuper() {
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
          <span className="sidebar-brand-text">Errazi Super Admin</span>
        </div>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <ul className="menu-list">
            <li className="menu-item">
              <Link
                to="/adminSuper"
                className={`menu-link ${activeMenuItem === "home" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("home")}
              >
                <span className="menu-link-icon">
                  <MdOutlineHome size={28} />
                </span>
                <span className="menu-link-text">Dashboard</span>
              </Link>
            </li>

<li className="menu-item">
              <Link
                to="/adminSuper/add-doctor"
                className={`menu-link ${activeMenuItem === "add Doctor" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("add Doctor")}
              >
                <span className="menu-link-icon">
                  <MdAdd size={20} />
                </span>
                <span className="menu-link-text">add Doctor</span>
              </Link>
            </li>

            <li className="menu-item">
              <Link
                to="/adminSuper/doctors-statistics"
                className={`menu-link ${activeMenuItem === "Doctors statistics" ? "active" : ""}`}
                onClick={() => handleMenuItemActive("Doctors statistics")}
              >
                <span className="menu-link-icon">
                  <MdBarChart size={20} />
                </span>
                <span className="menu-link-text">Doctors statistics</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-menu sidebar-menu2">
          <ul className="menu-list">


            <li className="menu-item">
              <Link
                to="/"
                className={`menu-link ${activeMenuItem === "logout" ? "active" : ""}`}
                onClick={() => {handleMenuItemActive("logout");
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('accountId');
                  sessionStorage.removeItem('activeMenu');
                }}
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

export default SidebarSuper;
