import Image from "next/image";
import { WealthGod as WealthGodItem } from "@/type";

interface WealthGodProps {
  items: WealthGodItem[];
  handleOpen?: (index: number) => void; // 使 handleOpen 成为可选
  reverse?: boolean;
}

const WealthGod: React.FC<WealthGodProps> = ({ items, handleOpen = () => {} }) => {
  
  return (
    <div className={`flex flex-wrap gap-5`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="text-center bg-white rounded-lg p-1 mb-4 cursor-pointer flex flex-col items-center justify-center"
          onClick={() => handleOpen(index)}
        >
          {item.isclaimed ? (
            <div>
              <Image
                src="/opened.png" 
                alt="opened" 
                width={80}
                height={80}
              />
              <h2 className="text-[8px] font-DynaPuff text-green-600">
                Claim: {(item.claimAmount/1000000000).toFixed(2)}
              </h2>
              <h2
                className={`text-[10px] font-DynaPuff ${
                 ((item.claimAmount/1000000000) - 1 < 0 ? "text-green-600" : "text-red-600")
                }`}
              >
               profit: {(1 - (item.claimAmount/1000000000)).toFixed(2)}
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
