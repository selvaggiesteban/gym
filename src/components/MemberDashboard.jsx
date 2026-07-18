import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogOut, CreditCard, Calendar, Clock, AlertTriangle, Hash, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function MemberDashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, members!inner(*)')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      setMemberData({ ...profile, ...profile.members });
      
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', user.id)
        .order('payment_date', { ascending: false });
      if (paymentsError) throw paymentsError;
      setPayments(paymentsData);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedule')
        .select('*, class_bookings(count)');
      if (scheduleError) throw scheduleError;
      
      const sortedSchedule = scheduleData.sort((a, b) => {
        const dayComparison = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
        if (dayComparison !== 0) return dayComparison;
        return a.start_time.localeCompare(b.start_time);
      });
      setSchedule(sortedSchedule);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('class_bookings')
        .select('class_id')
        .eq('member_id', user.id);
      if (bookingsError) throw bookingsError;
      setBookings(bookingsData.map(b => b.class_id));

      const { data: noticesData, error: noticesError } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (noticesError) throw noticesError;
      setNotices(noticesData);

    } catch (error) {
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPaymentStatus = () => {
    if (!memberData || !memberData.expiry_date) return { status: 'expired', color: 'bg-red-500', text: 'PAGO VENCIDO' };
    const now = new Date();
    const expiry = new Date(memberData.expiry_date);
    if (now > expiry) return { status: 'expired', color: 'bg-red-500', text: 'PAGO VENCIDO' };
    if (memberData.status === 'single_class') return { status: 'single', color: 'bg-yellow-500', text: 'CLASE SUELTA' };
    return { status: 'paid', color: 'bg-green-500', text: 'ACTIVO' };
  };

  const handleAttendance = async () => {
    if (!attendanceCode) {
      toast({ title: "Error", description: "Por favor ingresa tu código de asistencia", variant: "destructive" });
      return;
    }
    if (attendanceCode !== memberData.member_code) {
      await supabase.from('failed_access_attempts').insert({ member_id: user.id, reason: 'Código incorrecto' });
      toast({ title: "Error", description: "Código incorrecto", variant: "destructive" });
      return;
    }
    const paymentStatus = getPaymentStatus();
    if (paymentStatus.status === 'expired') {
      await supabase.from('failed_access_attempts').insert({ member_id: user.id, reason: 'Membresía vencida' });
      toast({ title: "⚠️ MIEMBRO CADUCADO", description: "DEBE PAGAR - Contacta al administrador", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('attendance').insert({ member_id: user.id });
    if (error) {
      toast({ title: "Error", description: "No se pudo registrar la asistencia.", variant: "destructive" });
    } else {
      toast({ title: "✅ Asistencia registrada", description: "¡Disfruta tu entrenamiento!" });
      setAttendanceCode('');
    }
  };

  const handleBookClass = async (classId) => {
    setIsBooking(true);
    const paymentStatus = getPaymentStatus();
    if (paymentStatus.status !== 'paid' && paymentStatus.status !== 'single') {
      toast({ title: "Pago Vencido", description: "Debes renovar tu membresía para poder reservar.", variant: "destructive" });
      setIsBooking(false);
      return;
    }
    const { error } = await supabase.from('class_bookings').insert({ class_id: classId, member_id: user.id });
    if (error) {
      toast({ title: "Error", description: "No se pudo realizar la reserva. Puede que ya estés inscripto.", variant: "destructive" });
    } else {
      toast({ title: "¡Reserva confirmada!", description: "Tu lugar ha sido guardado." });
      fetchData();
    }
    setIsBooking(false);
  };

  const handleCancelBooking = async (classId) => {
    setIsBooking(true);
    const { error } = await supabase.from('class_bookings').delete().match({ class_id: classId, member_id: user.id });
    if (error) {
      toast({ title: "Error", description: "No se pudo cancelar la reserva.", variant: "destructive" });
    } else {
      toast({ title: "Reserva cancelada", description: "Tu lugar ha sido liberado." });
      fetchData();
    }
    setIsBooking(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatus();
  const canBook = paymentStatus.status === 'paid' || paymentStatus.status === 'single';

  const groupedSchedule = schedule.reduce((acc, clase) => {
    const day = clase.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(clase);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>NÓMADES OCR - Panel de Miembro</title>
        <meta name="description" content="Panel de control para miembros de NÓMADES OCR" />
      </Helmet>

      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-black">NÓMADES OCR</h1>
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
                      <div className="flex items-center gap-2 text-red-700 font-bold"><AlertTriangle className="w-5 h-5" />⚠️ MIEMBRO CADUCADO – DEBE PAGAR</div>
                    </div>
                  )}
                  <div className="space-y-2 text-sm">
                    <p><strong>Último pago:</strong> {memberData?.last_payment_date ? new Date(memberData.last_payment_date).toLocaleDateString('es-AR') : 'Nunca'}</p>
                    <p><strong>Vencimiento:</strong> {memberData?.expiry_date ? new Date(memberData.expiry_date).toLocaleDateString('es-AR') : 'No definido'}</p>
                    <p><strong>Tu código:</strong> <span className="font-mono font-bold text-lg">{memberData?.member_code}</span></p>
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
                    <Button onClick={handleAttendance} className="w-full bg-black text-white hover:bg-gray-800 font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000]">MARCAR ASISTENCIA</Button>
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
                            <span className="font-medium capitalize">{payment.plan.replace('_', ' ')}</span>
                            <span className="font-bold">${payment.amount.toLocaleString('es-AR')}</span>
                          </div>
                          <p className="text-sm text-gray-600">{new Date(payment.payment_date).toLocaleDateString('es-AR')}</p>
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
                            const bookedCount = clase.class_bookings[0]?.count || 0;
                            const isBooked = bookings.includes(clase.id);
                            const isFull = bookedCount >= clase.max_capacity;
                            return (
                              <div key={clase.id} className="border-2 border-black p-4 rounded-lg flex flex-col justify-between bg-gray-50">
                                <div>
                                  <h4 className="font-bold">{clase.class_name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4" />{clase.start_time.substring(0, 5)}</div>
                                  <p className="text-xs mt-1"><strong>Prof:</strong> {clase.instructor}</p>
                                  <div className="flex items-center gap-2 text-sm mt-2 font-bold"><Users className="w-4 h-4" />{bookedCount} / {clase.max_capacity}</div>
                                </div>
                                <div className="mt-4">
                                  {isBooked ? (
                                    <Button onClick={() => handleCancelBooking(clase.id)} disabled={isBooking} variant="destructive" className="w-full">Cancelar</Button>
                                  ) : isFull ? (
                                    <Button disabled className="w-full bg-gray-400">Agotado</Button>
                                  ) : (
                                    <Button onClick={() => handleBookClass(clase.id)} disabled={isBooking || !canBook} className="w-full bg-black text-white hover:bg-gray-800">{!canBook ? 'Pago Vencido' : 'Reservar'}</Button>
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
                          <p className="text-xs text-gray-500 mt-1">{new Date(notice.created_at).toLocaleDateString('es-AR')}</p>
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