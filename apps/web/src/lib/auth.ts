import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@n8n/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async ({ id }) => {
          try {
            await prisma.projects.create({
              data: {
                name: "Personal",
                userId: id,
              },
            });
          } catch (error) {
            console.error("Error creating project", error);
            throw error;
          }
        },
      },
    },
  },

  experimental: { joins: true },

  plugins: [nextCookies()],
});
