import { isValidSuiAddress } from "@mysten/sui/utils";
import { suiClient } from "./index";
import { SuiObjectResponse,SuiParsedData } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { WealthGod } from "@/type";
import { createBetterTxFactory,networkConfig } from "./index";
import { State, ProfileCreated, WealthGodCreated,Profile } from "@/type";
import { Transaction } from "@mysten/sui/transactions";

export const getUserProfile = async (address: string): Promise<CategorizedObjects> => {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid Sui address");
  }

  let hasNextPage = true;
  let nextCursor: string | null = null;
  let allObjects: SuiObjectResponse[] = [];

  while (hasNextPage) {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      options: {
        showContent: true,
      },
      cursor: nextCursor,
    });

    allObjects = allObjects.concat(response.data);
    hasNextPage = response.hasNextPage;
    nextCursor = response.nextCursor ?? null;
  }

  return categorizeSuiObjects(allObjects);
};

export const queryState = async () => {
  const events = await suiClient.queryEvents({
      query: {
          MoveEventType: `${networkConfig.testnet.variables.package}::wealthgod::ProfileCreated`
      }
  })
  const state:State = {
      id:networkConfig.testnet.variables.state,
      profiles:[]
  }   
  events.data.map((event)=>{
      const user = event.parsedJson as ProfileCreated;
      state.profiles.push(user);
  })
  return state;
}

export const queryAllProfile = async () => {
  const state = await queryState();
  const profilePromises = state.profiles.map(async (oneprofile) => {
    const profile = await queryProfile(oneprofile.id);
    return profile; // 返回获取到的profile
  });

  // 使用 Promise.all 等待所有异步请求完成
  const profiles = await Promise.all(profilePromises);
  return profiles;
};


export const queryWealthGods = async () => {
  const events = await suiClient.queryEvents({
    query: {
        MoveEventType: `${networkConfig.testnet.variables.package}::wealthgod::WealthGodCreated`
    }
})
  const wealthGods:WealthGod[] = [];
  events.data.map(async (event)=>{
    const WealthGodCreated = event.parsedJson as WealthGodCreated;
    const wealthGodFirst = await suiClient.getObject({
      id: WealthGodCreated.id,
      options: {
        showContent: true,
      },
    })
    const parsedWealthGod = wealthGodFirst.data?.content as SuiParsedData;
    if (!parsedWealthGod || !('fields' in parsedWealthGod)) {
      throw new Error('Invalid wealthGod data structure');
  }
  const wealthGod = parsedWealthGod.fields as unknown as WealthGod;
  wealthGods.push(wealthGod);
  })
  return wealthGods;
}

export const queryProfile = async (address: string) => {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid profile address");
}
  const profileContent = await suiClient.getObject({
    id: address,
    options: {
      showContent: true,
    },
  })
  if (!profileContent.data?.content) {
    throw new Error("Profile content not found");
}

const parsedProfile = profileContent.data.content as SuiParsedData;
if (!('fields' in parsedProfile)) {
    throw new Error("Invalid profile data structure");
}

const profile = parsedProfile.fields as unknown as Profile;
if (!profile) {
    throw new Error("Failed to parse profile data");
}
  return profile;
}



export const queryWealthGod = async (address: string) => {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid wealthGod address");
}
  const profileContent = await suiClient.getObject({
    id: address,
    options: {
      showContent: true,
    },
  })
  if (!profileContent.data?.content) {
    throw new Error("WealthGod content not found");
}

const parsedWealthGod = profileContent.data.content as SuiParsedData;
if (!('fields' in parsedWealthGod)) {
    throw new Error("Invalid wealthGod data structure");
}

const wealthGod = parsedWealthGod.fields as unknown as WealthGod;
if (!wealthGod) {
    throw new Error("Failed to parse wealthGod data");
}
  return wealthGod;
}
// public entry fun create_profile(
//   state: &mut State,
//   name: String,
//   ctx: &mut TxContext,
// ) {
//   let uid = object::new(ctx);
//   let owner = ctx.sender();
//   assert!(!table::contains(&state.profiles, owner), 0);
//   let sendAmount = 0;
//   let claimAmount = 0;
//   let id = object::uid_to_inner(&uid);
//   let new_profile = Profile {
//       id: uid,
//       name,
//       sendAmount,
//       claimAmount,
//       wealthGods: vector::empty(),
//   };
//   transfer::transfer(new_profile, owner);
//   table::add(&mut state.profiles, owner, object::id_to_address(&id));
//   event::emit(ProfileCreated { id, owner });
// }
export const createProfileTx = createBetterTxFactory<{name:string}>((tx,networkVariables,params)=>{

  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "create_profile",
    arguments: [
      tx.object(networkVariables.state),
      tx.pure.string(params.name),
    ]
  })
  return tx;
})
 

// public entry fun createWealthGod(coin:&mut Coin<SUI>,description:String, user:&mut Profile,ctx: &mut TxContext) {
//   let in_coin = coin::split(coin, 1000000000, ctx);
//   let amount = coin::into_balance(in_coin);
//   let value = amount.value();
//   let uid = object::new(ctx);
//   let id = object::uid_to_inner(&uid);
//   let sender = object::uid_to_address(&user.id);
//   let wealthGod = WealthGod {
//       id: uid,
//       sender, 
//       isclaimed: false,
//       amount,
//       description,
//       claimAmount:0,
//   };
//   user.sendAmount = user.sendAmount + value;
//   event::emit(WealthGodCreated{
//           id,
//           sender,
//   });
//   vector::push_back(&mut user.wealthGods, object::id_to_address(&id));
//   transfer::share_object(wealthGod);
// }

export const createWealthGodTx =  async(description:string,user:string) => {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1500000000)]);
  tx.moveCall({
    package: networkConfig.testnet.variables.package,
    module: "wealthgod",
    function: "createWealthGod",
    arguments: [
      coin,
      tx.pure.string(description),
      tx.object(user)],
  })
  return tx;
}


// public entry fun claimWealthGod(wealthGod:&mut WealthGod,in_coin:Coin<SUI>,pool:&mut WeathPool,user:&mut Profile,random:&Random,ctx: &mut TxContext){
//   assert!(wealthGod.isclaimed == false,1);
//   wealthGod.isclaimed = true;
//   assert!(in_coin.value() > 2500000000,2);
//   let min:u64  = 300000000;
//   let max:u64  = 2500000000; 
//   let mut gen = random::new_generator(random, ctx);
//   let claim_amount = random::generate_u64_in_range(&mut gen, min, max);
//   //红包钱
//   let wealth_god_coin = coin::take(&mut wealthGod.amount,1000000000,ctx);
//   // let wealth_god_coin = coin::from_balance(wealthGod.amount, ctx);
//   //最大值
//   let max_amount = coin::into_balance(in_coin);
//   pool.amount.join(max_amount);
//   let sender_coin = coin::take(&mut pool.amount,claim_amount,ctx);
//   let recevicer_coin = coin::from_balance(balance::withdraw_all(&mut pool.amount),ctx);
//   wealthGod.claimAmount = wealthGod.claimAmount + claim_amount;
//   user.claimAmount = claim_amount;
//   transfer::public_transfer(wealth_god_coin,ctx.sender());
//   transfer::public_transfer(recevicer_coin,ctx.sender());
//   transfer::public_transfer(sender_coin,wealthGod.sender);
// }

export const claimWealthGodTx = createBetterTxFactory<{wealthGod:string,user:string}>((tx,networkVariables,params)=>{
  const {wealthGod,user} = params;
  const payment = 2600000000;
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(payment)]);
  
  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "claimWealthGod",
    arguments: [tx.object(wealthGod),coin, tx.object(networkConfig.testnet.variables.wealthGod),tx.object(user),tx.object("0x8")]
  })
  return tx;
})