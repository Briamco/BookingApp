import { Outlet } from "react-router";
import NavBar from "../NavBar";
import Footer from "../Footer";

function PageLayout() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-base-200">
      <NavBar />
      <div className="py-6 px-12">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default PageLayout;