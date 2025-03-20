import { useState, useEffect } from 'react'
import Card from './Card'
import Button from './Button'

const images = ['🍎', '🍌', '🍒', '🍇', '🍍', '🍑'] // 5 unique images
const shuffledCards = () => {
  const pairs = [...images, ...images].slice(0, 12) // Ensure 3x3 grid
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((img, index) => ({
      id: index,
      img,
      flipped: false,
      matched: false,
    }))
}

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffledCards)
  const [selected, setSelected] = useState<number[]>([])
  const [timer, setTimer] = useState(180)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (timer > 0 && !gameOver) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(countdown)
    } else {
      setGameOver(true)
    }
  }, [timer, gameOver])

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected
      if (cards[first].img === cards[second].img) {
        setCards((prev) =>
          prev.map((card, index) => (index === first || index === second ? { ...card, matched: true } : card)),
        )
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, index) => (index === first || index === second ? { ...card, flipped: false } : card)),
          )
        }, 1000)
      }
      setSelected([])
    }
  }, [selected, cards])

  const handleFlip = (index: number) => {
    if (cards[index].flipped || selected.length === 2 || gameOver) return
    const newCards = cards.map((card, i) => (i === index ? { ...card, flipped: true } : card))
    setCards(newCards)
    setSelected([...selected, index])
  }

  const resetGame = () => {
    setCards(shuffledCards)
    setSelected([])
    setTimer(180)
    setGameOver(false)
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Memory Game</h1>
      <p className="text-lg">Time left: {timer}s</p>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {cards.map((card, index) => (
          <Card key={card.id} card={card} onClick={() => handleFlip(index)} />
        ))}
      </div>
      {gameOver && <p className="text-red-500 mt-4">Game Over!</p>}
      <Button onClick={resetGame}>Restart</Button>
    </div>
  )
}
