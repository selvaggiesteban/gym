import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
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
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente",
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

      const { error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        whatsapp: formData.whatsapp,
        birthDate: formData.birthDate,
        role: 'member'
      });

      if (!error) {
        toast({
          title: "¡Cuenta creada!",
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
        description: "Revisa tu casilla de correo para restablecer tu contraseña.",
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
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

  // Modo: Nueva contraseña (el usuario volvió del email de recovery)
  if (recoveryMode) {
    return (
      <>
        <Helmet>
          <title>NÓMADES OCR - Nueva Contraseña</title>
          <meta name="description" content="Establece tu nueva contraseña de NÓMADES OCR" />
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
                <CardTitle className="text-3xl font-bold text-black">NÓMADES OCR</CardTitle>
                <CardDescription className="text-gray-600">
                  Establece tu nueva contraseña
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-black font-medium">Nueva contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Tu nueva contraseña"
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
                    <Label htmlFor="confirmPassword" className="text-black font-medium">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Repite tu nueva contraseña"
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
                    {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASEÑA'}
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

  // Modo: Enviar email de recuperación
  if (resetMode) {
    return (
      <>
        <Helmet>
          <title>NÓMADES OCR - Restablecer Contraseña</title>
          <meta name="description" content="Restablece tu contraseña de NÓMADES OCR" />
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
                <CardTitle className="text-3xl font-bold text-black">NÓMADES OCR</CardTitle>
                <CardDescription className="text-gray-600">
                  {resetSent ? 'Revisa tu email' : 'Restablece tu contraseña'}
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
                        Hacé clic en el link del email para restablecer tu contraseña.
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
                      {loading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERACIÓN'}
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
        <title>NÓMADES OCR - Acceso al Sistema</title>
        <meta name="description" content="Accede a tu cuenta de NÓMADES OCR para gestionar tu membresía del gimnasio" />
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
              <CardTitle className="text-3xl font-bold text-black">NÓMADES OCR</CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta nueva'}
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
                          placeholder="Tu número de WhatsApp"
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
                  <Label htmlFor="password" className="text-black font-medium">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
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
                  {loading ? 'Procesando...' : (isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
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
                  {isLogin ? '¿No tienes cuenta? Crear cuenta' : '¿Ya tienes cuenta? Iniciar sesión'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setResetMode(true)}
                    className="text-gray-600 hover:text-black text-sm"
                  >
                    ¿Olvidaste tu contraseña?
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
