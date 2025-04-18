/*
/// Module: wealthgod
module wealthgod::wealthgod;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions
module wealthgod::wealthgod;

use std::ascii::String as AString;
use std::string::String;
use std::type_name::{Self, TypeName};
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::dynamic_field;
use sui::event;
use sui::random::{Self, Random};
use sui::sui::SUI;
use sui::table::{Self, Table};

//strcut
public struct WealthGod has key {
    id: UID,
    sender: address,
    description: String,
    isclaimed: bool,
    claimAmount: u64,
    coin_type: TypeName,
    //dynamicfield
}

public struct State has key {
    id: UID,
    //<owner,profile>
    profiles: Table<address, address>,
}

public struct Profile has key {
    id: UID,
    name: String,
    sendAmount: u64,
    claimAmount: u64,
    wealthGods: vector<address>,
}

//字段待补充
public struct WeathPool has key {
    id: UID,
    //dynamicfield
}

//event struct
public struct WealthGodCreated has copy, drop {
    id: ID,
    sender: address,
}

public struct ProfileCreated has copy, drop {
    id: ID,
    owner: address,
}

//初始化可以考虑加点钱
fun init(ctx: &mut TxContext) {
    transfer::share_object(WeathPool {
        id: object::new(ctx),
    });
    transfer::share_object(State {
        id: object::new(ctx),
        profiles: table::new(ctx),
    });
}

public entry fun create_profile(state: &mut State, name: String, ctx: &mut TxContext) {
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
public entry fun createWealthGod<T>(
    coin: &mut Coin<T>,
    description: String,
    user: &mut Profile,
    amount: u64,
    ctx: &mut TxContext,
) {
    let in_coin = coin::split(coin, amount, ctx);
    let amount = coin::into_balance(in_coin);
    let value = amount.value();
    let uid = object::new(ctx);
    let id = object::uid_to_inner(&uid);
    let sender = ctx.sender();
    let type_name = type_name::get<T>();

    let mut wealthGod = WealthGod {
        id: uid,
        sender,
        isclaimed: false,
        description,
        coin_type: type_name,
        claimAmount: 0,
    };
    dynamic_field::add(&mut wealthGod.id, type_name, amount);
    user.sendAmount = user.sendAmount + value;
    event::emit(WealthGodCreated {
        id,
        sender,
    });
    vector::push_back(&mut user.wealthGods, object::id_to_address(&id));
    transfer::share_object(wealthGod);
}

public entry fun claimWealthGod<T>(
    wealthGod: &mut WealthGod,
    in_coin: Coin<T>,
    pool: &mut WeathPool,
    user: &mut Profile,
    random: &Random,
    ctx: &mut TxContext,
) {
    let type_name = type_name::get<T>();
    assert!(wealthGod.coin_type == type_name, 3);
    assert!(wealthGod.isclaimed == false, 1);
    wealthGod.isclaimed = true;
    let balance = dynamic_field::borrow<TypeName, Balance<T>>(&wealthGod.id, type_name);
    let original_amount = balance::value(balance);
    let min: u64 = original_amount * 30 / 100;
    let max: u64 = original_amount * 250 / 100;
    assert!(in_coin.value() >= max, 2);
    let mut gen = random::new_generator(random, ctx);
    let claim_amount = random::generate_u64_in_range(&mut gen, min, max);
    let balance = dynamic_field::borrow_mut<TypeName, Balance<T>>(&mut wealthGod.id, type_name);
    //红包钱
    let wealth_god_coin = coin::from_balance(balance::split(balance, original_amount), ctx);
    // let wealth_god_coin = coin::from_balance(wealthGod.amount, ctx);
    //最大值
    let max_amount = coin::into_balance(in_coin);
    // 确保池子中有对应币种的余额
    if (!dynamic_field::exists_(&pool.id, type_name)) {
        dynamic_field::add(&mut pool.id, type_name, balance::zero<T>());
    };

    let pool_balance = dynamic_field::borrow_mut<TypeName, Balance<T>>(&mut pool.id, type_name);
    balance::join(pool_balance, max_amount);

    // 从池中取出相应数量的代币
    let sender_coin = coin::from_balance(balance::split(pool_balance, claim_amount), ctx);
    let receiver_coin = coin::from_balance(balance::withdraw_all(pool_balance), ctx);

    wealthGod.claimAmount = claim_amount;
    user.claimAmount = user.claimAmount + claim_amount;

    transfer::public_transfer(wealth_god_coin, ctx.sender());
    transfer::public_transfer(receiver_coin, ctx.sender());
    transfer::public_transfer(sender_coin, wealthGod.sender);
}
