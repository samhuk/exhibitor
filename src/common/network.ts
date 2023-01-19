const VALID_IP_ADDRESS_REGEX = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/

// eslint-disable-next-line no-useless-escape
const VALID_HOSTNAME_REGEX = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/

/**
 * Determines if the given string represents a valid host,
 * i.e. either a hostname or an IP address.
 */
export const isValidHost = (s: string): boolean => (
  VALID_HOSTNAME_REGEX.test(s) || VALID_IP_ADDRESS_REGEX.test(s)
)
