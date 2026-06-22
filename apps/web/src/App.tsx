import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import TransactionsPage from './pages/TransactionsPage';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/transactions"
              sx={{ color: 'inherit', textDecoration: 'none' }}
            >
              Foolio
            </Typography>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/" element={<Navigate to="/transactions" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
