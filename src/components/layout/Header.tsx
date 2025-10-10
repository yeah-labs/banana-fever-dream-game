import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { inAppWallet, createWallet, smartWallet } from "thirdweb/wallets";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';
import { client, curtis, ACCOUNT_FACTORY_ADDRESS } from '@/lib/thirdweb';
import { useWalletAddresses } from '@/hooks/useWalletAddresses';
import apechainLogo from '@/assets/poweredby-apechain.png';

const wallets = [
  // Smart wallet for gas-sponsored score submissions
  smartWallet({
    chain: curtis,
    factoryAddress: ACCOUNT_FACTORY_ADDRESS,
    gasless: true, // Enable gasless transactions
  }),
  // Regular wallets (users log in with these, smart account wraps them)
  inAppWallet({
    auth: {
      options: ["google", "discord", "x"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("io.rabby"),
  createWallet("com.coinbase.wallet"),
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { formattedOriginalAddress, isConnected } = useWalletAddresses();

  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet);
    }
  };

  return (
    <header className="bg-gradient-banana-subtle shadow-banana font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo/Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.open('https://banana-fever-dream.lovable.app/', '_self')}
              className="text-2xl font-bold text-primary-foreground cursor-pointer"
            >
              🍌 Banana Fever Dream
            </button>
            <img 
              src={apechainLogo} 
              alt="Powered by ApeChain" 
              className="h-4 w-auto opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>

          {/* User Login Section */}
          <div className="flex items-center space-x-4">
            {isConnected && account ? (
              <div className="flex items-center space-x-3">
                {/* Original Wallet Address */}
                <Badge variant="secondary" className="bg-card/20 text-primary-foreground border-border hover:bg-card/20">
                  <User className="w-4 h-4 mr-2" />
                  {formattedOriginalAddress}
                </Badge>
                
                {/* Log Out Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="bg-card/10 border-border text-primary-foreground hover:bg-card/10 hover:border-border hover:text-primary-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={curtis}
                connectModal={{
                  size: "compact",
                  title: "Sign In",
                  showThirdwebBranding: true,
                }}
                connectButton={{
                  label: "Log In",
                  style: {
                    backgroundColor: 'hsl(var(--card) / 0.1)',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--primary-foreground))',
                    height: '2.25rem',
                    fontSize: '0.875rem',
                    padding: '0 0.75rem',
                  }
                }}
                theme="dark"
                // Enable account abstraction for gas-sponsored transactions
                accountAbstraction={{
                  chain: curtis,
                  factoryAddress: ACCOUNT_FACTORY_ADDRESS,
                  gasless: true,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;