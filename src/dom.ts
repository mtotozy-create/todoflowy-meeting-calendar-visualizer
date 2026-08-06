/**
 * 安全 DOM 元素创建辅助函数
 * NOTE: 严格禁止 innerHTML，所有元素和文本节点均通过 DOM API 构建
 */

interface ElementOptions {
  readonly className?: string;
  readonly id?: string;
  readonly text?: string;
  readonly title?: string;
  readonly attributes?: Readonly<Record<string, string>>;
}

export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {},
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.id) el.id = options.id;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.title !== undefined) el.title = options.title;
  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

export function button(
  label: string,
  onClick: (event: MouseEvent) => void,
  className = "",
): HTMLButtonElement {
  const btn = element("button", { className, text: label });
  btn.type = "button";
  btn.addEventListener("click", onClick);
  return btn;
}
