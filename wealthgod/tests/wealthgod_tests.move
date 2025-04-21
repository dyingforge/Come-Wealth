#[test_only]
module wealthgod::wealthgod_tests;

use std::debug;
use std::string;
use sui::coin;
use sui::random::{Self, Random};
use sui::sui::SUI;
use sui::test_scenario as ts;
use sui::test_utils::assert_eq;
use wealthgod::wealthgod::{
    Self,
    State,
    WeathPool,
    Profile,
    WealthGod,
    get_is_claimed,
    get_profile_wealthgods,
    get_wealthgods_claimAmount
};

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
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    // 创建财神红包
    ts::next_tx(&mut scenario, USER1);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );
        coin::burn_for_testing(coin);

        ts::return_to_sender(&scenario, profile);
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
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        let wealthgods = get_profile_wealthgods(&profile);
        assert!(!vector::is_empty(&wealthgods), 0); // 确保列表不为空
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        // 作为系统地址创建 Random 对象
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    // USER2领取财神红包
    ts::next_tx(&mut scenario, USER2);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let coin = coin::mint_for_testing<SUI>(CLAIM_DEPOSIT_AMOUNT, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);

        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 创建并共享 Random 对象用于测试
        let random = ts::take_shared<Random>(&scenario);
        // 获取共享的 Random 对象

        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 验证红包已被领取
        let is_claimed = get_is_claimed(&wealthgod);
        assert_eq(is_claimed, true);

        ts::return_shared(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
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

    // 为USER1和USER2创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        // 获取创建的财神红包ID
        let wealthgods = get_profile_wealthgods(&profile);
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    // 使用不足的资金尝试领取
    ts::next_tx(&mut scenario, USER2);
    {
        let coin = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario)); // 金额太少
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);
        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 获取共享的 Random 对象
        let random = ts::take_shared<Random>(&scenario);

        // 这应该会失败，因为金额不足
        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 返回共享对象
        ts::return_shared(random);

        // 预期会失败，所以这些代码不会执行
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
    };

    ts::end(scenario);
}

#[test]
fun test_claim_distribution() {
    let mut scenario = ts::begin(USER1);

    // 初始化模块
    {
        wealthgod::test_init(ts::ctx(&mut scenario));
    };

    // 为USER1和USER2创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        let wealthgods = get_profile_wealthgods(&profile);
        assert!(!vector::is_empty(&wealthgods), 0); // 确保列表不为空
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        // 作为系统地址创建 Random 对象
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    // USER2领取财神红包
    ts::next_tx(&mut scenario, USER2);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let coin = coin::mint_for_testing<SUI>(CLAIM_DEPOSIT_AMOUNT, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);

        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 创建并共享 Random 对象用于测试
        let random = ts::take_shared<Random>(&scenario);
        // 获取共享的 Random 对象

        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 验证分成合理性
        let is_claimed = get_is_claimed(&wealthgod);
        assert_eq(is_claimed, true);

        // 验证领取金额在合理范围内

        let claim_amount = get_wealthgods_claimAmount(&wealthgod);
        let min_expected = WEALTH_GOD_AMOUNT * 30 / 100; // 30%
        let max_expected = WEALTH_GOD_AMOUNT * 250 / 100; // 250%

        assert!(claim_amount >= min_expected, 0);
        assert!(claim_amount <= max_expected, 0);

        // 返回共享对象
        ts::return_shared(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
    };

    ts::end(scenario);
}

#[test_only]
module wealthgod::wealthgod_tests;

use std::debug;
use std::string;
use sui::coin;
use sui::random::{Self, Random};
use sui::sui::SUI;
use sui::test_scenario as ts;
use sui::test_utils::assert_eq;
use wealthgod::wealthgod::{
    Self,
    State,
    WeathPool,
    Profile,
    WealthGod,
    get_is_claimed,
    get_profile_wealthgods,
    get_wealthgods_claimAmount
};

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
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    // 创建财神红包
    ts::next_tx(&mut scenario, USER1);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );
        coin::burn_for_testing(coin);
        ts::return_to_sender(&scenario, profile);
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
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        let wealthgods = get_profile_wealthgods(&profile);
        assert!(!vector::is_empty(&wealthgods), 0); // 确保列表不为空
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        // 作为系统地址创建 Random 对象
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    // USER2领取财神红包
    ts::next_tx(&mut scenario, USER2);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let coin = coin::mint_for_testing<SUI>(CLAIM_DEPOSIT_AMOUNT, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);

        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 创建并共享 Random 对象用于测试
        let random = ts::take_shared<Random>(&scenario);
        // 获取共享的 Random 对象

        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 验证红包已被领取
        let is_claimed = get_is_claimed(&wealthgod);
        assert_eq(is_claimed, true);

        ts::return_shared(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
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

    // 为USER1和USER2创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        // 获取创建的财神红包ID
        let wealthgods = get_profile_wealthgods(&profile);
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    // 使用不足的资金尝试领取
    ts::next_tx(&mut scenario, USER2);
    {
        let coin = coin::mint_for_testing<SUI>(1000, ts::ctx(&mut scenario)); // 金额太少
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);
        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 获取共享的 Random 对象
        let random = ts::take_shared<Random>(&scenario);

        // 这应该会失败，因为金额不足
        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 返回共享对象
        ts::return_shared(random);

        // 预期会失败，所以这些代码不会执行
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
    };

    ts::end(scenario);
}

#[test]
fun test_claim_distribution() {
    let mut scenario = ts::begin(USER1);

    // 初始化模块
    {
        wealthgod::test_init(ts::ctx(&mut scenario));
    };

    // 为USER1和USER2创建资料
    ts::next_tx(&mut scenario, USER1);
    {
        let mut state = ts::take_shared<State>(&scenario);
        wealthgod::create_profile(
            &mut state,
            string::utf8(b"User1"),
            ts::ctx(&mut scenario),
        );
        ts::return_shared(state);
    };

    ts::next_tx(&mut scenario, USER2);
    {
        let mut state = ts::take_shared<State>(&scenario);
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
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let mut coin = coin::mint_for_testing<SUI>(WEALTH_GOD_AMOUNT*2, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);

        wealthgod::createWealthGod<SUI>(
            &mut coin,
            string::utf8(b"Lucky money!"),
            &mut profile,
            WEALTH_GOD_AMOUNT,
            ts::ctx(&mut scenario),
        );

        let wealthgods = get_profile_wealthgods(&profile);
        assert!(!vector::is_empty(&wealthgods), 0); // 确保列表不为空
        wealthgod_id = object::id_from_address(*vector::borrow(&wealthgods, 0));

        ts::return_to_sender(&scenario, profile);
        coin::burn_for_testing(coin);
    };

    ts::next_tx(&mut scenario, @0x0);
    {
        // 作为系统地址创建 Random 对象
        random::create_for_testing(ts::ctx(&mut scenario));
    };

    // USER2领取财神红包
    ts::next_tx(&mut scenario, USER2);
    {
        assert!(ts::has_most_recent_for_sender<Profile>(&scenario), 0);

        let coin = coin::mint_for_testing<SUI>(CLAIM_DEPOSIT_AMOUNT, ts::ctx(&mut scenario));
        let mut profile = ts::take_from_sender<Profile>(&scenario);
        let mut pool = ts::take_shared<WeathPool>(&scenario);

        let mut wealthgod = ts::take_shared_by_id<WealthGod>(&scenario, wealthgod_id);

        // 创建并共享 Random 对象用于测试
        let random = ts::take_shared<Random>(&scenario);
        // 获取共享的 Random 对象

        wealthgod::claimWealthGod<SUI>(
            &mut wealthgod,
            coin,
            &mut pool,
            &mut profile,
            &random,
            ts::ctx(&mut scenario),
        );

        // 验证分成合理性
        let is_claimed = get_is_claimed(&wealthgod);
        assert_eq(is_claimed, true);

        // 验证领取金额在合理范围内

        let claim_amount = get_wealthgods_claimAmount(&wealthgod);
        let min_expected = WEALTH_GOD_AMOUNT * 30 / 100; // 30%
        let max_expected = WEALTH_GOD_AMOUNT * 250 / 100; // 250%

        assert!(claim_amount >= min_expected, 0);
        assert!(claim_amount <= max_expected, 0);

        // 返回共享对象
        ts::return_shared(random);
        ts::return_shared(wealthgod);
        ts::return_shared(pool);
        ts::return_to_sender(&scenario, profile);
    };

    ts::end(scenario);
}
