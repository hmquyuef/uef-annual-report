"use client";

import Loading from "@/components/Loading";
import { getAllPermissions } from "@/services/permissions/permissionService";
import { getUsers } from "@/services/users/userService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../globals.css";

const ProcessLogin = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserPermissions = async () => {
      if (session) {
        const email = session?.user?.email;
        if (email) {
          const user = await getUsers(email);
          const userId = user.items[0]?.id;
          if (userId) {
            const permissions = await getAllPermissions(userId);
            if (permissions.items.length > 0) {
              window.location.href = "/forms";
            } else {
              window.location.href = "/forms";
            }
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    getUserPermissions();
  }, [session, router]);
  return (
    <div className="w-full h-dvh">
      <Loading isOpen={loading} />
    </div>
  );
};
export default ProcessLogin;
