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
    <header className="bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              🍌 Banana Fever Dream
            </h1>
          </div>

          {/* Wallet Connection Section */}
          <div className="flex items-center space-x-4">
            {address ? (
              <div className="flex items-center space-x-3">
                {/* Connected Wallet Address */}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <User className="w-4 h-4 mr-2" />
                  {formatAddress(address)}
                </Badge>
                
                {/* Disconnect Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
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
                modalTitleIcon=""
                welcomeScreen={{
                  title: "Welcome to Banana Fever Dream!",
                  subtitle: "Connect your wallet to start playing and earning rewards",
                }}
                modalSize="compact"
                showThirdwebBranding={false}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                }}
                connectButton={{
                  label: "Connect Wallet",
                  style: {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: 'white',
                  }
                }}
                supportedWallets={[
                  {
                    name: "Google",
                    icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjU2IDEyLjI1QzIyLjU2IDExLjQ3IDIyLjQ5IDEwLjcyIDIyLjM0IDEwSDEyVjE0LjI1SDE3Ljg5QzE3LjY2IDE1LjY2IDE2Ljg5IDE2Ljg5IDE1LjY2IDE3LjY2VjIwLjE0SDE5LjM0QzIxLjE0IDE4LjU0IDIyLjU2IDE1LjY2IDIyLjU2IDEyLjI1WiIgZmlsbD0iIzQyODVGNCIvPgo8cGF0aCBkPSJNMTIgMjNDNS45MzMgMjMgMSAxOC4wNjcgMSAxMkMxIDUuOTMzIDUuOTMzIDEgMTIgMUMxNC4wNjcgMSAxNS45MzMgMS42NyAxNy4zNCAyLjk5TDE1LjY2IDQuNjZDMTQuNjcgMy44MyAxMy4zNCAzLjI1IDEyIDMuMjVDOC4zNCAzLjI1IDUuMjUgNi4zNCA1LjI1IDEwQzUuMjUgMTMuNjYgOC4zNCAxNi43NSAxMiAxNi43NUMxNS42NiAxNi43NSAxOC43NSAxMy42NiAxOC43NSAxMEgxMlY3LjI1SDIyLjM0QzIyLjQ5IDcuOTggMjIuNTYgOC43NSAyMi41NiA5LjVWMjIuNTZIMTlWMjBIMTZWMjNIMTNaIiBmaWxsPSIjRUE0MzM1Ii8+CjxwYXRoIGQ9Ik0xMiA3LjI1VjEwSDE4Ljc1QzE4LjY2IDkuNDIgMTguNDkgOC44NSAxOC4yNSA4LjMzTDE2LjU5IDkuOTlDMTYuMDggOS4xNyAxNS4xNyA4LjUgMTQgOC41SDEyVjcuMjVaIiBmaWxsPSIjRkJCQzA0Ii8+CjxwYXRoIGQ9Ik0xMiAxNi43NUMxMy4zNCAxNi43NSAxNC42NyAxNi4xNyAxNS42NiAxNS4zNEwxNy4zNCAxNy4wMkMxNS45MzMgMTguMzMgMTQuMDY3IDE5IDEyIDE5QzguMzQgMTkgNS4yNSAxNS45MSA1LjI1IDEyLjI1SDEyVjE2Ljc1WiIgZmlsbD0iIzM0QTg1MyIvPgo8L3N2Zz4K",
                    walletId: "google",
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
