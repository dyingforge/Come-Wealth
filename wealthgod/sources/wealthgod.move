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
//strcut
  public struct WealthGod has key{
        id: UID,
        sender: address,
        isclaimed: bool,
        amount: Balance<SUI>,
        image: String,
    }

public struct User has key{
    id: UID,
    sendAmount: u64,
    claimAmount: u64,
}

//event struct
public struct WealthGodCreated has copy,drop{
    id:ID,
    sender:address,
}

//字段待补充
public struct WeathPool has key{
    id:UID,
    receiver:address,
    sender:address,
    amount:Balance<SUI>,
}

// sender :create: mint fee :contain 1sui
//         :receiver claim:random = recevice mint fee 0.3-2.5sui
// receiver:mint:random 0.3-2.5sui
//初始化可以考虑加点钱
fun init(ctx: &mut TxContext){
    transfer::share_object(WeathPool{
        id: object::new(ctx),
        receiver: ctx.sender(),
        sender: ctx.sender(),
        amount:  balance::zero(),
    });
}   

//function  发多少钱前端控制
public entry fun createWealthGod(coin:Coin<SUI>, image: String, user:&mut User,ctx: &mut TxContext) {
    let amount = coin::into_balance(coin);
    let value = amount.value();
    assert!(value > 0,0);
    let uid = object::new(ctx);
    let id = object::uid_to_inner(&uid);
    let sender = tx_context::sender(ctx);
    let wealthGod = WealthGod {
        id: uid,
        sender, 
        isclaimed: false,
        amount,
        image,
    };
    user.sendAmount = user.sendAmount + value;
    event::emit(WealthGodCreated{
            id,
            sender,
    });
    transfer::share_object(wealthGod);
}
public entry fun claimWealthGod(wealthGod:&mut WealthGod,amount:&mut Coin<SUI>,random:&Random,pool:&mut WeathPool,user:&mut User,ctx: &mut TxContext){
         //待改
        let min:u64  = 3;
        let max:u64  = 25;
        let mut gen = random::new_generator(random, ctx);
        let claim_amount = random::generate_u64_in_range(&mut gen, min, max);
        //红包钱
        let wealth_god_coin = coin::take(&mut wealthGod.amount,claim_amount,ctx);
        //最大值
        let max_coin = coin::split(amount, max, ctx);
        let max_amount = coin::into_balance(max_coin);
        pool.amount.join(max_amount);
        let recevicer_coin = coin::take(&mut pool.amount,claim_amount,ctx);
        let sender_coin = coin::from_balance(balance::withdraw_all(&mut pool.amount),ctx);
        user.claimAmount = user.claimAmount + claim_amount;
        transfer::public_transfer(wealth_god_coin,pool.receiver);
        transfer::public_transfer(recevicer_coin,pool.receiver);
        transfer::public_transfer(sender_coin,pool.sender);
}
}

