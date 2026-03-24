import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router";
import './App.css'
import Home from '../src/components/pages/user/home'
import SignUp from '../src/components/pages/user/SignUpForm'
import Login from '../src/components/pages/user/SignInForm'

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

import Profile from './components/pages/admin/Fetch/profile';
import Dashboard from './components/pages/admin/Fetch/dashboard';

import DisasterSimulation from './components/pages/admin/Fetch/DisasterSimulation';

import FamilyCheckIn from './components/pages/admin/forms/familyCheckIn';

import Hotline from './components/pages/admin/forms/hotline';

import FoodReport from './components/pages/admin/Fetch/report'
function App() {

  return (
    <>
    <Router>
      <Routes>
          <Route path='/' element={
            <ProtectedRoute roles={['user']}>
                           <Home/>
            </ProtectedRoute>
            
            }/>

          <Route path='/signUp' element={<SignUp/>}/>
          <Route path='/login' element={<Login/>}/>
          
          <Route element={<AppLayout/>}>
          

          <Route path='/evacuation-reg' element={
            <ProtectedRoute roles={['super_admin','barangay_official']}>
                <EvacuationCenter/>
            </ProtectedRoute>}/>
            

           <Route path='/admin-reg' element={
            <ProtectedRoute roles={['super_admin']}>
                <AdminRegister/>
            </ProtectedRoute>}/>  

    
          <Route path='/hazard-reg' element={
            <ProtectedRoute roles={['super_admin','barangay_official']}>
                <Hazard/>
            </ProtectedRoute>}/>

            <Route path='/check-reg' element={
            <ProtectedRoute roles={['super_admin','barangay_official']}>
                <Check/>
            </ProtectedRoute>}/>

            <Route path='/qr-checkin' element={
            <ProtectedRoute roles={['super_admin','barangay_official']}>
                <QrCode/>
            </ProtectedRoute>}/>

            <Route path='/evacuation' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <Evacuation/>
            </ProtectedRoute>}/>


            <Route path='/evacuation/evac-list/:id' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <Listing/>
            </ProtectedRoute>}/>


            <Route path='/evacuation/evac-list/:id/user/:id' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <Profile/>
            </ProtectedRoute>}/>


            <Route path='/dashboard' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <Dashboard/>
            </ProtectedRoute>}/>

             <Route path='/simulate' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <DisasterSimulation/>
            </ProtectedRoute>}/>

            <Route path='/familyCheckin' element={
            <ProtectedRoute roles={['barangay_official', 'super_admin']}>
                <FamilyCheckIn/>
            </ProtectedRoute>}/>

            <Route path='/hotline-reg' element={
            <ProtectedRoute roles={['super_admin','barangay_official']}>
                <Hotline/>
            </ProtectedRoute>}/>


            <Route path='/report' element={
            <ProtectedRoute roles={['super_admin']}>
                <FoodReport/>
            </ProtectedRoute>}/>


          </Route>


      </Routes>
    </Router>
    </>
  )
}

export default App
