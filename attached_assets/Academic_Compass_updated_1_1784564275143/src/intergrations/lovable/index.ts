/**
 * Lovable auth integration stub.
 * OAuth (Google etc.) is not supported in the MySQL/self-hosted mode.
 * The app uses email/password auth via the Express REST API.
 */
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: unknown) => {
      return { error: { message: "OAuth not supported in self-hosted mode. Use email/password." } };
    },
  },
};
