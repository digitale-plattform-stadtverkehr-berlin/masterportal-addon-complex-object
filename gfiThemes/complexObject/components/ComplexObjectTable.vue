<script>
import ComplexObjectRow from "./ComplexObjectRow.vue";

export default {
    name: "ComplexObjectTable",
    components: {ComplexObjectRow},
    props: {
        properties: {
            type: Object,
            required: true
        },
        beautifyKeysParam: {
            type: Boolean,
            required: true
        }
    },
    methods: {

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
    <table
        class="table table-hover"
    >
        <tbody>
            <tr v-if="!hasMappedProperties(properties)">
                <td class="bold">
                    {{ $t("modules.tools.gfi.themes.default.noAttributeAvailable") }}
                </td>
            </tr>
            <ComplexObjectRow
                v-for="(value, key) in properties"
                v-else
                :key="key"
                :property-key="key"
                :property-value="value"
                :beautify-keys-param="beautifyKeysParam"
            />
        </tbody>
    </table>
</template>

<style scoped lang="scss">

</style>
