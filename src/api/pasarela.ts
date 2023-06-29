import axios from 'axios';
import {URL_API_PASARELA_MOVIL} from './constants';

export type MediosQRServicios = {
  intencion: string;
  consulta: string;
  reversa: string;
  cancelacion: string;
};

export type MediosQR = {
  nombre: string;
  codigo: string;
  servicio: MediosQRServicios;
  fechaCreacion: Date;
  fechaEdicion: Date;
  estado: string; //aca estados
};

type PasarelaStatus = {
  api: boolean;
  pcl: boolean;
  device: boolean;
};

export type Clients = {
  run: string;
  nombre: string;
  apellido: string;
  razon_social: string;
  giro: string;
  email: string;
  direccion: string;
};

export type Payments = {
  uuid?: string;
  metodo: 'TRANSBANK' | 'MERCADO_PAGO' | 'CHECK' | 'FPAY';
  qr?: string;
  identificador?: string; //Orden de flete - Nro Boleto - etc
  concepto?: string; //Envío, retiro, viaje
  fecha_inicio?: Date;
  fecha_actualizacion?: Date;
  estado?: 'PENDIENTE' | 'CANCELADO' | 'ERROR' | 'CONFIRMADO';
  monto: number;
  origen: string;
  respuesta_integracion?: any;
  cliente?: Clients;
  error?: string;
};

class PasarelaApi {
  async getMediosPago(): Promise<MediosQR[]> {
    try {
      const result = await axios.get(`${URL_API_PASARELA_MOVIL}/medios-qr`);
      if (result.status === 200) {
        return result.data as MediosQR[];
      } else {
        return [];
      }
    } catch (err: any) {
      console.warn('Error en revisión de estado', err.toString(), new Date());
      return [];
    }
  }

  async getStatus(): Promise<PasarelaStatus> {
    try {
      const result = await axios.get(`${URL_API_PASARELA_MOVIL}/estado`);
      if (result.status === 200) {
        return result.data as PasarelaStatus;
      } else {
        return {
          api: false,
          pcl: false,
          device: false,
        };
      }
    } catch (err: any) {
      console.warn('Error en revisión de estado', err.toString(), new Date());
      return {
        api: false,
        pcl: false,
        device: false,
      };
    }
  }

  async cobrar(payment: Payments): Promise<Payments> {
    try {
      const result = await axios.post(
        `${URL_API_PASARELA_MOVIL}/cobro`,
        payment,
      );

      return result.data as Payments;
    } catch (err: any) {
      console.warn('Error en revisión de estado', err, new Date());
      if (err.response) {
        payment = err.response.data;
      } else {
        payment.estado = 'ERROR';
        payment.respuesta_integracion = {
          mensaje: 'Error al intentar cobrar: ' + err.toString(),
        };
      }
      return payment;
    }
  }

  async estadoCobro(uuid?: string): Promise<Payments> {
    let payment: Payments = {} as Payments;
    try {
      const result = await axios.get(`${URL_API_PASARELA_MOVIL}/cobro/${uuid}`);

      return result.data as Payments;
    } catch (err: any) {
      console.warn(
        'Error en revisión de estado en pasarela remota',
        err,
        new Date(),
      );
      if (err.response) {
        payment = err.response.data;
      } else {
        payment.estado = 'ERROR';
        payment.respuesta_integracion = {
          mensaje: 'Error al cobrar: ' + err.toString(),
        };
      }
      return payment;
    }
  }
}

export const Pasarela = new PasarelaApi();
