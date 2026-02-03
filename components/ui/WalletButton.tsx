'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function WalletButton() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="sui-wallet-button">
      <ConnectButton
        connectText="Connect Wallet"
        connectedText={`${currentAccount?.address.slice(0, 6)}...${currentAccount?.address.slice(-4)}`}
      />
    </div>
  );
}
