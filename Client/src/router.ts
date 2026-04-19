import { createBrowserRouter } from "react-router";
import MainPage from "./pages/MainPage";
import AuthLayout from "./components/layouts/AuthLayout";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ConfirmCard from "./components/auth/ConfirmCard";
import PageLayout from "./components/layouts/PageLayout";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import PropertyPage from "./pages/PropertyPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import MyNotificationsPage from "./pages/MyNotificationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PageLayout,
    children: [
      { path: "", Component: MainPage },
      { path: "my-properties", Component: MyPropertiesPage },
      { path: "property/:id", Component: PropertyPage },
      { path: "my-reservations", Component: MyReservationsPage },
      { path: "my-notifications", Component: MyNotificationsPage }
    ]
  },
  {
    path: "/checkout",
    Component: CheckoutPage
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: LoginForm },
      { path: "register", Component: RegisterForm },
      { path: "confirm", Component: ConfirmCard }
    ]
  }
])