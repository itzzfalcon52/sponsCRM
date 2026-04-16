import React from 'react'
import { Route, Routes } from "react-router-dom"
import "./app.css"

import Login from './pages/Login'
import Register from './pages/Register'
import NavBar from './components/NavBar'
import Landing from './pages/Landing'
import Org from './pages/Org'

import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Companies from './pages/Companies'
import Team from './pages/Team'
import { useEffect } from 'react'
import { api } from './api/axios'
import { useAuthStore } from './stores/authstore'
import Activities from './pages/Activities'
import Pipeline from './pages/Pipeline'
import FeaturesPage from './pages/Features'
import PricingPage from './pages/PricingPage'
import AboutPage from './pages/AboutPage'
import Footer from './components/landing/Footer'

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <NavBar />
    <main className="flex-1">{children}</main>
    <Footer/>
  </div>
);


const App = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        const user = res.data.data.user;
        setUser(user);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <Routes>

      {/*  PUBLIC ROUTES */}
      <Route 
        path='/' 
        element={
          <MainLayout>
            <Landing />
          </MainLayout>
        } 
      />

      <Route 
        path='/login' 
        element={
          <MainLayout>
            <Login />
          </MainLayout>
        } 
      />

      <Route 
        path='/register' 
        element={
          <MainLayout>
            <Register />
          </MainLayout>
        } 
      />

      <Route 
        path='/features' 
        element={
          <MainLayout>
            <FeaturesPage />
          </MainLayout>
        } 
      />

      <Route 
        path='/pricing' 
        element={
          <MainLayout>
            <PricingPage />
          </MainLayout>
        } 
      />

       <Route 
        path='/about' 
        element={
          <MainLayout>
            <AboutPage />
          </MainLayout>
        } 
      />

      <Route 
        path='/organization' 
        element={
          <MainLayout>
            <ProtectedRoute>
            <Org />
            </ProtectedRoute>
          </MainLayout>
        } 
      />

      {/*  APP ROUTES */}
      <Route path='/' element={
        <ProtectedRoute>
          <AppLayout/>
       
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='companies/*' element={<Companies/>} />
        <Route path='team/*' element={<Team/>} />
        <Route path="activities/*" element={<Activities/>} />
        <Route path="pipeline/*" element={<Pipeline/>} />

        </ProtectedRoute>}>
      </Route>

    </Routes>
  )
}

export default App