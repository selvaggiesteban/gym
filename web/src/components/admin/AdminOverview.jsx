import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { api } from '@/lib/apiClient';

const AdminOverview = () => {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: () => api('/attendance/overview'),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="neu-card">
            <CardContent className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    { label: 'Miembros Activos', value: overview?.activeMembers || 0, icon: Users, color: 'text-green-600' },
    { label: 'Miembros Vencidos', value: overview?.expiredMembers || 0, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Ingresos del Mes', value: `$${Number(overview?.monthRevenue || 0).toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-blue-600' },
    { label: 'Asistencia Hoy', value: overview?.todayAttendance || 0, icon: Clock, color: 'text-purple-600' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="neu-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
