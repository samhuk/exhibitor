import { exec, ExecException } from 'child_process'
import { log } from '../logging'

export const npmInstallPackage = (
  packageName: string,
  isDevDep: boolean = false,
) => new Promise<{ execError: ExecException } | null>((res, rej) => {
  exec(`npm i ${isDevDep ? '--save-dev' : '--save'} ${packageName}`, err => {
    if (err != null) {
      log(JSON.stringify(err))
      rej(err)
    }
    else {
      res(null)
    }
  })
})
