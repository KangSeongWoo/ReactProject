export function extractValues(mappings) {
    return Object.keys(mappings)
}

export function lookupValue(mappings, key) {
    return mappings[key]
}

export function lookupKey(mappings, name) {
    for (var key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            if (name === mappings[key]) {
                return key
            }
        }
    }
}

export function getUUID() {
    // UUID v4 generator in JavaScript (RFC4122 compliant)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 3) | 8
        return v.toString(16)
    })
}
