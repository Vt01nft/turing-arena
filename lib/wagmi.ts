import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mantleSepolia, mantle } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "turing-arena-dev";

export const wagmiConfig = getDefaultConfig({
  appName: "Turing Arena",
  projectId,
  chains: [mantleSepolia, mantle],
  ssr: true,
});
