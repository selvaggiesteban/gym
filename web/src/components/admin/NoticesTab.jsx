import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { api } from '@/lib/apiClient';

const NoticesTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNotice, setNewNotice] = useState({ title: '', message: '' });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => api('/notices'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api('/notices', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "¡Aviso publicado!", description: "El aviso es visible para todos los miembros" });
      setNewNotice({ title: '', message: '' });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addNotice = () => {
    if (!newNotice.title || !newNotice.message) {
      toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }
    createMutation.mutate(newNotice);
  };

  return (
    <div className="space-y-6">
      <Card className="neu-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Crear Nuevo Aviso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div><Label htmlFor="noticeTitle">Título</Label><Input id="noticeTitle" value={newNotice.title} onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))} placeholder="Título del aviso" /></div>
            <div><Label htmlFor="noticeMessage">Mensaje</Label><textarea id="noticeMessage" value={newNotice.message} onChange={(e) => setNewNotice(prev => ({ ...prev, message: e.target.value }))} placeholder="Contenido del aviso" className="w-full h-24 p-3 border-2 border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" /></div>
          </div>
          <Button onClick={addNotice} disabled={createMutation.isPending} className="mt-4 bg-black text-white hover:bg-gray-800 neu-btn-primary">
            <Plus className="w-4 h-4 mr-2" />{createMutation.isPending ? 'Publicando...' : 'Publicar Aviso'}
          </Button>
        </CardContent>
      </Card>

      <Card className="neu-card">
        <CardHeader><CardTitle>Avisos Publicados</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Cargando...</p>
            ) : notices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay avisos publicados</p>
            ) : (
              notices.map(notice => (
                <div key={notice.id} className="border-l-4 border-black pl-4 py-3 bg-gray-50">
                  <h3 className="font-bold text-lg">{notice.title}</h3>
                  <p className="text-gray-700 mt-2">{notice.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{new Date(notice.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticesTab;
