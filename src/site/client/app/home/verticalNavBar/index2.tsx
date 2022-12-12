import React, { EffectCallback, MutableRefObject, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

type NavBarState = {
  expandedPaths: string[]
}

const saveNavBarState = (state: NavBarState) => {
  const date = new Date().setFullYear(new Date().getFullYear() + 1)
  document.cookie = `navbar=${JSON.stringify(state)}; expires=${date}; path=/; SameSite=Lax`
}

const restoreNavBarState = (): NavBarState => {
  const rawValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('navbar='))
    ?.split('=')[1]
  if (rawValue == null)
    return { expandedPaths: [] }
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    return {
      expandedPaths: [...new Set(parsed.expandedPaths)] ?? [],
    }
  }
  catch {
    return { expandedPaths: [] }
  }
}

const createTopLevelElFocusEffect = (
  elRef: MutableRefObject<HTMLDivElement>,
  isElFocusRef: MutableRefObject<boolean>,
): EffectCallback => () => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (!e.shiftKey && isElFocusRef.current) {
        const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(elRef.current.querySelectorAll('a, button'))
        focusableElements[0]?.focus()
        e.preventDefault()
      }
      elRef.current.classList.remove('focused')
      isElFocusRef.current = false
      return
    }

    const isUp = e.key === 'ArrowUp'
    const isDown = e.key === 'ArrowDown'
    if (!isUp && !isDown)
      return

    if (!(isElFocusRef.current || elRef.current.contains(document.activeElement)))
      return

    const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(elRef.current.querySelectorAll('a, button'))

    let focusedElementIndex = 0
    for (let i = 0; i < focusableElements.length; i += 1) {
      if (focusableElements[i] === document.activeElement) {
        focusedElementIndex = i
        break
      }
    }

    const focusedElementIndexChange = isUp && focusedElementIndex > 0
      ? -1
      : isDown && focusedElementIndex < focusableElements.length
        ? 1
        : 0
    focusableElements[focusedElementIndex + focusedElementIndexChange]?.focus()
  }

  const onClick = (e: MouseEvent) => {
    const isEl = e.target === elRef.current
    isElFocusRef.current = isEl
    elRef.current.classList.toggle('focused', isEl)
  }

  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeyDown)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeyDown)
  }
}

export const Render = () => {
  // Restore the nav bar state from cookies once. I think we can just do this in the redux store code instead.
  const hasRestoredNavBarState = useRef(false)
  const initialState = !hasRestoredNavBarState.current ? restoreNavBarState() : null
  hasRestoredNavBarState.current = true

  const [expandedPaths, setExpandedPaths] = useState<string[]>(initialState?.expandedPaths)

  const el = useRef<HTMLDivElement>()
  const isElFocus = useRef(false)

  useEffect(createTopLevelElFocusEffect(el, isElFocus), [])

  return (
    <div className="navigator-side-bar" ref={el}>
      {Object.values(exh.nodes).map(n => (
        <div style={{
          paddingLeft: n.pathComponents.length * 15,
        }}
        >{n.path}
        </div>
      ))}
    </div>
  )
}

export const render = () => {
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  const loadingState = useAppSelector(s => s.componentExhibits.loadingState)

  if (readyState)
    return <Render />

  if (loadingState === LoadingState.FETCHING)
    return <div className="vertical-nav-bar">Loading exhibits...</div>

  if (loadingState === LoadingState.FAILED)
    return <div className="vertical-nav-bar">Loading exhibits failed</div>

  return null
}

export default render
