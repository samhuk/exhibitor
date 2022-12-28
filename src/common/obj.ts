export const deepSetAllPropsOnMatch = (objTruther: any, objToModify: any, val: (props: any[], path: string) => void, pathToHere?: string): any => {
  if (objTruther == null)
    return objToModify

  Object.keys(objTruther).forEach(prop => {
    const thisPath = pathToHere == null ? prop : `${pathToHere}.${prop}`
    if (objTruther[prop] === true) {
      const originalFn = objToModify[prop]
      objToModify[prop] = (...args: any[]) => {
        val(args, thisPath)
        originalFn(args)
      }
    }
    else if (typeof objTruther[prop] === 'object') {
      deepSetAllPropsOnMatch(objTruther[prop], objToModify[prop], val, thisPath)
    }
  })

  return objToModify
}
