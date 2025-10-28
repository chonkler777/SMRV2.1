import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";

export const solanaWeb3JsAdapter = new SolanaAdapter();

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined in environment variables');
}

export const metadata = {
  name: "CHONK",
  description: "",
  url: "https://chonkler.com/",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};