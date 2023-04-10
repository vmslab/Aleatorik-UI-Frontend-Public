import * as forge from "node-forge";

let keyPair: forge.pki.rsa.KeyPair;

const GenerateKey = (length: number) => {
  let key = "";
  const hex = "0123456789abcdef";

  for (let i = 0; i < length; i++) {
    key += hex.charAt(Math.floor(Math.random() * 16));
  }

  return key;
};

const EncryptRSA = (key: string, value: string) => {
  const publicKey = forge.pki.publicKeyFromPem(key);
  const pub = forge.pki.rsa.setPublicKey(publicKey.n, publicKey.e);
  const encrypted = pub.encrypt(value, "RSAES-PKCS1-V1_5", {
    md: forge.md.sha256.create(),
  });

  return forge.util.encode64(encrypted);
};

export const GetRSAKey = (): Promise<string> => {
  return new Promise(resolve => {
    keyPair = forge.pki.rsa.generateKeyPair();
    const result = forge.pki.publicKeyToPem(keyPair.publicKey);
    resolve(result);
  });
};

export const EncryptAES = (rsaKey: string, value: string): Promise<string> => {
  return new Promise(resolve => {
    const aesKey = GenerateKey(32);
    const encryptedAesKey = EncryptRSA(rsaKey, aesKey);
    const ivValue = GenerateKey(16);
    const encryptedIV = EncryptRSA(rsaKey, ivValue);

    const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
    cipher.start({ iv: ivValue });
    cipher.update(forge.util.createBuffer(value, "utf8"));
    cipher.finish();
    const cryptedObj = cipher.output;
    const result = `${encryptedAesKey}:${encryptedIV}:
    ${forge.util.encode64(cryptedObj.data)}`;

    resolve(result);
  });
};

const DecryptRSA = (message: string) => {
  const result = keyPair.privateKey.decrypt(forge.util.decode64(message), "RSAES-PKCS1-V1_5");
  return result;
};

export const DecryptAES = (cryptedMessage: string): Promise<string> => {
  return new Promise(resolve => {
    let result = "";

    const arr = cryptedMessage.split(":");
    const decryptedAESKey = DecryptRSA(arr[0]);
    const decryptedIV = DecryptRSA(arr[1]);

    if (decryptedAESKey && decryptedIV) {
      const cipher = forge.cipher.createDecipher("AES-CBC", decryptedAESKey);
      cipher.start({ iv: decryptedIV });
      cipher.update(forge.util.createBuffer(forge.util.decode64(arr[2])));
      cipher.finish();
      const obj = cipher.output;

      result = forge.util.decodeUtf8(obj.data);
    }

    resolve(result);
  });
};
