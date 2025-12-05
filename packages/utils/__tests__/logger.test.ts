import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Logger, LogLevel, createLogger, getLogger } from '../src/logger'

describe('Logger', () => {
  // Mock console methods
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  describe('constructor', () => {
    it('should create logger with default config', () => {
      const logger = new Logger()
      expect(logger).toBeInstanceOf(Logger)
    })

    it('should create logger with custom config', () => {
      const logger = new Logger({
        level: LogLevel.DEBUG,
        prefix: 'TEST',
        timestamp: true
      })
      expect(logger).toBeInstanceOf(Logger)
    })
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const logger1 = Logger.getInstance()
      const logger2 = Logger.getInstance()
      expect(logger1).toBe(logger2)
    })
  })

  describe('setLevel', () => {
    it('should set log level', () => {
      const logger = new Logger()
      logger.setLevel(LogLevel.ERROR)

      logger.info('info message')
      expect(consoleLogSpy).not.toHaveBeenCalled()

      logger.error('error message')
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })

  describe('setVerbose', () => {
    it('should enable debug level when verbose is true', () => {
      const logger = new Logger()
      logger.setVerbose(true)

      logger.debug('debug message')
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should set info level when verbose is false', () => {
      const logger = new Logger({ level: LogLevel.DEBUG })
      logger.setVerbose(false)

      consoleLogSpy.mockClear()
      logger.debug('debug message')
      expect(consoleLogSpy).not.toHaveBeenCalled()

      logger.info('info message')
      expect(consoleLogSpy).toHaveBeenCalled()
    })
  })

  describe('log levels', () => {
    describe('error', () => {
      it('should log error messages', () => {
        const logger = new Logger({ level: LogLevel.ERROR })
        logger.error('error message')
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] error message')
        )
      })

      it('should log error with additional args', () => {
        const logger = new Logger()
        const errorObj = new Error('test error')
        logger.error('error message', errorObj)
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] error message'),
          errorObj
        )
      })

      it('should always be logged regardless of level', () => {
        const logger = new Logger({ level: LogLevel.ERROR })
        logger.error('error message')
        expect(consoleErrorSpy).toHaveBeenCalled()
      })
    })

    describe('warn', () => {
      it('should log warning messages when level is WARN or higher', () => {
        const logger = new Logger({ level: LogLevel.WARN })
        logger.warn('warning message')
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('[WARN] warning message')
        )
      })

      it('should not log warning when level is ERROR', () => {
        const logger = new Logger({ level: LogLevel.ERROR })
        logger.warn('warning message')
        expect(consoleWarnSpy).not.toHaveBeenCalled()
      })
    })

    describe('info', () => {
      it('should log info messages when level is INFO or higher', () => {
        const logger = new Logger({ level: LogLevel.INFO })
        logger.info('info message')
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO] info message')
        )
      })

      it('should not log info when level is WARN', () => {
        const logger = new Logger({ level: LogLevel.WARN })
        logger.info('info message')
        expect(consoleLogSpy).not.toHaveBeenCalled()
      })
    })

    describe('debug', () => {
      it('should log debug messages when level is DEBUG or higher', () => {
        const logger = new Logger({ level: LogLevel.DEBUG })
        logger.debug('debug message')
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG] debug message')
        )
      })

      it('should not log debug when level is INFO', () => {
        const logger = new Logger({ level: LogLevel.INFO })
        logger.debug('debug message')
        expect(consoleLogSpy).not.toHaveBeenCalled()
      })
    })

    describe('trace', () => {
      it('should log trace messages when level is TRACE', () => {
        const logger = new Logger({ level: LogLevel.TRACE })
        logger.trace('trace message')
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[TRACE] trace message')
        )
      })

      it('should not log trace when level is DEBUG', () => {
        const logger = new Logger({ level: LogLevel.DEBUG })
        logger.trace('trace message')
        expect(consoleLogSpy).not.toHaveBeenCalled()
      })
    })

    describe('success', () => {
      it('should always log success messages', () => {
        const logger = new Logger({ level: LogLevel.ERROR })
        logger.success('success message')
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[SUCCESS] success message')
        )
      })
    })
  })

  describe('message formatting', () => {
    it('should include timestamp when configured', () => {
      const logger = new Logger({ timestamp: true })
      logger.info('test message')

      const call = consoleLogSpy.mock.calls[0][0] as string
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
    })

    it('should include prefix when configured', () => {
      const logger = new Logger({ prefix: 'TEST' })
      logger.info('test message')

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TEST]')
      )
    })

    it('should format message with timestamp and prefix', () => {
      const logger = new Logger({
        timestamp: true,
        prefix: 'APP'
      })
      logger.info('test message')

      const call = consoleLogSpy.mock.calls[0][0] as string
      expect(call).toMatch(/\[.*\] \[APP\] \[INFO\] test message/)
    })

    it('should format message without timestamp and prefix', () => {
      const logger = new Logger({
        timestamp: false,
        prefix: ''
      })
      logger.info('test message')

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO] test message')
    })
  })

  describe('log level hierarchy', () => {
    it('ERROR level should only show errors', () => {
      const logger = new Logger({ level: LogLevel.ERROR })

      logger.error('error')
      logger.warn('warn')
      logger.info('info')
      logger.debug('debug')
      logger.trace('trace')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
      expect(consoleLogSpy).toHaveBeenCalledTimes(0)
    })

    it('WARN level should show errors and warnings', () => {
      const logger = new Logger({ level: LogLevel.WARN })

      logger.error('error')
      logger.warn('warn')
      logger.info('info')
      logger.debug('debug')
      logger.trace('trace')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(0)
    })

    it('INFO level should show errors, warnings, and info', () => {
      const logger = new Logger({ level: LogLevel.INFO })

      logger.error('error')
      logger.warn('warn')
      logger.info('info')
      logger.debug('debug')
      logger.trace('trace')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(1) // only info
    })

    it('DEBUG level should show all except trace', () => {
      const logger = new Logger({ level: LogLevel.DEBUG })

      logger.error('error')
      logger.warn('warn')
      logger.info('info')
      logger.debug('debug')
      logger.trace('trace')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(2) // info and debug
    })

    it('TRACE level should show all messages', () => {
      const logger = new Logger({ level: LogLevel.TRACE })

      logger.error('error')
      logger.warn('warn')
      logger.info('info')
      logger.debug('debug')
      logger.trace('trace')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      expect(consoleLogSpy).toHaveBeenCalledTimes(3) // info, debug, trace
    })
  })

  describe('createLogger', () => {
    it('should create a new logger instance', () => {
      const logger1 = createLogger()
      const logger2 = createLogger()
      expect(logger1).not.toBe(logger2)
    })

    it('should create logger with custom config', () => {
      const logger = createLogger({ prefix: 'CUSTOM' })
      logger.info('test')
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[CUSTOM]')
      )
    })
  })

  describe('getLogger', () => {
    it('should return singleton instance', () => {
      const logger1 = getLogger()
      const logger2 = getLogger()
      expect(logger1).toBe(logger2)
    })

    it('should return same instance as Logger.getInstance()', () => {
      const logger1 = getLogger()
      const logger2 = Logger.getInstance()
      expect(logger1).toBe(logger2)
    })
  })
})
