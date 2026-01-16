/* eslint-disable no-prototype-builtins */
/**
 * @classdesc Helper to manipulate data before HTTP request.
 * @author Melo
 * @version 1.1.0 In this new version, the methods are static so you can use them directly from the class
 * @copyright Seed Developpers 2024
 * @name MethodUtils
 */

/**
 * Convertir un objet en formdata
 * @param object l'objet a inserer dans le formdata
 * @returns Formdata
 */
export function toFormData(object: any): FormData {
  const formdata = new FormData();
  // console.log(object.etat);
  for (const prop in object) {
    // skip loop if the property is from prototype
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    // console.log(prop + " = " + object[prop]);
    // console.log(typeof (object[prop]));
    formdata.append(prop, object[prop]);
  }
  return formdata;
}
/**
 * Change object to string to be sent to HTTP request
 * @param object
 * @returns string
 */
export function toHTTPString(object: any): string {
  let stringToReturn = '';
  for (const prop in object) {
    // console.log(object[prop]);
    // skip loop if the property is from prototype
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    stringToReturn = '&' + prop + '=' + object[prop] + stringToReturn;
  }
  return stringToReturn;
}

export function getFormData(formdata: FormData, object: any): void {
  for (const prop in object) {
    // skip loop if the property is from prototype
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    console.log(formdata.get(prop));
  }
}

export function validateEmail(mail: string) {
  // eslint-disable-next-line no-useless-escape
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail) &&
    mail.length > 5
  ) {
    return true;
  }

  return false;
}

export function downloadURI(uri: string, name: string) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // delete link;
}

export function downloadBlob(data: Blob, doc: string, type: string) {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;

  // Optionnel : utilisez le nom de fichier envoyé par le serveur
  const filename = `${doc}-${new Date().getTime()}.${type}`; // Remplacez par le nom de fichier approprié.
  a.download = filename;

  // Déclencher le téléchargement
  a.click();

  // Nettoyez l'URL blob après le téléchargement
  window.URL.revokeObjectURL(url);
}
export function formatDirectusError(errorResponse: any) {
  // Sécurité pour éviter crash si format inattendu
  const errObj = Array.isArray(errorResponse.errors) && errorResponse.errors[0]
    ? errorResponse.errors[0]
    : { message: 'Unknown error', extensions: { code: '' } };

  const { message, extensions } = errObj;
  const code = extensions?.code || '';

  // mapping des messages summary par code
  const summaries: any = {
    FAILED_VALIDATION: 'Validation failed',
    FORBIDDEN: 'Access forbidden',
    INVALID_TOKEN: 'Invalid token',
    TOKEN_EXPIRED: 'Session expired',
    INVALID_CREDENTIALS: 'Authentication failed',
    INVALID_IP: 'IP not allow-listed',
    INVALID_OTP: 'OTP is incorrect',
    INVALID_PAYLOAD: 'Invalid request body',
    INVALID_QUERY: 'Invalid query parameters',
    UNSUPPORTED_MEDIA_TYPE: 'Unsupported payload format',
    REQUESTS_EXCEEDED: 'Too many requests',
    ROUTE_NOT_FOUND: 'Endpoint not found',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    UNPROCESSABLE_CONTENT: 'Request could not be processed',
  };

  const summary = summaries[code] || 'Error';

  return {
    severity: 'error',
    summary,
    detail: message || summary,
  };
}
