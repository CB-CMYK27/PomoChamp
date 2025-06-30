import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Credits: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg border-2 border-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-mono text-xl md:text-2xl text-neonYel font-bold">
              🏆 CREDITS
            </h1>
          </div>
        </div>

        {/* Credits Content */}
        <div className="bg-black/40 rounded-lg p-6 border-2 border-crtBlue">
          <div className="space-y-8">
            
            {/* Game Development */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">GAME DEVELOPMENT</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• Game Design & Programming: PomoChamp Team</div>
                <div>• Built with React, TypeScript, and Tailwind CSS</div>
                <div>• Audio System: Web Audio API</div>
                <div>• Database: Supabase</div>
              </div>
            </section>

            {/* Audio Assets */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">AUDIO ASSETS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• Background Music: [Music Credits TBD]</div>
                <div>• Sound Effects: [SFX Credits TBD]</div>
                <div>• Voice Acting: [Voice Credits TBD]</div>
              </div>
            </section>

            {/* Visual Assets */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">VISUAL ASSETS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• Character Art: [Artist Credits TBD]</div>
                <div>• Background Art: [Background Credits TBD]</div>
                <div>• UI Elements: [UI Credits TBD]</div>
                <div>• Icons: Lucide React</div>
              </div>
            </section>

            {/* Special Thanks */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">SPECIAL THANKS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• The Pomodoro Technique® by Francesco Cirillo</div>
                <div>• Open Source Community</div>
                <div>• Beta Testers and Early Supporters</div>
              </div>
            </section>

            {/* Legal */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">LEGAL</h2>
              <div className="text-white font-mono text-xs space-y-2 text-gray-300">
                <div>• This game is a productivity tool inspired by the Pomodoro Technique®</div>
                <div>• All trademarks and copyrights belong to their respective owners</div>
                <div>• This is a non-commercial educational project</div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="text-neonYel font-mono text-sm">
            Made with ❤️ for productivity warriors everywhere
          </div>
          <div className="text-gray-400 font-mono text-xs mt-2">
            Version 1.0.0 • Built in 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;