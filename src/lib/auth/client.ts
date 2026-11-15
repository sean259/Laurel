"use client";

import { createAuthClient } from "@neon/auth/next";

// Talks to our own /api/auth proxy, which forwards to Neon Auth.
export const authClient = createAuthClient();
