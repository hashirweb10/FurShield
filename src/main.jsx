import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";

/* Public pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* Owner dashboard */
import OwnerDashboard from "./dashboards/owner/Dashboard";
import OwnerPets from "./dashboards/owner/Pets";
import OwnerAppointments from "./dashboards/owner/Appointments";
import OwnerHealthRecords from "./dashboards/owner/HealthRecords";
import OwnerProducts from "./dashboards/owner/Products";
import OwnerCart from "./dashboards/owner/Cart";
import OwnerOrders from "./dashboards/owner/Orders";
import OwnerAdoption from "./dashboards/owner/Adoption";
import OwnerCare from "./dashboards/owner/Care";
import OwnerNotifications from "./dashboards/owner/Notifications";
import OwnerChat from "./dashboards/owner/Chat";
import OwnerProfile from "./dashboards/owner/Profile";
import OwnerReviews from "./dashboards/owner/Reviews";
import OwnerVets from "./dashboards/owner/Vets";

/* Vet dashboard */
import VetDashboard from "./dashboards/vet/Dashboard";
import VetAppointments from "./dashboards/vet/Appointments";
import VetPatients from "./dashboards/vet/Patients";
import VetRecords from "./dashboards/vet/Records";
import VetAvailability from "./dashboards/vet/Availability";
import VetReviews from "./dashboards/vet/Reviews";
import VetProfile from "./dashboards/vet/Profile";

/* Shelter dashboard */
import ShelterDashboard from "./dashboards/shelter/Dashboard";
import ShelterListings from "./dashboards/shelter/Listings";
import ShelterApplications from "./dashboards/shelter/Applications";
import ShelterCare from "./dashboards/shelter/Care";
import ShelterProfile from "./dashboards/shelter/Profile";

import "./styles.css";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Owner routes */}
              <Route path="/dashboard/owner" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/pets" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerPets /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/appointments" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerAppointments /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/health" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerHealthRecords /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/vets" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerVets /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/products" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerProducts /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/cart" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerCart /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/orders" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerOrders /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/adoption" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerAdoption /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/care" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerCare /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/notifications" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerNotifications /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/chat" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerChat /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/profile" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerProfile /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/owner/reviews" element={<ProtectedRoute role="owner"><DashboardLayout role="owner"><OwnerReviews /></DashboardLayout></ProtectedRoute>} />

              {/* Vet routes */}
              <Route path="/dashboard/vet" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/appointments" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetAppointments /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/patients" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetPatients /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/records" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetRecords /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/availability" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetAvailability /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/reviews" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetReviews /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/vet/profile" element={<ProtectedRoute role="vet"><DashboardLayout role="vet"><VetProfile /></DashboardLayout></ProtectedRoute>} />

              {/* Shelter routes */}
              <Route path="/dashboard/shelter" element={<ProtectedRoute role="shelter"><DashboardLayout role="shelter"><ShelterDashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/shelter/listings" element={<ProtectedRoute role="shelter"><DashboardLayout role="shelter"><ShelterListings /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/shelter/applications" element={<ProtectedRoute role="shelter"><DashboardLayout role="shelter"><ShelterApplications /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/shelter/care" element={<ProtectedRoute role="shelter"><DashboardLayout role="shelter"><ShelterCare /></DashboardLayout></ProtectedRoute>} />
              <Route path="/dashboard/shelter/profile" element={<ProtectedRoute role="shelter"><DashboardLayout role="shelter"><ShelterProfile /></DashboardLayout></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
