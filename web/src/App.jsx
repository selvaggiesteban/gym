import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from '@/lib/helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/components/Login';
import MemberDashboard from '@/components/MemberDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import TrainerDashboard from '@/components/TrainerDashboard';
import QuickAttendance from '@/components/QuickAttendance';

function App() {
  const { user, loading, initialLoadComplete, recoveryMode } = useAuth();

  const renderContent = () => {
    if (loading && !initialLoadComplete) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      );
    }

    if (recoveryMode) return <Login />;
    if (!user) return <Login />;

    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'TRAINER') return <TrainerDashboard />;
    return <MemberDashboard />;
  };

  return (
    <>
      <Helmet title="GYM - Sistema de Gestión de Gimnasio" description="Sistema de gestión para miembros del gimnasio GYM - Neumorfismo + biblioteca de ejercicios" />
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
