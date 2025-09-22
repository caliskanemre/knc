import React from 'react';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function SearchPage() {
  return (
    <>
      <Head>
        <title>Kınasepeti - Arama</title>
        <meta name="description" content="Ürün arama sayfası" />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main>
        <Container sx={{ py: 6 }}>
          <Typography variant="h4" gutterBottom>Arama</Typography>
          <Typography>Bu sayfa yakında güncellenecek.</Typography>
        </Container>
      </main>
    </>
  );
}

