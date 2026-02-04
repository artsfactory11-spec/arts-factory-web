import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                await dbConnect();

                // Special handling for admin ID 'artrental' if used instead of email
                const queryEmail = credentials.email.includes('@')
                    ? credentials.email
                    : 'artrental@artsfactory.co.kr';

                const user = await User.findOne({ email: queryEmail });

                if (!user) {
                    throw new Error("존재하지 않는 계정입니다.");
                }

                const isPasswordMatch = await bcrypt.compare(credentials.password, user.password!);
                if (!isPasswordMatch) {
                    throw new Error("비밀번호가 일치하지 않습니다.");
                }

                // Check for partner approval
                if (user.role === 'partner' && !user.isApproved) {
                    throw new Error("관리자의 사용 승인이 대기 중입니다.");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/partner/login',
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET || "artfactory-secret-key-2025",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
