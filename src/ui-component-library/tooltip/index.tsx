import React, { ReactNode, useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import { PropsOfReactComponent, ReactComponent } from '../../api/exhibit/types'
import { CLASS_NAME_PREFIX } from '../common'

export type Props<T extends ReactComponent = ReactComponent> = {
  className?: string
  referenceEl: ReactNode
  tooltipEl: T
  tooltipProps?: PropsOfReactComponent<T>
  onShowChange?: (showing: boolean) => void
  offset?: { x?: number, y?: number }
}

export const NAME = 'tooltip'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  referenceEl: undefined,
  tooltipEl: undefined,
  tooltipProps: undefined,
}

export const render = (props: Props) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement>(null)
  const [popperElement, setPopperElement] = useState<HTMLElement>(null)
  const [arrowElement, setArrowElement] = useState<HTMLElement>(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      {
        name: 'offset',
        options: {
          offset: [props.offset?.x ?? 0, props.offset?.y ?? 5],
        },
      },
      { name: 'preventOverflow', options: { altAxis: true, padding: 5 } },
    ],
  })
  const [show, setShow] = useState(false)

  const changeShow = (newShow: boolean) => {
    props.onShowChange?.(newShow)
    setShow(newShow)
  }

  useEffect(() => {
    // If we are not currently showing or there is not popper element then don't proceed
    if (!show || popperElement == null)
      return undefined

    // Else, start listening for the next click anywhere on the screen to potentially close the popper.
    const onPageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement // Convenient cast

      if (popperElement === target || popperElement.contains(target))
        return

      changeShow(false)
    }
    setTimeout(() => document.addEventListener('click', onPageClick), 10)

    return () => {
      document.removeEventListener('click', onPageClick)
    }
  }, [show, popperElement])

  const onClick = () => {
    if (show)
      return

    changeShow(true)
  }

  const TooltipBodyEl = props.tooltipEl

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className={`${props.className ?? ''} ${show ? ' active' : ''}`}
        ref={setReferenceElement}
        onClick={() => onClick()}
      >
        {props.referenceEl}
      </div>
      {show
        ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div className={`${CLASS_NAME} ${props.className ?? ''}`} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <div className="body"><TooltipBodyEl {...props.tooltipProps} /></div>
            <div className="arrow" ref={setArrowElement} style={styles.arrow} />
          </div>
        ) : null}
    </>
  )
}

export default render
