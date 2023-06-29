import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {URL_API_DLS, URL_API_PASARELA_MOVIL} from './constants';

type CierreOF = {
  estado?: number;
  mensaje?: string;
  uuid?: string;
  imei: string;
  tipo: 'DLS';
};

type MontoOF = {
  estado: number;
  mensaje: string;
  montoCobrar: number;
};

export type ImeiMaquina = {
  estado: number;
  mensaje: string;
  imei: string;
  numero: null | number;
  tipo: string | null;
};

class DLSApi {
  public async cierraDLS(uuid?: string): Promise<CierreOF> {
    const imeiStr = await AsyncStorage.getItem('@maquina');
    const imei = JSON.parse(imeiStr ? imeiStr : '{}') as ImeiMaquina;
    console.log(`${URL_API_PASARELA_MOVIL}/cierre`);
    const result = await axios.post(`${URL_API_PASARELA_MOVIL}/cierre`, {
      tipo: 'DLS',
      uuid,
      imei: imei.imei,
    });
    if (result.status === 200) {
      return result.data as CierreOF;
    } else {
      return {
        estado: -1,
        mensaje: `"${result.statusText}" al intentar cerrar orden de flete`,
        uuid,
        imei: imei.imei,
        tipo: 'DLS',
      };
    }
  }

  public async getMontoByOF(oflete: number): Promise<MontoOF> {
    try {
      const imeiStr = await AsyncStorage.getItem('@maquina');
      const imei = JSON.parse(imeiStr ? imeiStr : '{}') as ImeiMaquina;
      console.log(
        `URL: ${URL_API_DLS}/validarPagoOrdenFlete?Imei=${imei.imei}&OrdenFlete=${oflete}`,
      );

      const result = await axios.get(
        `${URL_API_DLS}/validarPagoOrdenFlete?Imei=${imei.imei}&OrdenFlete=${oflete}`,
      );
      if (result.status === 200) {
        return result.data as MontoOF;
      } else {
        return {
          estado: -1,
          mensaje: `"${result.statusText}" al intentar obtener orden de flete`,
          montoCobrar: 0,
        };
      }
    } catch (e: any) {
      console.warn('Error al obtener datos desde el API DLS', e);
      return {
        estado: -1,
        mensaje: 'Error al intentar obtener orden de flete',
        montoCobrar: 0,
      };
    }
  }
  public async getImei(tipo: number, numero: number): Promise<ImeiMaquina> {
    try {
      console.log(
        `${URL_API_DLS}/homologacionImei?numeroMaquina=${numero}&tipoMaquina=${tipo}`,
      );
      const result = await axios.get(
        `${URL_API_DLS}/homologacionImei?numeroMaquina=${numero}&tipoMaquina=${tipo}`,
      );
      if (result.status === 200) {
        const data = result.data as any;
        return {...data, numero, tipo} as ImeiMaquina;
      } else {
        return {
          estado: -1,
          mensaje: `"${result.statusText}" al intentar obtener maquina`,
          imei: '',
          numero: null,
          tipo: tipo ? String(tipo) : null,
        };
      }
    } catch (e: any) {
      console.log(
        `${URL_API_DLS}/homologacionImei?numeroMaquina=${numero}&tipoMaquina=${tipo}`,
        e.response.data,
      );
      console.warn('Error al obtener datos desde el API DLS Maquinas', e);
      return {
        estado: -1,
        mensaje: 'Error al intentar obtener maquina',
        imei: '',
        numero: null,
        tipo: tipo ? String(tipo) : null,
      };
    }
  }
}

export const DLS = new DLSApi();
