import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { LogOut, Dumbbell, Users } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from '@/lib/helmet';
import { useAuth } from '@/contexts/AuthContext';
import MembersTab from '@/components/admin/MembersTab';
import PaymentsTab from '@/components/admin/PaymentsTab';
import AttendanceTab from '@/components/admin/AttendanceTab';
import ScheduleTab from '@/components/admin/ScheduleTab';
import NoticesTab from '@/components/admin/NoticesTab';
import RoutinesTab from '@/components/admin/RoutinesTab';
import AdminOverview from '@/components/admin/AdminOverview';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: () => api('/members'),
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => api('/payments'),
  });

  const loadData = () => {
    membersQuery.refetch();
    paymentsQuery.refetch();
  };

  const membersData = membersQuery.data || [];
  const paymentsData = paymentsQuery.data || [];

  return (
    <div className="min-h-screen bg-[var(--color-neu-bg)] p-6">
      <Helmet title="GYM - Admin" />
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">GYM · Admin</h1>
            <p className="text-gray-600">Panel de administración</p>
          </div>
          <Button onClick={signOut} variant="outline" className="neu-btn">
            <LogOut className="w-4 h-4 mr-2" />Cerrar Sesión
          </Button>
        </header>

        <AdminOverview />

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="members">Miembros</TabsTrigger>
            <TabsTrigger value="routines">Rutinas</TabsTrigger>
            <TabsTrigger value="payments">Pagos</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="schedule">Calendario</TabsTrigger>
            <TabsTrigger value="notices">Avisos</TabsTrigger>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>
          <TabsContent value="members"><MembersTab members={membersData} loadData={loadData} /></TabsContent>
          <TabsContent value="routines"><RoutinesTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab payments={paymentsData} loadData={loadData} /></TabsContent>
          <TabsContent value="attendance"><AttendanceTab /></TabsContent>
          <TabsContent value="schedule"><ScheduleTab /></TabsContent>
          <TabsContent value="notices"><NoticesTab /></TabsContent>
          <TabsContent value="resumen"><AdminOverview /></TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
