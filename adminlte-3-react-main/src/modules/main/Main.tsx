"use client";
import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { toggleSidebarMenu } from "@app/store/reducers/ui";
import {
  addWindowClass,
  removeWindowClass,
  scrollbarVisible,
} from "@app/utils/helpers";
import ControlSidebar from "@app/modules/main/control-sidebar/ControlSidebar";
import Header from "@app/modules/main/header/Header";
import Footer from "@app/modules/main/footer/Footer";
import { useAppDispatch, useAppSelector } from "@app/store/store";
import MenuSidebar from "./menu-sidebar/MenuSidebar";
// import { Outlet } from "react-router-dom";
import { Loading } from "@app/components/Loading";

const MENU_WIDTH = 250;
const MENU_WIDTH_COLLAPSED = 73; // Width of mini sidebar

const Main = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed
  );
  const controlSidebarCollapsed = useAppSelector(
    (state) => state.ui.controlSidebarCollapsed
  );
  const layoutBoxed = useAppSelector((state) => state.ui.layoutBoxed);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);

  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const mainRef = useRef<HTMLDivElement | undefined>(undefined);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  useEffect(() => {
    setIsAppLoaded(Boolean(currentUser));
  }, [currentUser]);

  useEffect(() => {
    removeWindowClass("register-page");
    removeWindowClass("login-page");
    removeWindowClass("hold-transition");

    addWindowClass("sidebar-mini");

    return () => {
      removeWindowClass("sidebar-mini");
    };
  }, []);

  useEffect(() => {
    removeWindowClass("sidebar-closed");
    removeWindowClass("sidebar-collapse");
    removeWindowClass("sidebar-open");
    if (menuSidebarCollapsed && screenSize === "lg") {
      addWindowClass("sidebar-collapse");
    } else if (menuSidebarCollapsed && screenSize === "xs") {
      addWindowClass("sidebar-open");
    } else if (!menuSidebarCollapsed && screenSize !== "lg") {
      addWindowClass("sidebar-closed");
      addWindowClass("sidebar-collapse");
    }
  }, [screenSize, menuSidebarCollapsed]);

  useEffect(() => {
    if (controlSidebarCollapsed) {
      removeWindowClass("control-sidebar-slide-open");
    } else {
      addWindowClass("control-sidebar-slide-open");
    }
  }, [screenSize, controlSidebarCollapsed]);

  const handleUIChanges = () => {
    setIsScrollbarVisible(scrollbarVisible(window.document.body));
  };

  useEffect(() => {
    window.document.addEventListener("scroll", handleUIChanges);
    window.document.addEventListener("resize", handleUIChanges);

    return () => {
      window.document.removeEventListener("scroll", handleUIChanges);
      window.document.removeEventListener("resize", handleUIChanges);
    };
  }, []);

  useEffect(() => {
    handleUIChanges();
  }, [mainRef.current]);

  const getMarginLeft = useCallback(() => {
    if (topNavigation) return "0px";

    if (screenSize === "lg") {
      if (menuSidebarCollapsed) return `${MENU_WIDTH_COLLAPSED}px`;
      return `${MENU_WIDTH}px`;
    }

    // For smaller screens, sidebar is absolute/overlay, so content doesn't push
    return "0px";
  }, [screenSize, topNavigation, menuSidebarCollapsed]);

  const getAppTemplate = useCallback(() => {
    if (!isAppLoaded) {
      return <Loading />;
    }

    const marginLeft = getMarginLeft();

    return (
      <>
        <Header
          containered={layoutBoxed}
          style={{ left: marginLeft, width: `calc(100% - ${marginLeft})` }}
        />

        {!topNavigation && <MenuSidebar />}

        <div
          ref={mainRef as any}
          className="bg-gray-100 min-h-screen transition-[margin-left] duration-300 ease-in-out pt-[57px]"
          style={{ marginLeft }}
        >
          <section className="p-4">
            <div className={layoutBoxed ? "container mx-auto" : ""}>
              {children}
            </div>
          </section>
        </div>

        <Footer containered={layoutBoxed} style={{ marginLeft }} />
        <div
          id="sidebar-overlay"
          role="presentation"
          onClick={handleToggleMenuSidebar}
          onKeyDown={() => {}}
          className={`fixed inset-0 z-1037 bg-black/50 transition-opacity ${
            screenSize === "sm" && !menuSidebarCollapsed ? "block" : "hidden"
          }`}
        />
      </>
    );
  }, [
    isAppLoaded,
    menuSidebarCollapsed,
    screenSize,
    layoutBoxed,
    topNavigation,
    getMarginLeft,
  ]);

  return (
    <div className="wrapper min-h-screen relative w-full overflow-x-hidden">
      {getAppTemplate()}
    </div>
  );
};

export default Main;
