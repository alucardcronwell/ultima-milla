import * as RNImei from 'react-native-imei';
import DeviceInfo from 'react-native-device-info';

export type ImeiType = {
  value: string;
  type: 'IMEI' | 'ANDROID_ID';
};

class ImeiModule {
  public async getImei(): Promise<ImeiType> {
    const lvl = await DeviceInfo.getApiLevel();
    if (lvl >= 28) {
      //Android ID
      return {
        value: DeviceInfo.getAndroidIdSync(),
        type: 'ANDROID_ID',
      };
    } else {
      const prom = new Promise<string>(reject => {
        RNImei.getImei()
          .then((imeiList: any) => {
            reject(String(imeiList[0]));
          })
          .catch((err: any) => {
            console.warn('Error al obtener imei', err);
            reject('');
          });
      });

      return {
        value: await prom.then(),
        type: 'IMEI',
      };
    }
  }
}

export const IMEI = new ImeiModule();
