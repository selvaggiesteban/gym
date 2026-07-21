import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const NoticesTab = ({ notices, loadData }) => {
  const { toast } = useToast();
  const [newNotice, setNewNotice] = useState({ title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNotice = async () => {
    if (!newNotice.title || !newNotice.message) {
      toast({ title: "Error", description: "Por favor completa todos los campos", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('notices').insert(newNotice);
    if (error) {
      toast({ title: "Error", description: "No se pudo publicar el aviso.", variant: "destructive" });
    } else {
      toast({ title: "¡Aviso publicado!", description: "El aviso es visible para todos los miembros" });
      setNewNotice({ title: '', message: '' });
      loadData();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Crear Nuevo Aviso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div><Label htmlFor="noticeTitle">Título</Label><Input id="noticeTitle" value={newNotice.title} onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))} placeholder="Título del aviso" /></div>
            <div><Label htmlFor="noticeMessage">Mensaje</Label><textarea id="noticeMessage" value={newNotice.message} onChange={(e) => setNewNotice(prev => ({ ...prev, message: e.target.value }))} placeholder="Contenido del aviso" className="w-full h-24 p-3 border-2 border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" /></div>
          </div>
          <Button onClick={addNotice} disabled={isSubmitting} className="mt-4 bg-black text-white hover:bg-gray-800"><Plus className="w-4 h-4 mr-2" />{isSubmitting ? 'Publicando...' : 'Publicar Aviso'}</Button>
        </CardContent>
      </Card>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader><CardTitle>Avisos Publicados</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {notices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay avisos publicados</p>
            ) : (
              notices.map(notice => (
                <div key={notice.id} className="border-l-4 border-black pl-4 py-3 bg-gray-50">
                  <h3 className="font-bold text-lg">{notice.title}</h3>
                  <p className="text-gray-700 mt-2">{notice.message}</p>
                  <p className="text-sm text-gray-500 mt-2">{new Date(notice.created_at).toLocaleDateString('es-AR')}</p>
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