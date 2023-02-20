import React, { useRef, useState } from 'react'
import { waitForNotNullish } from '../../../../common/function'

export type SelectOption<T extends any = any> = {
  displayText: string
  value: T
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const determineDropdownRect = (
  parentEl: HTMLElement,
  dropdownEl: HTMLElement,
): Rect => {
  const parentRect = { x: parentEl.offsetLeft, y: parentEl.offsetTop, height: parentEl.clientHeight, width: parentEl.clientWidth }
  const dropdownRect = dropdownEl.getBoundingClientRect()
  const width = Math.max(parentRect.width, dropdownRect.width) + 2
  return {
    x: parentRect.x,
    y: parentRect.y + parentRect.height + 1,
    width,
    height: dropdownRect.height,
  }
}

const applyDropdownRect = (dropdownEl: HTMLElement, rect: Rect) => {
  dropdownEl.style.left = `${rect.x}px`
  dropdownEl.style.top = `${rect.y}px`
  dropdownEl.style.width = `${rect.width}px`
  dropdownEl.style.height = `${rect.height}px`
}

export const render = <T extends any = any>(props: {
  options: SelectOption<T>[]
  onChange?: (value: T, option: SelectOption<T>) => void
  selectedOption?: SelectOption<T>
  className?: string
}) => {
  const [expanded, setExpanded] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption>(props.selectedOption)
  const elRef = useRef<HTMLDivElement>()
  const optionsElRef = useRef<HTMLDivElement>()
  const clickHandler = useRef<(e: MouseEvent) => void>()

  if (selectedOption !== props.selectedOption)
    setSelectedOption(props.selectedOption)

  const updateSelectedOption = (newOption: SelectOption) => {
    setSelectedOption(newOption)
    props.onChange?.(newOption.value, newOption)
  }

  const close = () => {
    document.removeEventListener('click', clickHandler.current)
    setExpanded(false)
    optionsElRef.current = undefined
  }

  const open = () => {
    setExpanded(true)
    waitForNotNullish(() => optionsElRef.current, { pollingIntervalMs: 10 }).then(optionsEl => {
      const dropdownRect = determineDropdownRect(elRef.current, optionsEl)
      applyDropdownRect(optionsEl, dropdownRect)
      optionsEl.style.visibility = 'visible'

      clickHandler.current = e => {
        const clickedEl = e.target as Node
        if (!optionsEl.contains(clickedEl)) {
          close()
          return
        }

        const optionEls = optionsEl.children
        let clickedOptionElIndex = -1
        for (let i = 0; i < optionEls.length; i += 1) {
          const optionEl = optionEls[i]
          if (optionEl === clickedEl || optionEl.contains(clickedEl)) {
            clickedOptionElIndex = i
            break
          }
        }

        if (clickedOptionElIndex !== -1) {
          updateSelectedOption(props.options[clickedOptionElIndex])
          close()
        }
      }
      document.addEventListener('click', clickHandler.current)
    })
  }

  const toggleExpanded = () => {
    if (expanded)
      close()
    else
      open()
  }

  const displayText = selectedOption?.displayText ?? ''

  return (
    <div className="cl-select" ref={elRef}>
      <input type="text" value={displayText} title={displayText} />
      <button
        className="toggle-expand-button"
        type="button"
        onClick={toggleExpanded}
        title={expanded ? 'Hide available options' : 'Show available options'}
      >
        <i className={expanded ? 'fas fa-angle-up' : 'fas fa-angle-down'} />
      </button>
      {expanded
        ? (
          <div className="options" ref={optionsElRef}>
            {props.options.map(o => (
              <div className="option">
                {o.displayText}
              </div>
            ))}
          </div>
        )
        : null}
    </div>
  )
}

export default render
