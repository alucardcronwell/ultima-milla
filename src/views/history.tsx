import React from 'react';
import {Link, Text, HStack, Center, Heading, VStack, Code} from 'native-base';

const HistoryView = () => {
  return (
    <Center
      _dark={{bg: 'blueGray.900'}}
      _light={{bg: 'blueGray.50'}}
      px={4}
      flex={1}>
      <VStack space={5} alignItems="center">
        <Heading size="lg">Welcome to NativeBase</Heading>
        <HStack space={2} alignItems="center">
          <Text>Edit</Text>
          <Code>App.tsx</Code>
          <Text>and save to reload.</Text>
        </HStack>
        <Link href="https://docs.nativebase.io" isExternal>
          <Text color="primary.500" underline fontSize={'xl'}>
            Learn NativeBase
          </Text>
        </Link>
      </VStack>
    </Center>
  );
};
export default HistoryView;
