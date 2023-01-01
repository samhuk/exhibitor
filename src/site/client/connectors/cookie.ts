export const getCookieValue = (name: string) => document.cookie
  .split('; ')
  .find(row => row.startsWith(`${name}=`))
  ?.split('=')[1]

const createDatePlusYears = (numYears: number) => {
  const date = new Date()
  date.setFullYear(new Date().getFullYear() + numYears)
  return date
}

export const setCookieValue = (name: string, value: string, dateExpires?: Date | number) => {
  document.cookie = `${name}=${value}; expires=${dateExpires ?? createDatePlusYears(1)}; path=/; SameSite=Lax`
}
