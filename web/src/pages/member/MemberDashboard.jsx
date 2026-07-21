import React from 'react';
    import { Helmet } from 'react-helmet';
    import { useAuth } from '@/hooks/useAuth';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';

    const MemberDashboard = () => {
      const { user, logout } = useAuth();

      return (
        <>
          <Helmet>
            <title>Mi Panel | NÓMADES OCR</title>
            <meta name="description" content="Panel de control para miembros de NÓMADES OCR." />
          </Helmet>
          <div className="p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Hola, {user?.name}</h1>
              <Button onClick={logout} variant="outline">Cerrar Sesión</Button>
            </header>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Panel de Miembro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>¡Bienvenido a tu panel! Aquí verás pronto el estado de tu membresía, horarios y más.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      );
    };

    export default MemberDashboard;