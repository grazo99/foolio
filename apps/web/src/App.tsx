import { CssBaseline, ThemeProvider, createTheme, Typography, Container } from '@mui/material';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Foolio</Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
