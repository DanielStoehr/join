
/**
 * makes a deep copy of a nested data structure
 * @param {string[] | object[]} obj - the nested object or array to make a deep copy from
 * @returns {string[] | object[]}   - the deep clone of the passed in object or array
 */
export const deepClone = (obj) => {
    if(typeof obj !== "object" || obj === null) return obj;  // nothing to go deeper into
    const newObject = Array.isArray(obj) ? [] : {};          // create an array or object to hold the values
    for (let key in obj) {
        const value = obj[key];
        newObject[key] = deepClone(value);                   // recursive call for nested objects & arrays
    }
    return newObject;
}