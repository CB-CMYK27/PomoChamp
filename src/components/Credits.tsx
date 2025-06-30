import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Credits: React.FC = () => {
  const navigate = useNavigate();

  // Media credits data
  const mediaCredits = [
    {
      originalTitle: "Warning Noise",
      author: "Jerimee",
      license: "CC-BY 3.0",
      url: "https://opengameart.org/content/warning-noise",
      yourFileName: "public/sfx/timer-warning.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "Explosion",
      author: "crazyduckgames",
      license: "CC-BY 4.0, CC-BY 3.0",
      url: "https://opengameart.org/content/5-soundsshort-melodies",
      yourFileName: "public/sfx/explosion.ogg",
      modifications: "None",
      additionalAttribution: "Artist website: https://crazy-duck-games.itch.io/ or www.crazyduckgames.de"
    },
    {
      originalTitle: "death_jack_01.wav",
      author: "Jack Menhorn",
      license: "CC-BY 3.0",
      url: "https://opengameart.org/content/fps-placeholder-sounds",
      yourFileName: "public/sfx/player-death.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "death_jack_02.wav",
      author: "Jack Menhorn",
      license: "CC-BY 3.0",
      url: "https://opengameart.org/content/fps-placeholder-sounds",
      yourFileName: "public/sfx/opponent-death.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "pain_jack_01.wav",
      author: "Jack Menhorn",
      license: "CC-BY 3.0",
      url: "https://opengameart.org/content/fps-placeholder-sounds",
      yourFileName: "public/sfx/player-grunt.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "pain_jack_02.wav",
      author: "Jack Menhorn",
      license: "CC-BY 3.0",
      url: "https://opengameart.org/content/fps-placeholder-sounds",
      yourFileName: "public/sfx/opponent-grunt.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "hit20.mp3.flac",
      author: "Independent.nu",
      license: "CC0",
      url: "https://opengameart.org/content/37-hitspunches",
      yourFileName: "public/sfx/player-punch.flac",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "hit30.mp3.flac",
      author: "Independent.nu",
      license: "CC0",
      url: "https://opengameart.org/content/37-hitspunches",
      yourFileName: "public/sfx/opponent-punch.flac",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "BossMain.wav",
      author: "SketchyLogic",
      license: "CC0",
      url: "https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles",
      yourFileName: "public/sfx/BossMain.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "Map.wav",
      author: "SketchyLogic",
      license: "CC0",
      url: "https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles",
      yourFileName: "public/sfx/Map.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "Mars.wav",
      author: "SketchyLogic",
      license: "CC0",
      url: "https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles",
      yourFileName: "public/sfx/Mars.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "Mercury.wav",
      author: "SketchyLogic",
      license: "CC0",
      url: "https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles",
      yourFileName: "public/sfx/Mercury.wav",
      modifications: "None",
      additionalAttribution: ""
    },
    {
      originalTitle: "Venus.wav",
      author: "SketchyLogic",
      license: "CC0",
      url: "https://opengameart.org/content/nes-shooter-music-5-tracks-3-jingles",
      yourFileName: "public/sfx/Venus.wav",
      modifications: "None",
      additionalAttribution: ""
    }
  ];

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
                <div>• Game Design & Programming: Boyle the Builder (Solo Developer)</div>
                <div>• Built with React, TypeScript, and Tailwind CSS</div>
                <div>• Audio System: Web Audio API</div>
                <div>• Database: Supabase</div>
              </div>
            </section>

            {/* Development Process */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">DEVELOPMENT PROCESS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• Created entirely through "vibe coding" with zero prior programming experience</div>
                <div>• AI-Assisted Development using ChatGPT, Claude, and Bolt.new</div>
                <div>• Proof that anyone can build amazing things with the right tools and determination</div>
                <div>• From idea to production in record time through AI collaboration</div>
              </div>
            </section>

            {/* Audio Assets */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">AUDIO ASSETS</h2>
              <div className="text-white font-mono text-sm space-y-4">
                {mediaCredits.map((credit, index) => (
                  <div key={index} className="bg-black/30 rounded p-3 border border-gray-600">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="text-neonYel font-bold">"{credit.originalTitle}"</span>
                        <span className="text-gray-400 text-xs">{credit.license}</span>
                      </div>
                      <div className="text-gray-300">by {credit.author}</div>
                      <div className="text-xs text-gray-400">
                        <a 
                          href={credit.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-crtBlue hover:text-neonYel underline"
                        >
                          {credit.url}
                        </a>
                      </div>
                      {credit.additionalAttribution && (
                        <div className="text-xs text-gray-400 italic">
                          {credit.additionalAttribution}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Visual Assets */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">VISUAL ASSETS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• Character Art: Original PomoChamp Team Creations</div>
                <div>• Background Art: Original PomoChamp Team Creations</div>
                <div>• UI Elements: Original PomoChamp Team Creations</div>
                <div>• Icons: Lucide React</div>
              </div>
            </section>

            {/* Special Thanks */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">SPECIAL THANKS</h2>
              <div className="text-white font-mono text-sm space-y-2">
                <div>• The Pomodoro Technique® by Francesco Cirillo</div>
                <div>• OpenGameArt.org community for amazing audio assets</div>
                <div>• ChatGPT, Claude, and Bolt.new for making this possible</div>
                <div>• The AI development community for pioneering new ways to create</div>
                <div>• Open Source Community</div>
                <div>• Beta Testers and Early Supporters</div>
                <div>• Spinal Tap for going to eleven</div>
              </div>
            </section>

            {/* Legal */}
            <section>
              <h2 className="text-neonYel font-mono text-lg font-bold mb-4">LEGAL</h2>
              <div className="text-white font-mono text-xs space-y-2 text-gray-300">
                <div>• This game is a productivity tool inspired by the Pomodoro Technique®</div>
                <div>• All audio assets used under their respective Creative Commons licenses</div>
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
            Version 1.0.0 • Built in 2025 • Powered by AI & Human Creativity
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;