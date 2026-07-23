import { Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/Scrolltotop";
 import Header from "./components/Header";
 import Footer from "./components/Footer";
 import HomePage from "./pages/Homepage";
 import ProductPage from "./pages/Productpage";
 import ShopPage from "./pages/Shoppage";

 export default function App() {
   return (
     <div className="min-h-screen flex flex-col bg-white text-stone-900 transition-colors duration-200 dark:bg-stone-950 dark:text-stone-100">
       <Header storeName="DorisWare" />

       <ScrollToTop />
       <main className="flex-1">
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/shop" element={<ShopPage />} />
           <Route path="/product/:id" element={<ProductPage />} />
           <Route path="*" element={<Navigate to="/" replace />} />
         </Routes>
       </main>

       <Footer storeName="DorisWare" contactEmail="info@dorisware.com" />
     </div>
   );
 }
