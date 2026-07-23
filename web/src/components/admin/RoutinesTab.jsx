import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Eye, Edit, Dumbbell } from 'lucide-react';
import { api } from '@/lib/apiClient';

const RoutinesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRoutine, setNewRoutine] = useState({ title: '', description: '' });
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines'],
    queryFn: () => api('/routines/mine'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api('/routines', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "¡Rutina creada!" });
      setNewRoutine({ title: '', description: '' });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/routines/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Rutina eliminada" });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, changeNote }) => api(`/routines/${id}/publish`, { method: 'POST', body: { changeNote } }),
    onSuccess: () => {
      toast({ title: "¡Rutina publicada!" });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 shadow-[2px_2px_0px_0px_#000000]">
              <Plus className="w-4 h-4 mr-2" />Crear Nueva Rutina
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Nueva Rutina</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Título</Label><Input value={newRoutine.title} onChange={(e) => setNewRoutine(prev => ({ ...prev, title: e.target.value }))} placeholder="Ej: Rutina Fuerza Upper Body" /></div>
              <div><Label>Descripción</Label><textarea value={newRoutine.description} onChange={(e) => setNewRoutine(prev => ({ ...prev, description: e.target.value }))} placeholder="Descripción breve de la rutina" className="w-full h-20 p-3 border-2 border-gray-300 rounded-md resize-none" /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createMutation.mutate(newRoutine)} disabled={createMutation.isPending || !newRoutine.title} className="bg-black text-white">
                {createMutation.isPending ? 'Creando...' : 'Crear Rutina'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5" />Mis Rutinas ({routines.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Cargando rutinas...</p>
            ) : routines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay rutinas creadas</p>
            ) : (
              routines.map(routine => (
                <div key={routine.id} className="border-2 border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{routine.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${routine.isPublished ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                          {routine.isPublished ? 'PUBLICADA' : 'BORRADOR'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{routine.description || 'Sin descripción'}</p>
                      <p className="text-xs text-gray-400 mt-1">Versión {routine.currentVersion || 1} · {routine.exercises?.length || 0} ejercicios</p>
                    </div>
                    <div className="flex gap-2">
                      {!routine.isPublished && (
                        <Button size="sm" onClick={() => publishMutation.mutate({ id: routine.id, changeNote: 'Publicación inicial' })} disabled={publishMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                          Publicar
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta rutina?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(routine.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutinesTab;
