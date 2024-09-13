"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// const Home = () => {
//   const { data: session } = useSession();

//   return (
//     <>
//       {session ? (
//         <>
//           <Dashboard />
//         </>
//       ) : (
//         <>
//           <Login />
//         </>
//       )}
//     </>
//   );
// };
// export default Home;
const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session) {
      router.push("/workload");
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  return null;
};

export default Home;
