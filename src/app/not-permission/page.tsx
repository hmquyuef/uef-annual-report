"use client";

import React from "react";
import "../globals.css";

const NotPermission = () => {
  return (
    <>
      <div className="grid grid-rows-1 gap-3">
        <h1 className="text-red-400 text-3xl text-center mt-10">
          Tài khoản của bạn chưa được cấp quyền truy cập vào hệ thống.
        </h1>
        <h1 className="text-red-400 text-2xl text-center">
          Vui lòng liên hệ TT.QLCNTT để được cấp quyền sử dụng.
        </h1>
        <h1 className="text-center text-2xl">Xin cảm ơn!</h1>
      </div>
    </>
  );
};

export default NotPermission;
