import React from 'react';
import {Text, HStack, Center, Icon, Pressable} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PaymentsView from './payments';
import HistoryView from './history';
import {PRIMARY_COLOR} from '../api/constants';

const Navigation = () => {
  const [selected, setSelected] = React.useState(0);

  return (
    <>
      {selected === 0 ? <PaymentsView /> : null}
      {selected === 1 ? <HistoryView /> : null}
      <HStack bg={PRIMARY_COLOR} alignItems="center" safeAreaBottom shadow={6}>
        <Pressable
          cursor="pointer"
          opacity={selected === 0 ? 1 : 0.5}
          py="3"
          flex={1}
          onPress={() => setSelected(0)}>
          <Center>
            <Icon
              mb="1"
              as={
                <MaterialCommunityIcons
                  name={selected === 0 ? 'credit-card' : 'credit-card-outline'}
                />
              }
              color="white"
              size="sm"
            />
            <Text color="white" fontSize="12">
              Cobros
            </Text>
          </Center>
        </Pressable>
      </HStack>
    </>
  );
};

export default Navigation;
