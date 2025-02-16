import Image from "next/image";
import { WealthGod as WealthGodItem } from "@/type";

interface WealthGodProps {
  items: WealthGodItem[];
  handleOpen?: (index: number) => void; // 使 handleOpen 成为可选
}

const WealthGod: React.FC<WealthGodProps> = ({ items, handleOpen = () => {} }) => { // 默认值为空函数
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="text-center bg-white rounded-lg p-1 mb-4 w-full cursor-pointer flex flex-col items-center justify-center"
          onClick={() => handleOpen(index)} // 只有未打开的红包才触发 handleOpen
        >
          {item.isclaimed ? (
            <div className="">
                <Image
                    src="/opened.png" 
                    alt="opened" 
                    width={70}
                    height={70}
                    />
              <h2 className="text-[10px] font-DynaPuff text-green-600">
                Claim: {(item.claimAmount/1000000000).toFixed(2)}
              </h2>
              <h2
                className={`text-[10px] font-DynaPuff ${
                  item.claimAmount - 1 > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {item.claimAmount - 1 > 0
                  ? `Profit: ${(item.claimAmount/1000000000).toFixed(2)}`
                  : `Loss: ${Math.abs(item.claimAmount/1000000000).toFixed(2)}`}
              </h2>
            </div>
          ) : (
            <Image src="/god.png" alt="红包" width={80} height={60} />
          )}
          <h1 className="mt-2 text-[8px] font-DynaPuff text-red-600">
            {item.description}
          </h1>

        </div>
      ))}
    </div>
  );
};

export default WealthGod;
