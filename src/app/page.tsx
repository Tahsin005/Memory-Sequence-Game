'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, CheckCircle, Sparkle, Trophy, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('Press Start to Begin');
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [showingSequence, setShowingSequence] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('memory_high_score');
    if (storedHighScore) {
      setHighScore(Number(storedHighScore));
    }
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateNewSequence = () => {
    return [...sequence, Math.floor(Math.random() * 9) + 1];
  };

  const showSequence = async (newSequence: number[]) => {
    setShowingSequence(true);
    setUserInput('');
    setInstructions(`Round ${newSequence.length} - Memorize the sequence!`);

    for (let number of newSequence) {
      setDisplayedNumber(number);
      await sleep(700);
      setDisplayedNumber(null);
      await sleep(300);
    }

    setInstructions(`Type the ${newSequence.length} numbers separated by spaces.`);
    setShowingSequence(false);
    inputRef.current?.focus();
  };

  const handleStartGame = () => {
    const newSequence = [Math.floor(Math.random() * 9) + 1];
    setSequence(newSequence);
    setCurrentRound(1);
    setGameStarted(true);
    setMessage('');
    showSequence(newSequence);
  };

  const handleNextRound = () => {
    const newSequence = generateNewSequence();
    setSequence(newSequence);
    setCurrentRound(newSequence.length);
    showSequence(newSequence);
  };

  const checkAnswer = () => {
    const userSequence = userInput.trim().split(' ').map(Number);

    if (userSequence.length !== sequence.length || userSequence.some(isNaN)) {
      setMessage(`❗ Please enter ${sequence.length} valid numbers separated by spaces.`);
      return;
    }

    const isCorrect = JSON.stringify(userSequence) === JSON.stringify(sequence);

    if (isCorrect) {
      const nextRound = currentRound + 1;
      setMessage(`🎉 Correct! Get ready for round ${nextRound}`);
      setTimeout(() => {
        setMessage('');
        handleNextRound();
      }, 2000);
    } else {
      if (currentRound > highScore) {
        setHighScore(currentRound);
        localStorage.setItem('memory_high_score', String(currentRound));
      }
      setMessage(`😭 Game over! You remembered ${currentRound - 1} rounds.\nSequence was: ${sequence.join(" ")}`);
      setInstructions('Press Start to play again.');
      setGameStarted(false);
      setCurrentRound(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameStarted && !showingSequence) {
      checkAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-0 shadow-2xl bg-black/20 backdrop-blur-xl animate-fade-in">
        <CardHeader className="text-center space-y-2 border-b border-white/10 pb-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="text-purple-300 h-8 w-8" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Memory Master
            </CardTitle>
            <Brain className="text-purple-300 h-8 w-8" />
          </div>
          <p className="text-white/70 flex items-center justify-center gap-2">
            <Sparkle className="text-amber-300 h-4 w-4" />
            Test your memory - remember and repeat the sequence
            <Sparkle className="text-amber-300 h-4 w-4" />
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {(gameStarted || currentRound > 0) && (
            <div className="flex justify-center items-center gap-4">
              <div className="px-4 py-1 rounded-full bg-indigo-500/20 text-indigo-200 font-semibold flex items-center">
                <Trophy className="h-4 w-4 mr-1.5" />
                Round {currentRound}
              </div>
              <div className="px-4 py-1 rounded-full bg-emerald-600/20 text-emerald-300 font-semibold flex items-center">
                🏆 High Score: {highScore}
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-medium text-white/80 mb-2">{instructions}</p>
          </div>

          <div className={`h-24 w-24 mx-auto rounded-2xl flex items-center justify-center text-5xl font-bold transition-all duration-300 ${displayedNumber ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 scale-110' : 'bg-white/5 scale-100'}`}>
            {displayedNumber !== null && displayedNumber}
          </div>

          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the sequence (e.g. 1 2 3)"
            disabled={!gameStarted || showingSequence}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-400"
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-white/10 pt-4">
          <div className="flex gap-3 w-full justify-center">
            <Button
              onClick={handleStartGame}
              disabled={gameStarted && showingSequence}
              className={`px-6 gap-2 ${!gameStarted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' : 'bg-emerald-600'}`}
            >
              {!gameStarted ? (
                <>
                  <Zap className="h-4 w-4" />
                  Start Game
                </>
              ) : 'Restart Game'}
            </Button>

            <Button
              onClick={checkAnswer}
              disabled={!gameStarted || showingSequence}
              variant="secondary"
              className={`px-6 gap-2 ${gameStarted && !showingSequence ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white' : 'bg-slate-700/50 text-slate-300'}`}
            >
              <CheckCircle className="h-4 w-4" />
              Submit
            </Button>
          </div>

          {message && (
            <div className="rounded-lg p-3 text-center text-white/90 whitespace-pre-line bg-white/5 w-full animate-pulse">
              {message}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
