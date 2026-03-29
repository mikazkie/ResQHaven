import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router";
import './App.css'
import './components/styles/adminForms.css'
import Home from '../src/components/pages/user/home'
import SignUp from '../src/components/pages/user/SignUpForm'
import Login from '../src/components/pages/user/SignInForm'
import FamilyRegistration from './components/pages/user/FamilyRegistration'

import EvacuationCenter from './components/pages/admin/forms/EvacuationCenter';
import Hazard from './components/pages/admin/forms/hazard';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './authentication/procted';
import CheckIn from './components/pages/admin/forms/checkIn';
import AdminRegister from '../src/components/pages/admin/forms/SignUpForm'

import QrCode from '../src/components/pages/admin/forms/qrCheckIn';
import Check from './components/pages/admin/forms/check';

import Evacuation from './components/pages/admin/Fetch/evacuation';
import Listing from './components/pages/admin/Fetch/listing';
import Inventory from './components/pages/admin/Fetch/inventory';

import Profile from './components/pages/admin/Fetch/profile';
import Dashboard from './components/pages/admin/Fetch/dashboard';

import DisasterSimulation from './components/pages/admin/Fetch/DisasterSimulation';

import FamilyCheckIn from './components/pages/admin/forms/familyCheckIn';

import Hotline from './components/pages/admin/forms/hotline';

import FoodReport from './components/pages/admin/Fetch/report'
import Track from './components/pages/admin/Fetch/track'
import Employees from './components/pages/admin/Fetch/employees'
import EmployeeProfile from './components/pages/admin/Fetch/employeeProfile'
import DistributionRequests from './components/pages/admin/Fetch/distributionRequests'

const ADMIN_ROLES = ['barangay_official', 'dswd', 'drrmo', 'super_admin']
const BARANGAY_OFFICIAL_ROLES = ['barangay_official', 'super_admin']
const DSWD_ROLES = ['dswd', 'super_admin']
const DRRMO_ROLES = ['drrmo', 'super_admin']
const TRACK_ROLES = ['barangay_official', 'drrmo', 'super_admin']
const EVAC_VIEW_ROLES = ['barangay_official', 'dswd', 'drrmo', 'super_admin']

function App() {

  return (
    <>
    <Router>
      <Routes>
          <Route path='/' element={
                           <Home/>
            
            }/>

          <Route path='/signUp' element={<SignUp/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/family-registration' element={<FamilyRegistration/>}/>
          
          <Route element={<AppLayout/>}>
          

          <Route path='/evacuation-reg' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <EvacuationCenter/>
            </ProtectedRoute>}/>



            <Route path='/track' element={
            <ProtectedRoute roles={TRACK_ROLES}>
                <Track/>
            </ProtectedRoute>}/>

            <Route path='/employees' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <Employees/>
            </ProtectedRoute>}/>

            <Route path='/employees/:id' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <EmployeeProfile/>
            </ProtectedRoute>}/>

            <Route path='/distribution-requests' element={
            <ProtectedRoute roles={DSWD_ROLES}>
                <DistributionRequests/>
            </ProtectedRoute>}/>
            

           <Route path='/admin-reg' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <AdminRegister/>
            </ProtectedRoute>}/>  

    
          <Route path='/hazard-reg' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <Hazard/>
            </ProtectedRoute>}/>

            <Route path='/check-reg' element={
            <ProtectedRoute roles={BARANGAY_OFFICIAL_ROLES}>
                <Check/>
            </ProtectedRoute>}/>

            <Route path='/qr-checkin' element={
            <ProtectedRoute roles={BARANGAY_OFFICIAL_ROLES}>
                <QrCode/>
            </ProtectedRoute>}/>

            <Route path='/evacuation' element={
            <ProtectedRoute roles={EVAC_VIEW_ROLES}>
                <Evacuation/>
            </ProtectedRoute>}/>

            <Route path='/inventory' element={
            <ProtectedRoute roles={DSWD_ROLES}>
                <Inventory/>
            </ProtectedRoute>}/>


            <Route path='/evacuation/evac-list/:id' element={
            <ProtectedRoute roles={EVAC_VIEW_ROLES}>
                <Listing/>
            </ProtectedRoute>}/>


            <Route path='/evacuation/evac-list/:centerId/user/:id' element={
            <ProtectedRoute roles={EVAC_VIEW_ROLES}>
                <Profile/>
            </ProtectedRoute>}/>

            <Route path='track/user/:id' element={
            <ProtectedRoute roles={TRACK_ROLES}>
                <Profile/>
            </ProtectedRoute>}/>


            <Route path='/dashboard' element={
            <ProtectedRoute roles={ADMIN_ROLES}>
                <Dashboard/>
            </ProtectedRoute>}/>

             <Route path='/simulate' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <DisasterSimulation/>
            </ProtectedRoute>}/>

            <Route path='/familyCheckin' element={
            <ProtectedRoute roles={BARANGAY_OFFICIAL_ROLES}>
                <FamilyCheckIn/>
            </ProtectedRoute>}/>

            <Route path='/hotline-reg' element={
            <ProtectedRoute roles={DRRMO_ROLES}>
                <Hotline/>
            </ProtectedRoute>}/>


            <Route path='/report' element={
            <ProtectedRoute roles={ADMIN_ROLES}>
                <FoodReport/>
            </ProtectedRoute>}/>


          </Route>


      </Routes>
    </Router>
    </>
  )
}

export default App
