import React from 'react';
    import { Link } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';

    const NotFoundPage = () => {
      return (
        <>
          <Helmet>
            <title>404 - Página no encontrada | NÓMADES OCR</title>
            <meta name="description" content="La página que buscas no existe." />
          </Helmet>
          <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white p-6">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-9xl font-black text-black">404</h1>
              <p className="text-2xl md:text-3xl font-bold text-neutral-800 mt-4">
                Página no encontrada
              </p>
              <p className="text-neutral-600 mt-4 mb-8">
                Lo sentimos, la página que estás buscando no existe o fue movida.
              </p>
              <Button asChild className="bg-black text-white hover:bg-neutral-800">
                <Link to="/">Volver al inicio</Link>
              </Button>
            </motion.div>
          </div>
        </>
      );
    };

    export default NotFoundPage;