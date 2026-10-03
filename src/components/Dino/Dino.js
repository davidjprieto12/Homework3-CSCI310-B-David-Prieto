import React, { useEffect, useRef, useState, useCallback } from "react";
import "./Dino.css";

// TODO: Add 5 features
// 1. Highest Scores
// 2. Skins
// 3. Shield
// 4. Biome / Obstacle Change
// 5. Fog

function Dino() {
  const dinoRef = useRef();
  const cactusRef = useRef();

  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [cactusReady, setCactusReady] = useState(false);
  const [message, setMessage] = useState("Press Space to Start!");

  const StartMessage = ({ displayedMessage }) => {
    return(
      <div className="start-message">
        <p>{displayedMessage}</p>
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
      return;
    }

    if (!!dinoRef.current && dinoRef.current.classList !== "jump") {
      dinoRef.current.classList.add("jump");
      setTimeout(function () {
        dinoRef.current.classList.remove("jump");
      }, 300);
    }
  }, [gameRunning, gameOver]);

  useEffect(() => {
    if (gameRunning && !gameOver) {
      const cactusTimer = setTimeout(() => {
        setCactusReady(true);
      }, 1000);

      setMessage("Go!");

      return () => clearTimeout(cactusTimer);
    }
  }, [gameRunning, gameOver]);

  useEffect(() => {
    if (gameRunning && !gameOver && cactusReady) {
      const isAlive = setInterval(function () {
        // get current dino Y position
        const dinoTop = parseInt(
          getComputedStyle(dinoRef.current).getPropertyValue("top")
        );

        // get current cactus X position
        let cactusLeft = parseInt(
          getComputedStyle(cactusRef.current).getPropertyValue("left")
        );

        // detect collision
        if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
          // collision
          setMessage("Game Over! Press Space to Reset. Your Score: " + score);
          setScore(0);
          setGameOver(true);
        } else {
          setScore((currentScore) => currentScore + 1);
        }
      }, 10);

      return () => clearInterval(isAlive);
    }
  }, [gameRunning, gameOver, cactusReady, score]);

  useEffect(() => {
    document.addEventListener("keydown", jump);
    return () => {
      document.removeEventListener("keydown", jump);
    };
  }, [jump]);

  return (
    <div>

    <div className={(gameRunning && !gameOver) ? "game" : "game not-running"}>
      Score : {score}
      <div id="dino" ref={dinoRef}></div>
      {cactusReady && <div id="cactus" ref={cactusRef}></div>}
    </div>

    {(!gameRunning || gameOver || cactusReady) && <StartMessage displayedMessage={message}/>}
    </div>
  );
}

export default Dino;
