import React from 'react';
import {NativeBaseProvider} from 'native-base';
import MainView from './src/views/main';

const App = () => {
  return (
    <NativeBaseProvider>
      <MainView />
    </NativeBaseProvider>
  );
};
export default App;
