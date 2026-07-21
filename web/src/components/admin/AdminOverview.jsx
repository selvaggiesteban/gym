import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, DollarSign, Clock } from 'lucide-react';

const AdminOverview = ({ data }) => {
  const getStats = () => {
    const now = new Date();
    const activeMembers = data.members.filter(m => m.expiry_date && new Date(m.expiry_date) > now).length;
    const expiredMembers = data.members.length - activeMembers;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = data.payments
      .filter(p => new Date(p.payment_date) >= thisMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const today = new Date().toLocaleDateString('es-AR');
    const todayAttendance = data.attendance.filter(a => 
      new Date(a.check_in_time).toLocaleDateString('es-AR') === today
    ).length;

    return { activeMembers, expiredMembers, monthlyRevenue, todayAttendance };
  };

  const stats = getStats();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Miembros Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{stats.expiredMembers}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString('es-AR')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asistencia Hoy</p>
                <p className="text-3xl font-bold text-purple-600">{stats.todayAttendance}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000] mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-bold">Intentos de Acceso Fallidos Recientes</h3>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data.failedAttempts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay intentos fallidos registrados</p>
            ) : (
              data.failedAttempts.slice().reverse().map((attempt) => (
                <div key={attempt.id} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-red-700">{attempt.profiles?.name || 'Miembro desconocido'}</p>
                      <p className="text-sm text-red-600">{attempt.reason}</p>
                    </div>
                    <p className="text-xs text-red-500">{new Date(attempt.attempt_time).toLocaleString('es-AR')}</p>
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

export default AdminOverview;