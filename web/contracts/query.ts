import { isValidSuiAddress } from "@mysten/sui/utils";
import { suiClient } from "./index";
import { SuiObjectResponse, SuiParsedData,CoinMetadata } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { WealthGod } from "@/type";
import { createBetterTxFactory, networkConfig } from "./index";
import { State, ProfileCreated, WealthGodCreated, Profile,WealthGodData,SuiCoin } from "@/type";
import queryWealthDataContext from "./graphqlContext"
import {SuiGraphQLClient} from "@mysten/sui/graphql";

const graphqlClient = new SuiGraphQLClient({
  url: `https://sui-testnet.mystenlabs.com/graphql`,
});
export async function getWealthDynamicFields(wealthId: string) {
  const result = await graphqlClient.query({
    query: queryWealthDataContext,
    variables: { address: wealthId }
  });

  // 处理返回的数据
  const WealthData = result.data?.object?.dynamicFields?.nodes?.map((node) => {
    const nameJson = node.name as { json: { name: string } };
    const valueJson = node.value as { json: { value: string } }; // Changed unknown to string to match FolderData type
    return {
        name: nameJson.json.name,
        value: Number(valueJson.json.value)
    }as WealthGodData
}) ?? [];

  return WealthData;
}



export const getUserProfileCoin = async (address: string) => {
  if (!isValidSuiAddress(address)) {
    throw new Error("Invalid Sui address");
  }
  // export type SuiObject = {
  //   id: string,
  //   type: string,
  //   coinMetadata?: CoinMetadata,
  //   balance?: number,
  // }
    const response = await suiClient.getCoins({
      owner: address,
    });

    const coins = await Promise.all(response.data.map(async(coinContent) => {
      const coindata = await suiClient.getCoinMetadata({
        coinType: coinContent.coinType,
        }) as CoinMetadata;
      const coin = {
        id: coinContent.coinObjectId,
        type: coinContent.coinType,
        coinMetadata: coindata,
        balance: Number(coinContent.balance),
      }as SuiCoin;
      return coin;
    }));
  return coins;
};

export const queryCoinMetadata = async (coinTypes: string) => {
  const coin = await suiClient.getCoinMetadata({
      coinType: coinTypes,
      }) as CoinMetadata;
  return coin;
}


export const queryState = async () => {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: `${networkConfig.testnet.variables.package}::wealthgod::ProfileCreated`
    }
  })
  const state: State = {
    id: networkConfig.testnet.variables.state,
    profiles: []
  }
  events.data.map((event) => {
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


export const queryWealthGods = async (): Promise<WealthGod[]> => {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: `${networkConfig.testnet.variables.package}::wealthgod::WealthGodCreated`,
    },
  });

  // 使用 Promise.all 来并行获取每个财富神的详细信息
  const wealthGodPromises = events.data.map(async (event) => {
    const WealthGodCreated = event.parsedJson as WealthGodCreated;
    const wealthGodData = await getWealthDynamicFields(WealthGodCreated.id);

    // 获取财富神的对象
    const wealthGodFirst = await suiClient.getObject({
      id: WealthGodCreated.id,
      options: {
        showContent: true,
      },
    });

    // 解析财富神的内容
    const parsedWealthGod = wealthGodFirst.data?.content as SuiParsedData;
    if (!parsedWealthGod || !('fields' in parsedWealthGod)) {
      throw new Error('Invalid wealthGod data structure');
    }

    // 返回解析后的财富神对象
    const wealthGod = parsedWealthGod.fields as unknown as WealthGod;
    wealthGod.coin = wealthGodData.find((coin) => coin.name === wealthGod.coin_type.fields.name);
    return wealthGod;
  });

  // 等待所有财富神数据的获取完成
  const wealthGods = await Promise.all(wealthGodPromises);
  return wealthGods;
};


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
export const createProfileTx = createBetterTxFactory<{ name: string }>((tx, networkVariables, params) => {

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


// public entry fun createWealthGod<T>(
//   coin: &mut Coin<T>,
//   description: String,
//   user: &mut Profile,
//   amount: u64,
//   ctx: &mut TxContext,
// ) {
//   let in_coin = coin::split(coin, amount, ctx);
//   let amount = coin::into_balance(in_coin);
//   let value = amount.value();
//   let uid = object::new(ctx);
//   let id = object::uid_to_inner(&uid);
//   let sender = ctx.sender();
//   let type_name = type_name::get<T>();

//   let mut wealthGod = WealthGod {
//       id: uid,
//       sender,
//       isclaimed: false,
//       description,
//       coin_type: type_name,
//       claimAmount: 0,
//   };
//   dynamic_field::add(&mut wealthGod.id, type_name, amount);
//   user.sendAmount = user.sendAmount + value;
//   event::emit(WealthGodCreated {
//       id,
//       sender,
//   });
//   vector::push_back(&mut user.wealthGods, object::id_to_address(&id));
//   transfer::share_object(wealthGod);
// }

export const createWealthGodTx = createBetterTxFactory<{ sender:string,coin:string,description: string, amount: number, user: string, coin_type: string }>((tx, networkVariables, params) => {
  if(params.coin_type === "0x2::sui::SUI"){
    const splitResult = tx.splitCoins(tx.gas, [tx.pure.u64(params.amount)]);
  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "createWealthGod",
    arguments: [
      tx.object(splitResult),
      tx.pure.string(params.description),
      tx.object(params.user),
      tx.pure.u64(params.amount),
    ],
    typeArguments: [params.coin_type]
  })
  tx.transferObjects([splitResult], params.sender);
  return tx;
}else{
  const splitResult = tx.splitCoins(tx.object(params.coin), [tx.pure.u64(params.amount)]);
  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "createWealthGod",
    arguments: [
      tx.object(splitResult),
      tx.pure.string(params.description),
      tx.object(params.user),
      tx.pure.u64(params.amount),
    ],
    typeArguments: [params.coin_type]
  })
  return tx;
}
})


// public entry fun claimWealthGod<T>(
//   wealthGod: &mut WealthGod,
//   in_coin: Coin<T>,
//   pool: &mut WeathPool,
//   user: &mut Profile,
//   random: &Random,
//   ctx: &mut TxContext,
// ) {
//   let type_name = type_name::get<T>();
//   assert!(wealthGod.coin_type == type_name, 3);
//   assert!(wealthGod.isclaimed == false, 1);
//   wealthGod.isclaimed = true;
//   let balance = dynamic_field::borrow<TypeName, Balance<T>>(&wealthGod.id, type_name);
//   let original_amount = balance::value(balance);
//   let min: u64 = original_amount * 30 / 100;
//   let max: u64 = original_amount * 250 / 100;
//   assert!(in_coin.value() >= max, 2);
//   let mut gen = random::new_generator(random, ctx);
//   let claim_amount = random::generate_u64_in_range(&mut gen, min, max);
//   let balance = dynamic_field::borrow_mut<TypeName, Balance<T>>(&mut wealthGod.id, type_name);
//   //红包钱
//   let wealth_god_coin = coin::from_balance(balance::split(balance, original_amount), ctx);
//   // let wealth_god_coin = coin::from_balance(wealthGod.amount, ctx);
//   //最大值
//   let max_amount = coin::into_balance(in_coin);
//   // 确保池子中有对应币种的余额
//   if (!dynamic_field::exists_(&pool.id, type_name)) {
//       dynamic_field::add(&mut pool.id, type_name, balance::zero<T>());
//   };

//   let pool_balance = dynamic_field::borrow_mut<TypeName, Balance<T>>(&mut pool.id, type_name);
//   balance::join(pool_balance, max_amount);

//   // 从池中取出相应数量的代币
//   let sender_coin = coin::from_balance(balance::split(pool_balance, claim_amount), ctx);
//   let receiver_coin = coin::from_balance(balance::withdraw_all(pool_balance), ctx);

//   wealthGod.claimAmount = claim_amount;
//   user.claimAmount = user.claimAmount + claim_amount;

//   transfer::public_transfer(wealth_god_coin, ctx.sender());
//   transfer::public_transfer(receiver_coin, ctx.sender());
//   transfer::public_transfer(sender_coin, wealthGod.sender);
// }

export const claimWealthGodTx = createBetterTxFactory<{ sender: string,amount:number, wealthGod: string, in_coin: string, user: string, coin_type: string }>((tx, networkVariables, params) => {
  if(params.coin_type === "0x2::sui::SUI"){
    const intAmount = Math.ceil(params.amount * 2.5);
  let coin = tx.splitCoins(tx.gas, [tx.pure.u64(intAmount)]);
  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "claimWealthGod",
    arguments: [tx.object(params.wealthGod), tx.object(coin), tx.object(networkConfig.testnet.variables.wealthGodPool), tx.object(params.user), tx.object("0x8"),
    ],
    typeArguments: [params.coin_type]  
  })
  return tx;
}else{
  tx.moveCall({
    package: networkVariables.package,
    module: "wealthgod",
    function: "claimWealthGod",
    arguments: [tx.object(params.wealthGod), tx.object(params.in_coin), tx.object(networkConfig.testnet.variables.wealthGodPool), tx.object(params.user), tx.object("0x8"),
    ],
    typeArguments: [params.coin_type]  
  })
  return tx;
}
})