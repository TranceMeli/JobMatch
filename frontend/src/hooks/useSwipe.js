import { useState, useRef, useCallback, createRef } from 'react'

export function useSwipe(cards) {
  const [currentIndex, setCurrentIndex] = useState(cards.length - 1)
  const [liked, setLiked]   = useState([])
  const [passed, setPassed] = useState([])

  const childRefs = useRef(
    Array(cards.length).fill(0).map(() => createRef())
  )

  const canSwipe = currentIndex >= 0

  const swipe = useCallback(
    async (dir) => {
      if (!canSwipe) return
      await childRefs.current[currentIndex].current.swipe(dir)
    },
    [canSwipe, currentIndex]
  )

  const onSwipe = useCallback(
    (dir, card) => {
      if (dir === 'right' || dir === 'up') {
        setLiked((prev) => [...prev, card.id])
      } else {
        setPassed((prev) => [...prev, card.id])
      }
      setCurrentIndex((prev) => prev - 1)
    },
    []
  )

  const reset = useCallback(() => {
    setCurrentIndex(cards.length - 1)
    setLiked([])
    setPassed([])
  }, [cards.length])

  return { currentIndex, liked, passed, childRefs, canSwipe, swipe, onSwipe, reset }
}