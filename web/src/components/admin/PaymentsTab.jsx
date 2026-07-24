import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/apiClient';

const PaymentsTab = ({ payments, loadData }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePayment = async (paymentId) => {
    setIsDeleting(true);
    try {
      await api(`/payments/${paymentId}`, { method: 'DELETE' });
      toast({ title: "Pago eliminado", description: "El registro del pago ha sido eliminado." });
      loadData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setIsDeleting(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthName = now.toLocaleString('es-AR', { month: 'long' });

    const monthlyPayments = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
    });

    if (monthlyPayments.length === 0) {
      toast({ title: "Sin datos", description: "No hay pagos registrados en el mes actual para exportar." });
      return;
    }

    const tableColumn = ["Fecha", "Miembro", "Plan", "Monto"];
    const tableRows = [];
    let totalAmount = 0;

    monthlyPayments.forEach(payment => {
      const paymentData = [
        new Date(payment.paymentDate).toLocaleDateString('es-AR'),
        payment.memberName || payment.memberId || 'Miembro desconocido',
        (payment.plan || '').replace('_', ' '),
        `$${Number(payment.amount || 0).toLocaleString('es-AR')}`
      ];
      tableRows.push(paymentData);
      totalAmount += Number(payment.amount || 0);
    });

    doc.setFontSize(18);
    doc.text(`Reporte de Pagos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, 14, 22);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [22, 22, 22] },
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Recaudado: $${totalAmount.toLocaleString('es-AR')}`, 14, finalY + 15);

    doc.save(`reporte_pagos_${year}_${month + 1}.pdf`);
  };

  const filteredPayments = useMemo(() => {
    if (!searchTerm) return payments.slice().reverse();
    const lowercasedTerm = searchTerm.toLowerCase();
    return payments.filter(p =>
      (p.memberName || p.memberId || '').toLowerCase().includes(lowercasedTerm)
    ).slice().reverse();
  }, [payments, searchTerm]);

  return (
    <Card className="neu-card">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>Historial de Pagos</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full sm:w-64" />
            </div>
            <Button onClick={exportToPDF} variant="outline" className="neu-btn">
              <Download className="w-4 h-4 mr-2" />Exportar Reporte Mensual
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay pagos que coincidan con la búsqueda.</p>
          ) : (
            filteredPayments.map(payment => (
              <div key={payment.id} className="border-2 border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{payment.memberName || payment.memberId || 'Miembro desconocido'}</h3>
                    <p className="text-sm text-gray-600 capitalize">{(payment.plan || '').replace('_', ' ')}</p>
                    <p className="text-sm">{new Date(payment.paymentDate).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-green-600">${Number(payment.amount || 0).toLocaleString('es-AR')}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este pago?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará el registro del pago de ${Number(payment.amount || 0).toLocaleString('es-AR')} para {payment.memberName || 'este miembro'}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePayment(payment.id)} disabled={isDeleting}>Eliminar</AlertDialogAction>
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
  );
};

export default PaymentsTab;
