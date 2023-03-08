import { modifyFileText } from './fileModifier'

const exampleYamlText = `version: '3'

services:
  client:
    container_name: client
    build:
      context: ./client
    ports:
    - \${config.demo.httpPort}:80
    # START config.demo.enableHttps
    - "\${config.demo.httpsPort}:443"
    volumes:
    - \${config.demo.certDir}/www:/var/www/certbot/:ro
    - \${config.demo.certDir}/conf/:/etc/nginx/ssl/:ro
  certbot:
    image: certbot/certbot:latest
    volumes:
      - \${config.demo.certDir}/www/:/var/www/certbot/:rw
      - \${config.demo.certDir}/conf/:/etc/letsencrypt/:rw
  # END config.demo.enableHttps
  api:
    container_name: api
    user: node
    build:
      context: ./server
    volumes:
    - ../../:/mnt
    environment:
    - EXH_DEMO=true
    - EXH_VERBOSE=true
    - EXH_SITE_SERVER_HOST=0.0.0.0
    - EXH_SITE_SERVER_PORT=80
    ports:
    - "4001:80"`

describe('cli/commands/demo/fileModifier', () => {
  describe('modify', () => {
    const fn = modifyFileText
    test('enable section', () => {
      const result = fn(exampleYamlText, {
        sectionToggles: {
          'config.demo.enableHttps': true,
        },
      })

      expect(result).toBe(`version: '3'

services:
  client:
    container_name: client
    build:
      context: ./client
    ports:
    - \${config.demo.httpPort}:80
    - "\${config.demo.httpsPort}:443"
    volumes:
    - \${config.demo.certDir}/www:/var/www/certbot/:ro
    - \${config.demo.certDir}/conf/:/etc/nginx/ssl/:ro
  certbot:
    image: certbot/certbot:latest
    volumes:
      - \${config.demo.certDir}/www/:/var/www/certbot/:rw
      - \${config.demo.certDir}/conf/:/etc/letsencrypt/:rw
  api:
    container_name: api
    user: node
    build:
      context: ./server
    volumes:
    - ../../:/mnt
    environment:
    - EXH_DEMO=true
    - EXH_VERBOSE=true
    - EXH_SITE_SERVER_HOST=0.0.0.0
    - EXH_SITE_SERVER_PORT=80
    ports:
    - "4001:80"`)
    })

    test('disable section', () => {
      const result = fn(exampleYamlText, {
        sectionToggles: {
          'config.demo.enableHttps': false,
        },
      })

      expect(result).toBe(`version: '3'

services:
  client:
    container_name: client
    build:
      context: ./client
    ports:
    - \${config.demo.httpPort}:80
  api:
    container_name: api
    user: node
    build:
      context: ./server
    volumes:
    - ../../:/mnt
    environment:
    - EXH_DEMO=true
    - EXH_VERBOSE=true
    - EXH_SITE_SERVER_HOST=0.0.0.0
    - EXH_SITE_SERVER_PORT=80
    ports:
    - "4001:80"`)
    })

    test('full test', () => {
      const result = fn(exampleYamlText, {
        sectionToggles: {
          'config.demo.enableHttps': true,
        },
        parameters: {
          'config.demo.httpPort': 80,
          'config.demo.httpsPort': 443,
          'config.demo.certDir': './certbot',
        },
      })

      expect(result).toBe(`version: '3'

services:
  client:
    container_name: client
    build:
      context: ./client
    ports:
    - 80:80
    - "443:443"
    volumes:
    - ./certbot/www:/var/www/certbot/:ro
    - ./certbot/conf/:/etc/nginx/ssl/:ro
  certbot:
    image: certbot/certbot:latest
    volumes:
      - ./certbot/www/:/var/www/certbot/:rw
      - ./certbot/conf/:/etc/letsencrypt/:rw
  api:
    container_name: api
    user: node
    build:
      context: ./server
    volumes:
    - ../../:/mnt
    environment:
    - EXH_DEMO=true
    - EXH_VERBOSE=true
    - EXH_SITE_SERVER_HOST=0.0.0.0
    - EXH_SITE_SERVER_PORT=80
    ports:
    - "4001:80"`)
    })
  })
})
