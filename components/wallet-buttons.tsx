"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/// Custom render of RainbowKit's connect / chain / account buttons so we
/// own the markup completely. RainbowKit's default `<ConnectButton>` wraps
/// the inner pill in a styled container that leaks a white halo even after
/// CSS overrides. With `ConnectButton.Custom` we ship plain semantic buttons
/// styled directly to the Versus palette.
export function WalletButtons() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
            className="flex items-center gap-2"
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="ta-wallet-pill ta-wallet-pill-connect"
                  >
                    Connect wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="ta-wallet-pill ta-wallet-pill-warn"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <>
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="ta-wallet-pill ta-wallet-pill-chain"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: "var(--vs-machine)" }}
                    />
                    <span className="hidden md:inline">{chain.name}</span>
                    <span className="md:hidden">{chain.name?.split(" ")[0]}</span>
                    <Chev />
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="ta-wallet-pill ta-wallet-pill-account"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: "var(--vs-ochre)" }}
                    />
                    <span className="mono">{account.displayName}</span>
                    <Chev />
                  </button>
                </>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function Chev() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-70"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
