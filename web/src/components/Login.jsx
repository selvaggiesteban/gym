import React, { useState } from 'react';
import { Helmet } from '@/lib/helmet';
import { motion } from 'motion/react';
import { Eye, EyeOff, User, Lock, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    whatsapp: '',
    birthDate: ''
  });
  const { signIn, signUp, recoveryMode, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (!error) {
        toast({
          title: "Â¡Bienvenido!",
          description: "Has iniciado sesiÃ³n correctamente",
        });
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.whatsapp || !formData.birthDate) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        whatsapp: formData.whatsapp,
        birthDate: formData.birthDate,
      });

      if (!error) {
        toast({
          title: "Â¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente. Revisa tu email para confirmar.",
        });
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '', whatsapp: '', birthDate: '' });
      }
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    if (!error) {
      setResetSent(true);
      toast({
        title: "Email enviado",
        description: "Revisa tu casilla de correo para restablecer tu contraseÃ±a.",
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseÃ±as no coinciden",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseÃ±a debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (!error) {
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetAllForms = () => {
    setResetMode(false);
    setResetSent(false);
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Modo: Nueva contraseÃ±a (el usuario volviÃ³ del email de recovery)
  if (recoveryMode) {
    return (
      <>
        <Helmet>
          <title>NÃ“MADES OCR - Nueva ContraseÃ±a</title>
          <meta name="description" content="Establece tu nueva contraseÃ±a de NÃ“MADES OCR" />
        </Helmet>
        
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-black">NÃ“MADES OCR</CardTitle>
                <CardDescription className="text-gray-600">
                  Establece tu nueva contraseÃ±a
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-black font-medium">Nueva contraseÃ±a</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Tu nueva contraseÃ±a"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-black"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-black font-medium">Confirmar contraseÃ±a</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Repite tu nueva contraseÃ±a"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASEÃ‘A'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={resetAllForms}
                    className="text-gray-600 hover:text-black text-sm"
                  >
                    Volver al login
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  // Modo: Enviar email de recuperaciÃ³n
  if (resetMode) {
    return (
      <>
        <Helmet>
          <title>NÃ“MADES OCR - Restablecer ContraseÃ±a</title>
          <meta name="description" content="Restablece tu contraseÃ±a de NÃ“MADES OCR" />
        </Helmet>
        
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-black">NÃ“MADES OCR</CardTitle>
                <CardDescription className="text-gray-600">
                  {resetSent ? 'Revisa tu email' : 'Restablece tu contraseÃ±a'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {resetSent ? (
                  <div className="space-y-4 text-center">
                    <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
                      <p className="text-green-700 font-medium">
                        Te enviamos un email a <strong>{resetEmail}</strong>
                      </p>
                      <p className="text-green-600 text-sm mt-2">
                        HacÃ© clic en el link del email para restablecer tu contraseÃ±a.
                      </p>
                    </div>
                    <Button 
                      onClick={resetAllForms}
                      variant="outline"
                      className="w-full border-2 border-black hover:bg-black hover:text-white"
                    >
                      Volver al login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail" className="text-black font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="tu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                      disabled={loading}
                    >
                      {loading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERACIÃ“N'}
                    </Button>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <button
                    onClick={resetAllForms}
                    className="text-gray-600 hover:text-black text-sm"
                  >
                    Volver al login
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  // Modo: Login / Registro (default)
  return (
    <>
      <Helmet>
        <title>NÃ“MADES OCR - Acceso al Sistema</title>
        <meta name="description" content="Accede a tu cuenta de NÃ“MADES OCR para gestionar tu membresÃ­a del gimnasio" />
      </Helmet>
      
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-black shadow-[8px_8px_0px_0px_#000000]">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">NÃ“MADES OCR</CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin ? 'Inicia sesiÃ³n en tu cuenta' : 'Crea tu cuenta nueva'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-black font-medium">Nombre completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-black font-medium">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          type="tel"
                          placeholder="Tu nÃºmero de WhatsApp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-black font-medium">Fecha de nacimiento</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="birthDate"
                          name="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={handleChange}
                          className="pl-10"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">ContraseÃ±a</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseÃ±a"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black text-white hover:bg-gray-800 font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : (isLogin ? 'INICIAR SESIÃ“N' : 'CREAR CUENTA')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({ email: '', password: '', name: '', whatsapp: '', birthDate: '' });
                  }}
                  className="text-black hover:underline font-medium"
                >
                  {isLogin ? 'Â¿No tienes cuenta? Crear cuenta' : 'Â¿Ya tienes cuenta? Iniciar sesiÃ³n'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setResetMode(true)}
                    className="text-gray-600 hover:text-black text-sm"
                  >
                    Â¿Olvidaste tu contraseÃ±a?
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
