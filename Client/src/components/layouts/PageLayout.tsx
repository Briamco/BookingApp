import { Outlet } from "react-router";
import NavBar from "../NavBar";
import Footer from "../Footer";
import BottomNav from "../BottomNav";

function PageLayout() {
  return (
    <div className="relative min-h-screen bg-base-200">
      <div className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <NavBar />
        <div className="mx-auto w-full max-w-400 px-4 pb-24 pt-6 sm:px-6 lg:px-8 md:pb-10">
          <Outlet />
        </div>
        <Footer />
        <BottomNav />
      </div>
    </div>
  );
}

export default PageLayout;