import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/apiClient';

const AttendanceTab = () => {
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api('/attendance'),
  });

  return (
    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
      <CardHeader>
        <CardTitle>Registro de Asistencia</CardTitle>
        <CardDescription>Asistencia diaria de miembros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">Cargando...</p>
          ) : attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros de asistencia</p>
          ) : (
            attendance.slice().reverse().map((record) => (
              <div key={record.id} className="border-2 border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{record.memberName || record.memberId || 'Miembro desconocido'}</h3>
                    <p className="text-sm text-gray-600">{new Date(record.checkInTime || record.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(record.checkInTime || record.createdAt).toLocaleTimeString('es-AR')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTab;
