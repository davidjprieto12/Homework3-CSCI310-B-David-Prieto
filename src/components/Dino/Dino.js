import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Dino.css";

const createCactus = () => {
  const height = 40 + Math.floor(Math.random() * 7);

  return {
    width: Math.round(height / 2),
    height,
    startX: 550 + Math.floor(Math.random() * 51),
    duration: 1.1 + Math.random() * 0.4,
  };
};

// TODO: Add 5 features
// 1. Highest Scores (DONE)
// 2. Skins (ONGOING)
// 3. Animations (DONE)
// 4. Shield
// 5. QOL - Game states, runup, randomization

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();
  const scoreRef = useRef(0);

  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([0, 0, 0])

  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cactusReady, setCactusReady] = useState(false);
  const [cactus, setCactus] = useState(null);

  const [message, setMessage] = useState("Press Space to Start!");

  const StartMessage = ({ displayedMessage }) => {
    return(
      <div className="start-message">
        <p>{displayedMessage}</p>
      </div>
    )
  }

  const Scoreboard = ({topScores}) => {
    let firstScore = topScores[0];
    let secondScore = topScores[1];
    let thirdScore = topScores[2];

    return(
      <div className="scoreboard">
          <h1>Today's Top Scores:</h1>
          <p className="score">1st: {firstScore} pts</p>
          <p className="score">2nd: {secondScore} pts</p>
          <p className="score">3rd: {thirdScore} pts</p>
      </div>
    )
  }

  const jump = useCallback((event) => {
    if (event.code !== "Space" || event.target.closest("button")) {
      return;
    }

    event.preventDefault();

    if (gameOver) {
      setGameRunning(false);
      setGameOver(false);
      setCactusReady(false);
      setMessage("Press Space to Start!");
      return;
    }

    if (!gameRunning) {
      setGameRunning(true);
      setCactusReady(false);
      setMessage("Go!");
      return;
    }

    if (dinoRef.current && !dinoRef.current.classList.contains("jump")) {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        dinoRef.current?.classList.remove("jump");
      }, 400);
    }
  }, [gameRunning, gameOver]);

  useEffect(() => {
    if (gameRunning && !gameOver && !cactusReady) {
      const difficulty = Math.min(scoreRef.current / 5000, 1);
      const baseDelay = 700 - difficulty * (700 - 200);
      const spawnDelay = baseDelay * (0.8 + Math.random() * 0.4);

      const cactusTimer = setTimeout(() => {
        setCactus(createCactus());
        setCactusReady(true);
      }, spawnDelay);

      return () => clearTimeout(cactusTimer);
    }
  }, [gameRunning, gameOver, cactusReady]);

  useEffect(() => {
    if (gameRunning && !gameOver) {
      const scoreTimer = setInterval(() => {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }, 10);

      return () => clearInterval(scoreTimer);
    }
  }, [gameRunning, gameOver]);

  useEffect(() => {
    if (gameRunning && !gameOver && cactusReady && cactus) {
      const collisionTimer = setInterval(function () {
        const dinoBounds = dinoRef.current?.getBoundingClientRect();
        const cactusBounds = cactusRef.current?.getBoundingClientRect();

        if (
          dinoBounds &&
          cactusBounds &&
          dinoBounds.right > cactusBounds.left &&
          dinoBounds.left < cactusBounds.right &&
          dinoBounds.bottom > cactusBounds.top &&
          dinoBounds.top < cactusBounds.bottom
        ) {
          const finalScore = scoreRef.current;
          setMessage("Game Over! Press Space to Reset. Your Score: " + finalScore);

          setTopScores((currentScores) =>
            [...currentScores, finalScore].sort((a, b) => b - a).slice(0, 3)
          );

          scoreRef.current = 0;
          setScore(0);
          setGameOver(true);
          clearInterval(collisionTimer);
        }
      }, 10);

      return () => clearInterval(collisionTimer);
    }
  }, [gameRunning, gameOver, cactusReady, cactus]);

  useEffect(() => {
    document.addEventListener("keydown", jump);
    return () => {
      document.removeEventListener("keydown", jump);
    };
  }, [jump]);

  return (
    <div className="dino-layout">
      <div className="game-content">
        <div className="game-title">
          <h1>Dino Game</h1>
        </div>

        <div className={`game ${gameRunning && !gameOver ? "running" : "not-running"} ${gameOver ? "game-over" : ""}`}>
          Score : {score}
          <div id="dino" ref={dinoRef}></div>
          {cactusReady && cactus && (
            <div
              id="cactus"
              ref={cactusRef}
              onAnimationEnd={() => setCactusReady(false)}
              style={{
                "--cactus-width": `${cactus.width}px`,
                "--cactus-height": `${cactus.height}px`,
                "--cactus-start": `${cactus.startX}px`,
                "--cactus-end": `-${cactus.width}px`,
                "--cactus-duration": `${cactus.duration}s`,
                backgroundSize: `${cactus.width}px ${cactus.height}px`,
              }}
            />
          )}
        </div>

        {(!gameRunning || gameOver || message === "Go!") && <div className="game-message"><StartMessage displayedMessage={message}/></div>}
      </div>

      <div className="sprite-selector" aria-label="Choose a dinosaur sprite set">
        <button type="button">Sprite Set 1</button>
        <button type="button">Sprite Set 2</button>
        <button type="button">Sprite Set 3</button>
      </div>

      <Scoreboard topScores={topScores}/>
    </div>
  );
}

export default Dino;
