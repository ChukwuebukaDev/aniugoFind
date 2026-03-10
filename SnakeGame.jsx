import { useEffect, useRef, useState } from "react";

const GRID_SIZE = 20;
const CELL = 20;

const randomFood = () => ({
  x: Math.floor(Math.random() * GRID_SIZE),
  y: Math.floor(Math.random() * GRID_SIZE),
});

export default function SnakeGame() {
  const [snake, setSnake] = useState([
    { x: 8, y: 8 },
    { x: 7, y: 8 },
  ]);

  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(randomFood());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const highScore =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("snake-high-score")) || 0
      : 0;

  const speedRef = useRef(150);
  const lastMoveRef = useRef(0);
  const dirRef = useRef(direction);

  dirRef.current = direction;

  // Change direction (used by keyboard + mobile buttons)
  const changeDirection = (x, y) => {
    setDirection({ x, y });
  };

  // Keyboard control
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp":
          changeDirection(0, -1);
          break;
        case "ArrowDown":
          changeDirection(0, 1);
          break;
        case "ArrowLeft":
          changeDirection(-1, 0);
          break;
        case "ArrowRight":
          changeDirection(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Game loop
  useEffect(() => {
    let animation;

    const gameLoop = (time) => {
      if (gameOver) return;

      if (time - lastMoveRef.current > speedRef.current) {
        setSnake((prev) => {
          const head = prev[0];

          const newHead = {
            x: head.x + dirRef.current.x,
            y: head.y + dirRef.current.y,
          };

          // Wall collision
          if (
            newHead.x < 0 ||
            newHead.y < 0 ||
            newHead.x >= GRID_SIZE ||
            newHead.y >= GRID_SIZE
          ) {
            setGameOver(true);
            return prev;
          }

          // Self collision
          if (prev.some((s) => s.x === newHead.x && s.y === newHead.y)) {
            setGameOver(true);
            return prev;
          }

          let newSnake = [newHead, ...prev];

          // Food collision
          if (newHead.x === food.x && newHead.y === food.y) {
            setFood(randomFood());

            setScore((s) => {
              const newScore = s + 1;

              if (newScore > highScore) {
                localStorage.setItem("snake-high-score", newScore);
              }

              return newScore;
            });

            speedRef.current = Math.max(60, speedRef.current - 5);
          } else {
            newSnake.pop();
          }

          return newSnake;
        });

        lastMoveRef.current = time;
      }

      animation = requestAnimationFrame(gameLoop);
    };

    animation = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animation);
  }, [food, gameOver, highScore]);

  const restart = () => {
    setSnake([
      { x: 8, y: 8 },
      { x: 7, y: 8 },
    ]);
    setDirection({ x: 1, y: 0 });
    setFood(randomFood());
    setScore(0);
    setGameOver(false);
    speedRef.current = 150;
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>🐍 Snake Game</h2>

      <p>Score: {score}</p>
      <p>High Score: {highScore}</p>

      {gameOver && (
        <div>
          <h3>Game Over</h3>
          <button
            className="bg-emerald-600 p-2 text-white font-bold rounded-2xl mb-2 text-xs"
            onClick={restart}
          >
            Restart
          </button>
        </div>
      )}

      {/* Game Board */}
      <div
        className="rounded-4xl bg-black/80"
        style={{
          width: GRID_SIZE * CELL,
          height: GRID_SIZE * CELL,
          margin: "auto",
          position: "relative",
        }}
      >
        {/* Food */}
        <div
          style={{
            position: "absolute",
            width: CELL,
            height: CELL,
            background: "red",
            borderRadius: "50%",
            left: food.x * CELL,
            top: food.y * CELL,
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: CELL,
              height: CELL,
              background: i === 0 ? "#00ff88" : "#22c55e",
              left: segment.x * CELL,
              top: segment.y * CELL,
              borderRadius: 4,
            }}
          />
        ))}
      </div>

      {/* Mobile Controls */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => changeDirection(0, -1)}
          className="bg-gray-800 text-white p-3 rounded-xl"
        >
          ⬆️
        </button>

        <div style={{ display: "flex", gap: 20 }}>
          <button
            onClick={() => changeDirection(-1, 0)}
            className="bg-gray-800 text-white p-3 rounded-xl"
          >
            ⬅️
          </button>

          <button
            onClick={() => changeDirection(0, 1)}
            className="bg-gray-800 text-white p-3 rounded-xl"
          >
            ⬇️
          </button>

          <button
            onClick={() => changeDirection(1, 0)}
            className="bg-gray-800 text-white p-3 rounded-xl"
          >
            ➡️
          </button>
        </div>
      </div>
    </div>
  );
}