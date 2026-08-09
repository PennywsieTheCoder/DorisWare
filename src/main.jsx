import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/Cartcontext'
import { ThemeProvider  } from './context/Themecontext '
import { AuthProvider } from './context/Authcontext'
import './index.css'

 ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/DorisWare/">
    <ThemeProvider>
    <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
    </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
