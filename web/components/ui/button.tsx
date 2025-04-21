import { ConnectButton } from '@mysten/dapp-kit';

export function SuiConnectButton() {
  return (
    <ConnectButton
      className="flex-shrink-0 hover:opacity-80 active:opacity-60 transition-opacity hover:bg-[url('/gameui/login/bottom_bar_pre.png')] active:bg-[url('/gameui/login/bottom_bar_pre.png')]"
      style={{
        width: '200px',
        height: '50px',
      }}
    />
  );
}