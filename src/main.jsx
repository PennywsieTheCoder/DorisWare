import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/Cartcontext'
import { ThemeProvider  } from './context/Themecontext '
import './index.css'

 ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename="/DorisWare/">
    <ThemeProvider>
    <CartProvider>
      <App />
    </CartProvider>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);