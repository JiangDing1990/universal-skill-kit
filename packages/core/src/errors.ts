/**
 * Custom Error Classes
 * 自定义错误类
 */

/**
 * Base error class for USK
 * USK基础错误类
 */
export class USKError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'USKError'
    Error.captureStackTrace?.(this, this.constructor)
  }
}

/**
 * Skill not found error
 * Skill文件未找到错误
 */
export class SkillNotFoundError extends USKError {
  constructor(skillPath: string) {
    super(
      `Skill not found / Skill 文件未找到: ${skillPath}`,
      'SKILL_NOT_FOUND',
      { skillPath }
    )
    this.name = 'SkillNotFoundError'
  }
}

/**
 * Skill validation error
 * Skill验证错误
 */
export class SkillValidationError extends USKError {
  constructor(
    skillPath: string,
    public readonly validationErrors: Array<{ field: string; message: string }>
  ) {
    super(
      `Skill validation failed / Skill 验证失败: ${validationErrors.length} error(s) / ${validationErrors.length} 个错误`,
      'SKILL_VALIDATION_ERROR',
      { skillPath, errors: validationErrors }
    )
    this.name = 'SkillValidationError'
  }
}

/**
 * Conversion error
 * 转换错误
 */
export class ConversionError extends USKError {
  constructor(skillPath: string, reason: string, cause?: Error) {
    super(
      `Conversion failed / 转换失败 (${skillPath}): ${reason}`,
      'CONVERSION_ERROR',
      { skillPath, reason, cause }
    )
    this.name = 'ConversionError'
  }
}

/**
 * Resource file missing error
 * 资源文件缺失错误
 */
export class ResourceNotFoundError extends USKError {
  constructor(resourcePath: string, skillPath: string) {
    super(
      `Resource file not found / 资源文件未找到: ${resourcePath}`,
      'RESOURCE_NOT_FOUND',
      { resourcePath, skillPath }
    )
    this.name = 'ResourceNotFoundError'
  }
}

/**
 * File write error
 * 文件写入错误
 */
export class FileWriteError extends USKError {
  constructor(filePath: string, reason: string) {
    super(
      `Failed to write file / 文件写入失败 (${filePath}): ${reason}`,
      'FILE_WRITE_ERROR',
      { filePath, reason }
    )
    this.name = 'FileWriteError'
  }
}

/**
 * Check if error is a USK error
 * 检查是否为USK错误
 */
export function isUSKError(error: unknown): error is USKError {
  return error instanceof USKError
}

/**
 * Format error message for user display
 * 格式化错误信息用于用户显示
 */
export function formatErrorMessage(error: unknown): string {
  if (isUSKError(error)) {
    return `[${error.code}] ${error.message}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

/**
 * Get error suggestions based on error type
 * 根据错误类型获取建议
 */
export function getErrorSuggestions(error: unknown): string[] {
  if (!isUSKError(error)) {
    return []
  }

  const suggestions: string[] = []

  switch (error.code) {
    case 'SKILL_NOT_FOUND':
      suggestions.push('Ensure the file path is correct / 确保文件路径正确')
      suggestions.push('If it\'s a directory, make sure it contains SKILL.md / 如果是目录，请确保其中包含 SKILL.md 文件')
      suggestions.push('Use absolute path or path relative to current working directory / 使用绝对路径或相对于当前工作目录的路径')
      break

    case 'SKILL_VALIDATION_ERROR':
      suggestions.push('Run `usk analyze <skill>` to see detailed validation info / 运行 `usk analyze <skill>` 查看详细验证信息')
      suggestions.push('Fix all errors and retry conversion / 修复所有错误后重新转换')
      suggestions.push('Or use --interactive mode to manually confirm / 或使用 --interactive 模式手动确认继续')
      break

    case 'CONVERSION_ERROR':
      suggestions.push('Check if target platform is correct (claude/codex) / 检查目标平台是否正确 (claude/codex)')
      suggestions.push('Ensure output directory has write permissions / 确保输出目录有写入权限')
      suggestions.push('Use --verbose to see detailed error info / 使用 --verbose 查看详细错误信息')
      break

    case 'RESOURCE_NOT_FOUND':
      suggestions.push('Check if resource file paths in Skill are correct / 检查 Skill 中引用的资源文件路径是否正确')
      suggestions.push('Ensure all referenced files exist / 确保所有引用的文件都存在')
      suggestions.push('Use relative paths instead of absolute paths / 使用相对路径而不是绝对路径')
      break

    case 'FILE_WRITE_ERROR':
      suggestions.push('Check if output directory has write permissions / 检查输出目录是否存在写入权限')
      suggestions.push('Ensure output path is valid / 确保输出路径有效')
      suggestions.push('Check if disk space is sufficient / 检查磁盘空间是否充足')
      break
  }

  return suggestions
}
