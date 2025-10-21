/**
 * 用户消息常量
 */
/**
 * 成功消息
 */
export declare const SUCCESS_MESSAGES: {
    readonly BUILD_COMPLETE: "构建完成";
    readonly BUILD_SUCCESS: "构建成功";
    readonly CONFIG_LOADED: "配置加载成功";
    readonly CONFIG_VALIDATED: "配置验证通过";
    readonly PLUGIN_LOADED: "插件加载成功";
    readonly ADAPTER_INITIALIZED: "适配器初始化成功";
    readonly CACHE_HIT: "缓存命中";
    readonly WATCH_STARTED: "监听模式已启动";
    readonly LIBRARY_DETECTED: "库类型检测成功";
};
/**
 * 信息消息
 */
export declare const INFO_MESSAGES: {
    readonly BUILD_STARTING: "开始构建...";
    readonly CONFIG_LOADING: "正在加载配置...";
    readonly PLUGIN_LOADING: "正在加载插件...";
    readonly ADAPTER_SWITCHING: "正在切换适配器...";
    readonly CACHE_CLEARING: "正在清理缓存...";
    readonly WATCH_CHANGE_DETECTED: "检测到文件变化";
    readonly LIBRARY_DETECTING: "正在检测库类型...";
    readonly PERFORMANCE_ANALYZING: "正在分析性能...";
};
/**
 * 警告消息
 */
export declare const WARNING_MESSAGES: {
    readonly CONFIG_DEPRECATED: "配置项已废弃";
    readonly PLUGIN_DEPRECATED: "插件已废弃";
    readonly LARGE_BUNDLE_SIZE: "打包文件过大";
    readonly SLOW_BUILD_TIME: "构建时间过长";
    readonly MEMORY_USAGE_HIGH: "内存使用过高";
    readonly CACHE_MISS: "缓存未命中";
    readonly DEPENDENCY_OUTDATED: "依赖版本过旧";
    readonly EXPERIMENTAL_FEATURE: "使用了实验性功能";
};
/**
 * 用户消息
 */
export declare const USER_MESSAGES: {
    readonly BUILD_FAILED: "构建失败";
    readonly CONFIG_INVALID: "配置无效";
    readonly PLUGIN_ERROR: "插件错误";
    readonly ADAPTER_ERROR: "适配器错误";
    readonly FILE_NOT_FOUND: "文件未找到";
    readonly DEPENDENCY_MISSING: "依赖缺失";
    readonly NETWORK_ERROR: "网络错误";
    readonly PERMISSION_DENIED: "权限不足";
    readonly OUT_OF_MEMORY: "内存不足";
    readonly TIMEOUT: "操作超时";
};
/**
 * 进度消息
 */
export declare const PROGRESS_MESSAGES: {
    readonly INITIALIZING: "初始化中...";
    readonly LOADING_CONFIG: "加载配置中...";
    readonly DETECTING_LIBRARY: "检测库类型中...";
    readonly LOADING_PLUGINS: "加载插件中...";
    readonly RESOLVING_MODULES: "解析模块中...";
    readonly TRANSFORMING_CODE: "转换代码中...";
    readonly GENERATING_BUNDLE: "生成打包文件中...";
    readonly WRITING_FILES: "写入文件中...";
    readonly OPTIMIZING: "优化中...";
    readonly FINALIZING: "完成中...";
};
/**
 * 帮助消息
 */
export declare const HELP_MESSAGES: {
    readonly USAGE: "使用方法";
    readonly OPTIONS: "选项";
    readonly EXAMPLES: "示例";
    readonly COMMANDS: "命令";
    readonly CONFIG: "配置";
    readonly PLUGINS: "插件";
    readonly TROUBLESHOOTING: "故障排除";
    readonly FAQ: "常见问题";
};
/**
 * 提示消息
 */
export declare const TIP_MESSAGES: {
    readonly PERFORMANCE_OPTIMIZATION: "性能优化提示";
    readonly BUNDLE_SIZE_OPTIMIZATION: "包大小优化提示";
    readonly CACHE_USAGE: "缓存使用提示";
    readonly PLUGIN_RECOMMENDATION: "插件推荐";
    readonly CONFIG_SUGGESTION: "配置建议";
    readonly BEST_PRACTICES: "最佳实践";
    readonly TROUBLESHOOTING_GUIDE: "故障排除指南";
};
/**
 * 状态消息
 */
export declare const STATUS_MESSAGES: {
    readonly IDLE: "空闲";
    readonly INITIALIZING: "初始化中";
    readonly BUILDING: "构建中";
    readonly WATCHING: "监听中";
    readonly ERROR: "错误";
    readonly COMPLETE: "完成";
    readonly CANCELLED: "已取消";
    readonly PAUSED: "已暂停";
};
/**
 * 确认消息
 */
export declare const CONFIRMATION_MESSAGES: {
    readonly OVERWRITE_FILE: "文件已存在，是否覆盖？";
    readonly DELETE_CACHE: "是否清理缓存？";
    readonly SWITCH_BUNDLER: "是否切换打包器？";
    readonly INSTALL_DEPENDENCY: "是否安装依赖？";
    readonly UPDATE_CONFIG: "是否更新配置？";
    readonly CONTINUE_BUILD: "是否继续构建？";
    readonly ABORT_BUILD: "是否中止构建？";
};
/**
 * 格式化消息模板
 */
export declare const MESSAGE_TEMPLATES: {
    readonly BUILD_TIME: "构建时间: {time}ms";
    readonly BUNDLE_SIZE: "打包大小: {size}";
    readonly MEMORY_USAGE: "内存使用: {memory}MB";
    readonly CACHE_HIT_RATE: "缓存命中率: {rate}%";
    readonly FILE_COUNT: "文件数量: {count}";
    readonly PLUGIN_COUNT: "插件数量: {count}";
    readonly ERROR_COUNT: "错误数量: {count}";
    readonly WARNING_COUNT: "警告数量: {count}";
    readonly PROGRESS: "进度: {current}/{total} ({percent}%)";
    readonly VERSION: "版本: {version}";
};
/**
 * 日志级别消息
 */
export declare const LOG_LEVEL_MESSAGES: {
    readonly silent: "静默模式";
    readonly error: "仅显示错误";
    readonly warn: "显示警告和错误";
    readonly info: "显示信息、警告和错误";
    readonly debug: "显示调试信息";
    readonly verbose: "显示详细信息";
};
/**
 * 命令行消息
 */
export declare const CLI_MESSAGES: {
    readonly WELCOME: "欢迎使用 @ldesign/builder";
    readonly VERSION: "版本信息";
    readonly HELP: "帮助信息";
    readonly INVALID_COMMAND: "无效命令";
    readonly MISSING_ARGUMENT: "缺少参数";
    readonly UNKNOWN_OPTION: "未知选项";
    readonly COMMAND_SUCCESS: "命令执行成功";
    readonly COMMAND_FAILED: "命令执行失败";
};
/**
 * 配置消息
 */
export declare const CONFIG_MESSAGES: {
    readonly LOADING: "正在加载配置文件...";
    readonly LOADED: "配置文件加载成功";
    readonly NOT_FOUND: "未找到配置文件，使用默认配置";
    readonly INVALID: "配置文件格式错误";
    readonly VALIDATING: "正在验证配置...";
    readonly VALIDATED: "配置验证通过";
    readonly MERGING: "正在合并配置...";
    readonly MERGED: "配置合并完成";
    readonly WATCHING: "正在监听配置文件变化...";
    readonly CHANGED: "配置文件已更改，重新加载中...";
};
/**
 * 插件消息
 */
export declare const PLUGIN_MESSAGES: {
    readonly LOADING: "正在加载插件: {name}";
    readonly LOADED: "插件加载成功: {name}";
    readonly FAILED: "插件加载失败: {name}";
    readonly INITIALIZING: "正在初始化插件: {name}";
    readonly INITIALIZED: "插件初始化成功: {name}";
    readonly EXECUTING: "正在执行插件: {name}";
    readonly EXECUTED: "插件执行完成: {name}";
    readonly ERROR: "插件执行错误: {name}";
    readonly DISABLED: "插件已禁用: {name}";
    readonly DEPRECATED: "插件已废弃: {name}";
};
/**
 * 适配器消息
 */
export declare const ADAPTER_MESSAGES: {
    readonly DETECTING: "正在检测可用的适配器...";
    readonly DETECTED: "检测到适配器: {name}";
    readonly INITIALIZING: "正在初始化适配器: {name}";
    readonly INITIALIZED: "适配器初始化成功: {name}";
    readonly SWITCHING: "正在切换到适配器: {name}";
    readonly SWITCHED: "适配器切换成功: {name}";
    readonly NOT_AVAILABLE: "适配器不可用: {name}";
    readonly VERSION_MISMATCH: "适配器版本不匹配: {name}";
    readonly CONFIG_ERROR: "适配器配置错误: {name}";
};
/**
 * 性能消息
 */
export declare const PERFORMANCE_MESSAGES: {
    readonly ANALYZING: "正在分析性能...";
    readonly ANALYZED: "性能分析完成";
    readonly SLOW_BUILD: "构建速度较慢，建议优化";
    readonly LARGE_BUNDLE: "打包文件较大，建议优化";
    readonly HIGH_MEMORY: "内存使用较高，建议优化";
    readonly CACHE_EFFECTIVE: "缓存效果良好";
    readonly CACHE_INEFFECTIVE: "缓存效果不佳，建议检查配置";
    readonly OPTIMIZATION_SUGGESTION: "性能优化建议: {suggestion}";
};
