
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import SubMenu from "./pages/SubMenu";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";
import { TranslationProvider } from "./context/TranslationContext";
import { Toaster } from "sonner";

function App() {
  return (
    <TranslationProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/en/menu" element={<Menu />} />
          <Route path="/fr/menu" element={<Menu />} />
          <Route path="/es/menu" element={<Menu />} />
          <Route path="/de/menu" element={<Menu />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/storia" element={<Storia />} />
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          <Route path="/preview/*" element={<PreviewPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/:path" element={<PreviewPage />} />
          <Route path="/en/:path" element={<PreviewPage />} />
          <Route path="/fr/:path" element={<PreviewPage />} />
          <Route path="/es/:path" element={<PreviewPage />} />
          <Route path="/de/:path" element={<PreviewPage />} />
        </Routes>
      </Router>
    </TranslationProvider>
  );
}

export default App;
