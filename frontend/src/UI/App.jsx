import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "../components/SideBar";
import Product from "../pages/Product";
import Sales from "../pages/Sale";
import Dashboard from "../pages/Dashboard";
import Category from "../pages/Category";
import Member from "../pages/Member";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import ForgetPassword from "../pages/ForgetPassword";
import ResetPassword from "../pages/ResetPassword";
import NewSale from "../pages/NewSale";
import Ledger from "../pages/Ledger";
import { UserContext } from "../context/UserContext";
// Store context removed

export default function App() {
  const { user } = useContext(UserContext);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Sidebar />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={user?.role === "admin" ? <Dashboard /> : <NewSale />}
          />
          <Route path="new-sale" element={<NewSale />} />
          <Route path="product" element={<Product />} />
          <Route path="category" element={<Category />} />
          <Route path="member" element={<Member />} />
          <Route path="sale" element={<Sales />} />
          <Route path="ledger" element={<Ledger />} />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}