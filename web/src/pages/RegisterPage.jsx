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

    const RegisterPage = () => {
      const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        birthDate: '',
        password: '',
      });
      const { register, login } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === formData.email);

        if (existingUser) {
          toast({
            title: "Error de registro",
            description: "Este correo electrónico ya está en uso.",
            variant: "destructive",
          });
          return;
        }

        const newUser = register(formData);
        login(newUser);
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente.",
        });
        navigate('/dashboard');
      };

      return (
        <>
          <Helmet>
            <title>Crear Cuenta | NÓMADES OCR</title>
            <meta name="description" content="Crea una nueva cuenta en NÓMADES OCR." />
          </Helmet>
          <div className="flex items-center justify-center min-h-screen bg-white p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mx-auto max-w-sm w-[400px]">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
                  <CardDescription className="text-center">
                    Ingresa tus datos para registrarte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input id="name" placeholder="Juan Pérez" required onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input id="email" type="email" placeholder="miembro@ejemplo.com" required onChange={handleChange} />
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input id="whatsapp" type="tel" placeholder="1122334455" required onChange={handleChange} />
                    </div>
                     <div className="grid gap-2">
                      <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                      <Input id="birthDate" type="date" required onChange={handleChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" required onChange={handleChange} />
                    </div>
                    <Button type="submit" className="w-full bg-black text-white hover:bg-neutral-800">
                      Crear mi cuenta
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="underline">
                      Iniciar sesión
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      );
    };

    export default RegisterPage;