import { useEffect, useRef } from 'react'
import Login from '../components/LoginPage/Login'
import ForgetPassword from '../components/ForgetPassword/ForgetPassword'
import ResetPassword from '../components/ResetPassword/ResetPassword'
import HomePage from '../components/HomePage/HomePage'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import BaseLayout from '../components/Admin/layout/BaseLayout'
import RoutesManagement from '../components/Admin/sidebarPages/routes/RoutesManagement'
import UniversitySection from '../components/Admin/sidebarPages/univSection/UniversitySection'
import BusManagement from '../components/Admin/sidebarPages/buses/BusManagement'
import BusStatistics from '../components/Admin/sidebarPages/busStatistics/Statistics'
import StationsManagement from '../components/Admin/sidebarPages/stations/StationsManagement'
import HomeDashboard from '../components/Admin/sidebarPages/home/HomeDashboard'
import LanguageSettings from '../components/Admin/sidebarPages/language/LanguageSettings'
import io from 'socket.io-client'
import { LanguageProvider } from '../context/LanguageContext';
import './App.scss'

function App() {
  const socketRef = useRef('');
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    socketRef.current = io(`${apiUrl}`, {
      auth: {secret: 'this is socket io in clinic project'},
      query: {data: 20033008}
    })
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password/:email/:token" element={<ResetPassword/>} />
          <Route path="/reset-password" element={<ResetPassword />} />
 {/*
           <Route path="/otp-verification/:email" element={<OtpVerificationDegits/>} />
          <Route path="/otp-verification" element={<OtpVerificationDegits />} />
 */}
          
          {/* Admin Routes */}
          <Route path="/admin" element={<BaseLayout />}>
            <Route index element={<HomeDashboard />} />
            <Route path="routes" element={<RoutesManagement />} />
            <Route path="univ-sections" element={<UniversitySection />} />
            <Route path="buses" element={<BusManagement />} />
            <Route path="stations" element={<StationsManagement />} />
            <Route path="statistics" element={<BusStatistics />} />
            <Route path="language" element={<LanguageSettings />} />
          </Route>

          {/* Super Admin Routes 
          <Route path="/super-admin" element={<BaseLayout2 />}>
            <Route path="doctors" element={<DoctorsManagement />} />
            <Route path="add-doctor" element={<AddNewDoctor />} />
            <Route path="statistics" element={<DoctorsStatistics />} />
          </Route>*/}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
