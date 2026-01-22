import { safeEq } from '@/utils';

// 响应包装器：校验业务 success 后执行回调，ignore 可跳过校验
const withResponse = (
  fn: (...args: any[]) => void,
  ignore = !1,
) => (({ data }) => {
  const {
    success,
    data: res,
  } = data ?? {};
  // 业务成功或忽略错误时执行回调
  if (safeEq(success, !0)
    || safeEq(ignore, !0)
  ) fn(res ?? {});
});

export default withResponse;
