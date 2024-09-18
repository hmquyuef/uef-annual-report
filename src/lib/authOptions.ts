import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: 'consent',
                    hd: 'uef.edu.vn',
                    domain_hint: 'uef.edu.vn',
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            if (profile?.email?.endsWith('@uef.edu.vn')) {
                return true;
            } else {
                return false;
            }
        },
        // async signIn({ account, profile }) {
        //     if (profile?.email) {
        //         const userExists = await checkIfUserExists(profile.email);

        //         if (userExists) {
        //             if (account) {
        //                 account.authorization = {
        //                     params: { prompt: 'none' },
        //                 };
        //             }
        //         } else {
        //             if (account) {
        //                 account.authorization = {
        //                     params: { prompt: 'select_account' },
        //                 };
        //             }
        //         }
        //         return true;
        //     }
        //     return false;
        // },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login",
    },
};