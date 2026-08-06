import { auth, sheets } from "@googleapis/sheets";

let client: ReturnType<typeof sheets> | undefined;

export function getSheetsClient() {
  if (!client) {
    const authClient = new auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    client = sheets({ version: "v4", auth: authClient });
  }
  return client;
}
