import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Users, Edit, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { api } from '@/lib/apiClient';

const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const ScheduleTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newClass, setNewClass] = useState({ className: '', dayOfWeek: '', startTime: '', instructor: '', maxCapacity: '' });
  const [editingClass, setEditingClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState(null);

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api('/schedule'),
  });

  const invalidateSchedule = () => queryClient.invalidateQueries({ queryKey: ['schedule'] });

  const createMutation = useMutation({
    mutationFn: (data) => api('/schedule', { method: 'POST', body: data }),
    onSuccess: () => { toast({ title: "¡Clase agregada!", description: "La clase ha sido agregada al calendario" }); setCreateModalOpen(false); setNewClass({ className: '', dayOfWeek: '', startTime: '', instructor: '', maxCapacity: '' }); invalidateSchedule(); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => api(`/schedule/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => { toast({ title: "Clase actualizada", description: "Los cambios han sido guardados." }); setEditingClass(null); setEditModalOpen(false); invalidateSchedule(); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/schedule/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast({ title: "Clase eliminada", description: "La clase ha sido eliminada del calendario" }); invalidateSchedule(); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const resetMutation = useMutation({
    mutationFn: () => api('/schedule/reset-week', { method: 'POST' }),
    onSuccess: () => { toast({ title: "¡Calendario limpio!", description: "Todas las reservas han sido eliminadas." }); invalidateSchedule(); },
    onError: (err) => toast({ title: "Error al limpiar el calendario", description: err.message, variant: "destructive" }),
  });

  const handleInputChange = (e, setter) => setter(prev => ({ ...prev, [e.target.id]: e.target.value }));
  const handleSelectChange = (value, field, setter) => setter(prev => ({ ...prev, [field]: value }));

  const addClass = () => {
    if (!newClass.className || !newClass.dayOfWeek || !newClass.startTime || !newClass.instructor || !newClass.maxCapacity) {
      toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    createMutation.mutate({ ...newClass, maxCapacity: parseInt(newClass.maxCapacity, 10) });
    setIsSubmitting(false);
  };

  const updateClass = () => {
    if (!editingClass) return;
    setIsSubmitting(true);
    const { id, bookings, ...updateData } = editingClass;
    updateMutation.mutate({ id, ...updateData, maxCapacity: parseInt(updateData.maxCapacity, 10) });
    setIsSubmitting(false);
  };

  const openEditModal = (clase) => {
    setEditingClass({ ...clase, startTime: clase.startTime ? clase.startTime.substring(0, 5) : '' });
    setEditModalOpen(true);
  };

  const sortedSchedule = useMemo(() => {
    return [...schedule].sort((a, b) => {
      const dayComparison = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
      if (dayComparison !== 0) return dayComparison;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [schedule]);

  const groupedSchedule = useMemo(() => {
    return sortedSchedule.reduce((acc, clase) => {
      const day = clase.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(clase);
      return acc;
    }, {});
  }, [sortedSchedule]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 shadow-[2px_2px_0px_0px_#000000]">
              <Plus className="w-4 h-4 mr-2" />Agregar Nueva Clase
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Agregar Nueva Clase</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div><Label htmlFor="className">Nombre</Label><Input id="className" value={newClass.className} onChange={(e) => handleInputChange(e, setNewClass)} placeholder="Ej: CrossFit" /></div>
              <div><Label htmlFor="dayOfWeek">Día</Label><Select value={newClass.dayOfWeek} onValueChange={(value) => handleSelectChange(value, 'dayOfWeek', setNewClass)}><SelectTrigger><SelectValue placeholder="Selecciona día" /></SelectTrigger><SelectContent>{dayOrder.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="startTime">Horario</Label><Input id="startTime" type="time" value={newClass.startTime} onChange={(e) => handleInputChange(e, setNewClass)} /></div>
              <div><Label htmlFor="instructor">Profesor</Label><Input id="instructor" value={newClass.instructor} onChange={(e) => handleInputChange(e, setNewClass)} placeholder="Nombre del profesor" /></div>
              <div className="md:col-span-2"><Label htmlFor="maxCapacity">Cupos Máximos</Label><Input id="maxCapacity" type="number" value={newClass.maxCapacity} onChange={(e) => handleInputChange(e, setNewClass)} placeholder="Ej: 15" /></div>
            </div>
            <DialogFooter><Button onClick={addClass} disabled={isSubmitting} className="bg-black text-white">{isSubmitting ? 'Agregando...' : 'Agregar Clase'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive"><RefreshCw className="w-4 h-4 mr-2" />Limpiar Reservas</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción eliminará TODAS las reservas de TODAS las clases. Los cupos volverán a cero. Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>{resetMutation.isPending ? 'Limpiando...' : 'Sí, limpiar todo'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader><CardTitle>Calendario Semanal</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {dayOrder.map(day => (
              <div key={day} className="space-y-4">
                <h3 className="text-center font-bold text-lg border-b-2 border-black pb-2">{day}</h3>
                {groupedSchedule[day] && groupedSchedule[day].length > 0 ? (
                  groupedSchedule[day].map(clase => (
                    <div key={clase.id} className="border-2 border-black p-4 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold">{clase.className}</h4>
                          <p className="text-sm text-gray-600">{(clase.startTime || '').substring(0, 5)}</p>
                          <p className="text-xs mt-1"><strong>Prof:</strong> {clase.instructor}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-black" onClick={() => openEditModal(clase)}><Edit className="w-4 h-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>¿Eliminar clase?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará permanentemente la clase "{clase.className}".</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(clase.id)} disabled={deleteMutation.isPending}>Eliminar</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm" className="w-full flex justify-between items-center" onClick={() => setExpandedClassId(expandedClassId === clase.id ? null : clase.id)}>
                          <div className="flex items-center gap-2 font-bold"><Users className="w-4 h-4" /><span>{clase.bookings?.length || 0} / {clase.maxCapacity} cupos</span></div>
                          {expandedClassId === clase.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        {expandedClassId === clase.id && (
                          <div className="mt-2 p-2 bg-white border rounded-md max-h-32 overflow-y-auto">
                            {clase.bookings && clase.bookings.length > 0 ? (
                              <ul className="text-sm space-y-1">{clase.bookings.map((b, i) => <li key={i}>{b.memberName || b.memberId}</li>)}</ul>
                            ) : (
                              <p className="text-xs text-gray-500">Nadie ha reservado aún.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center pt-4">No hay clases</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingClass && (
        <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editar Clase</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div><Label htmlFor="className">Nombre</Label><Input id="className" value={editingClass.className} onChange={(e) => handleInputChange(e, setEditingClass)} /></div>
              <div><Label htmlFor="dayOfWeek">Día</Label><Select value={editingClass.dayOfWeek} onValueChange={(value) => handleSelectChange(value, 'dayOfWeek', setEditingClass)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{dayOrder.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="startTime">Horario</Label><Input id="startTime" type="time" value={editingClass.startTime} onChange={(e) => handleInputChange(e, setEditingClass)} /></div>
              <div><Label htmlFor="instructor">Profesor</Label><Input id="instructor" value={editingClass.instructor} onChange={(e) => handleInputChange(e, setEditingClass)} /></div>
              <div className="md:col-span-2"><Label htmlFor="maxCapacity">Cupos Máximos</Label><Input id="maxCapacity" type="number" value={editingClass.maxCapacity} onChange={(e) => handleInputChange(e, setEditingClass)} /></div>
            </div>
            <DialogFooter><Button onClick={updateClass} disabled={isSubmitting} className="bg-black text-white">{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ScheduleTab;
