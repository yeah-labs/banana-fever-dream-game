import React from 'react';
import { ConnectWallet, useAddress, useDisconnect } from '@thirdweb-dev/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const address = useAddress();
  const disconnect = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-gradient-banana-subtle shadow-banana font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-foreground">
              🍌 Banana Fever Dream
            </h1>
          </div>

          {/* Wallet Connection Section */}
          <div className="flex items-center space-x-4">
            {address ? (
              <div className="flex items-center space-x-3">
                {/* Connected Wallet Address */}
                <Badge variant="secondary" className="bg-card/20 text-primary-foreground border-border hover:bg-card/20">
                  <User className="w-4 h-4 mr-2" />
                  {formatAddress(address)}
                </Badge>
                
                {/* Disconnect Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="bg-card/10 border-border text-primary-foreground hover:bg-card/10 hover:border-border hover:text-primary-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <ConnectWallet
                theme="dark"
                btnTitle="Connect Wallet"
                modalTitle="Connect to Banana Fever Dream"
                modalSize="compact"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
