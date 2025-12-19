import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MenuItem } from "@components";
import { Image } from "@profabric/react-components";
import styled from "styled-components";
import { SidebarSearch } from "@app/components/sidebar-search/SidebarSearch";
import i18n from "@app/utils/i18n";
import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem } from "@app/utils/menu";
import { useAuthorization } from "@app/hooks/useAuthorization";

const StyledBrandImage = styled(Image)`
  float: left;
  line-height: 0.8;
  margin: -1px 8px 0 6px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(Image)`
  --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const StyledSidebar = styled.aside`
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh !important;
  overflow-y: hidden !important;
  z-index: 1038;
`;

const StyledSidebarInner = styled.div`
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden !important;
`;

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);

  const { userRoles, roleBasedAllowedPaths } = useAuthorization();

  const userPermissions = useMemo(() => {
    const permissionsFromUser = Array.isArray(currentUser?.permissions)
      ? currentUser?.permissions
      : [];
    const permissionsFromMetadata = Array.isArray(
      currentUser?.metadata?.permissions
    )
      ? currentUser?.metadata?.permissions
      : [];

    return Array.from(
      new Set(
        [...permissionsFromUser, ...permissionsFromMetadata].filter(Boolean)
      )
    );
  }, [currentUser]);

  const canAccess = (item: IMenuItem) => {
    // SUPERADMIN BYPASS
    if (userRoles.includes("superadmin")) {
      return true;
    }

    const roleAllowed =
      !item.allowedRoles ||
      item.allowedRoles.length === 0 ||
      item.allowedRoles.some((role) => userRoles.includes(role));

    const permissionAllowed =
      !item.allowedPermissions ||
      item.allowedPermissions.length === 0 ||
      item.allowedPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

    const overrideAllowed = item.path && roleBasedAllowedPaths.has(item.path);

    return overrideAllowed || (roleAllowed && permissionAllowed);
  };

  const filteredMenu = useMemo(() => {
    const filterItems = (items: IMenuItem[]): IMenuItem[] =>
      items
        .map((item) => {
          const filteredChildren = item.children
            ? filterItems(item.children)
            : undefined;
          const itemAllowed = canAccess(item);

          if (
            !itemAllowed &&
            (!filteredChildren || filteredChildren.length === 0)
          ) {
            return null;
          }

          return { ...item, children: filteredChildren };
        })
        .filter(Boolean) as IMenuItem[];

    return filterItems(MENU);
  }, [userPermissions, userRoles]);

  return (
    <StyledSidebar className={`main-sidebar elevation-4 ${sidebarSkin}`}>
      <Link to="/" className="brand-link">
        <StyledBrandImage
          src="img/logo.png"
          alt="RBAC System Logo"
          width={33}
          height={33}
          rounded
        />
        <span className="brand-text font-weight-light">RBAC System</span>
      </Link>
      <StyledSidebarInner className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <StyledUserImage
              src={currentUser?.photoURL}
              fallbackSrc="/img/default-profile.png"
              alt="User"
              width={34}
              height={34}
              rounded
            />
          </div>
          <div className="info">
            <Link to={"/profile"} className="d-block">
              {currentUser?.email}
            </Link>
          </div>
        </div>

        <div className="form-inline">
          <SidebarSearch />
        </div>

        <nav className="mt-2" style={{ overflowY: "hidden" }}>
          <ul
            className={`nav nav-pills nav-sidebar flex-column${
              menuItemFlat ? " nav-flat" : ""
            }${menuChildIndent ? " nav-child-indent" : ""}`}
            role="menu"
          >
            {filteredMenu.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
          </ul>
        </nav>
      </StyledSidebarInner>
    </StyledSidebar>
  );
};

export default MenuSidebar;
