import Image from "next/image";

interface WealthGodItem {
  description: string;
  sender: string;
  isOpened: boolean;
  claimAmount: number;
}

interface WealthGodProps {
  items: WealthGodItem[];
  handleOpen?: (index: number) => void; // 使 handleOpen 成为可选
}

const WealthGod: React.FC<WealthGodProps> = ({ items, handleOpen = () => {} }) => { // 默认值为空函数
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="text-center bg-white rounded-lg p-1 mb-4 w-full cursor-pointer flex flex-col items-center justify-center"
          onClick={() => !item.isOpened && handleOpen(index)} // 只有未打开的红包才触发 handleOpen
        >
          {item.isOpened ? (
            <div className="mt-2">
                <Image
                    src="/opened.png" 
                    alt="opened" 
                    width={100}
                    height={100}
                    className="mx-auto"
                    />
              <h2 className="text-xs font-DynaPuff text-green-600">
                ClaimAmount: {item.claimAmount.toFixed(2)}
              </h2>
              <h2
                className={`text-sm font-DynaPuff ${
                  item.claimAmount - 1 > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {item.claimAmount - 1 > 0
                  ? `Profit: ${(item.claimAmount - 1).toFixed(2)}`
                  : `Loss: ${Math.abs(item.claimAmount - 1).toFixed(2)}`}
              </h2>
            </div>
          ) : (
            <Image src="/god.png" alt="红包" width={80} height={60} />
          )}
          <h1 className="mt-2 text-[10px] font-DynaPuff text-red-600">
            {item.description}
          </h1>
          <h1 className="mt-2 text-xs font-DynaPuff text-red-400">
            {item.sender.substring(0, 4) +
              "..." +
              item.sender.substring(item.sender.length - 4)}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default WealthGod;
