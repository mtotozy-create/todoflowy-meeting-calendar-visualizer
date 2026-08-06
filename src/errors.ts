/**
 * 插件领域错误基类
 */
export class PluginDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PluginDomainError";
  }
}

/**
 * Storage 记录格式或版本校验失败错误
 */
export class StorageRecordError extends PluginDomainError {
  constructor(message: string) {
    super(message);
    this.name = "StorageRecordError";
  }
}

/**
 * Meeting API 操作失败或版本冲突错误
 */
export class MeetingOperationError extends PluginDomainError {
  constructor(message: string) {
    super(message);
    this.name = "MeetingOperationError";
  }
}
