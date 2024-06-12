<script>
import beautifyKey from "../../../../src/utils/beautifyKey.js";
import {isWebLink} from "../../../../src/utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../src/utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../src/utils/isEmailAddress.js";
import {isHTML} from "../../../../src/utils/isHTML.js";

export default {
    name: "ComplexObjectSimple",
    props: {
        propertyKey: {
            type: String,
            required: true
        },
        propertyValue: {
            type: String,
            required: true
        },
        beautifyKeysParam: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        isHTML,

        /**
       * checks if the given feature has one or more mapped properties
       * @param {Object} properties the current feature to check
       * @returns {Boolean} returns true if feature has mapped properties
       */
        hasMappedProperties (properties) {
            return Object.keys(properties).length !== 0;
        },

        /**
     * @param {string} value string to check.
     * @returns {boolean} whether the given value includes a pipe.
     */
        hasPipe: function (value) {
            return typeof value === "string" && value.includes("|");
        }
    }
};
</script>

<template>
    <a
        v-if="isWebLink(propertyValue)"
        :href="propertyValue"
        target="_blank"
    >Link</a>
    <a
        v-else-if="isPhoneNumber(propertyValue)"
        :href="getPhoneNumberAsWebLink(propertyValue)"
    >{{ propertyValue }}</a>
    <a
        v-else-if="isEmailAddress(propertyValue)"
        :href="`mailto:${propertyValue}`"
    >{{ propertyValue }}</a>
    <div
        v-else-if="typeof propertyValue === 'string' && propertyValue.includes('<br>')"
        v-html="propertyValue"
    />
    <span v-else>
        {{ propertyValue }}
    </span>
</template>

<style scoped lang="scss">

</style>
