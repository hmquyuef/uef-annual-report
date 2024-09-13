"use client";

import { useEffect } from "react";
import Workload from "./workload/page";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session, status } = useSession();
  useEffect(() => {
    console.log("SESSION: ", session);
    if (status === "loading") return;
  }, [session, status]);
  return (
    <>
      {status === "loading" ? (
        <>
          <div>Loading...</div>
        </>
      ) : (
        <>
          <Workload />
        </>
      )}
    </>
  );
};
export default Dashboard;
