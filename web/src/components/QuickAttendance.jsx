import React, { useState } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Hash } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/apiClient';

export default function QuickAttendance() {
  const { toast } = useToast();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttendance = async () => {
    if (!attendanceCode || attendanceCode.length < 3) {
      toast({ title: 'Error', description: 'Ingresa un codigo valido', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const { ok, reason, member } = await api('/attendance/check-in', {
        method: 'POST',
        body: { memberCode: attendanceCode },
      });
      if (!ok) {
        toast({ title: 'No se registro', description: reason, variant: 'destructive' });
        return;
      }
      toast({
        title: `Hola, ${member.profile?.name || 'miembro'}`,
        description: 'Asistencia registrada.',
        duration: 5000,
      });
      setAttendanceCode('');
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet title="GYM - Asistencia Rapida" description="Asistencia rapida por codigo" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-base text-base-foreground">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="w-full max-w-md neu-card">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full h-16 w-16 flex items-center justify-center mb-4 neu-pressed text-primary">
                <Hash className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-bold">Asistencia Rapida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Label htmlFor="code" className="text-lg font-medium">Ingresa tu codigo (3-4 digitos)</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="1234"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  className="mt-2 h-16 text-center text-4xl font-mono tracking-widest neu-pressed"
                  maxLength={4}
                />
              </div>
              <Button onClick={handleAttendance} disabled={isSubmitting} className="w-full h-12 text-lg font-bold neu-pill">
                {isSubmitting ? 'Registrando...' : 'MARCAR ASISTENCIA'}
              </Button>
              <div className="flex items-center justify-center pt-4">
                <QRCodeSVG value={window.location.href} size={80} level="H" />
                <p className="ml-4 text-sm text-muted-foreground">Escanea para volver a esta pagina.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
