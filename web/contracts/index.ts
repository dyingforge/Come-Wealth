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
            package:"0x0754356722b31de69a4a40ecd8ca45c19f3f1318a628196a75a952a171dcac72",
            state:"0x275ced2f5939fadcf84da6dbab513d6bec03e54e90a0d2fd6ee4f91eb1d1346d",
            wealthGodPool:"0xb16680e2c866e2210c1c93016525059cdd25cd8cab9b3a8b5af8c24e970e16c0"
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

