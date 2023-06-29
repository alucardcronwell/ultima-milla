import React, { useEffect, useState, useCallback } from 'react';
import { Text, Switch, Center, Radio, ScrollView, FormControl, Input, Divider, Button, View, Heading, Icon, Modal, Image, IconButton, HStack } from 'native-base';
import { PRIMARY_COLOR } from '../api/constants';
import { Alert, Dimensions, StyleSheet, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

//import "externos"
import { DLS } from '../api/dls';
import { Utils } from '../api/utils';
import { Pasarela, Payments } from '../api/pasarela';
import CameraOF from '../components/camera';
import { multiOf, multiOfType } from '../const';
import { getId, validarOf } from '../helpers/';

const styles = StyleSheet.create({
  horizontalCol: { flexDirection: 'row' },
});

const PaymentsView = () => {
  const [mercadoPago, setMercadoPago] = useState(false);
  const [check, setCheck] = useState(false);
  const [fpay, setFpay] = useState(false);
  const [ordenFlete, setOrdenFlete] = useState('');
  const [activePayment, setActivePayment] = useState(false);
  const [buscandoOF, setBuscandoOF] = useState(false);
  const [cobrando, setCobrando] = useState(false);
  const [showCamara, setShowCamara] = useState(false);
  const [montoOF, setMontoOF] = useState(0);
  const [ofs, setOfs] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [metodo, setMetodo] = useState(
    'TRANSBANK' as 'TRANSBANK' | 'MERCADO_PAGO' | 'CHECK' | 'FPAY',
  );
  const [pagoQR, setPagoQR] = useState(null as null | Payments);
  const [estadoCobroQR, setEstadoCobroQR] = useState('');

  useEffect(() => {
    Pasarela.getMediosPago().then(result => {
      //setIniciando(false);
      let checkV = false;
      let fpayV = false;
      let mpagoV = false;
      for (const medio of result) {
        if (medio.codigo === 'CHECK' && medio.estado === 'ACTIVO') {
          checkV = true;
        }
        if (medio.codigo === 'FPAY' && medio.estado === 'ACTIVO') {
          fpayV = true;
        }
        if (medio.codigo === 'MERCADO_PAGO' && medio.estado === 'ACTIVO') {
          mpagoV = true;
        }
      }
      setMercadoPago(mpagoV);
      setCheck(checkV);
      setFpay(fpayV);
    });
    return () => { };
  }, []);

  const compruebaEstadoQR = useCallback(async(pago: Payments) => {
    //console.log(new Date(), 'Consultando estado pago ' + pago?.uuid);
    if (!activePayment) {
      return;
    }

    const result = await Pasarela.estadoCobro(pago?.uuid);
    if (result.estado === 'CONFIRMADO') {
      try {
        const resultCierre = await DLS.cierraDLS(result.uuid);
        console.log('cierre', resultCierre);
        if (Number(resultCierre.estado) > 0) {
          Alert.alert('Listo!', 'Cobro realizado con éxito');
          setPagoQR(null);
          setActivePayment(false);
          setOrdenFlete('');
        } else {
          Alert.alert(
            'Listo!',
            'Cobro realizado con éxito. Cierre en DLS pendiente de proceso masivo',
          );
          setPagoQR(null);
          setActivePayment(false);
          setOrdenFlete('');
        }
      } catch (e) {
        console.warn(e);
        Alert.alert(
          'Listo!',
          'Cobro realizado con éxito. Cierre en DLS pendiente de proceso masivo.',
        );
        setPagoQR(null);
        setActivePayment(false);
        setOrdenFlete('');
      }
    } else if (result.estado === 'CANCELADO') {
      Alert.alert('Lo sentimos', 'Pago cancelado o rechazado');
      setPagoQR(null);
      setActivePayment(false);
    } else if (result.estado === 'ERROR') {
      console.warn('Error en pago', result);
      Alert.alert(
        'Lo sentimos',
        'No fue posible realizar el cobro: ' + result.error,
      );
      setPagoQR(null);
    } else if (result.estado === 'PENDIENTE') {
      setTimeout(() => {
        compruebaEstadoQR(pago);
      }, 3000);
    }
  }, [activePayment])

  const payment = useCallback(async() => {
    if (total > 0 && ofs.length > 0) {
      //const id = getId(ofs)
      const identificador = ofs.map((of: multiOf) => of.of)
      console.log("identificador: ", identificador)
      console.log("pasoo")
      const newPayment: Payments = {
        identificador: identificador,
        monto: total,
        metodo,
        //concepto:  `Cobro ${ofs.length > 1 && 'Multi '} OF`,
        concepto: `Cobro OF`,
        origen: 'UM',
      };
      try {
        setCobrando(true);
        setPagoQR(null);
        const result = await Pasarela.cobrar(newPayment);
        setCobrando(false);
        if (result.estado === 'CONFIRMADO') {
          const cierra = await DLS.cierraDLS(result.uuid);
          if (Number(cierra.estado) > 0) {
            Alert.alert('Listo!', 'Cobro realizado con éxito');
            setPagoQR(null);
            setOrdenFlete('');
            setActivePayment(false);
          } else {
            Alert.alert(
              'Listo!',
              'Cobro realizado con éxito. No fue posible realizar cierre de cobro en DLS, pero el proceso se finalizará de forma interna',
            );
            setPagoQR(null);
            setOrdenFlete('');
            setActivePayment(false);
          }
        } else if (result.estado === 'PENDIENTE' && result.qr) {
          setEstadoCobroQR('Esperando confirmación de cobro QR');
          setPagoQR(result);
          setTimeout(() => {
            compruebaEstadoQR(result);
          }, 5000);
        } else {
          Alert.alert(
            Utils.formatWords(result.estado),
            result.respuesta_integracion
              ? result.respuesta_integracion.mensaje
              : result.error
                ? result.error
                : 'No fue posible finalizar el cobro',
          );
        }
      } catch (e: any) {
        setCobrando(false);
        console.warn('Error al cobrar en pasarela Payment', e);
      }
    } else {
      Alert.alert('Compruebe', 'Debe ingresar OF');
    }
  }, [ofs, total])

  const deleteOfs = useCallback((indice: number) => {
    const of = ofs[indice]
    let newOfs = [...ofs]
    newOfs.splice(indice, 1)
    setTotal(total - of.monto)
    setOfs(newOfs)
    Alert.alert('Eliminado', `Se ha eliminado con éxito la of: ${of.of}`);
  }, [ofs])

  const findOF = useCallback(() => {
    const ofExist = validarOf(ofs, ordenFlete)
    if (Number(ordenFlete) > 10000 && !ofExist) {
      setBuscandoOF(true);
      DLS.getMontoByOF(Number(ordenFlete)).then(result => {
        setBuscandoOF(false);
        if (result.estado >= -2) {
          if (Number(result.montoCobrar) <= -1) {
            Alert.alert(
              'Lo sentimos',
              'La orden de flete ingresado no tiene cobros pendientes',
            );
          } else {
            const newOf: multiOf = { of: ordenFlete, monto: result.montoCobrar };
            setOfs((prevState: any) => [...prevState, newOf])
            setTotal((prev): number => prev + newOf.monto)
          }
        } else {
          setActivePayment(false);
          Alert.alert('Lo sentimos', result.mensaje);
        }
      });
      return;
    }
    ofExist ? Alert.alert('Notificación', 'La of ingresada ya existe en la lista') : Alert.alert('Compruebe', 'Debe ingresar orden de flete valida');
  }, [ordenFlete, ofs, total])

  if (showCamara) {
    return (
      <CameraOF
        onCapture={(oflete: string) => {
          setOrdenFlete(oflete);
          setShowCamara(false);
        }}
        onCancel={() => {
          setShowCamara(false);
        }}
      />
    );
  }

  const GridHeader = useCallback(() => (
    <View style={{ flex: 1, flexDirection: 'row' }} >
      <View style={{ flex: 3 }} >
        <Heading size="sm">OF</Heading>
      </View>
      <View style={{ flex: 2 }} >
        <Heading size="sm">Monto</Heading>
      </View>
      <View style={{ flex: 1 }} >
        <Heading size="sm">Accion</Heading>
      </View>
    </View>
  ), [])

  const Item = useCallback(({ index, of, monto }: multiOfType) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingTop: 10 }}>
      <View style={{ flex: 3 }} >
        <Text>{of}</Text>
      </View>
      <View style={{ flex: 2 }} >
        <Text>{Utils.formatMoney(monto)}</Text>
      </View>
      <View style={{ flex: 1 }} >
        <IconButton size={9} variant='ghost' key={`borrar-${of}`} colorScheme="danger" _icon={{
          as: FontAwesome5,
          name: "trash-alt",
          color: "red.500"
        }}
          onPress={() => deleteOfs(index)}
        />
      </View>
    </View>
  ), [ofs])

  return (
    <>
      <Modal
        isOpen={pagoQR !== null}
        onClose={() => setPagoQR(null)}
        style={{ width: Dimensions.get('window').width }}>
        <Modal.Content style={{ width: Dimensions.get('window').width }}>
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontSize="xl" bold>
              Cobrando con {Utils.formatWords(metodo.split('_').join(' '))}
            </Text>
          </Modal.Header>
          <Modal.Body style={{ height: Dimensions.get('window').width }}>
            {pagoQR !== null ? (
              <Image
                source={{
                  uri: pagoQR.qr?.includes('base64')
                    ? pagoQR.qr
                    : `data:image/png;base64,${pagoQR.qr}`,
                }}
                width={Dimensions.get('window').width - 50}
                height={Dimensions.get('window').width - 50}
                resizeMode="stretch"
                alt="QR"
              />
            ) : null}
            <Text
              mt={3}
              fontSize="md"
              italic
              width={Dimensions.get('window').width - 50}
              textAlign="center">
              {estadoCobroQR}
            </Text>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                onPress={() => {
                  setPagoQR(null);
                }}>
                Cancelar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
      <ScrollView>
        <Center m={5}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingTop: 10 }}>
            <View style={{ flex: 3 }} >
              <Heading>Cobro de entregas</Heading>
            </View>
            <View style={{ flex: 1 }} >
                <Heading>${Utils.formatMoney(total)}</Heading>
            </View>
          </View>
          <FormControl my="5">
            <FormControl.Label>Órden de Flete</FormControl.Label>
            <Input
              fontSize="2xl"
              maxLength={9}
              keyboardType="number-pad"
              onChangeText={setOrdenFlete}
              value={ordenFlete}
              isDisabled={buscandoOF || activePayment}
              InputRightElement={
                <Button
                  onPress={() => {
                    setShowCamara(true);
                  }}
                  bgColor={PRIMARY_COLOR}>
                  <Icon
                    m={1}
                    as={<MaterialCommunityIcons name="barcode" />}
                    color="white"
                    size="sm"
                  />
                </Button>
              }
            />
            <FormControl.HelperText>Ejemplo: 954321091</FormControl.HelperText>
          </FormControl>
          {activePayment ? (
            <>
              <Text bold fontSize="4xl" mb="0">
                $ {Utils.formatMoney(total)}
              </Text>
              <Text italic fontSize="sm" mb="4">
                Debe cobrar órden de flete. Seleccione metodo de pago
              </Text>
              <Radio.Group
                name="metodosDePagos"
                defaultValue="1"
                onChange={value => {
                  setMetodo(value as any);
                }}
                colorScheme="green">
                <View style={styles.horizontalCol}>
                  <Radio value="TRANSBANK" my={1} m={2} isDisabled={cobrando}>
                    Transbank
                  </Radio>
                  <Radio
                    value="MERCADO_PAGO"
                    my={1}
                    ml={4}
                    m={2}
                    isDisabled={cobrando || !mercadoPago}>
                    Mercado Pago
                  </Radio>
                </View>
                <View style={styles.horizontalCol}>
                  <Radio
                    value="CHECK"
                    my={1}
                    m={2}
                    isDisabled={cobrando || !check}>
                    Check Ripley
                  </Radio>
                  <Radio
                    value="FPAY"
                    my={1}
                    m={2}
                    isDisabled={cobrando || !fpay}>
                    FPay Falabella
                  </Radio>
                </View>
              </Radio.Group>
              <Button
                width="100%"
                bg={PRIMARY_COLOR}
                isLoading={cobrando}
                mb={2}
                mt={5}
                onPress={payment}>
                <Text color="white">Cobrar Órden de flete</Text>
              </Button>
              <Button
                width="100%"
                bg="#FF5733"
                mb={4}
                isDisabled={cobrando}
                onPress={() => {
                  setActivePayment(false);
                }}>
                <Text color="white">Cancelar</Text>
              </Button>
            </>
          ) : (
            <Button
              width="100%"
              bg={PRIMARY_COLOR}
              mb={4}
              onPress={findOF}
              isDisabled={cobrando}
              isLoading={buscandoOF}>
              <Text color="white">Buscar</Text>
            </Button>
          )}
          <HStack alignItems="center" space={4}>
            <Text>¿Mostrar Cobro?</Text>
            <Switch size="md" colorScheme="emerald" isChecked={activePayment}
              onToggle={() => setActivePayment(!activePayment)}
            />
          </HStack>

          <Divider my="2" />
          <View style={{ flex: 1, width: "100%", padding: 5 }}>
            <GridHeader />
            {/*ofs.map((of: multiOf, indice: number) => 
              <Item key={`key-${indice}`} of={of.of} monto={of.monto} index={indice} />
            )*/}
            <FlatList
              data={ofs}
              renderItem={({ item, index }) => <Item of={item.of} monto={item.monto} index={index} />}
              keyExtractor={item => item.of}
            />
          </View>
        </Center>
        <Divider my="2" />
      </ScrollView>
    </>
  );


};
export default PaymentsView;
