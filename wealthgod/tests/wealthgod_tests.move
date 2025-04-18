#[test_only]
module wealthgod::wealthgod_tests;

use std::string;
use sui::coin::{Self, Coin};
use sui::random_test::{Self, Random};
use sui::sui::SUI;
use sui::test_scenario::{Self as ts, Scenario};
use sui::test_utils::assert_eq;
use wealthgod::wealthgod::{Self, State, WeathPool, Profile, WealthGod};

// 测试常量
const USER1: address = @0xA;
const USER2: address = @0xB;
const WEALTH_GOD_AMOUNT: u64 = 10_000_000; // 1000万
const CLAIM_DEPOSIT_AMOUNT: u64 = 25_000_000; // 2500万

#[test]
fun test_create_profile_and_wealthgod() {
    let mut scenario = ts::begin(USER1);

    // 初始化模块
    {
        wealthgod::test_init(ts::ctx(&mut scenario));
    };

    // USER1创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    // 检查资料是否创建成功
    ts::next_tx(&mut scenario, USER1);
    {
        let profile = ts::take_from_sender<Profile>(&scenario);
        assert_eq(profile.name, string::utf8(b"User1"));
        assert_eq(profile.sendAmount, 0);
        assert_eq(profile.claimAmount, 0);
        ts::return_to_sender(&mut scenario, profile);
    };

    // 创建财神红包
    ts::next_tx(&mut scenario, USER1);
    {
        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT, ts::ctx(&mut scenario));
        let profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        assert_eq(profile.sendAmount, WEALTH_GOD_AMOUNT);
        ts::return_to_sender(&mut scenario, profile);
        ts::return_to_sender(&mut scenario, coin);
    };

    ts::end(scenario);
}

#[test]
fun test_claim_wealthgod() {
    let mut scenario = ts::begin(USER1);

    // 初始化模块
    {
        wealthgod::test_init(ts::ctx(&mut scenario));
    };

    // 为USER1和USER2创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User2"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    // USER1创建财神红包
    let wealthgod_id: ID;
    ts::next_tx(&mut scenario, USER1);
    {
        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT, ts::ctx(&mut scenario));
        let profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        // 获取创建的财神红包ID
        wealthgod_id = *vector::borrow(&profile.wealthGods, 0);

        ts::return_to_sender(&mut scenario, profile);
        ts::return_to_sender(&mut scenario, coin);
    };

    // USER2领取财神红包
    ts::next_tx(&mut scenario, USER2);
    {
        let mut coin = coin::mint_for_testing<SUI>(CLAIM_DEPOSIT_AMOUNT, ts::ctx(&mut scenario));
        let profile = ts::take_from_sender<Profile>(&scenario);
        let pool = ts::take_shared<WeathPool>(&scenario);
        let wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);
        let random = random_test::new(ts::ctx(&mut scenario));

        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 验证红包已被领取
        assert_eq(wealthgod.isclaimed, true);
        assert!(profile.claimAmount > 0, 0);

        random_test::destroy(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&mut scenario, profile);
    };

    ts::end(scenario);
}

// 测试边界情况：尝试用不足的金额领取红包
#[test]
#[expected_failure(abort_code = 2)]
fun test_claim_with_insufficient_funds() {
    let mut scenario = ts::begin(USER1);

    // 初始化模块
    {
        wealthgod::test_init(ts::ctx(&mut scenario));
    };

    // 创建资料和红包
    // ... (与上面相同的代码)

    // 使用不足的资金尝试领取
    ts::next_tx(&mut scenario, USER2);
    {
        let mut coin = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario)); // 金额太少
        let profile = ts::take_from_sender<Profile>(&scenario);
        let pool = ts::take_shared<WeathPool>(&scenario);
        let wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);
        let random = random_test::new(ts::ctx(&mut scenario));

        // 这应该会失败，因为金额不足
        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 由于预期失败，以下代码不应该执行
        random_test::destroy(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&mut scenario, profile);
    };

    ts::end(scenario);
}
