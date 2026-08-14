import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import ScrollToTop from "./components/Scrolltotop";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage";
import ProductPage from "./pages/Productpage";
import About from "./pages/About";
import ContactPage from "./pages/Contactpage";
import ShopPage from "./pages/Shoppage";
import CheckoutPage from "./pages/Checkoutpage";
import OrderConfirmationPage from "./pages/Orderconfirmationpage";
import InfoPage from "./pages/Infopage";
import PageLoader from "./components/Pageloader";
import LoginPage from "./pages/Loginpage";
import SignupPage from "./pages/Signuppage";
import PasswordResetPage from "./pages/Passwordresetpage";
import ProfilePage from "./pages/Profilepage";
import AdminPage from "./pages/Adminpage";
import ConnectionStatus from "./components/Connectionstatus";
import StoreAssistant from "./components/StoreAssistant";
import BackToTop from "./components/Backtotop";

export default function App() {
  const location = useLocation();
  const isPasswordReset = location.search.includes("reset-password=");
  const isAuthPage = ["/login", "/signup", "/reset-password"].includes(location.pathname) || isPasswordReset;
  const focusedPage = ["/checkout", "/order-confirmation", "/profile", "/admin"].includes(location.pathname);
  const showFooter = !isAuthPage && !focusedPage;
  const showAssistant = !isAuthPage && !["/checkout", "/order-confirmation", "/admin"].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 transition-colors duration-200 dark:bg-stone-950 dark:text-stone-100">
      <PageLoader />
      <ConnectionStatus />
      {!isAuthPage && <Header storeName="DorisWare" />}

      <ScrollToTop />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeOrPasswordReset />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<KeyedProductPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/delivery" element={<InfoPage type="delivery" />} />
          <Route path="/returns" element={<InfoPage type="returns" />} />
          <Route path="/privacy" element={<InfoPage type="privacy" />} />
          <Route path="/terms" element={<InfoPage type="terms" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && <Footer storeName="DorisWare" contactEmail="info@dorisware.com" />}
      {!isAuthPage && <BackToTop />}
      {showAssistant && <StoreAssistant />}
    </div>
  );
}

function KeyedProductPage() {
  const { id } = useParams();
  return <ProductPage key={id} />;
}

function HomeOrPasswordReset() {
  return new URLSearchParams(useLocation().search).has("reset-password") ? <PasswordResetPage /> : <HomePage />;
}
