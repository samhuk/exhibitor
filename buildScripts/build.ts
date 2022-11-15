import { buildClient, buildServer } from '.'

buildClient().then(() => buildServer())
