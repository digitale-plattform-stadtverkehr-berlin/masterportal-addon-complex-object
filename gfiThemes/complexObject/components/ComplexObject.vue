<script>
import CompareFeatureIcon from "../../../../src/modules/tools/gfi/components/favoriteIcons/components/CompareFeatureIcon.vue";
import {getPropertiesWithFullKeys} from "../../../../src/modules/tools/gfi/utils/getPropertiesWithFullKeys.js";
import {mapAttributes} from "../utils/attributeMapper";
import ComplexObjectTable from "./ComplexObjectTable.vue";

export default {
    name: "ComplexObject",
    components: {
        ComplexObjectTable,
        CompareFeatureIcon
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            imageLinks: ["bildlink", "link_bild", "Bild", "bild"],
            importedComponents: [],
            showFavoriteIcons: true,
            maxWidth: "600px",
            beautifyKeysParam: true,
            showObjectKeysParam: false
        };
    },
    computed: {

    },
    watch: {
        feature () {
            this.$nextTick(() => {
                this.setMaxWidth(this.feature.getTheme()?.params);
                this.initParams(this.feature.getTheme()?.params);
            });
        }
    },
    created () {
        this.showFavoriteIcons = this.feature.getTheme()?.params?.showFavoriteIcons ?
            this.feature.getTheme().params.showFavoriteIcons : this.showFavoriteIcons;

        this.replacesConfiguredImageLinks();
        this.setImportedComponents();
    },
    mounted () {
        this.$nextTick(() => {
            this.setMaxWidth(this.feature.getTheme()?.params);
            this.initParams(this.feature.getTheme()?.params);
        });
    },
    methods: {
        /**
         * checks if given feature has a function getMappedProperties
         * @param {Object} feature the current feature to check
         * @return {Boolean} returns true if given feature has a function getMappedProperties
         */
        mappedPropertiesExists (feature) {
            return typeof feature === "object" && feature !== null && typeof feature.getMappedProperties === "function";
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
         * Replaces  the configured imageLinks from the gfiTheme.params to the imageLinks.
         * @returns {void}
         */
        replacesConfiguredImageLinks: function () {
            const imageLinksAttribute = this.feature.getTheme()?.params?.imageLinks;

            if (Array.isArray(imageLinksAttribute)) {
                this.imageLinks = imageLinksAttribute;
            }
            else if (typeof imageLinksAttribute === "string") {
                this.imageLinks = [imageLinksAttribute];
            }
        },

        /**
         * Sets the max-width of the default gfiTheme content.
         * @param {Object} params The gfi parameters.
         * @returns {void}
         */
        setMaxWidth: function (params) {
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
@include media-breakpoint-up(sm) {
    .gfi-iFrame {
        width: 450px;
    }
}
@include media-breakpoint-down(sm) {
    .gfi-iFrame {
        width: 100%;
    }
}
.gfi-theme-iframe {
    line-height: 1px;
}
.gfi-theme-images {
    max-width: 600px;
    height: 100%;
}
.gfi-theme-images-image {
    margin: auto;
    display: block;
    text-align: center;
    color: $black;
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
