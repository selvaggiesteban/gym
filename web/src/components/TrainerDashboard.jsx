import React from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/apiClient';

export default function TrainerDashboard() {
  const { user, signOut } = useAuth();

  const routinesQuery = useQuery({
    queryKey: ['routines', 'trainer'],
    queryFn: () => api('/routines/mine'),
  });

  const assignmentsQuery = useQuery({
    queryKey: ['routine-assignments', 'trainer'],
    queryFn: () => api('/routine-assignments/trainer'),
  });

  const routines = routinesQuery.data || [];
  const assignments = assignmentsQuery.data || [];

  return (
    <>
      <Helmet>
        <title>GYM - Panel del Entrenador</title>
        <meta name="description" content="Panel de control para entrenadores" />
      </Helmet>

      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">GYM · Entrenador</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />Cerrar Sesión
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Mis Rutinas</CardTitle>
                  <Dumbbell className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{routines.length}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Asignaciones Activas</CardTitle>
                  <ClipboardList className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{assignments.length}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Rutinas Publicadas</CardTitle>
                  <Dumbbell className="w-5 h-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{routines.filter(r => r.status === 'PUBLISHED').length}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle>Mis Rutinas Recientes</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {routines.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay rutinas creadas</p>
                    ) : (
                      routines.slice(0, 5).map(routine => (
                        <div key={routine.id} className="border border-gray-200 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{routine.name}</h4>
                            <p className="text-xs text-gray-500">{routine.exercises?.length || 0} ejercicios · v{routine.currentVersion || 1}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${routine.status === 'PUBLISHED' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                            {routine.status === 'PUBLISHED' ? 'PUBLICADA' : 'BORRADOR'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle>Asignaciones Recientes</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {assignments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay asignaciones activas</p>
                    ) : (
                      assignments.slice(0, 5).map(assignment => (
                        <div key={assignment.id} className="border border-gray-200 p-3 rounded-lg">
                          <h4 className="font-bold">{assignment.routineTitle || 'Rutina'}</h4>
                          <p className="text-xs text-gray-500">Miembro: {assignment.memberName || assignment.memberId}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
