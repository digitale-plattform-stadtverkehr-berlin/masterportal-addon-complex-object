import {getValueFromObjectByPath} from "./getValueFromObjectByPath.js";
import thousandsSeparator from "./thousandsSeparator";
import dayjs from "dayjs";
/**
 * checks if value starts with special prefix to determine if value is a object path
 * @param   {string} value string to check
 * @returns {Boolean} true is value is an object path
 */
function isObjectPath (value) {
    return typeof value === "string" && value.startsWith("@");
}
/**
 * Returns the value of the given key. Also considers, that the key may be an object path.
 * @param {Object} properties properties.
 * @param {String} propertyKey Key to derive value from.
 * @returns {*} - Value from key.
 */
function prepareValue (properties, propertyKey) {
    Object.keys(properties).forEach((parentKey) => {
        if (properties[parentKey] && typeof properties[parentKey] === "object") {
            Object.keys(properties[parentKey]).forEach((key) => {
                properties[parentKey + "." + key] = properties[parentKey][key];
            });
        }
    });

    const isPath = isObjectPath(propertyKey);
    let value = properties[Object.keys(properties).find(propertiesKey => propertiesKey.toLowerCase() === propertyKey.toLowerCase())];

    if (isPath) {
        value = getValueFromObjectByPath(properties, propertyKey);
    }

    return value;
}

/**
 * Parsing the boolean value
 * @param {String} value default value
 * @param {String|Object} format the format of boolean value
* @returns {String} - original value or parsed value
 */
function getBooleanValue (value, format) {
    let parsedValue = String(value);

    if (Object.prototype.hasOwnProperty.call(format, value)) {
        // TODO: check if true -> translation is dismissed because i18next does not exist in masterportalApi
        parsedValue = format[value];

    }
    return parsedValue;
}

/**
 * Appends a suffix if available.
 * @param {*} value Value to append suffix.
 * @param {String} suffix Suffix
 * @returns {String} - Value with suffix.
 */
function appendSuffix (value, suffix) {
    let valueWithSuffix = value;

    if (suffix) {
        valueWithSuffix = String(valueWithSuffix) + " " + suffix;
    }
    return valueWithSuffix;
}

/**
 * Prepend a prefix if available.
 * @param {*} value Value to prepend prefix.
 * @param {String} prefix Prefix
 * @returns {String} - Value with prefix.
 */
function prependPrefix (value, prefix) {
    let valueWithPrefix = value;

    if (prefix) {
        valueWithPrefix = prefix + String(valueWithPrefix);
    }
    return valueWithPrefix;
}

/**
 * Derives the value from the given condition.
 * @param {String} key Key.
 * @param {String} condition Condition to filter.
 * @param {Object} properties Properties.
 * @returns {*} - Value that matches the given condition.
 */
function getValueFromCondition (key, condition, properties) {
    let valueFromCondition,
        match;

    if (condition === "contains") {
        match = Object.keys(properties).filter(key2 => {
            return key2.includes(key);
        })[0];
        valueFromCondition = properties[match];
    }
    else if (condition === "startsWith") {
        match = Object.keys(properties).filter(key2 => {
            return key2.startsWith(key);
        })[0];
        valueFromCondition = properties[match];
    }
    else if (condition === "endsWith") {
        match = Object.keys(properties).filter(key2 => {
            return key2.endsWith(key);
        })[0];
        valueFromCondition = properties[match];
    }
    else {
        valueFromCondition = properties[key];
    }

    return valueFromCondition;

}

/**
 * Maps the feature properties by the given object. if the value is the wildcard '%value%' then the prepared value is taken.
 * @param {HTML} htmltag The html tag.
 * @param {Object} properties The properties for the htmltag.
 * @param {String} preparedValue The prepared value.
 * @returns {HTML} The html tag with mapped properties.
 */
function addPropertiesToHtmlTag (htmltag, properties, preparedValue) {
    const htmltagWithproperties = htmltag;

    if (properties) {
        Object.keys(properties).forEach(prop => {
            if (properties[prop] === "%value%") {
                htmltagWithproperties.setAttribute(prop, preparedValue);
            }
            else {
                htmltagWithproperties.setAttribute(prop, properties[prop]);
            }
        });
    }
    return htmltagWithproperties;
}

/**
 * Derives the gfi value if the value is an object.
 * @param {*} key Key of Attribute.
 * @param {Object} mappingObj Value of attribute.
 * @param {Object} properties object.
 * @returns {*} - Prepared Value
 */
function prepareValueFromObject (key, mappingObj, properties) {
    const type = mappingObj?.type ? mappingObj.type : "string",
        condition = mappingObj?.condition ? mappingObj.condition : null,
        serializer = new XMLSerializer();
    let preparedValue = prepareValue(properties, key),
        format = mappingObj?.format ? mappingObj.format : "YYYY-MM-DDTHH:mm:ss.SSSZ",
        date,
        htmltag;

    if (condition) {
        preparedValue = getValueFromCondition(key, condition, properties);
    }
    switch (type) {
        case "array": {
            if (Array.isArray(preparedValue)) {
                const mappedValues = [];

                for (let i = 0; i < preparedValue.length; i++) {
                    mappedValues.push(prepareValueFromObject(key, mappingObj.elements, {[key]: preparedValue[i]}));
                }
                preparedValue = mappedValues;
            }
            break;
        }
        case "object": {
            preparedValue = mapAttributes(preparedValue, mappingObj.children);
            break;
        }
        case "date": {
            date = new Date(String(preparedValue));
            if (format === "YYYY-MM-DDTHH:mm:ss.SSSZ") {
                const offset = date.getTimezoneOffset();

                let offsetHours = (offset / 60) % 24,
                    offsetMinutes = offset % 60;

                offsetHours = offsetHours < 0 ? "+" + ("0" + Math.abs(offsetHours)).slice(-2) : "-" + ("0" + Math.abs(offsetHours)).slice(-2);
                offsetMinutes = offsetMinutes < 0 ? ":" + ("0" + Math.abs(offsetMinutes)).slice(-2) : ":" + ("0" + offsetMinutes).slice(-2);
                preparedValue = date.toISOString().slice(0, -1) + offsetHours + offsetMinutes;
            }
            else if (!isNaN(date.getDay())) {
                preparedValue = dayjs(String(preparedValue)).format(format);
            }
            else {
                console.warn("If the attribute is missing, ISO 8601 is used.");
            }
            break;
        }
        case "number": {
            preparedValue = thousandsSeparator(preparedValue);
            break;
        }
        case "linechart": {
            preparedValue = Object.assign({
                name: key,
                staObject: preparedValue
            }, mappingObj);
            break;
        }
        case "boolean": {
            format = format === "DD.MM.YYYY HH:mm:ss" ? {true: "true", false: "false"} : format;
            preparedValue = getBooleanValue(preparedValue, format);
            break;
        }
        case "html": {
            if (preparedValue !== undefined) {
                // create tag
                if (mappingObj?.html?.tag) {
                    htmltag = document.createElement(mappingObj?.html?.tag);
                }
                // create innerHTML
                if (mappingObj?.html?.innerHTML === "%value%") {
                    htmltag.innerHTML = preparedValue;
                }
                else if (mappingObj?.html?.innerHTML) {
                    htmltag.innerHTML = mappingObj?.html?.innerHTML;
                }
                if (htmltag) {
                    if (mappingObj?.html?.properties) {
                        htmltag = addPropertiesToHtmlTag(htmltag, mappingObj?.html?.properties, preparedValue);
                    }
                    preparedValue = serializer.serializeToString(htmltag);
                    // remove xmlns
                    preparedValue = preparedValue.replace(/ xmlns="(.*?)"/g, "");
                }
            }
            break;
        }
        // default equals to mappingObj.type === "string"
        default: {
            preparedValue = String(preparedValue);
        }
    }
    if (preparedValue && mappingObj.suffix && preparedValue !== "undefined") {
        preparedValue = appendSuffix(preparedValue, mappingObj.suffix);
    }
    if (preparedValue && mappingObj.prefix && preparedValue !== "undefined") {
        preparedValue = prependPrefix(preparedValue, mappingObj.prefix);
    }
    return preparedValue;
}

/**
 * Maps the feature properties by the given object.
 * @param {Object} properties The feature properties.
 * @param {Object} mappingObject Object to me mapped.
 * @param {Boolean} [isNested=true] Flag if Object is nested, like "gfiAttributes".
 * @returns {Object} The mapped properties.
 */
function mapAttributes (properties, mappingObject, isNested = true) {
    let mappedProperties;

    if (!mappingObject) {
        return false;
    }
    if (!isNested) {
        if (typeof mappingObject === "string") {
            mappedProperties = prepareValue(properties, mappingObject);
        }
        else {
            mappedProperties = prepareValueFromObject(mappingObject.name, mappingObject, properties);
        }
    }
    else {
        mappedProperties = {};
        Object.keys(mappingObject).forEach(key => {
            let newKey = mappingObject[key],
                value = prepareValue(properties, key);

            if (typeof newKey === "object") {
                value = prepareValueFromObject(key, newKey, properties);
                newKey = newKey.name;
            }
            if (value && value !== "undefined") {
                mappedProperties[newKey] = value;
            }
        });
    }
    return mappedProperties;
}

export {
    mapAttributes,
    isObjectPath,
    prepareValue
};
