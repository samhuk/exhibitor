import React, { useRef, useState } from 'react'
import { waitForNotNullish } from '../../common/function'
import Button from '../button'
import { CLASS_NAME_PREFIX } from '../common'

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

type Props<T extends any = any> = {
  label?: string
  options: SelectOption<T>[]
  onChange?: (value: T, option: SelectOption<T>) => void
  selectedOption?: SelectOption<T>
  className?: string
}

export const NAME = 'select'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  options: [],
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
    y: parentRect.y + parentRect.height,
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

const NoOptionsEl = () => (
  <div className="no-options">[No options]</div>
)

export const render = <T extends any = any>(props: Props<T>) => {
  const [expanded, setExpanded] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption>(props.selectedOption)
  const elRef = useRef<HTMLDivElement>()
  const optionsElRef = useRef<HTMLDivElement>()
  const clickHandler = useRef<(e: MouseEvent) => void>()

  /* If a selected option has been provided in the props, then we will ensure
   * that our selected option stays up-to-date with the one provided.
   *
   * If it isn't provided, then we have complete free-will and will essentially
   * be using only our own useState to store the currently selected option.
   */
  const isSelectedOptionProvided = 'selectedOption' in props
  if (isSelectedOptionProvided && selectedOption !== props.selectedOption)
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
        const wasClickInsideTextAndButtonEl = clickedEl === elRef.current || elRef.current.contains(clickedEl)
        if (wasClickInsideTextAndButtonEl)
          return

        const wasClickInsideOptionsEl = optionsEl.contains(clickedEl)
        if (!wasClickInsideOptionsEl) {
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

  const options = props.options ?? DEFAULT_PROPS.options

  return (
    <div className="cl-select">
      {props.label != null
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        ? <label>{props.label}</label>
        : null}
      <div className="text-and-button" ref={elRef}>
        <input type="text" value={displayText} title={displayText} onFocus={() => open()} />
        <Button
          className="toggle-expand-button"
          onClick={toggleExpanded}
          title={expanded ? 'Hide available options' : 'Show available options'}
          icon={{
            name: expanded ? 'angle-up' : 'angle-down',
          }}
        />
      </div>
      {expanded
        ? (
          <div className="options" ref={optionsElRef}>
            {options.length > 0
              ? (props.options ?? DEFAULT_PROPS.options).map(o => (
                <div className="option">
                  {o.displayText}
                </div>
              ))
              : <NoOptionsEl />}
          </div>
        )
        : null}
    </div>
  )
}

export default render
