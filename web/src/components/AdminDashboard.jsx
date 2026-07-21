import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogOut, Users, CreditCard, Calendar, AlertTriangle, Clock, BarChart2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AdminOverview from '@/components/admin/AdminOverview';
import MembersTab from '@/components/admin/MembersTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import AttendanceTab from '@/components/admin/AttendanceTab';
import ScheduleTab from '@/components/admin/ScheduleTab';
import NoticesTab from '@/components/admin/NoticesTab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode.react";
const TABS = [{
  id: 'overview',
  label: 'Resumen',
  icon: BarChart2
}, {
  id: 'members',
  label: 'Miembros',
  icon: Users
}, {
  id: 'payments',
  label: 'Pagos',
  icon: CreditCard
}, {
  id: 'attendance',
  label: 'Asistencia',
  icon: Clock
}, {
  id: 'schedule',
  label: 'Calendario',
  icon: Calendar
}, {
  id: 'notices',
  label: 'Avisos',
  icon: AlertTriangle
}];
export default function AdminDashboard() {
  const {
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('adminActiveTab') || 'overview';
  });
  const [data, setData] = useState({
    members: [],
    payments: [],
    attendance: [],
    failedAttempts: [],
    schedule: [],
    notices: []
  });
  const [loading, setLoading] = useState(true);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: membersData,
        error: membersError
      } = await supabase.functions.invoke('get-users');
      if (membersError) throw membersError;
      if (membersData.error) throw new Error(membersData.error);
      const {
        data: paymentsData,
        error: paymentsError
      } = await supabase.from('payments').select('*, profiles(name)');
      if (paymentsError) throw paymentsError;
      const {
        data: attendanceData,
        error: attendanceError
      } = await supabase.from('attendance').select('*, profiles(name)');
      if (attendanceError) throw attendanceError;
      const {
        data: failedAttemptsData,
        error: failedAttemptsError
      } = await supabase.from('failed_access_attempts').select('*, profiles(name)');
      if (failedAttemptsError) throw failedAttemptsError;
      const {
        data: scheduleData,
        error: scheduleError
      } = await supabase.from('schedule').select('*, class_bookings(*, profiles(name))');
      if (scheduleError) throw scheduleError;
      const {
        data: noticesData,
        error: noticesError
      } = await supabase.from('notices').select('*').order('created_at', {
        ascending: false
      });
      if (noticesError) throw noticesError;
      setData({
        members: membersData.members,
        payments: paymentsData,
        attendance: attendanceData,
        failedAttempts: failedAttemptsData,
        schedule: scheduleData,
        notices: noticesData
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos del panel: ${error.message}`,
        variant: "destructive"
      });
      console.error("Data loading error:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  useEffect(() => {
    sessionStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const renderTabContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
    }
    switch (activeTab) {
      case 'overview':
        return <AdminOverview data={data} />;
      case 'members':
        return <MembersTab members={data.members} loadData={loadData} />;
      case 'payments':
        return <PaymentsTab payments={data.payments} loadData={loadData} />;
      case 'attendance':
        return <AttendanceTab attendance={data.attendance} failedAttempts={data.failedAttempts} />;
      case 'schedule':
        return <ScheduleTab schedule={data.schedule} loadData={loadData} />;
      case 'notices':
        return <NoticesTab notices={data.notices} loadData={loadData} />;
      default:
        return null;
    }
  };
  const attendanceUrl = `${window.location.origin}/attendance`;
  return <>
      <Helmet>
        <title>NÓMADES OCR - Panel de Administración</title>
        <meta name="description" content="Panel de administración para gestionar NÓMADES OCR" />
      </Helmet>

      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-black">NÓMADES OCR</h1>
              <p className="text-gray-600">Panel de Administración
Creado por Teems Agency</p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Asistencia
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl">QR para Asistencia Rápida</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4 gap-4">
                    <QRCode value={attendanceUrl} size={256} level="H" />
                    <p className="text-center text-gray-600">
                      Escanea este código para ir a la página de asistencia rápida.
                    </p>
                    <a href={attendanceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      {attendanceUrl}
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={signOut} variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map(tab => {
            const Icon = tab.icon;
            return <Button key={tab.id} onClick={() => setActiveTab(tab.id)} variant={activeTab === tab.id ? "default" : "outline"} className={`border-2 border-black ${activeTab === tab.id ? 'bg-black text-white shadow-[2px_2px_0px_0px_#000000]' : 'hover:bg-black hover:text-white'}`}>
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>;
          })}
          </div>

          <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </>;
}