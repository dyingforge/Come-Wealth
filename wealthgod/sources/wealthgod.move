/*
/// Module: wealthgod
module wealthgod::wealthgod;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
module wealthgod::wealthgod {
  use std::string::String;
  use sui::balance::{Self,Balance};
  use sui::coin::{Self,Coin};
  use sui::sui::SUI;
  use sui::event;
  use sui::random::{Random,Self};
  use sui::table::{Self, Table};

//strcut
public struct WealthGod has key{
    id: UID,
    sender: address,
    description: String,
    isclaimed: bool,
    amount: Balance<SUI>,
    claimAmount: u64,
}

public struct State has key{
    id: UID,
    //<owner,profile>
    profiles: Table<address, address>,
}

public struct Profile has key{
    id: UID,
    name: String,
    sendAmount: u64,
    claimAmount: u64,
    wealthGods: vector<address>,
}

//字段待补充
public struct WeathPool has key{
    id:UID,
    amount:Balance<SUI>,
}

//event struct
public struct WealthGodCreated has copy,drop{
    id:ID,
    sender:address,
}

public struct ProfileCreated has copy, drop {
    id: ID,
    owner: address,
}


//初始化可以考虑加点钱
fun init(ctx: &mut TxContext){
    transfer::share_object(WeathPool{
        id: object::new(ctx),
        amount:  balance::zero(),
    });

    transfer::share_object(State{
        id: object::new(ctx),
        profiles: table::new(ctx),
    });
}   



public entry fun create_profile(
    state: &mut State,
    name: String,
    ctx: &mut TxContext,
) {
    let uid = object::new(ctx);
    let owner = ctx.sender();
    assert!(!table::contains(&state.profiles, owner), 0);
    let sendAmount = 0;
    let claimAmount = 0;
    let id = object::uid_to_inner(&uid);
    let new_profile = Profile {
        id: uid,
        name,
        sendAmount,
        claimAmount,
        wealthGods: vector::empty(),
    };
    transfer::transfer(new_profile, owner);
    table::add(&mut state.profiles, owner, object::id_to_address(&id));
    event::emit(ProfileCreated { id, owner });
}

//function
public entry fun createWealthGod(coin:&mut Coin<SUI>,description:String, user:&mut Profile,ctx: &mut TxContext) {
    let in_coin = coin::split(coin, 1000000000, ctx);
    let amount = coin::into_balance(in_coin);
    let value = amount.value();
    let uid = object::new(ctx);
    let id = object::uid_to_inner(&uid);
    let sender = ctx.sender();
    let wealthGod = WealthGod {
        id: uid,
        sender, 
        isclaimed: false,
        amount,
        description,
        claimAmount:0,
    };
    user.sendAmount = user.sendAmount + value;
    event::emit(WealthGodCreated{
            id,
            sender,
    });
    vector::push_back(&mut user.wealthGods, object::id_to_address(&id));
    transfer::share_object(wealthGod);
}


public entry fun claimWealthGod(wealthGod:&mut WealthGod,in_coin:Coin<SUI>,pool:&mut WeathPool,user:&mut Profile,random:&Random,ctx: &mut TxContext){
        assert!(wealthGod.isclaimed == false,1);
        wealthGod.isclaimed = true;
        assert!(in_coin.value() > 2500000000,2);
        let min:u64  = 300000000;
        let max:u64  = 2500000000; 
        let mut gen = random::new_generator(random, ctx);
        let claim_amount = random::generate_u64_in_range(&mut gen, min, max);
        //红包钱
        let wealth_god_coin = coin::take(&mut wealthGod.amount,1000000000,ctx);
        // let wealth_god_coin = coin::from_balance(wealthGod.amount, ctx);
        //最大值
        let max_amount = coin::into_balance(in_coin);
        pool.amount.join(max_amount);
        let sender_coin = coin::take(&mut pool.amount,claim_amount,ctx);
        let recevicer_coin = coin::from_balance(balance::withdraw_all(&mut pool.amount),ctx);
        wealthGod.claimAmount = claim_amount;
        user.claimAmount = user.claimAmount + claim_amount;
        transfer::public_transfer(wealth_god_coin,ctx.sender());
        transfer::public_transfer(recevicer_coin,ctx.sender());
        transfer::public_transfer(sender_coin,wealthGod.sender);
}
}
