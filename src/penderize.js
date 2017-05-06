/**
 * Appends the suffixes to the action type
 * @param {string} type 
 */
export default function penderize(type) {
    return {
        PENDING: `${type}_PENDING`,
        SUCCESS: `${type}_SUCCESS`,
        FAILURE: `${type}_FAILURE`
    }
}
