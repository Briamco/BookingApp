import { createBrowserRouter } from "react-router";
import MainPage from "./pages/MainPage";
import AuthLayout from "./components/layouts/AuthLayout";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ConfirmCard from "./components/auth/ConfirmCard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainPage
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