import React, { useState, useCallback } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, CreditCard, Calendar, Clock, AlertTriangle, Hash, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/apiClient';

const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function MemberDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attendanceCode, setAttendanceCode] = useState('');

  const memberQuery = useQuery({
    queryKey: ['member', user?.id],
    queryFn: () => api(`/members/${user.id}`),
    enabled: !!user,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => api('/payments'),
    enabled: !!user,
  });

  const scheduleQuery = useQuery({
    queryKey: ['schedule'],
    queryFn: () => api('/schedule'),
  });

  const noticesQuery = useQuery({
    queryKey: ['notices'],
    queryFn: () => api('/notices'),
  });

  const memberData = memberQuery.data;
  const payments = (paymentsQuery.data || []).filter(p => p.memberId === user?.id);
  const rawSchedule = scheduleQuery.data || [];
  const notices = noticesQuery.data || [];

  const getPaymentStatus = () => {
    if (!memberData?.expiryDate) return { status: 'expired', color: 'bg-red-500', text: 'PAGO VENCIDO' };
    const now = new Date();
    const expiry = new Date(memberData.expiryDate);
    if (now > expiry) return { status: 'expired', color: 'bg-red-500', text: 'PAGO VENCIDO' };
    if (memberData.status === 'single_class') return { status: 'single', color: 'bg-yellow-500', text: 'CLASE SUELTA' };
    return { status: 'paid', color: 'bg-green-500', text: 'ACTIVO' };
  };

  const attendanceMutation = useMutation({
    mutationFn: async (memberCode) => {
      if (!memberCode) throw new Error('Por favor ingresa tu código de asistencia');
      if (memberCode !== memberData.memberCode) {
        await api('/attendance/check-in', { method: 'POST', body: { memberCode, force: false } });
        throw new Error('Código incorrecto');
      }
      const paymentStatus = getPaymentStatus();
      if (paymentStatus.status === 'expired') {
        await api('/attendance/check-in', { method: 'POST', body: { memberCode, force: false } });
        throw new Error('MIEMBRO CADUCADO – DEBE PAGAR');
      }
      return api('/attendance/check-in', { method: 'POST', body: { memberCode } });
    },
    onSuccess: () => {
      toast({ title: "Asistencia registrada", description: "¡Disfruta tu entrenamiento!" });
      setAttendanceCode('');
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const bookMutation = useMutation({
    mutationFn: (classId) => api(`/schedule/${classId}/book`, { method: 'POST', body: { memberId: user.id } }),
    onSuccess: () => {
      toast({ title: "¡Reserva confirmada!", description: "Tu lugar ha sido guardado." });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const unbookMutation = useMutation({
    mutationFn: (classId) => api(`/schedule/${classId}/unbook`, { method: 'POST', body: { memberId: user.id } }),
    onSuccess: () => {
      toast({ title: "Reserva cancelada", description: "Tu lugar ha sido liberado." });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (memberQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();
  const canBook = paymentStatus.status === 'paid' || paymentStatus.status === 'single';

  const sortedSchedule = [...rawSchedule].sort((a, b) => {
    const dayComparison = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayComparison !== 0) return dayComparison;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  const groupedSchedule = sortedSchedule.reduce((acc, clase) => {
    const day = clase.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(clase);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>GYM - Panel de Miembro</title>
        <meta name="description" content="Panel de control para miembros del gimnasio" />
      </Helmet>

      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black">GYM</h1>
              <p className="text-gray-600">Bienvenido, {memberData?.name}</p>
            </div>
            <Button onClick={signOut} variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Estado de Pago</CardTitle></CardHeader>
                <CardContent>
                  <div className={`${paymentStatus.color} text-white p-4 rounded-lg text-center font-bold mb-4`}>{paymentStatus.text}</div>
                  {paymentStatus.status === 'expired' && (
                    <div className="bg-red-100 border-2 border-red-500 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-red-700 font-bold"><AlertTriangle className="w-5 h-5" />MIEMBRO CADUCADO – DEBE PAGAR</div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <p><strong>Último pago:</strong> {memberData?.lastPaymentDate ? new Date(memberData.lastPaymentDate).toLocaleDateString('es-AR') : 'Nunca'}</p>
                    <p><strong>Vencimiento:</strong> {memberData?.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString('es-AR') : 'No definido'}</p>
                    <p><strong>Tu código:</strong> <span className="font-mono font-bold text-lg">{memberData?.memberCode}</span></p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle className="flex items-center gap-2"><Hash className="w-5 h-5" />Marcar Asistencia</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code" className="text-black font-medium">Ingresa tu código</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input id="code" type="text" placeholder="Tu código de 3 dígitos" value={attendanceCode} onChange={(e) => setAttendanceCode(e.target.value)} className="pl-10 font-mono text-center text-lg" maxLength={3} />
                      </div>
                    </div>
                    <Button onClick={() => attendanceMutation.mutate(attendanceCode)} disabled={attendanceMutation.isPending} className="w-full bg-black text-white hover:bg-gray-800 font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                      {attendanceMutation.isPending ? 'Verificando...' : 'MARCAR ASISTENCIA'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle>Historial de Pagos</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {payments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
                    ) : (
                      payments.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{(payment.plan || '').replace('_', ' ')}</span>
                            <span className="font-bold">${Number(payment.amount || 0).toLocaleString('es-AR')}</span>
                          </div>
                          <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString('es-AR')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3">
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Calendario Semanal</CardTitle>
                  <CardDescription>Reserva tu lugar en las clases. Solo miembros activos pueden reservar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {dayOrder.map(day => (
                      <div key={day} className="space-y-4">
                        <h3 className="text-center font-bold text-lg border-b-2 border-black pb-2">{day}</h3>
                        {groupedSchedule[day] && groupedSchedule[day].length > 0 ? (
                          groupedSchedule[day].map(clase => {
                            const isBooked = clase.bookings?.some(b => b.memberId === user?.id);
                            const bookedCount = clase.bookings?.length || 0;
                            const isFull = bookedCount >= clase.maxCapacity;
                            return (
                              <div key={clase.id} className="border-2 border-black p-4 rounded-lg flex flex-col justify-between bg-gray-50">
                                <div>
                                  <h4 className="font-bold">{clase.className}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4" />{(clase.startTime || '').substring(0, 5)}</div>
                                  <p className="text-xs mt-1"><strong>Prof:</strong> {clase.instructor}</p>
                                  <div className="flex items-center gap-2 text-sm mt-2 font-bold"><Users className="w-4 h-4" />{bookedCount} / {clase.maxCapacity}</div>
                                </div>
                                <div className="mt-4">
                                  {isBooked ? (
                                    <Button onClick={() => unbookMutation.mutate(clase.id)} disabled={unbookMutation.isPending} variant="destructive" className="w-full">Cancelar</Button>
                                  ) : isFull ? (
                                    <Button disabled className="w-full bg-gray-400">Agotado</Button>
                                  ) : (
                                    <Button onClick={() => bookMutation.mutate(clase.id)} disabled={bookMutation.isPending || !canBook} className="w-full bg-black text-white hover:bg-gray-800">{!canBook ? 'Pago Vencido' : 'Reservar'}</Button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-400 text-center pt-4">No hay clases</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-3">
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <CardHeader><CardTitle>Avisos Importantes</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notices.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay avisos</p>
                    ) : (
                      notices.map((notice) => (
                        <div key={notice.id} className="border-l-4 border-black pl-4 py-2">
                          <h4 className="font-bold">{notice.title}</h4>
                          <p className="text-sm text-gray-600">{notice.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(notice.createdAt).toLocaleDateString('es-AR')}</p>
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
