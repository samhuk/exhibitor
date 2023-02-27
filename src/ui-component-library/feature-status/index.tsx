import React, { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'
import Button from '../button'
import { CLASS_NAME_PREFIX } from '../common'
import ExternalLink from '../external-link'

export enum FeatureStatus {
  ALPHA = 'Alpha',
  BETA = 'Beta',
}

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  status: FeatureStatus
  featureName: string
}

export const NAME = 'feature-status'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  featureName: '',
  status: FeatureStatus.BETA,
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
          offset: [0, 5],
        },
      },
    ],
  })
  const [show, setShow] = useState(false)

  useEffect(() => {
    // If we are not currently showing or there is not popper element then don't proceed
    if (!show || popperElement == null)
      return undefined

    // Else, start listening for the next click anywhere on the screen to potentially close the popper.
    const onPageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement // Convenient cast

      if (popperElement === target || popperElement.contains(target))
        return

      setShow(false)
    }
    setTimeout(() => document.addEventListener('click', onPageClick), 10)

    return () => {
      document.removeEventListener('click', onPageClick)
    }
  }, [show, popperElement])

  const onClick = () => {
    if (show)
      return

    setShow(true)
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...props} className={`${CLASS_NAME} ${props.className ?? ''}`}>
      <Button
        className={show ? 'active' : ''}
        ref={setReferenceElement}
        onClick={() => onClick()}
      >
        {props.status} feature
        <i className="fas fa-circle-info" />
      </Button>
      {show
        ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div className="tooltip" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <p>
              {props.featureName ?? DEFAULT_PROPS.featureName} is in <b>{props.status ?? DEFAULT_PROPS.status} status</b>,
              meaning that it is under active developmentand may have minor issues and missing functionality.
            </p>
            <p>
              If you would like something added or changed, head over to the&nbsp;
              <ExternalLink text="Exhibitor Discussion 💬" href="https://github.com/samhuk/exhibitor/discussions/categories/ideas" />.
            </p>
            <div className="arrow" ref={setArrowElement} style={styles.arrow} />
          </div>
        ) : null}
    </div>
  )
}

export default render
