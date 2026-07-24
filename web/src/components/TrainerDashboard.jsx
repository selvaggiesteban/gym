import React, { useState } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Dumbbell, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/apiClient';

export default function TrainerDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ memberId: '', routineId: '', dueDate: '', notes: '' });

  const routinesQuery = useQuery({
    queryKey: ['routines', 'trainer'],
    queryFn: () => api('/routines/mine'),
  });

  const assignmentsQuery = useQuery({
    queryKey: ['routine-assignments', 'trainer'],
    queryFn: () => api('/routine-assignments/trainer'),
  });

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: () => api('/members'),
  });

  const routines = routinesQuery.data || [];
  const assignments = assignmentsQuery.data || [];
  const members = (membersQuery.data || []).filter(m => m.role !== 'ADMIN' && m.role !== 'TRAINER');

  const assignMutation = useMutation({
    mutationFn: (data) => api('/routine-assignments', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Rutina asignada', description: 'La rutina ha sido asignada al miembro.' });
      setAssignOpen(false);
      setAssignForm({ memberId: '', routineId: '', dueDate: '', notes: '' });
      queryClient.invalidateQueries({ queryKey: ['routine-assignments', 'trainer'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id) => api(`/routine-assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Asignacion eliminada' });
      queryClient.invalidateQueries({ queryKey: ['routine-assignments', 'trainer'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleAssign = () => {
    if (!assignForm.memberId || !assignForm.routineId) {
      toast({ title: 'Error', description: 'Selecciona un miembro y una rutina', variant: 'destructive' });
      return;
    }
    assignMutation.mutate(assignForm);
  };

  const getMemberName = (assignment) => {
    return assignment.member?.profile?.name || assignment.memberId;
  };

  const getRoutineName = (assignment) => {
    return assignment.routine?.name || 'Rutina';
  };

  return (
    <>
      <Helmet>
        <title>GYM - Panel del Entrenador</title>
        <meta name="description" content="Panel de control para entrenadores" />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-neu-bg)] p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">GYM · Entrenador</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="neu-btn">
              <LogOut className="w-4 h-4 mr-2" />Cerrar Sesion
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="neu-card">
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
              <Card className="neu-card">
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
              <Card className="neu-card">
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
              <Card className="neu-card">
                <CardHeader><CardTitle>Mis Rutinas Recientes</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {routines.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay rutinas creadas</p>
                    ) : (
                      routines.slice(0, 5).map(routine => (
                        <div key={routine.id} className="neu-inset p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{routine.name}</h4>
                            <p className="text-xs text-gray-500">{routine.exercises?.length || 0} ejercicios</p>
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
              <Card className="neu-card">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Asignaciones Activas</CardTitle>
                  <Button onClick={() => setAssignOpen(true)} className="neu-btn-primary text-sm">
                    <Plus className="w-4 h-4 mr-1" />Asignar
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {assignments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay asignaciones activas</p>
                    ) : (
                      assignments.slice(0, 10).map(assignment => (
                        <div key={assignment.id} className="neu-inset p-3 rounded-lg flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{getRoutineName(assignment)}</h4>
                            <p className="text-xs text-gray-500">Miembro: {getMemberName(assignment)}</p>
                            {assignment.dueDate && (
                              <p className="text-xs text-yellow-600 mt-1">Vence: {new Date(assignment.dueDate).toLocaleDateString('es-AR')}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      <Dialog open={isAssignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Rutina a Miembro</DialogTitle>
            <DialogDescription>Selecciona el miembro y la rutina que quieres asignar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Miembro</Label>
              <Select value={assignForm.memberId} onValueChange={(v) => setAssignForm(prev => ({ ...prev, memberId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar miembro" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rutina</Label>
              <Select value={assignForm.routineId} onValueChange={(v) => setAssignForm(prev => ({ ...prev, routineId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar rutina" /></SelectTrigger>
                <SelectContent>
                  {routines.filter(r => r.status === 'PUBLISHED').map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} ({r.exercises?.length || 0} ejercicios)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate">Fecha de vencimiento (opcional)</Label>
              <Input id="dueDate" type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm(prev => ({ ...prev, dueDate: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" value={assignForm.notes} onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Instrucciones adicionales..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAssign} disabled={assignMutation.isPending} className="neu-btn-primary">
              {assignMutation.isPending ? 'Asignando...' : 'Asignar Rutina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
