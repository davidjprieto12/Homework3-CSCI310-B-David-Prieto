import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Dino.css";
import defaultSprite from "./img/default-sprites/dino-default.png";
import jockeySprite from "./img/jockey-sprites/jockey-def-run1.png"
import surferSprite from "./img/surfer-sprites/surfer-def-run1.png"

// Task: Add 5 features
// 1. Scoreboard / Highest Scores
// 2. Skins
// 3. Animations
// 4. Game State - Start & Game Over, Run Up, Message
// 5. Difficulty / Randomization - Cactus Size / Frequency Variation, Speed Increases with Score
// Bonus: Stylization - Updated the default icon/page title, implemented a pixel font, added more color to the page

function Dino() {
  // References for the dino, cactus, and score (in starter code)
  const dinoRef = useRef();
  const cactusRef = useRef();
  const scoreRef = useRef(0);

  // State hooks:

  // For score / scoreboard:
  const [score, setScore] = useState(0);
  const [topScores, setTopScores] = useState([0, 0, 0, 0, 0])

  // Game state:
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cactusReady, setCactusReady] = useState(false);
  const [cactus, setCactus] = useState(null);

  // Message & visuals:
  const [message, setMessage] = useState("Press Space to Start!");
  const [skin, setSkin] = useState("default")

  // Changes the selected skin based on the button argument
  const selectSkin = (event, selectedSkin) => {
    setSkin(selectedSkin);
    if (event.detail > 0) {
      event.currentTarget.blur();
    }
  };

  // Defines how the StartMessage is displayed
  const StartMessage = ({ displayedMessage }) => {
    return(
      <div className="start-message">
        <p style={{"font-size": `18px`}}>{displayedMessage}</p>
      </div>
    )
  }

  // Defines how the scoreboard is displayed in relation to the topScores hook
  const Scoreboard = ({topScores}) => {
    let firstScore = topScores[0];
    let secondScore = topScores[1];
    let thirdScore = topScores[2];
    let fourthScore = topScores[3];
    let fifthScore = topScores[4];

    return(
      <div className="scoreboard">
          <p className="subheader">Today's Top Scores:</p>
          <p className="score" style={{"color": `#D4AF37`}}>1st: {firstScore} pts</p>
          <p className="score" style={{"color": `#909090`}}>2nd: {secondScore} pts</p>
          <p className="score" style={{"color": `#CD7F32`}}>3rd: {thirdScore} pts</p>
          <p className="score">4th: {fourthScore} pts</p>
          <p className="score">5th: {fifthScore} pts</p>
      </div>
    )
  }

  // Defines jump definition based on game state
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

  // Cactus sizing / speed is random and tied to the current score
  const createCactus = () => {
    const height = 30 + Math.floor(Math.random() * 20);
    const difficulty = Math.min(scoreRef.current / 5000, 1);

    return {
      width: Math.round(height / 2),
      height,
      startX: 550 + Math.floor(Math.random() * 51),
      duration: (1.2 - difficulty) + Math.random() * 0.4,
    };
  };

  // Cactus spawning is also random and tied to current score
  useEffect(() => {
    if (gameRunning && !gameOver && !cactusReady) {
      const difficulty = Math.min(scoreRef.current / 5000, 1);
      const baseDelay = 600 - difficulty * (700 - 200);
      let spawnDelay = baseDelay * (0.8 + Math.random() * 0.4);

      const cactusTimer = setTimeout(() => {
        setCactus(createCactus());
        setCactusReady(true);
      }, spawnDelay);

      return () => clearTimeout(cactusTimer);
    }
  }, [gameRunning, gameOver, cactusReady]);

  // Updates the score reference when the game ends
  useEffect(() => {
    if (gameRunning && !gameOver) {
      const scoreTimer = setInterval(() => {
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }, 10);

      return () => clearInterval(scoreTimer);
    }
  }, [gameRunning, gameOver]);

  // Handles collision checks / scoreboard updating
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
            [...currentScores, finalScore].sort((a, b) => b - a).slice(0, 5)
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

  // If user presses space, then "jump"
  useEffect(() => {
    document.addEventListener("keydown", jump);
    return () => {
      document.removeEventListener("keydown", jump);
    };
  }, [jump]);

  // Return all components in the window as such (primary return statement):
  return (
    <div className="dino-layout">
      <div className="game-content">
        <div className="game-title">
          <h1>Dino Game</h1>
        </div>

        <div className={`game ${gameRunning && !gameOver ? "running" : "not-running"} ${gameOver ? "game-over" : ""}`}>
          Score : {score}
          <div id="dino" className={`skin-${skin}`} ref={dinoRef}></div>
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

      <div className="sprite-selector">
        <p className="subheader">Skins:</p>
        <div className="sprites-container">
          <div className="skin-option">
            <img src={defaultSprite} alt="Default Sprite" width="75" height="75" />
            <button type="button" className="skin-button default-button" onClick={(event) => selectSkin(event, "default")}>Default Dino</button>
          </div>

          <div className="skin-option">
            <img src={jockeySprite} alt="Jockey Sprite" width="75" height="75" />
            <button type="button" className="skin-button jockey-button" onClick={(event) => selectSkin(event, "jockey")}>Jockey Dino</button>
          </div>

          <div className="skin-option">
            <img src={surferSprite} alt="Surfer Sprite" width="75" height="75" />
            <button type="button" className="skin-button surfer-button" onClick={(event) => selectSkin(event, "surfer")}>Surf Dino</button>
          </div>
        </div>
      </div>
      <Scoreboard topScores={topScores}/>
    </div>
  );
}

export default Dino;
