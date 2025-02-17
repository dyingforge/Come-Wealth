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
            package:"0xb9682dc73bfae0b65f2918a6f7e047337ca18a8a2c3e718535c6d93c524d5afe",
            state:"0xdabca9f43fe85cf7071bbcc1714a6c9c46cc221b0e2a84796db787c9988504a9",
            wealthGodPool:"0x30654e112d7b6bf217c5b4072525d408ff2d86983507b582bcfb458a1e18d514"
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

