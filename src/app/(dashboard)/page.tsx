"use client";

import { useEffect, useState } from "react";
import Workload from "./workload/page";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // console.log("SESSION: ", session);
    if (status === "loading") setLoading(true);
    else setLoading(false);
  }, [session, status]);

  return (
    <>
      {status === "loading" ? (
        <>
          <Loading isOpen={loading}/>
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
