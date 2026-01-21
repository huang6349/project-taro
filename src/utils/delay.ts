// 延迟函数，默认延迟 1 秒
const delay = (timeout: number = 1000) => new Promise<void>(resolve => (
  setTimeout(resolve, timeout)
));

export default delay;
