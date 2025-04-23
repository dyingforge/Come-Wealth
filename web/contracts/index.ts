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
            package:"0xa55a3ae2d892e96f3bbb23ffc72db83c4f56b349fe9db1507b46c019e97fcb24",
            state:"0x938c030f7178e289e22ca909b1cb73b267e2062eeb27ceecce038ac4994d6e24",
            wealthGodPool:"0x01d5cfec97805b8a3b36233b7651c5260710b625cdf244f04ee06264c10a3b57"
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

