import { useEffect } from 'react'

// Mock animations for stability with React 19
export function useFadeInUp(delay = 0) {
  return {}
}

export function usePressScale(toScale = 0.96) {
  return { animatedStyle: {}, onPressIn: () => {}, onPressOut: () => {} }
}

export function useStaggerFadeIn(index: number) {
  return {}
}

export function useTabScale(focused: boolean) {
  return { opacity: focused ? 1 : 0.6 }
}
