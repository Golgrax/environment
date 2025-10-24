/**
 * Represents the most commonly used SHA-based
 * encryption and hashing algorithms in Node.js.
 */
export enum EncryptionAlgorithm {
  /** SHA-224 encryption method: https://fr.wikipedia.org/wiki/SHA-2#SHA-224 */
  SHA224 = "sha224",
  /** SHA-256 encryption method: https://fr.wikipedia.org/wiki/SHA-2#SHA-256 */
  SHA256 = "sha256",
  /** SHA-384 encryption method: https://fr.wikipedia.org/wiki/SHA-2#SHA-384 */
  SHA384 = "sha384",
  /** SHA-512 encryption method: https://fr.wikipedia.org/wiki/SHA-2#SHA-512 */
  SHA512 = "sha512",
  /** SHA3-256 encryption method: https://fr.wikipedia.org/wiki/SHA-3 */
  SHA3_256 = "sha3-256",
  /** SHA3-512 encryption method: https://fr.wikipedia.org/wiki/SHA-3 */
  SHA3_512 = "sha3-512",
  /** SHAKE128 encryption method: https://fr.wikipedia.org/wiki/SHAKE_(fonction_de_hachage) */
  SHAKE128 = "shake128",
  /** SHAKE256 encryption method: https://fr.wikipedia.org/wiki/SHAKE_(fonction_de_hachage) */
  SHAKE256 = "shake256",
}
