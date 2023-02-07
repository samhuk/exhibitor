import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter'
import { createNodeIntercomClient } from '../../../../intercom/client/node'
import { IntercomClient } from '../../../../intercom/client/types'
import { IntercomMessageType } from '../../../../intercom/message/types'
import { IntercomIdentityType } from '../../../../intercom/types'

type Options = {
  intercomHost: string
  intercomPort: number
}

class IntercomReporter implements Reporter {
  intercomClient: IntercomClient

  constructor(private readonly options: Options) {
    this.intercomClient = createNodeIntercomClient({
      host: this.options.intercomHost,
      port: this.options.intercomPort,
      enableLogging: true,
      identityType: IntercomIdentityType.SITE_SERVER,
    })

    this.intercomClient.connect()
  }

  sendProgressUpdate(msg: string) {
    this.intercomClient.send({
      type: IntercomMessageType.TEST_PROGRESS_UPDATE,
      to: IntercomIdentityType.SITE_CLIENT,
      data: msg,
    })
  }

  async onBegin(config: FullConfig, suite: Suite) {
    this.sendProgressUpdate(`Starting the run with ${suite.allTests().length} tests`)
  }

  onTestBegin(test: TestCase, result: TestResult) {
    this.sendProgressUpdate(`Starting test ${test.title}`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.sendProgressUpdate(`Finished test '${test.title}': ${result.status}`)
  }

  onEnd(result: FullResult) {
    this.sendProgressUpdate(`Finished the run: ${result.status}`)
  }
}

export default IntercomReporter
