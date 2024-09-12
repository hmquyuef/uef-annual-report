import Image from "next/image";

const HeaderMenus = () => {
  return (
    <div className="sticky top-0 bg-white z-20 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* ICONS AND USER */}
        <div className="flex items-center gap-6 justify-end w-full">
          <div className="flex flex-col">
            <span className="text-xs leading-3 font-medium">John Doe</span>
            <span className="text-[10px] text-gray-500 text-right">Admin</span>
          </div>
          <Image
            src="/avatar.jpg"
            alt=""
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderMenus;
