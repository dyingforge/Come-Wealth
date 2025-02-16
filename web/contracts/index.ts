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
            package:"0xae17b1f578d8d371fae0974d4fedda49e26e7afe560aac650b32e7ae35ed7831",
            state:"0x80b7438ecb23ae7da4f55cd2ea772e15af380047701e4bb90fc1331f3a017804",
            wealthGodPool:"0xdcd9d5e8da53114de198508e656b6731c7694bf50ebfd0e2c3bb3d3c9c72a85b"
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

