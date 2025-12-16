/**
 * MySQL/MariaDB Client Utilities
 *
 * Provides compatibility helpers for MySQL CLI tools that work with both
 * MySQL and MariaDB clients.
 */

/**
 * Get SSL flags compatible with both MySQL and MariaDB clients
 *
 * MariaDB client (default on Debian Trixie) uses --skip-ssl
 * MySQL 8.0+ client uses --ssl-mode=DISABLED
 *
 * Since the Docker image uses Debian's default-mysql-client (MariaDB),
 * we use --skip-ssl which is supported by both.
 *
 * @returns SSL disable flag string for mysqldump/mysql commands
 */
export function getMysqlSslFlags(): string {
  return '--skip-ssl'
}

/**
 * Build common mysqldump options
 *
 * @param host - Database host
 * @param port - Database port
 * @param user - Database user
 * @param password - Database password
 * @returns Array of mysqldump option strings
 */
export function getMysqldumpOptions(
  host: string,
  port: string | number,
  user: string,
  password: string
): string[] {
  return [
    `--host=${host}`,
    `--port=${port}`,
    `--user=${user}`,
    `--password='${password}'`,
    getMysqlSslFlags(),
    '--single-transaction',
    '--routines',
    '--triggers',
    '--events',
  ]
}

/**
 * Build common mysql client options
 *
 * @param host - Database host
 * @param port - Database port
 * @param user - Database user
 * @param password - Database password
 * @returns Array of mysql option strings
 */
export function getMysqlClientOptions(
  host: string,
  port: string | number,
  user: string,
  password: string
): string[] {
  return [
    `-h${host}`,
    `-P${port}`,
    `-u${user}`,
    `-p'${password}'`,
    getMysqlSslFlags(),
  ]
}
