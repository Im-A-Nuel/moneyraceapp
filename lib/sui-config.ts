import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
  devnet: {
    url: 'https://fullnode.devnet.sui.io:443',
    network: 'devnet',
  },
  testnet: {
    url: 'https://fullnode.testnet.sui.io:443',
    network: 'testnet',
  },
  mainnet: {
    url: 'https://fullnode.mainnet.sui.io:443',
    network: 'mainnet',
  },
});

export { networkConfig, useNetworkVariable, useNetworkVariables };
