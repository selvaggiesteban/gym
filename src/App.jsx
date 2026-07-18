import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/components/Login';
import MemberDashboard from '@/components/MemberDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import QuickAttendance from '@/components/QuickAttendance';

function App() {
  const { user, loading, initialLoadComplete, recoveryMode } = useAuth();

  const renderContent = () => {
    if (loading && !initialLoadComplete) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black">Cargando...</p>
          </div>
        </div>
      );
    }

    if (recoveryMode) {
      return <Login />;
    }

    if (!user) {
      return <Login />;
    }

    return user.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
  };

  return (
    <>
      <Helmet>
        <title>NÓMADES OCR - Sistema de Gestión de Gimnasio</title>
        <meta name="description" content="Sistema de gestión para miembros de NÓMADES OCR - Control de pagos, asistencias y más" />
      </Helmet>
      
      <Router>
        <Routes>
          <Route path="/attendance" element={<QuickAttendance />} />
          <Route path="/*" element={renderContent()} />
        </Routes>
      </Router>
      
      <Toaster />
    </>
  );
}

export default App;