import React from 'react';
import {RNCamera} from 'react-native-camera';
import {View, Text, Button, Center} from 'native-base';

type Props = {
  onCapture: any;
  onCancel: any;
};

export default function CameraOF(props: Props) {
  const onBarCodeRead = (scanResult: any) => {
    if (scanResult.data != null) {
      let codigo: string = scanResult.data;
      if (codigo.length > 9) {
        codigo = codigo.substr(codigo.length - 12, 9);
        codigo = String(parseInt(codigo, 10));
        console.warn(codigo);
      }
      props.onCapture(codigo);
    }
    return;
  };

  return (
    <View style={styles.container}>
      <RNCamera
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}
        captureAudio={false}
        onBarCodeRead={onBarCodeRead}
        style={styles.preview}
        androidCameraPermissionOptions={{
          title: 'Permiso para usar la cámara',
          message: 'Necesitamos su permiso para usar su cámara',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancelar',
        }}
      />
      <View style={[styles.overlay, styles.topOverlay]}>
        <Text allowFontScaling={false} style={styles.scanScreenMessage}>
          Captura código de barra en la parte superior de la orden de flete
        </Text>
      </View>
      <View>
        <Center>
          <Button onPress={props.onCancel} width="90%" bgColor="#FF5733">
            <Text color="white">Cancelar</Text>
          </Button>
        </Center>
      </View>
    </View>
  );
}

const styles: any = {
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    padding: 16,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  topOverlay: {
    top: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomOverlay: {
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterBarcodeManualButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 40,
  },
  scanScreenMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
