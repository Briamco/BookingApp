import { Outlet } from "react-router";
import NavBar from "../NavBar";
import Footer from "../Footer";

function PageLayout() {
  return (
    <div className="relative min-h-screen bg-base-200">
      <div className="relative grid min-h-screen grid-rows-[auto_1fr_auto]">
        <NavBar />
        <div className="mx-auto w-full max-w-400 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default PageLayout;