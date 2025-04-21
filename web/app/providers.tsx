'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig, network } from "@/contracts"
import "@mysten/dapp-kit/dist/index.css";
import { PopupProvider, usePopup } from "@/context/PopupProvider";
import { Popup } from "@/components/Popup";

const queryClient = new QueryClient();

function PopupContainer() {
  const { isOpen, onConfirm, onCancel, content } = usePopup()
  return <Popup isOpen={isOpen}  onConfirm={onConfirm} onCancel={onCancel} content={content} />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider>
              <PopupProvider>
                {children}
              <PopupContainer />
            </PopupProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
