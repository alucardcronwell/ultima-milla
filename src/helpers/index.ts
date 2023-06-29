import { multiOf } from '../const';

const getId = (ofs: [multiOf]): string => {
    let id = '';
    ofs.forEach((of: multiOf) => {
        id += `${of.of}|`
    })
    const lastIndex = id.lastIndexOf('|')
    if (lastIndex > -1) id = id.substring(0, lastIndex)
    return id
}

const validarOf = (ofs: [multiOf], id: string): boolean => {
    let flag = false;
    ofs.forEach((of: multiOf) => {
        if (of.of === id) flag = true
    })
    return flag;
}

export { getId, validarOf }