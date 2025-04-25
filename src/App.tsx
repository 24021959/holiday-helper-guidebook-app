
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Home from "./pages/Home";
import SubMenu from "./pages/SubMenu";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Welcome from "./pages/Welcome";
import Storia from "./pages/Storia";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";
import { TranslationProvider } from "./context/TranslationContext";
import { Toaster } from "sonner";
import ChatbotBubble from "./components/ChatbotBubble";
import EditPage from "./pages/admin/EditPage";
import Wifi from "./pages/Wifi";
import WhereToEat from "./pages/WhereToEat";
import Taxi from "./pages/Taxi";
import RoadsideAssistance from "./pages/RoadsideAssistance";
import Restaurants from "./pages/restaurants/Restaurants";
import Pizzerias from "./pages/restaurants/Pizzerias";
import TraditionalTrattorias from "./pages/restaurants/TraditionalTrattorias";

function App() {
  return (
    <TranslationProvider>
      <Router>
        <Routes>
          {/* Index and system pages */}
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/storia" element={<Storia />} />
          <Route path="/wifi" element={<Wifi />} />
          <Route path="/where-to-eat" element={<WhereToEat />} />
          <Route path="/taxi" element={<Taxi />} />
          <Route path="/roadside-assistance" element={<RoadsideAssistance />} />
          
          {/* Restaurant pages */}
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/pizzerias" element={<Pizzerias />} />
          <Route path="/traditional" element={<TraditionalTrattorias />} />
          
          {/* Admin routes */}
          <Route path="/admin/edit" element={<EditPage />} />
          
          {/* Home pages in different languages */}
          <Route path="/en" element={<Home />} />
          <Route path="/fr" element={<Home />} />
          <Route path="/es" element={<Home />} />
          <Route path="/de" element={<Home />} />
          
          {/* Menu routes */}
          <Route path="/menu" element={<Menu />} />
          
          {/* SubMenu routes with improved path handling */}
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          <Route path="/submenu/:language/:path" element={<SubMenu />} />
          
          {/* Content page routes - both with and without language prefixes */}
          <Route path="/preview/*" element={<PreviewPage />} />
          
          {/* Content pages without language prefix */}
          <Route path="/:path" element={<PreviewPage />} />
          <Route path="/:parent/:child" element={<PreviewPage />} />
          
          {/* Content pages with language prefixes */}
          <Route path="/en/:path" element={<PreviewPage />} />
          <Route path="/en/:parent/:child" element={<PreviewPage />} />
          <Route path="/fr/:path" element={<PreviewPage />} />
          <Route path="/fr/:parent/:child" element={<PreviewPage />} />
          <Route path="/es/:path" element={<PreviewPage />} />
          <Route path="/es/:parent/:child" element={<PreviewPage />} />
          <Route path="/de/:path" element={<PreviewPage />} />
          <Route path="/de/:parent/:child" element={<PreviewPage />} />
          
          {/* Catch-all for unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotBubble />
        <Toaster position="top-right" richColors />
      </Router>
    </TranslationProvider>
  );
}

export default App;
