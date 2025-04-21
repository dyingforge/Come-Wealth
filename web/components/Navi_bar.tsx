import { ConnectButton} from "@mysten/dapp-kit";
import Image from 'next/image'
const Navi_bar = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-red-500 rounded-2xl shadow-md mb-40">
        <div className="flex items-center rounded-full overflow-hidden">
          <Image src="/logo.png" alt="Sui Logo" width={80} height={40} />
        </div>
        <ConnectButton />
      </header>
  );
};

export default Navi_bar;
