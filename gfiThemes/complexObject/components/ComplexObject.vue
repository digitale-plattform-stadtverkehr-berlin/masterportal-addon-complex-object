<script>
import beautifyKey from "../../../../src/shared/js/utils/beautifyKey.js";
import {isImage, isWebLink} from "../../../../src/shared/js/utils/urlHelper.js";
import {translateKeyWithPlausibilityCheck} from "../../../../src/shared/js/utils/translateKeyWithPlausibilityCheck.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../src/shared/js/utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../src/shared/js/utils/isEmailAddress.js";
import {isHTML} from "../../../../src/shared/js/utils/isHTML.js";
import {getPropertiesWithFullKeys} from "../js/getPropertiesWithFullKeys.js";
import ComplexObjectTable from "./ComplexObjectTable.vue";
import {mapAttributes} from "../utils/attributeMapper";

/**
 * The default theme for the get feature info.
 * @module modules/getFeatureInfo/themes/default/components/DefaultTheme
 * @vue-prop {Object} feature - The required feature.
 * @vue-data {Object[]} importedComponents - The imported gfi themes.
 * @vue-data {Boolean} [showFavoriteIcons=true] - Show favorite icons.
 * @vue-data {Boolean} [beautifyKeysParam=true] - Specifies if the keys should be displayed more nicely, like first letter cap.
 * @vue-data {Boolean} [showObjectKeysParam=false] - Show objects key params.
 * @vue-computed {String} mimeType - Returns the mimeType of the gfi feature
 */
export default {
    name: "ComplexObject",
    components: {
        ComplexObjectTable
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            importedComponents: [],
            showFavoriteIcons: true,
            beautifyKeysParam: true,
            showObjectKeysParam: false
        };
    },
    computed: {
        /**
         * Returns the mimeType of the gfi feature.
         * @returns {String} The mimeType.
         */
        mimeType: function () {
            return this.feature.getMimeType();
        }
    },
    watch: {
        feature () {
            this.$nextTick(() => {
                this.addTextHtmlContentToIframe();
                this.initParams(this.feature.getTheme()?.params);
            });
        }
    },
    created () {
        this.showFavoriteIcons = this.feature.getTheme()?.params?.showFavoriteIcons ?
            this.feature.getTheme().params.showFavoriteIcons : this.showFavoriteIcons;

        this.setImportedComponents();
    },
    mounted () {
        this.$nextTick(() => {
            this.addTextHtmlContentToIframe();
            this.initParams(this.feature.getTheme()?.params);
        });
    },
    methods: {
        beautifyKey,
        isWebLink,
        isImage,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        isHTML,
        translateKeyWithPlausibilityCheck,

        /**
         * checks if given feature has a function getMappedProperties
         * @param {Object} feature the current feature to check
         * @return {Boolean} returns true if given feature has a function getMappedProperties
         */
        mappedPropertiesExists (feature) {
            return typeof feature === "object" && feature !== null && typeof feature.getMappedProperties === "function";
        },

        /**
         * checks if the given feature has one or more mapped properties
         * @param {Object} feature the current feature to check
         * @returns {Boolean} returns true if feature has mapped properties
         */
        hasMappedProperties (feature) {
            return Object.keys(feature.getMappedProperties()).length !== 0;
        },
        /**
         * @param {String} value string to check.
         * @returns {Boolean} whether the given value includes a pipe.
         */
        hasPipe: function (value) {
            return typeof value === "string" && value.includes("|");
        },
        /**
         * returns the mapped properties of the given feature or parses the properites through getPropertiesWithFullKeys if the component flag showObjectKeysParam is set
         * @param {Object} feature the current feature
         * @param {Boolean} [showObjectKeysParam=false] the switch to activate getPropertiesWithFullKeys
         * @returns {Object} returns mapped properties
         */
        getMappedPropertiesOfFeature (feature, showObjectKeysParam = false) {
            if (showObjectKeysParam === true) {
                const properties = getPropertiesWithFullKeys(feature.getMappedProperties());

                return properties !== false ? properties : {};
            }
            return this.prepareProperties(feature.getProperties(), feature.getAttributesToShow());
        },
        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @param {String[]} ignoredKeys - configured in the config.js
         * @returns {Object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject) {
            return mapAttributes(properties, mappingObject);
        },

        /**
         * sets params from gfiTheme params
         * @param {Object} params the params to set
         * @returns {void}
         */
        initParams (params) {
            if (typeof params !== "object" || params === null) {
                return;
            }
            this.beautifyKeysParam = params?.beautifyKeys;
            this.showObjectKeysParam = params?.showObjectKeys;
        },

        /**
         * Sets the imported components to importedComponents.
         * @returns {void}
         */
        setImportedComponents: function () {
            Object.keys(this.$options.components).forEach(componentName => {
                if (componentName !== "ComplexObject") {
                    this.importedComponents.push(this.$options.components[componentName]);
                }
            });
        },

        /**
         * Adds the text/html content to the iframe.
         * The onLoad event of the iframe starts with the execution of close().
         * @returns {void}
         */
        addTextHtmlContentToIframe: function () {
            const iframe = document.getElementsByClassName("gfi-iFrame")[0];

            if (this.mimeType === "text/html" && iframe) {
                this.setIframeSize(iframe, this.feature.getTheme()?.params);
                iframe.contentWindow.document.open();
                iframe.contentWindow.document.write(this.feature.getDocument());
                iframe.contentWindow.document.close();
            }
        },

        /**
         * Sets the size of the given iframe.
         * The iframe size can be overwritten in the config.json at the layer.
         * @param {Object} iframe The iframe.
         * @param {Object} params The gfi parameters.
         * @returns {void}
         */
        setIframeSize: function (iframe, params) {
            document.getElementsByClassName("gfi-theme-iframe")[0].style.maxWidth = "";
            iframe.style.width = params?.iframe?.width;
            iframe.style.height = params?.iframe?.height;
        }
    }
};
</script>

<template>
    <div>
        <ComplexObjectTable
            v-if="mappedPropertiesExists(feature)"
            :properties="getMappedPropertiesOfFeature(feature, showObjectKeysParam)"
            :beautify-keys-param="beautifyKeysParam"
        />
    </div>
</template>


<style lang="scss" scoped>
@import "~variables";

.table > tbody > tr > td {
    padding: 5px 8px;
    font-size: $font-size-base;
    &.bold{
        font-family: $font_family_accent;
    }
}
.gfi-iFrame {
    height: 450px;
    resize: both;
}
@media (min-width: 768px) {
    .gfi-iFrame {
        width: 450px;
    }
}
@media (max-width: 767px) {
    .gfi-iFrame {
        width: 100%;
    }
}
.gfi-theme-iframe {
    line-height: 1px;
}
.gfi-theme-images-image {
    margin: auto;
    display: block;
    text-align: center;
    color: $black;
    width: 100%;
}
.favorite-icon-container {
    display: flex;
    justify-content: center;
    .bootstrap-icon {
        font-size: $font_size_huge;
        padding: 0 2px;
    }
}
.table {
    margin-bottom: 0;
}
</style>
