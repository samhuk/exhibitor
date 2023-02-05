import { ReactNode } from 'react'

export type NavItemOptions = {
  text?: string
  title?: string
  iconName?: string
  active?: boolean
  onClick: () => void
  additionalElement?: ReactNode
}
