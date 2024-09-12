"use client";

import { useState } from "react";
import Icon from "./Icon";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Define types for menu items and children
type MenuItem = {
  icon: string;
  label: string;
  href: string;
  visible: string[];
  children?: MenuItem[] | null;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuItems: MenuSection[] = [
  {
    title: "dashboard",
    items: [
      {
        icon: "bx-list-check",
        label: "Công tác",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
        children: null,
      },
    ],
  },
  {
    title: "systems",
    items: [
      {
        icon: "bx-list-ol",
        label: "Các hoạt động",
        href: "/forms",
        visible: ["admin", "teacher", "student", "parent"],
        children: null,
      },
      {
        icon: "bx-file",
        label: "KL công tác",
        href: "/workloads",
        visible: ["admin", "teacher", "student", "parent"],
        children: [
          {
            icon: "bx-file",
            label: "Biểu mẫu",
            href: "/workloads/types",
            visible: ["admin", "teacher", "student", "parent"],
            children: null,
          },
          {
            icon: "bx-file",
            label: "Nhóm công tác",
            href: "/workloads/groups",
            visible: ["admin", "teacher", "student", "parent"],
            children: null,
          },
        ],
      },
      {
        icon: "bx-cog",
        label: "Cài đặt",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
        children: null,
      },
    ],
  },
];

const Menus = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prevState) => ({
      ...prevState,
      [label]: !prevState[label],
    }));
  };

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((menu) => (
        <div className="flex flex-col gap-1" key={menu.title}>
          <div className="hidden uppercase lg:block text-gray-400 font-light mt-5">
            {menu.title}
          </div>
          {menu.items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.label];
            const isActive = pathname === item.href;

            return (
              <div key={item.label}>
                {!hasChildren ? (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md cursor-pointer
                      hover:bg-[#e7e7ff] ${
                        isActive
                          ? "bg-[#e7e7ff] text-indigo-600 font-semibold border-l-4 border-l-indigo-600"
                          : ""
                      }`}
                  >
                    <Icon name={item.icon} size="20px" />
                    <p className="hidden lg:block flex-1">{item.label}</p>
                  </Link>
                ) : (
                  <>
                    <div
                      className={`flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md cursor-pointer
                    hover:bg-[#e7e7ff] ${
                      pathname.includes(item.href)
                        ? "bg-[#e7e7ff] text-indigo-600 font-semibold border-l-4 border-l-indigo-600"
                        : ""
                    }`}
                      onClick={() => toggleMenu(item.label)}
                    >
                      <Icon name={item.icon} size="20px" />
                      <p className="hidden lg:block flex-1">{item.label}</p>
                      {hasChildren && (
                        <Icon
                          name={isOpen ? "bx-chevron-down" : "bx-chevron-right"}
                          size="20px"
                        />
                      )}
                    </div>

                    {hasChildren && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-40" : "max-h-0"
                        }`}
                      >
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;

                          return (
                            <Link
                              href={child.href}
                              key={child.label}
                              className={`${
                                isChildActive
                                  ? "ml-[2px] text-[#4f46e5]"
                                  : "ml-[7px] text-gray-500"
                              } flex items-center justify-center lg:justify-start gap-4 py-2 my-1 md:px-2 rounded-md cursor-pointer hover:bg-[#e7e7ff]`}
                            >
                              <Icon
                                name={
                                  isChildActive
                                    ? "bx-radio-circle-marked"
                                    : "bxs-circle"
                                }
                                size={isChildActive ? "18px" : "8px"}
                                color={isChildActive ? "#4f46e5" : ""}
                              />
                              <p className="ml-2">{child.label}</p>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Menus;
