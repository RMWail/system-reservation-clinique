import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import {Toaster} from 'sonner';
import { Outlet } from 'react-router-dom'
import {FaHandHoldingMedical } from 'react-icons/fa';
function BaseLayout() {
  return (
    <main className="page-wrapper">

      {/**Left side of the page  */}
      <Sidebar />

      <div className="content-wrapper">
      <Toaster icons={{
        duration:4000,
        info: <FaHandHoldingMedical size={25} color='#2196f3'/>,
      }}/>
        {/**Right side of the page wich is the content */}
        <Outlet />

      </div>
    </main>
  )
}

export default BaseLayout
