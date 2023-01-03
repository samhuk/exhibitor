import React, { useState } from 'react'
import { usePopper } from 'react-popper'

export const render = () => {
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const [arrowElement, setArrowElement] = useState(null)
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
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

  return (
    <div className="about">
      <button className={`info-button${show ? ' active' : ''}`} type="button" ref={setReferenceElement} onClick={() => setShow(!show)}>
        <i className="fas fa-circle-info" />
      </button>

      {show
        ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div className="tooltip" ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            React: v{React.version}
            <div className="arrow" ref={setArrowElement} style={styles.arrow} />
          </div>
        ) : null}

    </div>
  )
}

export default render
