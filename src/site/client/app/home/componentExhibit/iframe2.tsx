import React, { forwardRef, useRef } from 'react'

type BaseProps = React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>

/**
 * This has lots of research:
 *
 * * For nicely applying styles:
 *     https://stackoverflow.com/questions/57666672/react-ensure-css-loaded-before-iframe-renders
 * * For the onload workaround for firefox bug with react's `ref`:
 *     https://github.com/adrid/slate/blob/c9ca4902de8f9c5504dba1ad40e9b34f2a3f28b9/site/examples/iframe.tsx#L107
 */
export const render = forwardRef((props: BaseProps, ref) => {
  const iframeElRef = useRef<HTMLIFrameElement>()

  const onLoad = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    // eslint-disable-next-line react/prop-types
    props?.onLoad?.(e)

    if (iframeElRef.current != null)
      iframeElRef.current.style.visibility = 'visible'
  }

  return (
    // eslint-disable-next-line jsx-a11y/iframe-has-title
    <iframe
      ref={el => {
        iframeElRef.current = el
        if (ref == null)
          return
        // Mimick React's internal ref assignment behavior
        if (typeof ref === 'function')
          ref(el)
        else
          ref.current = el
      }}
      style={{ visibility: 'hidden' }}
      onLoad={onLoad}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  )
})

export default render
