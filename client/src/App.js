import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import DefaultLayout from "./layouts/DefaultLayout";
import AdminLayout from "./layouts/AdminLayout";
import AccountLayout from "./layouts/AccountLayout";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Discount from "./pages/Discount";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Active from "./pages/Auth/Active";

import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import GenreDetail from "./pages/GenreDetail";
import Search from "./pages/Search";

import Profile from "./pages/Account/Profile";
import Order from "./pages/Account/Order";
import Address from "./pages/Account/Address";
import ReturnPolicy from "./layouts/components/ReturnPolicy";
import ShippingPolicy from "./layouts/components/ShippingPolicy";
import TermsandConditions from "./layouts/components/TermsandConditions";
import PrivacyPolicy from "./layouts/components/PrivacyPolicy";
import AboutUs from './layouts/components/AboutUs';
import Contact from './layouts/components/Contact';

import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Admin/Analytics";
import AddBook from "./pages/Admin/Product/AddBook";
import UpdateBook from "./pages/Admin/Product/UpdateBook";
import BookList from "./pages/Admin/Product/BookList";
import Author from "./pages/Admin/Author";
import OrderList from "./pages/Admin/Order/OrderList";
import Voucher from "./pages/Admin/Voucher";

import CustomerList from "./pages/Admin/User/CustomerList";
import StaffList from "./pages/Admin/User/StaffList";

import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

import MoMoCallback from "./pages/Checkout/MoMoCallback";

import userApi from "./api/userApi";
import authApi from "./api/authApi";

import { login, logout } from "./redux/actions/auth";
import { setCart } from "./redux/actions/cart";

import { roleEnum } from "./layouts/components/SideBar/routes";

function App() {
  const currentUser = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();

  // --- INIT APP: Fetch user + cart ---
  useEffect(() => {
    const initApp = async () => {
      // In development, clear any stored credentials by default so
      // the app opens to the login page instead of auto-signing-in an admin.
      // To re-enable the previous behaviour during local dev set:
      // REACT_APP_AUTO_LOGIN=true in your .env
      try {
        if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_AUTO_LOGIN !== 'true') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } catch (e) {}

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsAuthChecked(true);
        try {
          // One-time startup redirect: if this is the first app session view,
          // navigate to login so the developer sees the login page when the
          // project is started. Do not block access to Home afterwards.
          if (!sessionStorage.getItem('initialLoginRedirectDone')) {
            sessionStorage.setItem('initialLoginRedirectDone', 'true');
            navigate('/dang-nhap', { replace: true });
          }
        } catch (e) {}
        return;
      }

      try {
        // Fetch user data
        const data = await authApi.me();
        const { email, fullName, phoneNumber, avatar, id, role } = data?.user;
        dispatch(login({ email, fullName, phoneNumber, avatar, userId: id, role }));

        // Fetch cart
        try {
          const { data: cartData } = await userApi.getCart(id);
          const newList = cartData.cart.map((item) => {
            const { price, discount } = item.product;
            const newPrice = price - price * ((discount > 0 ? discount : 0) / 100);
            return {
              ...item,
              product: { ...item.product, price: newPrice },
              totalPriceItem: newPrice * item.quantity,
            };
          });
          dispatch(setCart(newList));
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          dispatch(logout());
        }
      } finally {
        setIsAuthChecked(true);
      }
    };

    initApp();
  }, [dispatch]);

  return (
    <div className="App">
      <ToastContainer />

      {!isAuthChecked ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div>Loading...</div>
        </div>
      ) : (
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home />} />
            <Route path="/gio-hang" element={<Cart />} />
            <Route path="/khuyen-mai" element={<Discount />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ki" element={<Register />} />
            <Route path="/quen-mat-khau" element={<ForgotPassword />} />
            <Route path="/dat-lai-mat-khau/:token" element={<ResetPassword />} />
            <Route path="/services/user/verify" element={<Active />} />
            <Route path="/san-pham" element={<Product />} />
            <Route path="/chi-tiet-san-pham/:slug" element={<ProductDetail />} />
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/san-pham/the-loai/:genre" element={<GenreDetail />} />
            <Route path="/tim-kiem" element={<Search />} />
            <Route path="/thanhtoan/momo/callback" element={<MoMoCallback />} />
            <Route path="/chinh-sach-doi-tra" element={<ReturnPolicy />} />
            <Route path="/chinh-sach-van-chuyen" element={<ShippingPolicy />} />
            <Route path="/dieu-khoan-dich-vu" element={<TermsandConditions />} />
            <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
            <Route path="/gioi-thieu" element={<AboutUs />} />
            <Route path="/lien-he" element={<Contact />} />
          </Route>

          {/* Account routes for any authenticated user (Customer, Staff, Admin) */}
          {currentUser && currentUser.role !== -1 && (
            <Route
              path="/"
              element={<ProtectedRoute isAllowed={currentUser.role !== -1} />}
            >
              <Route element={<DefaultLayout />}>
                <Route element={<AccountLayout />}>
                  {/* Everyone with a valid role can access profile */}
                  <Route path="tai-khoan" element={<Profile />} />

                  {/* Only customers see Orders and Address pages */}
                  {currentUser.role === roleEnum.Customer && (
                    <>
                      <Route path="don-hang" element={<Order />} />
                      <Route path="dia-chi" element={<Address />} />
                    </>
                  )}
                </Route>
              </Route>
            </Route>
          )}

          {/* Staff/Admin Routes */}
          {currentUser && currentUser.role !== -1 && (
            <Route
              path="/admin"
              element={<ProtectedRoute isAllowed={currentUser.role >= roleEnum.Staff} />}
            >
              <Route element={<AdminLayout />}>
                <Route path="" element={<Analytics />} />
                <Route path="book" element={<BookList />} />
                <Route path="book/add" element={<AddBook />} />
                <Route path="book/update/:id" element={<UpdateBook />} />
                <Route path="author" element={<Author />} />
                <Route path="order" element={<OrderList />} />
                <Route path="voucher" element={<Voucher />} />
                <Route path="customer" element={<CustomerList />} />
              </Route>
            </Route>
          )}

          {/* Admin Only */}
          {currentUser && currentUser.role !== -1 && (
            <Route
              path="/admin"
              element={<ProtectedRoute isAllowed={currentUser.role === roleEnum.Admin} />}
            >
              <Route element={<AdminLayout />}>
                <Route path="staff" element={<StaffList />} />
              </Route>
            </Route>
          )}

          {/* Prevent non-customers (staff/admin) from accessing customer-only pages */}
          {currentUser && currentUser.role !== -1 && currentUser.role !== roleEnum.Customer && (
            <>
              <Route path="/don-hang" element={<AccessDenied />} />
              <Route path="/dia-chi" element={<AccessDenied />} />
            </>
          )}

          {/* If user is not authenticated, redirect admin/account/customer pages to login instead of showing AccessDenied */}
          {currentUser.role === -1 && isAuthChecked && (
            <>
              <Route path="/admin/*" element={<Navigate to="/dang-nhap" replace />} />
            </>
          )}

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
