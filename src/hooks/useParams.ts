import { useRouter } from '@tarojs/taro';

const useParams = () => (
  useRouter()?.params || {}
);

export default useParams;
