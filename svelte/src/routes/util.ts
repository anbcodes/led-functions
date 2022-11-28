export const generateRandomId = (len = 25) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
  
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);

  return [...array].map((v) => alphabet[Math.round(v / 255 * alphabet.length)])
    .join("");
}