<script>
import beautifyKey from "../../../../src/shared/js/utils/beautifyKey.js";
import ComplexObjectSimple from "./ComplexObjectSimple.vue";
import {translateKeyWithPlausibilityCheck} from "../../../../src/shared/js/utils/translateKeyWithPlausibilityCheck";
import { defineAsyncComponent } from 'vue'


export default {
    name: "ComplexObjectRow",
    components: {ComplexObjectTable: defineAsyncComponent(() => import("./ComplexObjectTable.vue")), ComplexObjectSimple},
    props: {
        propertyKey: {
            type: String,
            required: true
        },
        propertyValue: {
            type: [String, Object, Array],
            required: true
        },
        beautifyKeysParam: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        beautifyKey,
        translateKeyWithPlausibilityCheck
    }
};
</script>

<template>
    <tr
        :key="propertyKey"
    >
        <td
            class="bold firstCol"
        >
            <span v-if="beautifyKeysParam">
                {{ beautifyKey(translateKeyWithPlausibilityCheck(propertyKey, v => $t(v))) }}
            </span>
            <span v-else>
                {{ propertyKey }}
            </span>
        </td>
        <td v-if="Array.isArray(propertyValue)">
            <span
                v-for="(element, key) in propertyValue"
                :key="key"
            >
                <ComplexObjectTable
                    v-if="typeof element === 'object'"
                    :properties="element"
                    :beautify-keys-param="beautifyKeysParam"
                />
                <ComplexObjectSimple
                    v-else
                    :property-key="propertyKey"
                    :property-value="propertyValue"
                    :beautify-keys-param="beautifyKeysParam"
                />
            </span>
        </td>
        <td v-else-if="typeof propertyValue === 'object'">
            <ComplexObjectTable
                :properties="propertyValue"
                :beautify-keys-param="beautifyKeysParam"
            />
        </td>
        <td v-else>
            <ComplexObjectSimple
                :property-key="propertyKey"
                :property-value="propertyValue"
                :beautify-keys-param="beautifyKeysParam"
            />
        </td>
    </tr>
</template>

<style scoped lang="scss">

</style>
