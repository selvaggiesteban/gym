import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Hash, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode.react';

const QuickAttendance = () => {
  const { toast } = useToast();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendance = async () => {
    if (!attendanceCode || attendanceCode.length !== 3) {
      toast({ title: "Error", description: "Por favor ingresa un código válido de 3 dígitos", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, expiry_date, status, profiles(name)')
        .eq('member_code', attendanceCode)
        .single();

      if (memberError || !member) {
        await supabase.from('failed_access_attempts').insert({ reason: `Código no encontrado: ${attendanceCode}` });
        toast({ title: "Error", description: "Código no encontrado.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const now = new Date();
      const expiry = new Date(member.expiry_date);

      if (now > expiry) {
        await supabase.from('failed_access_attempts').insert({ member_id: member.id, reason: 'Membresía vencida' });
        toast({ title: "⚠️ MIEMBRO CADUCADO", description: `${member.profiles.name}, debes pagar. Contacta al administrador.`, variant: "destructive", duration: 5000 });
        setIsSubmitting(false);
        return;
      }

      const { error: attendanceError } = await supabase.from('attendance').insert({ member_id: member.id });

      if (attendanceError) {
        throw attendanceError;
      }

      toast({ title: `✅ ¡Hola, ${member.profiles.name}!`, description: "Asistencia registrada. ¡Disfruta tu entrenamiento!", duration: 5000 });
      setAttendanceCode('');

    } catch (error) {
      toast({ title: "Error", description: "No se pudo registrar la asistencia.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>NÓMADES OCR - Asistencia Rápida</title>
        <meta name="description" content="Página de asistencia rápida para miembros de NÓMADES OCR" />
      </Helmet>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
            <CardHeader className="text-center">
              <div className="mx-auto bg-black text-white rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <Hash className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-bold">Asistencia Rápida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Label htmlFor="code" className="text-lg font-medium">Ingresa tu código de 3 dígitos</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                  className="mt-2 h-16 text-center text-4xl font-mono tracking-widest border-2 border-black focus:shadow-[4px_4px_0px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px]"
                  maxLength={3}
                />
              </div>
              <Button onClick={handleAttendance} disabled={isSubmitting} className="w-full h-12 text-lg font-bold bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:transform-none active:transform-none active:shadow-none">
                {isSubmitting ? 'Registrando...' : 'MARCAR ASISTENCIA'}
              </Button>
              <div className="flex items-center justify-center pt-4">
                <QRCode value={window.location.href} size={80} level="H" />
                <p className="ml-4 text-sm text-gray-600">Escanea para volver a esta página.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default QuickAttendance;