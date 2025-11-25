import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify"
 
import DefaultLayout from "./layouts/DefaultLayout"
import AdminLayout from "./layouts/AdminLayout"
import AccountLayout from "./layouts/AccountLayout";

import Home from './pages/Home';
import Cart from './pages/Cart';
import Discount from "./pages/Discount";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword"
import ResetPassword from "./pages/Auth/ResetPassword";
import Active from "./pages/Auth/Active"

import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import GenreDetail from "./pages/GenreDetail";
import Search from "./pages/Search";

import Profile from "./pages/Account/Profile";
import Order from "./pages/Account/Order";
import Address from "./pages/Account/Address";


import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Admin/Analytics"
import AddBook from "./pages/Admin/Product/AddBook"
import UpdateBook from "./pages/Admin/Product/UpdateBook"
import BookList from "./pages/Admin/Product/BookList"
import Author from "./pages/Admin/Author"
import OrderList from "./pages/Admin/Order/OrderList";
import Voucher from "./pages/Admin/Voucher";

import CustomerList from "./pages/Admin/User/CustomerList";
import StaffList from "./pages/Admin/User/StaffList";

import AccessDenied from "./pages/AccessDenied"
import NotFound from "./pages/NotFound"

import MoMoCallback from "./pages/Checkout/MoMoCallback";


import userApi from "./api/userApi";
import authApi from "./api/authApi";

import { login, logout } from "./redux/actions/auth";
import { setCart } from "./redux/actions/cart";

import { roleEnum } from  "./layouts/components/SideBar/routes"

function App() {

  const currentUser = useSelector((state) => state.auth)

  const dispatch = useDispatch()
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await authApi.me()
        const { email, fullName, phoneNumber, avatar, _id, role } = data?.user
        dispatch(login({email, fullName, phoneNumber, avatar, userId: _id, role}))
      } catch (error) {
        if (error.response.status === 403 || error.response.status === 401) {
          localStorage.removeItem('accessToken')
          dispatch(logout())
        }
      }
    }
    const getCart = async () => {
      try {
          const { data } = await userApi.getCart(currentUser.userId)
          const newList = data.cart.map(item => {
            const { price, discount } = item.product
            const newPrice = price - price * ((discount > 0 ? discount : 0) / 100)
            return {
              ...item,
              product: { ...item.product, price: newPrice },
              totalPriceItem: newPrice * item.quantity
            }
          })
          dispatch(setCart(newList))
      } catch (error) {
        console.log(error)
      }
    }
    const token = localStorage.getItem('accessToken')
    if (token && !currentUser.userId) {
      fetchData()
    }
    if (token && currentUser.userId) {
      getCart()
    }
  },[dispatch, currentUser])


  return (
    <div className="App">
      <ToastContainer />
      <Routes>
        <Route path="/" element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gio-hang" element={<Cart />} />
          <Route path="/khuyen-mai" element={<Discount />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/quen-mat-khau" element={<ForgotPassword />} />
          <Route path="/dat-lai-mat-khau/:token" element={<ResetPassword />} />
          <Route path="/services/user/verify" element={<Active />} />
          <Route path="/dang-ki" element={<Register />} />
          <Route path="/san-pham" element={<Product />} />
          <Route path="/chi-tiet-san-pham/:slug" element={<ProductDetail />} />
          <Route path="/thanh-toan" element={<Checkout />} />
          <Route path="/san-pham/the-loai/:genre" element={<GenreDetail />} />
          <Route path="/tim-kiem" element={<Search />} />

          <Route path="/thanhtoan/momo/callback" element={<MoMoCallback />}></Route>

        </Route>

        {currentUser && currentUser.role !== -1 && (
            <Route path="/" element={<ProtectedRoute isAllowed={currentUser.role === roleEnum.Customer} />}>
              <Route element={<DefaultLayout />}>
                <Route element={<AccountLayout />}>
                  <Route path="don-hang" element={<Order />} />
                  <Route path="tai-khoan" element={<Profile />} />
                  <Route path="dia-chi" element={<Address />} />
                </Route>
              </Route>
            </Route>
           )
        }

        {currentUser && currentUser.role !== -1 && (
          <Route path="/admin" element={<ProtectedRoute isAllowed={currentUser.role >= roleEnum.Staff} />}>
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

        {currentUser && currentUser.role !== -1 && (
          <Route path="/admin" element={<ProtectedRoute isAllowed={currentUser.role === roleEnum.Admin} />}>
            <Route element={<AdminLayout />}>

              <Route path="staff" element={<StaffList />} />

            </Route>
          </Route>
        )}

        {currentUser.role === -1 && (
          <>
            <Route path="/admin/*" element={<AccessDenied />} />
            <Route path="/don-hang" element={<AccessDenied />} />
            <Route path="/tai-khoan" element={<AccessDenied />} />
            <Route path="/dia-chi" element={<AccessDenied />} />
          </>
        )}

        <Route path="*" element={<NotFound />} />

      </Routes> 
    </div>
  );
}

export default App;
