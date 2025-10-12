import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, Lora, Playfair Display, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    h6: {
      fontFamily: 'Playfair Display, serif',
      fontWeight: 700,
      fontSize: '1.25rem',
    }
  },
  palette: {
    primary: {
      main: '#C84B31',
    },
    secondary: {
      main: '#ECDCCB',
    },
  },
});

export default theme;

