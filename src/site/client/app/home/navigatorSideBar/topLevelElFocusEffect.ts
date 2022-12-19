import { MutableRefObject, EffectCallback } from 'react'

/**
 * This makes `elRef` pseudo-focusable, which mimics vscode's navigator side-bar
 * behaviour.
 */
export const createTopLevelElFocusEffect = (
  el: HTMLElement,
  isElFocusRef: MutableRefObject<boolean>,
): EffectCallback => () => {
  if (el == null)
    return () => undefined

  const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(el.querySelectorAll('a, button'))

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (!e.shiftKey && isElFocusRef.current) {
        focusableElements[0]?.focus()
        e.preventDefault()
      }
      el.classList.remove('focused')
      isElFocusRef.current = false
      return
    }

    const isUp = e.key === 'ArrowUp'
    const isDown = e.key === 'ArrowDown'
    if (!isUp && !isDown)
      return

    if (!(isElFocusRef.current || el.contains(document.activeElement)))
      return

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
    const isEl = e.target === el
    isElFocusRef.current = isEl
    el.classList.toggle('focused', isEl)
  }

  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeyDown)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeyDown)
  }
}
