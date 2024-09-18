"use client";

import Icon from "@/components/Icon";
import Modals from "@/components/Modals";
import SweetAlert from "@/components/sweetAlert/SweetAlert";
import { Button, Checkbox, Image, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "../globals.css";

const Login = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode] = useState<"add" | "edit">("add");
  const toggleVisibility = () => setIsVisible(!isVisible);
  const [alertOpen, setAlertOpen] = useState(false);
  const [titleAlert, setTitleAlert] = useState("");
  const [contentAlert, setContentAlert] = useState("");
  const [statusAlert, setStatusAlert] = useState<
    "add" | "update" | "delete" | "error" | "info" | ""
  >("");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleCloseAlert = useCallback(() => {
    setAlertOpen(false);
  }, []);
  useEffect(() => {
    if (error && error === "DomainNotAllowed") {
      setAlertOpen(true);
      setTitleAlert("Thông báo");
      setStatusAlert("error");
      setContentAlert("Vui lòng sử dụng tài khoản Email UEF để đăng nhập");
    }
  }, [error]);

  const handleLogin = async () => {
    const res = await signIn("google", { callbackUrl: "/forms" });
    console.log(res);
  };
  return (
    <div className="w-full h-dvh bg-gray-100 flex justify-center items-center">
      <div className="w-1/4 bg-white rounded-xl shadow-lg mb-16">
        <div className="flex flex-col">
          <div className="flex flex-col justify-center items-center mt-4">
            <Image src="logoUEF.svg" width={170} height={100} alt="UEF Logo" />
          </div>
          <div className="flex flex-col gap-5 my-3 mx-3 px-5 py-5">
            <Input
              key="inputUsername"
              type="text"
              label="Tài khoản"
              variant="faded"
              placeholder=" "
              labelPlacement="outside"
              startContent={<Icon name="bx-user-pin" size="20px" />}
              classNames={{
                label: "text-md",
              }}
            />
            <Input
              key="inputPassword"
              label="Mật khẩu"
              variant="faded"
              placeholder=" "
              labelPlacement="outside"
              startContent={<Icon name="bx-key" size="20px" />}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label="toggle password visibility"
                >
                  {isVisible ? (
                    <Icon name="bx-show-alt" size="20px" />
                  ) : (
                    <Icon name="bx-low-vision" size="20px" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              classNames={{
                label: "text-md",
              }}
            />
            <Checkbox defaultSelected size="md">
              Ghi nhớ đăng nhập
            </Checkbox>
            <Button
              color="primary"
              className="w-full"
              onClick={() => setIsOpen(true)}
              endContent={<Icon name="bx-log-in-circle" size="20px" />}
            >
              Đăng nhập
            </Button>
            <p className="text-center text-neutral-400">Hoặc sử dụng</p>
            <Button
              color="success"
              className="w-full"
              onClick={() => handleLogin()}
              startContent={
                <Icon name="bxl-google" size="20px" className="text-white" />
              }
            >
              <p className="text-white">Đăng nhập với</p>
              <p className="text-red-500 font-semibold">Email UEF</p>
            </Button>
          </div>
        </div>
      </div>
      <Modals
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title={mode === "edit" ? "Cập nhật công tác" : "Thông báo"}
        size="md"
        actionLabel=""
        closeLabel="Quay lại"
        onAction={() => {}}
        bodyContent={
          <>
            <p>
              Tính năng đang được cập nhật, vui lòng sử dụng tính năng đăng nhập
              với tài khoản <span className="text-red-500">Email UEF</span>
            </p>
          </>
        }
      />
       <SweetAlert
          open={alertOpen}
          status={statusAlert}
          title={<>{titleAlert}</>}
          content={<>{contentAlert}</>}
          onClose={handleCloseAlert}
          confirmButtonText="Xác nhận"
          isSuccess={true}
        />
    </div>
  );
};
export default Login;
