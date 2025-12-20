import { IMenuItem, MENU } from "@app/utils/menu";
import { Dropdown } from "@profabric/react-components";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { Input } from "../ui/input";

export const StyledDropdown = styled(Dropdown)`
  border: none;
  width: 100%;
  display: flex;
  padding: 0;
  justify-content: center;
  align-items: center;
  --pf-dropdown-menu-min-width: 14.625rem;
  --pf-dropdown-border: none;
  --pf-dropdown-menu-margin-top: 0px;

  .menu {
    background-color: #2c4a59;
  }

  .dropdown-item {
    padding: 0.5rem 1rem;
  }

  .nothing-found {
    color: #c2c7d0;
    padding: 0.25rem 0.5rem;
  }

  .list-group {
    .list-group-item {
      padding: 0.5rem 0.75rem;
      cursor: pointer;
    }

    .search-path {
      font-size: 80%;
      color: #adb5bd;
    }
  }
`;

export const SidebarSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [foundMenuItems, setFoundMenuItems] = useState<IMenuItem[]>([]);
  const dropdown = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setFoundMenuItems([]);
    if (searchText) {
      setFoundMenuItems(findMenuItems(MENU));
    } else {
      setSearchText("");
      setFoundMenuItems([]);
    }
  }, [searchText]);

  useEffect(() => {
    if (foundMenuItems && foundMenuItems.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [foundMenuItems]);

  const handleIconClick = () => {
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const handleMenuItemClick = () => {
    setSearchText("");
    setIsDropdownOpen(false);
  };

  const findMenuItems = (
    menuItems: IMenuItem[],
    results: IMenuItem[] = []
  ): IMenuItem[] => {
    for (const menuItem of menuItems) {
      if (menuItem.name.includes(searchText) && menuItem.path) {
        results.push(menuItem);
      }
      if (menuItem.children) {
        return findMenuItems(menuItem.children, results);
      }
    }
    return results;
  };

  const boldString = (str: string, substr: string) => {
    return str.replaceAll(
      substr,
      `<strong class="text-light">${substr}</strong>`
    );
  };

  return (
    <StyledDropdown
      ref={dropdown}
      isOpen={isDropdownOpen}
      hideArrow
      openOnButtonClick={false}
    >
      <div slot="head">
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu..."
              className="pl-12 pr-4 py-6 text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              // Add your search logic here if needed
              // value={searchQuery}
              // onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="menu" slot="body">
        {foundMenuItems && foundMenuItems.length === 0 && (
          <div className="nothing-found">No Element found</div>
        )}
        {foundMenuItems.length > 0 && (
          <div className="list-group">
            {foundMenuItems &&
              foundMenuItems.map((menuItem: any) => (
                <NavLink
                  key={menuItem.name + menuItem.path}
                  className="list-group-item"
                  to={menuItem.path}
                  onClick={() => handleMenuItemClick()}
                >
                  <div
                    className="search-title"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: boldString(menuItem.name, searchText),
                    }}
                  />
                  <div className="search-path">{menuItem.name}</div>
                </NavLink>
              ))}
          </div>
        )}
      </div>
    </StyledDropdown>
  );
};
