import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Trash2, GripVertical, Dumbbell, Save, Eye } from 'lucide-react';
import { api } from '@/lib/apiClient';
import ExerciseLibrary from '@/components/ExerciseLibrary';

export default function RoutineDetail({ routineId, onBack }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editForm, setEditForm] = useState({ sets: 3, reps: '10', restSeconds: 60, notes: '' });

  const routineQuery = useQuery({
    queryKey: ['routine', routineId],
    queryFn: () => api(`/routines/${routineId}`),
  });

  const routine = routineQuery.data;

  const addExerciseMutation = useMutation({
    mutationFn: (exercise) => api(`/routines/${routineId}/exercises`, {
      method: 'POST',
      body: {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: 3,
        reps: '10',
        restSeconds: 60,
        order: routine?.exercises?.length || 0,
      },
    }),
    onSuccess: () => {
      toast({ title: "Ejercicio agregado" });
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      setShowLibrary(false);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({ exerciseRowId, data }) => api(`/routines/${routineId}/exercises/${exerciseRowId}`, {
      method: 'PUT',
      body: data,
    }),
    onSuccess: () => {
      toast({ title: "Ejercicio actualizado" });
      setEditingExercise(null);
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (exerciseRowId) => api(`/routines/${routineId}/exercises/${exerciseRowId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: "Ejercicio eliminado" });
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const publishMutation = useMutation({
    mutationFn: () => api(`/routines/${routineId}/publish`, { method: 'POST', body: { changeNote: 'Publicación desde editor' } }),
    onSuccess: () => {
      toast({ title: "¡Rutina publicada!" });
      queryClient.invalidateQueries({ queryKey: ['routine', routineId] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setEditForm({
      sets: exercise.sets || 3,
      reps: exercise.reps || '10',
      restSeconds: exercise.restSeconds || 60,
      notes: exercise.notes || '',
    });
  };

  const saveExerciseEdit = () => {
    if (!editingExercise) return;
    updateExerciseMutation.mutate({
      exerciseRowId: editingExercise.id,
      data: editForm,
    });
  };

  if (routineQuery.isLoading) {
    return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div></div>;
  }

  if (!routine) {
    return <div className="text-center py-8 text-gray-500">Rutina no encontrada</div>;
  }

  const exercises = routine.exercises || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="shadow-[4px_4px_8px_#c5cad1,-4px_-4px_8px_#ffffff]">
          <ArrowLeft className="w-4 h-4 mr-2" />Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{routine.name}</h2>
          <p className="text-sm text-gray-600">{routine.description || 'Sin descripción'}</p>
        </div>
        <div className="flex gap-2">
          {routine.status !== 'PUBLISHED' && (
            <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending || exercises.length === 0} className="bg-[var(--color-success)] text-white">
              <Eye className="w-4 h-4 mr-2" />{publishMutation.isPending ? 'Publicando...' : 'Publicar'}
            </Button>
          )}
          <Button onClick={() => setShowLibrary(true)} className="bg-[var(--color-brand)] text-white">
            <Plus className="w-4 h-4 mr-2" />Agregar Ejercicio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="w-5 h-5" />Ejercicios ({exercises.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {exercises.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay ejercicios. Agregá uno desde la biblioteca.</p>
            ) : (
              exercises.map((ex, idx) => (
                <div key={ex.id} className="p-4 rounded-[12px] bg-[var(--color-neu-surface)] shadow-[inset_3px_3px_6px_#c5cad1,inset_-3px_-3px_6px_#ffffff]">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-mono text-sm w-6">#{idx + 1}</span>
                      <div>
                        <h4 className="font-bold text-sm">{ex.exerciseName || ex.exerciseId}</h4>
                        <div className="flex gap-3 mt-1 text-xs text-gray-600">
                          <span><strong>{ex.sets}</strong> series</span>
                          <span><strong>{ex.reps}</strong> reps</span>
                          {ex.restSeconds && <span>Descanso: <strong>{ex.restSeconds}s</strong></span>}
                        </div>
                        {ex.notes && <p className="text-xs text-gray-500 mt-1 italic">{ex.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEditExercise(ex)}>
                        <Save className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive"><Trash2 className="w-3 h-3" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar ejercicio?</AlertDialogTitle>
                            <AlertDialogDescription>Se eliminará "{ex.exerciseName || ex.exerciseId}" de esta rutina.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeExerciseMutation.mutate(ex.id)}>Eliminar</AlertDialogAction>
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

      <Dialog open={!!editingExercise} onOpenChange={(open) => { if (!open) setEditingExercise(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Ejercicio</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Series</Label><Input type="number" value={editForm.sets} onChange={(e) => setEditForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))} min={1} /></div>
              <div><Label>Reps</Label><Input value={editForm.reps} onChange={(e) => setEditForm(prev => ({ ...prev, reps: e.target.value }))} placeholder="Ej: 10, 8-12, AMRAP" /></div>
              <div><Label>Descanso (seg)</Label><Input type="number" value={editForm.restSeconds} onChange={(e) => setEditForm(prev => ({ ...prev, restSeconds: parseInt(e.target.value) || 0 }))} min={0} step={15} /></div>
              <div><Label>Notas</Label><Input value={editForm.notes} onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Instrucciones adicionales" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExercise(null)}>Cancelar</Button>
            <Button onClick={saveExerciseEdit} disabled={updateExerciseMutation.isPending} className="bg-black text-white">
              {updateExerciseMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Seleccionar Ejercicio</DialogTitle></DialogHeader>
          <ExerciseLibrary
            selectedIds={exercises.map(e => e.exerciseId)}
            onSelect={(exercise) => addExerciseMutation.mutate(exercise)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
