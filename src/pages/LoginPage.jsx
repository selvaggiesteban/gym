import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/hooks/useAuth';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const { login } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (foundUser) {
          toast({
            title: "¡Bienvenido de nuevo!",
            description: "Has iniciado sesión correctamente.",
          });
          login(foundUser);
          navigate('/dashboard');
        } else {
          toast({
            title: "Error de autenticación",
            description: "Correo electrónico o contraseña incorrectos.",
            variant: "destructive",
          });
        }
      };

      return (
        <>
          <Helmet>
            <title>Iniciar Sesión | NÓMADES OCR</title>
            <meta name="description" content="Inicia sesión en tu cuenta de NÓMADES OCR." />
          </Helmet>
          <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mx-auto max-w-sm w-[400px]">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">NÓMADES OCR</CardTitle>
                  <CardDescription className="text-center">
                    Ingresa tu correo electrónico para iniciar sesión en tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="miembro@ejemplo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Contraseña</Label>
                        <Link to="#" className="ml-auto inline-block text-sm underline" onClick={() => toast({ description: "🚧 ¡Esta función aún no está implementada!" })}>
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-black text-white hover:bg-neutral-800">
                      Iniciar Sesión
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="underline">
                      Crear cuenta
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      );
    };

    export default LoginPage;