import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Archive, CreditCard, Upload, Info, Filter, Search, RefreshCw, Mail, Phone, Cake, CalendarDays, Barcode, CalendarCheck, CalendarX, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const MembersTab = ({ members, loadData }) => {
  const { toast } = useToast();
  const [newMember, setNewMember] = useState({
    name: '', email: '', whatsapp: '', birthDate: '', password: '', role: 'member'
  });
  const [validationErrors, setValidationErrors] = useState({
    name: '', email: '', password: ''
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [paymentData, setPaymentData] = useState({ plan: '', paymentDate: new Date().toISOString().split('T')[0] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateMemberOpen, setCreateMemberOpen] = useState(false);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const fileInputRef = React.useRef(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      password: ''
    };
    let isValid = true;

    if (!newMember.name.trim()) {
      errors.name = 'El nombre es obligatorio';
      isValid = false;
    }

    if (!newMember.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!validateEmail(newMember.email)) {
      errors.email = 'El correo electrónico debe ser válido';
      isValid = false;
    }

    if (!newMember.password) {
      errors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (newMember.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const createMember = async (memberDetails) => {
    setIsSubmitting(true);
    try {
      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: memberDetails.email,
        password: memberDetails.password,
        options: {
          data: {
            name: memberDetails.name,
            whatsapp: memberDetails.whatsapp || '',
            birthDate: memberDetails.birthDate || null,
            role: memberDetails.role || 'member'
          }
        }
      });

      if (authError) {
        // Handle specific auth errors
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          throw new Error('El correo ya está registrado');
        }
        throw new Error(`Error al crear el usuario: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      toast({ 
        title: "¡Miembro creado!", 
        description: `El miembro ${memberDetails.name} ha sido registrado exitosamente.` 
      });
      
      return { user: authData.user };
    } catch (error) {
      toast({ 
        title: "Error creando miembro", 
        description: error.message, 
        variant: "destructive" 
      });
      return { error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSingleMember = async () => {
    if (!validateForm()) {
      toast({ 
        title: "Formulario inválido", 
        description: "Por favor corrige los errores antes de continuar", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await createMember(newMember);
    if (!error) {
      setNewMember({ name: '', email: '', whatsapp: '', birthDate: '', password: '', role: 'member' });
      setValidationErrors({ name: '', email: '', password: '' });
      setCreateMemberOpen(false);
      loadData();
    }
  };

  const handleInputChange = (field, value) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const membersToCreate = results.data;
        if (!membersToCreate.length || !membersToCreate[0].name || !membersToCreate[0].email) {
          toast({ title: "Error en CSV", description: "El archivo debe tener las columnas 'name' y 'email'.", variant: "destructive" });
          setIsImporting(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;
        
        for (const member of membersToCreate) {
          const { error } = await createMember({
            name: member.name,
            email: member.email,
            password: 'miembroocr123',
            whatsapp: member.whatsapp || '',
            birthDate: member.birthDate || '',
            role: 'member',
          });
          if (error) {
            errorCount++;
          } else {
            successCount++;
          }
        }
        
        toast({
          title: "Importación completada",
          description: `${successCount} miembros importados correctamente. ${errorCount} errores.`,
        });
        
        loadData();
        setIsImporting(false);
      },
      error: (error) => {
        toast({ title: "Error al leer el archivo", description: error.message, variant: "destructive" });
        setIsImporting(false);
      },
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const archiveMember = async (memberId, memberName) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) {
        throw new Error(`Error al archivar el miembro: ${error.message}`);
      }

      toast({ 
        title: "Miembro archivado", 
        description: `${memberName} ha sido archivado correctamente` 
      });
      
      loadData();
    } catch (error) {
      toast({ 
        title: "Error al archivar miembro", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const syncUsers = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-users');
      if (error) throw error;
      if (data.error) throw new Error(data.error.message);

      toast({
        title: "Sincronización Completa",
        description: `${data.created_profiles} perfiles creados. ${data.updated_profiles} perfiles actualizados.`,
      });
      loadData();
    } catch (error) {
      toast({ title: "Error de Sincronización", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const addPayment = async () => {
    if (!selectedMember || !paymentData.plan || !paymentData.paymentDate) {
      toast({ title: "Error", description: "Completa todos los campos del pago", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const paymentDate = new Date(paymentData.paymentDate);
    let expiryDate = new Date(paymentDate);
    let amount = 0;
    let status = 'paid';
    switch (paymentData.plan) {
      case 'monthly': expiryDate.setDate(paymentDate.getDate() + 30); amount = 40000; break;
      case 'quarterly': expiryDate.setDate(paymentDate.getDate() + 90); amount = 105000; break;
      case 'single_class': expiryDate.setDate(paymentDate.getDate() + 1); amount = 8000; status = 'single_class'; break;
      case 'ocr_2_days': expiryDate.setDate(paymentDate.getDate() + 30); amount = 30000; break;
      case 'hybrid_month': expiryDate.setDate(paymentDate.getDate() + 30); amount = 48000; break;
      default: setIsSubmitting(false); return;
    }

    const { error: paymentError } = await supabase.from('payments').insert({
      member_id: selectedMember.id,
      plan: paymentData.plan,
      amount,
      payment_date: paymentDate.toISOString()
    });

    if (paymentError) {
      toast({ title: "Error", description: "No se pudo registrar el pago.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const { error: memberError } = await supabase.from('members').update({
      status,
      last_payment_date: paymentDate.toISOString(),
      expiry_date: expiryDate.toISOString()
    }).eq('id', selectedMember.id);

    if (memberError) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del miembro.", variant: "destructive" });
    } else {
      toast({ title: "¡Pago registrado!", description: `${amount.toLocaleString('es-AR')} - Vence: ${expiryDate.toLocaleDateString('es-AR')}` });
      setPaymentDialogOpen(false);
      setSelectedMember(null);
      setPaymentData({ plan: '', paymentDate: new Date().toISOString().split('T')[0] });
      loadData();
    }
    setIsSubmitting(false);
  };

  const filteredMembers = useMemo(() => {
    const now = new Date();
    let membersList = members;

    // Filter by active/archived status
    if (!showArchived) {
      membersList = membersList.filter(m => m.is_active !== false);
    }

    // Filter by expiry status
    if (filter === 'active') {
      membersList = membersList.filter(m => m.expiry_date && new Date(m.expiry_date) > now);
    } else if (filter === 'expired') {
      membersList = membersList.filter(m => !m.expiry_date || new Date(m.expiry_date) <= now);
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      membersList = membersList.filter(m => 
        m.name?.toLowerCase().includes(lowercasedTerm) ||
        m.email?.toLowerCase().includes(lowercasedTerm) ||
        m.member_code?.includes(lowercasedTerm)
      );
    }
    
    return membersList;
  }, [members, filter, searchTerm, showArchived]);

  const isFormValid = newMember.name.trim() && 
                      newMember.email.trim() && 
                      validateEmail(newMember.email) &&
                      newMember.password && 
                      newMember.password.length >= 6;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Dialog open={isCreateMemberOpen} onOpenChange={setCreateMemberOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800 shadow-[2px_2px_0px_0px_#000000]"><Plus className="w-4 h-4 mr-2" />Crear Nuevo Miembro</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Nuevo Miembro</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input 
                  id="name" 
                  value={newMember.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)} 
                  placeholder="Nombre completo"
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newMember.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)} 
                  placeholder="email@ejemplo.com"
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  value={newMember.whatsapp} 
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)} 
                  placeholder="Número de WhatsApp" 
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input 
                  id="birthDate" 
                  type="date" 
                  value={newMember.birthDate} 
                  onChange={(e) => handleInputChange('birthDate', e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={newMember.password} 
                  onChange={(e) => handleInputChange('password', e.target.value)} 
                  placeholder="Mínimo 6 caracteres"
                  className={validationErrors.password ? 'border-red-500' : ''}
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                )}
              </div>
              <div>
                <Label htmlFor="role">Tipo de Usuario</Label>
                <Select value={newMember.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Miembro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleCreateSingleMember} 
                disabled={isSubmitting || !isFormValid} 
                className="bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Miembro'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => fileInputRef.current?.click()} disabled={isImporting} variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
          <Upload className="w-4 h-4 mr-2" />
          {isImporting ? "Importando..." : "Importar Miembros (CSV)"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".csv"
        />
        <Button onClick={syncUsers} disabled={isSyncing} variant="outline" className="border-2 border-black hover:bg-black hover:text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar Miembros"}
        </Button>
      </div>

      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Info className="w-5 h-5 text-gray-500" />Instrucciones para Importar CSV</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>Asegúrate de que tu archivo CSV tenga las siguientes columnas (la primera fila debe ser el encabezado):</p>
          <ul className="list-disc list-inside pl-4 font-mono text-xs bg-gray-100 p-2 rounded">
            <li><strong>name</strong> (obligatorio): Nombre completo del miembro.</li>
            <li><strong>email</strong> (obligatorio): Correo electrónico del miembro.</li>
            <li><strong>whatsapp</strong> (opcional): Número de WhatsApp.</li>
            <li><strong>birthDate</strong> (opcional): Fecha de nacimiento en formato AAAA-MM-DD.</li>
          </ul>
          <p>La contraseña para todos los usuarios importados será: <strong>miembroocr123</strong></p>
        </CardContent>
      </Card>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <CardTitle>Lista de Miembros ({filteredMembers.length})</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Buscar por nombre, email, código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="border-2 border-black">Todos</Button>
                <Button size="sm" variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')} className="border-2 border-black">Activos</Button>
                <Button size="sm" variant={filter === 'expired' ? 'default' : 'outline'} onClick={() => setFilter('expired')} className="border-2 border-black">Vencidos</Button>
              </div>
              <Button 
                size="sm" 
                variant={showArchived ? 'default' : 'outline'} 
                onClick={() => setShowArchived(!showArchived)} 
                className="border-2 border-black"
              >
                {showArchived ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {showArchived ? 'Ocultar archivados' : 'Mostrar archivados'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {filteredMembers.map(member => {
              const isExpired = !member.expiry_date || new Date(member.expiry_date) <= new Date();
              const isArchived = member.is_active === false;
              return (
                <div key={member.id} className={`border-2 p-4 rounded-lg ${isExpired ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${isArchived ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        {isArchived && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500 text-white">ARCHIVADO</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{isExpired ? 'VENCIDO' : 'ACTIVO'}</span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-200">{member.role === 'admin' ? 'ADMIN' : 'MIEMBRO'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {member.email || 'No disponible'}</span>
                        <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {member.whatsapp || 'No disponible'}</span>
                        <span className="flex items-center gap-2"><Cake className="w-4 h-4 text-gray-400" /> {member.birth_date ? new Date(member.birth_date).toLocaleDateString('es-AR', { timeZone: 'UTC' }) : 'No disponible'}</span>
                        <span className="flex items-center gap-2"><Barcode className="w-4 h-4 text-gray-400" /> {member.member_code || 'N/A'}</span>
                        <span className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-gray-400" /> Pago: {member.last_payment_date ? new Date(member.last_payment_date).toLocaleDateString('es-AR') : 'Nunca'}</span>
                        <span className="flex items-center gap-2"><CalendarX className="w-4 h-4 text-gray-400" /> Vence: {member.expiry_date ? new Date(member.expiry_date).toLocaleDateString('es-AR') : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isPaymentDialogOpen && selectedMember?.id === member.id} onOpenChange={(open) => { if(!open) setSelectedMember(null); setPaymentDialogOpen(open); }}>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => { 
                              setSelectedMember(member); 
                              setPaymentData({ plan: '', paymentDate: new Date().toISOString().split('T')[0] }); 
                              setPaymentDialogOpen(true); 
                            }} 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isArchived}
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Cargar Pago - {selectedMember?.name}</DialogTitle>
                            <DialogDescription>Selecciona el plan, la fecha y registra el pago.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Plan</Label>
                              <Select value={paymentData.plan} onValueChange={(value) => setPaymentData(prev => ({ ...prev, plan: value }))}>
                                <SelectTrigger><SelectValue placeholder="Selecciona un plan" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="monthly">Mensual - $40.000</SelectItem>
                                  <SelectItem value="quarterly">Trimestral - $105.000</SelectItem>
                                  <SelectItem value="single_class">Clase Suelta - $8.000</SelectItem>
                                  <SelectItem value="ocr_2_days">Pase 2 días OCR - $30.000</SelectItem>
                                  <SelectItem value="hybrid_month">Híbrido Mes - $48.000</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="paymentDate">Fecha de Pago</Label>
                              <Input 
                                id="paymentDate" 
                                type="date" 
                                value={paymentData.paymentDate} 
                                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))} 
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={addPayment} 
                              disabled={isSubmitting} 
                              className="bg-black text-white"
                            >
                              {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white" disabled={isArchived}>
                            <Archive className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de que desea archivar este miembro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El miembro <strong>{member.name}</strong> será archivado y ocultado de la vista principal. Podrá recuperarlo activando la opción "Mostrar archivados".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => archiveMember(member.id, member.name)} 
                              disabled={isSubmitting}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {isSubmitting ? 'Archivando...' : 'Archivar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MembersTab;