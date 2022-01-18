import qz from 'qz-tray'
import { KJUR, KEYUTIL, stob64, hextorstr } from 'jsrsasign'
/*
 * JavaScript client-side example using jsrsasign
 */

// #########################################################
// #             WARNING   WARNING   WARNING               #
// #########################################################
// #                                                       #
// # This file is intended for demonstration purposes      #
// # only.                                                 #
// #                                                       #
// # It is the SOLE responsibility of YOU, the programmer  #
// # to prevent against unauthorized access to any signing #
// # functions.                                            #
// #                                                       #
// # Organizations that do not protect against un-         #
// # authorized signing will be black-listed to prevent    #
// # software piracy.                                      #
// #                                                       #
// # -QZ Industries, LLC                                   #
// #                                                       #
// #########################################################

/**
 * Depends:
 *     - jsrsasign-latest-all-min.js
 *     - qz-tray.js
 *
 * Steps:
 *
 *     1. Include jsrsasign 8.0.4 into your web page
 *        <script src="https://cdn.rawgit.com/kjur/jsrsasign/c057d3447b194fa0a3fdcea110579454898e093d/jsrsasign-all-min.js"></script>
 *
 *     2. Update the privateKey below with contents from private-key.pem
 *
 *     3. Include this script into your web page
 *        <script src="path/to/sign-message.js"></script>
 *
 *     4. Remove or comment out any other references to "setSignaturePromise"
 */
var privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYeqXhIpUKBVTE\n' +
    'Xx+k4LazZam9T0Zaowjc5XtBonY86e9Ae4V50THaDFZYNb5uaI8DOVW7NZEAkUtD\n' +
    'K1ali94Aac4Jgqh/xGdi0VHhJG7Omr/KzMRpyQBnUA515fYnVMz542Wan1yfz0KI\n' +
    'n+ZxDoSt0G7imCYyKkrlO1Vkeq0JZfCEucyT357Clo+Ix1zSswqjIwJPdx5KkHW4\n' +
    'zx9qSnxrkz3nuaNF40tPSpmNTzrQ2Fnoz4/TEtcBupjXrnFlH9vk+SRIVTzTiCH/\n' +
    'EXCykCwg8d8E3Tw3EyJ+Q3DxXwKsu5J2huXJC0EwqGvyTU2eWz5g40KETD1/WBkQ\n' +
    '+LcQDunzAgMBAAECggEAEevZZrF3uCwnz9f2JS6rQV/FtRPmhaNgnPTshsr90d4l\n' +
    '/ecb7jFI2L3Tuhq86KQETuaEt+pf1jWxDt78Hdld6BfaRERKUcV/L5mXlzVubPE3\n' +
    'toDMM9u9ilAA2nbOsYPeMkPGig3uW5aLcgcWyz5B8qfCPkUNSHLi32ZRk+9p+tCM\n' +
    'GqRe8sXrOvu6i/fbNEs/g7ZjoyULWjW6aDA0qql8yFiWqcOb8AN9tPJTpIaV9TTp\n' +
    'F68Qfq1oFKRL7UL63bJgnv+s25pDjWjBWF+YClA9yCXC19nnroapAicRSC7y0tCF\n' +
    'byFlx0hzahqFVHxHD+TamYVzA7dlW88vvfY51Jr9cQKBgQD27MiSZ6ViT39mdmYb\n' +
    'wPNjLPfTxgr7GewqVodhSrDFtleRrhwSe0gKT3rEJDWwOerL/fgSjZjL165y3cZb\n' +
    'Rvt64jGPOE3uI8cg2o0Ii3okOWe1AbmkZ4H7ZGAa86byJ+SJTMm5AfhAY734A0ZW\n' +
    '+fDwSFZdYEwhUZiXp1LQGn0egwKBgQDgb2lzBf2akFjK8+1ELSpG2l6kx6BxFGvt\n' +
    'TUESqS72D6UVK6jbVljUyMsEP4r/W41m0gnx4G+CX7O+qaxwZamW8t1LQLeg/eyd\n' +
    'V1aAFGM+dIBrwjmUWJMuF+EM8ABBskk7/03q/mkzNvFSRGcTgtjt/J1iaGwcsCP7\n' +
    'kQx3usMr0QKBgQCwAFyChmAKr/F2HiRv2dthsHbBOyMuke6UyvJaNbvEYVEPpJOb\n' +
    '1MWnm7k8vzaJcu7aEh9VUho8CXLtqwgsnW64yytaE17wxA22bDEkiw43bbdu/FjP\n' +
    'R3wNrSEXdN5lMmwiNVp/hVjmxHFuqx7i9ep3yofMrMv238stJXXQoWDXcwKBgBYE\n' +
    'N+b1tnwcHunB5gujFpuevlwRzTZql2/O/Uw0VowC2uHpx4XEwbAWBnxjM2J7e7KT\n' +
    'djBJIQc8FijlAiqAfpN1PaotLhZX8oc40x57YYT17scjZXyc98s0wnn/bTcEo1SE\n' +
    'ZgNgc7d3c1LrrOToGBm4h0PpFHn3+X+rKfrw0kaRAoGAEQM4dJLF4+dpx++afIem\n' +
    'zLuPRZkVcaQ5yfcBqkrFX7cPbLmnmcnj4fqMSCUAU27KVM5EM/uIzPiu/9b2m9TO\n' +
    'UqIHqRGsPMc/MUKIhm4gXXpEXPUutmXqQuxkTNB8ORD5GzscRQahYUu34Cx0OaoG\n' +
    'yFEEIllqBsctDxhXLtcbnM4=\n' +
    '-----END PRIVATE KEY-----'

qz.security.setSignatureAlgorithm('SHA512') // Since 2.1
qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(privateKey)
            var sig = new KJUR.crypto.Signature({ alg: 'SHA512withRSA' }) // Use "SHA1withRSA" for QZ Tray 2.0 and older
            sig.init(pk)
            sig.updateString(toSign)
            var hex = sig.sign()
            console.log('DEBUG: \n\n' + stob64(hextorstr(hex)))
            resolve(stob64(hextorstr(hex)))
        } catch (err) {
            console.error(err)
            reject(err)
        }
    }
})
