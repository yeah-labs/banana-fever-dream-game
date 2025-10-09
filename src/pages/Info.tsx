import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gamepad2, Target, Zap } from 'lucide-react';
import powerUpSpreadShot from '@/assets/powerup-spread-shot.png';
import powerUpShield from '@/assets/powerup-shield.png';
import powerUpScoreDoubler from '@/assets/powerup-score-doubler.png';
import powerUpMagnet from '@/assets/powerup-magnet.png';
import powerUpSword from '@/assets/powerup-sword.png';
import powerUpRealityWarp from '@/assets/powerup-reality-warp.png';

const Info: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-game flex flex-col items-center justify-start p-4 pt-4">
      <div className="w-full max-w-4xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/')}
            className="border-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-primary">Game Info</h1>
        </div>

        {/* Story Section */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              Backstory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              You doze off at your keyboard. What happens next is something you will never forget. Or will you?
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The ceiling of the clubhouse unzips—out drifts the invading ships of the Pith. These bug-like alien creatures are here to take over the swamp.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Wake our friends and slam the big yellow button—banana cannons roaring, jukebox to max. Drive them out before it is too late.
            </p>
          </CardContent>
        </Card>

        {/* How to Play Section */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Controls */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Controls
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="font-mono bg-primary/10 px-2 py-1 rounded text-sm">WASD</span>
                  <span className="font-mono bg-primary/10 px-2 py-1 rounded text-sm">Arrow Keys</span>
                  <span>Move your character</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono bg-primary/10 px-2 py-1 rounded text-sm">SPACE</span>
                  <span>Shoot bananas</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-mono bg-primary/10 px-2 py-1 rounded text-sm">F</span>
                  <span>Activate Fever (when meter is full)</span>
                </div>
              </div>
            </div>

            {/* Power-ups */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Power-Ups
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <img src={powerUpSpreadShot} alt="Spread Shot" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Spread Shot:</span> Fires deadly triple shots
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={powerUpShield} alt="Shield" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Shield:</span> Provides temporary invulnerability
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={powerUpScoreDoubler} alt="Score Doubler" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Score Doubler:</span> Earns double points
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={powerUpMagnet} alt="Magnet" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Magnet:</span> Attracts power-ups within range
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={powerUpSword} alt="Sword" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Sword:</span> Sends powerful projectiles
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img src={powerUpRealityWarp} alt="Reality Warp" className="w-5 h-5 mt-1" />
                  <div>
                    <span className="text-foreground">Reality Warp:</span> [Redacted]
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Info;

