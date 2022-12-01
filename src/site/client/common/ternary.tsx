import React from 'react'

/**
 * Render either `t` or `f` element depending on whether `bool` is true/false, respectively.
 *
 * @example
 * <Ternary bool={isLoading} t={<LoadingSpinner />} f={<MyPage />}
 */
export const render = (props: {
  bool: boolean,
  t: React.ReactNode,
  f?: React.ReactNode,
// eslint-disable-next-line react/jsx-no-useless-fragment
}): JSX.Element => (props.bool ? <>{props.t}</> : (props.f != null ? <>{props.f}</> : null))

export default render
