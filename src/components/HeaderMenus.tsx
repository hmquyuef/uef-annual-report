"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";

const HeaderMenus = () => {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 bg-white z-20 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* ICONS AND USER */}
        <div className="flex items-center gap-6 justify-end w-full">
          <Dropdown placement="bottom-start">
            <DropdownTrigger>
              <User
                as="button"
                avatarProps={{
                  isBordered: true,
                  src: session?.user?.image || "avatar.jpg",
                }}
                className="transition-transform"
                description={`${session?.user?.email}`}
                name={`${session?.user?.name}`}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownItem
                key="logout"
                color="danger"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default HeaderMenus;
