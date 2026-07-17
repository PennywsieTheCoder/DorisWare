import { Routes, Route } from "react-router-dom";
 import Header from "./components/Header";
 import Footer from "./components/Footer";
 import HomePage from "./pages/Homepage";
 import ProductPage from "./pages/Productpage";

 export default function App() {
   return (
     <div className="min-h-screen flex flex-col bg-white">
       <Header storeName="DorisWare" />

       <main className="flex-1">
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/product/:id" element={<ProductPage />} />
         </Routes>
       </main>

       <Footer storeName="DorisWare" contactEmail="info@dorisware.com" />
     </div>
   );
 }