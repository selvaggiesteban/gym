import React, { useState, useEffect } from 'react';
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
  const [tokenMode, setTokenMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
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
  const { signIn, signUp, recoveryMode, resetPassword, confirmPasswordReset } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setTokenMode(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const { error } = await signIn(formData.email, formData.password);
      if (!error) {
        toast({
          title: "Bienvenido!",
          description: "Has iniciado sesion correctamente",
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
          title: "Cuenta creada!",
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
        description: "Revisa tu casilla de correo para restablecer tu contrasena.",
      });
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contrasenas no coinciden",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contrasena debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      if (tokenMode && resetToken) {
        await confirmPasswordReset(resetToken, newPassword);
        toast({ title: "Contrasena actualizada", description: "Tu contrasena ha sido restablecida correctamente." });
        setTokenMode(false);
        setResetToken('');
        window.history.replaceState({}, '', '/login');
      } else {
        throw new Error('Modo de recuperacion invalido');
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

  if (tokenMode) {
    return (
      <>
        <Helmet>
          <title>GYM - Restablecer Contrasena</title>
          <meta name="description" content="Establece tu nueva contrasena de GYM" />
        </Helmet>
        
        <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="neu-card">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-black">GYM</CardTitle>
                <CardDescription className="text-gray-600">
                  Establece tu nueva contrasena
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-black font-medium">Nueva contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Tu nueva contrasena"
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
                    <Label htmlFor="confirmPassword" className="text-black font-medium">Confirmar contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Repite tu nueva contrasena"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full neu-btn-primary font-bold py-3"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASENA'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  if (recoveryMode) {
    return (
      <>
        <Helmet>
          <title>GYM - Nueva Contrasena</title>
          <meta name="description" content="Establece tu nueva contrasena de GYM" />
        </Helmet>
        
        <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="neu-card">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-black">GYM</CardTitle>
                <CardDescription className="text-gray-600">
                  Establece tu nueva contrasena
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-black font-medium">Nueva contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Tu nueva contrasena"
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
                    <Label htmlFor="confirmPassword" className="text-black font-medium">Confirmar contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Repite tu nueva contrasena"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full neu-btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASENA'}
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

  if (resetMode) {
    return (
      <>
        <Helmet>
          <title>GYM - Restablecer Contrasena</title>
          <meta name="description" content="Restablece tu contrasena de GYM" />
        </Helmet>
        
        <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="neu-card">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-black">GYM</CardTitle>
                <CardDescription className="text-gray-600">
                  {resetSent ? 'Revisa tu email' : 'Restablece tu contrasena'}
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
                        Hace clic en el link del email para restablecer tu contrasena.
                      </p>
                    </div>
                    <Button 
                      onClick={resetAllForms}
                      variant="outline"
                      className="w-full neu-btn"
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
                      className="w-full neu-btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Enviando...' : 'ENVIAR LINK DE RECUPERACION'}
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

  return (
    <>
      <Helmet>
        <title>GYM - Acceso al Sistema</title>
        <meta name="description" content="Accede a tu cuenta de GYM para gestionar tu membresia del gimnasio" />
      </Helmet>
      
      <div className="min-h-screen bg-[var(--color-neu-bg)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="neu-card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-black">GYM</CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin ? 'Inicia sesion en tu cuenta' : 'Crea tu cuenta nueva'}
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
                          placeholder="Tu numero de WhatsApp"
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
                  <Label htmlFor="password" className="text-black font-medium">Contrasena</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contrasena"
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
                  className="w-full neu-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : (isLogin ? 'INICIAR SESION' : 'CREAR CUENTA')}
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
                  {isLogin ? 'No tienes cuenta? Crear cuenta' : 'Ya tienes cuenta? Iniciar sesion'}
                </button>
              </div>

              {isLogin && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setResetMode(true)}
                    className="text-gray-600 hover:text-black text-sm"
                  >
                    Olvidaste tu contrasena?
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
