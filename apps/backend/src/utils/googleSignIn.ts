import { google } from "googleapis";

// Separate from the organization-level Google Sheets OAuth client.
export const googleSignInClient = new google.auth.OAuth2();

export class GoogleSignInError extends Error {
  constructor(
    message: string,
    public statusCode = 401,
    public code = "GOOGLE_SIGN_IN_FAILED",
    public email?: string,
  ) {
    super(message);
  }
}

export async function verifyGoogleCredential(credential: string) {
  const audience = process.env.GOOGLE_SIGN_IN_CLIENT_ID?.trim();
  if (!audience) {
    throw new GoogleSignInError("Google sign-in is not configured. Please use email and password.", 503);
  }

  try {
    // The Google library checks the signature, issuer, audience and expiry.
    const ticket = await googleSignInClient.verifyIdToken({ idToken: credential, audience });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new Error("A verified Google email is required");
    }
    return { googleId: payload.sub, email: payload.email.trim().toLowerCase(), name: payload.name };
  } catch {
    throw new GoogleSignInError("Google could not verify your sign-in. Please try again.");
  }
}
