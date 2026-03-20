import { ConfigProvider } from '@nutui/nutui-react-taro';
import './app.scss';

const App = ({ children }) => {
  return (<ConfigProvider>
    {children}
  </ConfigProvider>);
};

export default App;
