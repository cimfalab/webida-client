/*
* Copyright (c) 2012-2015 S-Core Co., Ltd.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
 * Constructor
 * partModelProvider
 *
 * @see
 * @since: 2015.07.15
 * @author: hw.shim
 */

// @formatter:off
define([
    'webida-lib/plugins/workbench/plugin',
    'webida-lib/util/genetic',
    'webida-lib/util/logger/logger-client',
    './PartModel',
    './PartRegistry'
], function(
    workbench,
    genetic, 
    Logger,
    PartModel,
    PartRegistry
) {
    'use strict';
// @formatter:on

    /**
     * @typedef {Object} DataSource
     * @typedef {Object} PartModel
     */

    var logger = new Logger();
    //logger.setConfig('level', Logger.LEVELS.log);
    //logger.off();

    var partModelProvider = {

        /** @type {Map.<DataSource, {Map.<Function, PartModel>}>} */
        modelRegistry: new Map(),

        /**
         * @private
         * @return {Map.<DataSource, {Map.<Function, PartModel>}>}
         */
        _getModelRegistry: function() {
            return this.modelRegistry;
        },

        _getModelsByDataSource: function(dataSource) {
            return this._getModelRegistry().get(dataSource);
        },

        /**
         * Register PartModel to the modelRegistry.
         *
         * @param {DataSource} dataSource
         * @param {PartModel} model
         */
        register: function(dataSource, model) {
            logger.info('register(' + dataSource + ', ' + model + ')');
            if (!( model instanceof PartModel)) {
                throw new Error('model should implement PartModel interface');
            }
            var reg = this._getModelRegistry();
            if (reg.has(dataSource) === false) {
                reg.set(dataSource, new Map());
            }
            reg.get(dataSource).set(model.constructor, model);
        },

        /**
         * Unregister PartModel from the modelRegistry.
         *
         * @param {PartModel} model
         */
        unregister: function(model) {
            logger.info('unregister(' + model + ')');
            var reg = this._getModelRegistry();
            reg.forEach(function(map) {
                map.forEach(function(partModel, ModelClass) {
                    if (model === partModel) {
                        map['delete'](ModelClass);
                    }
                });
            });
        },

        /**
         * Retrive a PartModel from modelRegistry with
         * given dataSource and PartModel's constructor
         *
         * @param {DataSource} dataSource
         * @param {Function} PartModelClass
         * @return {PartModel}
         */
        getPartModel: function(dataSource, PartModelClass) {
            logger.info('getPartModel(' + dataSource + ', ' + PartModelClass.name + ')');
            var modelsOfDs = this._getModelsByDataSource(dataSource);
            if (modelsOfDs) {
                return modelsOfDs.get(PartModelClass);
            }
        },

        /**
         * Whether the model is used by any Part
         *
         * @param {PartModel} model
         * @return {boolean}
         */
        isModelUsed: function(model) {
            var parts, result = false;
            workbench.getPages().forEach(function(page) {
                parts = page.getPartRegistry().getParts();
                parts.forEach(function(partsByDs, ds) {
                    partsByDs.forEach(function(part) {
                        if (model === part.getModel()) {
                            result = true;
                        }
                    });
                });
            });
            return result;
        },

        _listenPartRegistry: function() {
            // @formatter:off
            var provider = this;
            var page = workbench.getCurrentPage();
            var reg = page.getPartRegistry();
            reg.on(PartRegistry.PART_UNREGISTERED, function(part) {
                var model = part.getModel();
                if (model) {
                    var dataSource = part.getDataSource();
                    var PartModelClass = model.constructor;
                    if (provider.getPartModel(dataSource, PartModelClass) 
                            && provider.isModelUsed(model) === false) {
                        part.resetModel();
                    }                	
                }
            });
            // @formatter:on
        }
    };

    partModelProvider._listenPartRegistry();

    return partModelProvider;
});
