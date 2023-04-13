/*!
 * Create a new object composed of properties picked from another object
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Object} obj   The object to pick properties from
 * @param  {Array}  props An array of properties to use
 * @return {Object}       The new object
 */
export const pick = (obj: any, keys: string[]) => {
  // Create new object
  let picked: any = {};

  // Loop through props and push to new object
  for (let key of keys) {
    picked[key] = obj[key];
  }

  // Return new object
  return picked;
};
