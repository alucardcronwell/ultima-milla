/* eslint-disable no-useless-escape */
export class Utils {
  static formatDate(date: string | undefined | null, withHora: boolean = true) {
    try {
      if (date === undefined || date === null) {
        return date;
      }
      const arr = date.split('T');
      const fecha = arr[0];
      const hora = arr[1];

      const dma = fecha.split('-');
      if (withHora) {
        return dma[2] + '-' + dma[1] + '-' + dma[0] + ' ' + hora.split('.')[0];
      } else {
        return dma[2] + '-' + dma[1] + '-' + dma[0];
      }
    } catch (err) {
      console.warn('Error al parsear fechas', err);
      return date;
    }
  }

  static formatWords(oracion: string | undefined) {
    if (oracion === null || oracion === undefined) {
      return '';
    }
    oracion = oracion.toLowerCase();
    return oracion.replace(
      /^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g,
      function ($1) {
        return $1.toUpperCase();
      },
    );
  }

  static formatMoney(num: number): string {
    if (num === null || num === undefined) {
      return '';
    }
    const money = num
      .toString()
      .split('')
      .reverse()
      .join('')
      .replace(/(?=\d*\.?)(\d{3})/g, '$1.');
    return money.split('').reverse().join('').replace(/^[\.]/, '');
  }

  static esEmpresa(runFactura: string) {
    try {
      if (runFactura.length > 0) {
        let runClean = runFactura
          .toLowerCase()
          .split('-')
          .join('')
          .split('.')
          .join('')
          .trim();

        runClean = runClean.substr(0, runClean.length - 1);
        if (Number(runClean) > 50000000) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  static zfill(number: number, width: number) {
    let numberOutput = Math.abs(number); /* Valor absoluto del número */
    let length = number.toString().length; /* Largo del número */
    let zero = '0'; /* String de cero */

    if (width <= length) {
      if (number < 0) {
        return '-' + numberOutput.toString();
      } else {
        return numberOutput.toString();
      }
    } else {
      if (number < 0) {
        return '-' + zero.repeat(width - length) + numberOutput.toString();
      } else {
        return zero.repeat(width - length) + numberOutput.toString();
      }
    }
  }
}
