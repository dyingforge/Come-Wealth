import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables(network: Network) {
    return networkConfig[network].variables;
}

function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params: T) => Transaction
) {
    return (params: T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables(network);
        return fn(tx, networkVariables, params);
    };
}

type Network = "mainnet" | "testnet"

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            package:"0xf89325c5ce2dbc8229916b5e5775f775bc697518a0ee72513c2ce3aabd744abb",
            state:"0xc0a07b90762e44b7010587671858dddef0b801cb1cb13cbd7ede52cb4b59b859",
            wealthGodPool:"0x8df0f25a171e1ff61a47c742e537b53811daf4cdf64efa9132971b4a6c071b54"
        },
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"), 
        variables: {
            package:"0xfa802f80c25dde3189d36915bcfa9cf78aaf6ce88afa5460680580311229eb91",
            state:"0x7a944e3ee1712cf3481f3741c728c17659fbb099ee3db28f0091e42ca651b843",
            wealthGodPool:"0x3200083946dba6bab22696219e2a9e4780179458c88d39d466f14429641f0f9e"
        },
    }
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

export { getNetworkVariables, networkConfig, network, suiClient, createBetterTxFactory, useNetworkVariables };
export type { NetworkVariables };

