import React from 'react';
    import { Helmet } from 'react-helmet';
    import { useAuth } from '@/hooks/useAuth';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';

    const AdminDashboard = () => {
      const { user, logout } = useAuth();

      return (
        <>
          <Helmet>
            <title>Panel de Administrador | NÓMADES OCR</title>
            <meta name="description" content="Panel de administración de NÓMADES OCR." />
          </Helmet>
          <div className="p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Panel de Administrador</h1>
              <Button onClick={logout} variant="outline">Cerrar Sesión</Button>
            </header>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenido, {user?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Desde aquí podrás gestionar miembros, pagos, asistencias y mucho más.</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      );
    };

    export default AdminDashboard;