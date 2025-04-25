
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
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
import HotelServices from "./pages/hotel-services/HotelServices";
import Rentals from "./pages/rentals/Rentals";
import VehicleRentals from "./pages/rentals/VehicleRentals";
import BikeRentals from "./pages/rentals/BikeRentals";
import BoatRentals from "./pages/rentals/BoatRentals";
import SportsActivities from "./pages/sports/SportsActivities";
import Trekking from "./pages/sports/Trekking";
import HorseRiding from "./pages/sports/HorseRiding";
import WaterSports from "./pages/sports/WaterSports";

function App() {
  return (
    <TranslationProvider>
      <Router>
        <Routes>
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
          
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/pizzerias" element={<Pizzerias />} />
          <Route path="/traditional" element={<TraditionalTrattorias />} />
          
          <Route path="/admin/edit" element={<EditPage />} />
          
          <Route path="/en" element={<Home />} />
          <Route path="/fr" element={<Home />} />
          <Route path="/es" element={<Home />} />
          <Route path="/de" element={<Home />} />
          
          <Route path="/submenu/:parentPath" element={<SubMenu />} />
          <Route path="/submenu/:language/:path" element={<SubMenu />} />
          
          <Route path="/preview/*" element={<PreviewPage />} />
          
          <Route path="/:path" element={<PreviewPage />} />
          <Route path="/:parent/:child" element={<PreviewPage />} />
          
          <Route path="/en/:path" element={<PreviewPage />} />
          <Route path="/en/:parent/:child" element={<PreviewPage />} />
          <Route path="/fr/:path" element={<PreviewPage />} />
          <Route path="/fr/:parent/:child" element={<PreviewPage />} />
          <Route path="/es/:path" element={<PreviewPage />} />
          <Route path="/es/:parent/:child" element={<PreviewPage />} />
          <Route path="/de/:path" element={<PreviewPage />} />
          <Route path="/de/:parent/:child" element={<PreviewPage />} />
          
          <Route path="/hotel-services" element={<HotelServices />} />
          <Route path="/hotel-services/:subpage" element={<PreviewPage />} />
          
          <Route path="/en/hotel-services" element={<HotelServices />} />
          <Route path="/en/hotel-services/:subpage" element={<PreviewPage />} />
          <Route path="/fr/hotel-services" element={<HotelServices />} />
          <Route path="/fr/hotel-services/:subpage" element={<PreviewPage />} />
          <Route path="/es/hotel-services" element={<HotelServices />} />
          <Route path="/es/hotel-services/:subpage" element={<PreviewPage />} />
          <Route path="/de/hotel-services" element={<HotelServices />} />
          <Route path="/de/hotel-services/:subpage" element={<PreviewPage />} />
          
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/vehicles" element={<VehicleRentals />} />
          <Route path="/rentals/bikes" element={<BikeRentals />} />
          <Route path="/rentals/boats" element={<BoatRentals />} />
          
          <Route path="/en/rentals" element={<Rentals />} />
          <Route path="/en/rentals/vehicles" element={<VehicleRentals />} />
          <Route path="/en/rentals/bikes" element={<BikeRentals />} />
          <Route path="/en/rentals/boats" element={<BoatRentals />} />
          <Route path="/fr/rentals" element={<Rentals />} />
          <Route path="/fr/rentals/vehicles" element={<VehicleRentals />} />
          <Route path="/fr/rentals/bikes" element={<BikeRentals />} />
          <Route path="/fr/rentals/boats" element={<BoatRentals />} />
          <Route path="/es/rentals" element={<Rentals />} />
          <Route path="/es/rentals/vehicles" element={<VehicleRentals />} />
          <Route path="/es/rentals/bikes" element={<BikeRentals />} />
          <Route path="/es/rentals/boats" element={<BoatRentals />} />
          <Route path="/de/rentals" element={<Rentals />} />
          <Route path="/de/rentals/vehicles" element={<VehicleRentals />} />
          <Route path="/de/rentals/bikes" element={<BikeRentals />} />
          <Route path="/de/rentals/boats" element={<BoatRentals />} />
          
          <Route path="/sports" element={<SportsActivities />} />
          <Route path="/sports/trekking" element={<Trekking />} />
          <Route path="/sports/horse-riding" element={<HorseRiding />} />
          <Route path="/sports/water-sports" element={<WaterSports />} />
          
          <Route path="/en/sports" element={<SportsActivities />} />
          <Route path="/en/sports/trekking" element={<Trekking />} />
          <Route path="/en/sports/horse-riding" element={<HorseRiding />} />
          <Route path="/en/sports/water-sports" element={<WaterSports />} />
          <Route path="/fr/sports" element={<SportsActivities />} />
          <Route path="/fr/sports/trekking" element={<Trekking />} />
          <Route path="/fr/sports/horse-riding" element={<HorseRiding />} />
          <Route path="/fr/sports/water-sports" element={<WaterSports />} />
          <Route path="/es/sports" element={<SportsActivities />} />
          <Route path="/es/sports/trekking" element={<Trekking />} />
          <Route path="/es/sports/horse-riding" element={<HorseRiding />} />
          <Route path="/es/sports/water-sports" element={<WaterSports />} />
          <Route path="/de/sports" element={<SportsActivities />} />
          <Route path="/de/sports/trekking" element={<Trekking />} />
          <Route path="/de/sports/horse-riding" element={<HorseRiding />} />
          <Route path="/de/sports/water-sports" element={<WaterSports />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotBubble />
        <Toaster position="top-right" richColors />
      </Router>
    </TranslationProvider>
  );
}

export default App;
