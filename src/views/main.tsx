import React, {useEffect} from 'react';
import {
  HStack,
  Box,
  StatusBar,
  Avatar,
  Image,
  Modal,
  Button,
  Text,
  Select,
  Input,
  ScrollView,
  View,
  Center,
} from 'native-base';
import Navigation from './navigation';
import {Pasarela} from '../api/pasarela';
import {PRIMARY_COLOR} from '../api/constants';
import {AppState, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {DLS, ImeiMaquina} from '../api/dls';

let interval: NodeJS.Timer;

const MainView = () => {
  const [pclActive, setPclActive] = React.useState(false);
  const [deviceActive, setDeviceActive] = React.useState(false);
  const [apiActive, setApiActive] = React.useState(false);
  const [numeroMaquina, setNumeroMaquina] = React.useState(
    'Buscando..' as null | string,
  );
  const [identificando, setIdentificando] = React.useState(false);
  const [maquinaInput, setMaquinaInput] = React.useState('');
  const [tipoInput, setTipoInput] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    if (numeroMaquina === null) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
    return () => {};
  }, [numeroMaquina]);

  useEffect(() => {
    AsyncStorage.getItem('@maquina').then(result => {
      if (result) {
        const maquinaLocal = JSON.parse(result) as ImeiMaquina;
        setNumeroMaquina(
          maquinaLocal.numero ? String(maquinaLocal.numero) : null,
        );
        setMaquinaInput(maquinaLocal.numero ? String(maquinaLocal.numero) : '');
        setTipoInput(maquinaLocal.tipo ? maquinaLocal.tipo : '');
      } else {
        setNumeroMaquina(null);
        setMaquinaInput('');
        setTipoInput('');
      }
    });

    getStatus();
    const subscription = AppState.addEventListener('focus', () => {
      clearInterval(interval as any);
      interval = setInterval(getStatus, 10000);
      getStatus();
    }) as any;

    const subscriptionLos = AppState.addEventListener('blur', () => {
      clearInterval(interval as any);
    }) as any;

    return () => {
      clearInterval(interval as any);
      if (subscription) {
        subscription.remove();
      }
      if (subscriptionLos) {
        subscriptionLos.remove();
      }
    };
  }, []);

  const getStatus = () => {
    Pasarela.getStatus().then(result => {
      setPclActive(result.pcl);
      setDeviceActive(result.device);
      setApiActive(result.api);
    });
  };

  const identificar = () => {
    setIdentificando(true);
    DLS.getImei(Number(tipoInput), Number(maquinaInput)).then(async result => {
      setIdentificando(false);
      if (result.imei !== '') {
        result.tipo = tipoInput;
        result.numero = Number(maquinaInput);
        await AsyncStorage.setItem('@maquina', JSON.stringify(result));
        setNumeroMaquina(maquinaInput);
        setModalVisible(false);
      } else {
        Alert.alert('Lo sentimos', result.mensaje);
      }
    });
  };

  let colorTB = 'red.500';
  if (pclActive && !deviceActive) {
    colorTB = 'yellow.500';
  }
  if (pclActive && deviceActive) {
    colorTB = 'green.500';
  }

  return (
    <Box flex={1} bg="white" safeAreaTop>
      <StatusBar backgroundColor="green" barStyle="light-content" />

      <Modal isOpen={modalVisible} size="full">
        <Modal.Content maxH="400">
          <Modal.Header>Identifique maquina</Modal.Header>
          <Modal.Body>
            <ScrollView p={3}>
              <Text>Tipo de vehiculo</Text>
              <Select onValueChange={setTipoInput} selectedValue={tipoInput}>
                <Select.Item value="0" label="BUS" />
                <Select.Item value="1" label="CAMION" />
                <Select.Item value="2" label="RAMPLA" />
                <Select.Item value="3" label="CAMIONETA" />
                <Select.Item value="4" label="MINIBUS" />
                <Select.Item value="5" label="VAN" />
                <Select.Item value="6" label="FURGON" />
                <Select.Item value="7" label="MOTO" />
                <Select.Item value="8" label="REMOLQUE" />
                <Select.Item value="9" label="AUTO" />
                <Select.Item value="10" label="GRUA ROQUILLA" />
                <Select.Item value="11" label="TAXIBUS" />
                <Select.Item value="12" label="STATION WAGON" />
                <Select.Item value="13" label="TUR CARRY" />
                <Select.Item value="14" label="AVION" />
                <Select.Item value="15" label="OTROS" />
                <Select.Item value="16" label="PEATON" />
              </Select>
              <Text mt={4}>Número de vehiculo</Text>
              <Input
                value={maquinaInput}
                maxLength={7}
                onChangeText={setMaquinaInput}
                keyboardType="number-pad"
              />
            </ScrollView>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              {numeroMaquina ? (
                <Button
                  isLoading={identificando}
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => {
                    setModalVisible(false);
                  }}>
                  Cancelar
                </Button>
              ) : (
                <View />
              )}
              <Button
                colorScheme="green"
                isLoading={identificando}
                onPress={identificar}>
                Seleccionar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      <Box safeAreaTop backgroundColor={PRIMARY_COLOR}>
        <HStack
          bg={PRIMARY_COLOR}
          py="3"
          justifyContent="space-between"
          alignItems="center">
          <HStack space={0} pl={0} width="30%">
            <Image
              source={require('../assets/logo-blanco.png')}
              resizeMode="contain"
              width={120}
              height={37}
              alt="logo Starken"
            />
          </HStack>
          <Center>
            <Button
              onPress={() => setModalVisible(true)}
              colorScheme="green"
              style={{width: 90}}
              height={10}
              alignContent="center"
              alignItems="center"
              flexDirection="row">
              <MaterialCommunityIcons
                name="car"
                color="white"
                size={18}
                // eslint-disable-next-line react-native/no-inline-styles
                style={{textAlign: 'center'}}
              />
              {numeroMaquina ? numeroMaquina : 'Seleccione'}
            </Button>
          </Center>
          <HStack space={2} width="25%">
            <Avatar bg="lightBlue.400" size="sm" mt={1}>
              PP
              <Avatar.Badge bg={colorTB} />
            </Avatar>
            <Avatar bg="lightBlue.400" size="sm" mt={1} mr={4}>
              API
              <Avatar.Badge bg={apiActive ? 'green.500' : 'red.500'} />
            </Avatar>
          </HStack>
        </HStack>
      </Box>
      <Navigation />
    </Box>
  );
};
export default MainView;
