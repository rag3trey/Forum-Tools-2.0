// ==UserScript==
// @name         OnePlus Forum Tools
// @namespace    *.oneplus.net*
// @version      2.0.0
// @description  Useful sidebar addon for the OnePlus forum! :)
// @author       github.com/kpsuperplane, github.com/rag3trey
// @include      *forums.oneplus.net*
// @grant        none
// @license      MIT License; http://opensource.org/licenses/MIT
// @require      https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.4/require.min.js
// ==/UserScript==

window.define = define;
window.require = require;

window.nativeAsset = function(path) {
    return `https://rawgit.com/rag3trey/Forum-Tools-2.0/master/${path}`;
};

requirejs.config({
    paths: {
        "Vue": "https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.1/vue.min",
        "vue": "https://rawgit.com/edgardleal/require-vue/master/dist/require-vuejs"
    },
    shim: {
        "Vue": {"exports": "Vue"}
    },
    map: {
        '*': {
            'css': 'https://cdnjs.cloudflare.com/ajax/libs/require-css/0.1.10/css.min.js' // or whatever the path to require-css is
        }
    }
});

require(['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js', `css!${nativeAsset('spectre/dist/spectre.min')}`], (_) => {
    class ConfigModule{
        constructor(name, defaultConfig, _tools) {
            this._config = null;
            this.name = name;
            this.defaultConfig = defaultConfig;
            this._tools = _tools;
        }
        getConfig() {
            if (this._config === null) {
                this._config = this._tools.setConfig(_.merge({modules: {
                    [this.name]: {
                        config: _.mapValues(this.defaultConfig, 'default')
                    }
                }}, this._tools.getConfig())
                                                    ).modules[this.name].config
                ;            }
            return this._config;
        }
    }

    class ForumTools {
        setConfig(config) {
            window.localStorage.setItem('forumTools', JSON.stringify(config));
            return config;
        }
        getConfig(forceLoad = false) {
            const config = this.config || JSON.parse(window.localStorage.getItem('forumTools'));
            return config || this.setConfig({
                modules: {
                    configurator: {
                        config: {},
                        enabled: true
                    }
                }
            });
        }
        module(name, deps, defaultConfig, init) {
            const ctx = new ConfigModule(name, defaultConfig, this);
            define(name, deps, init.bind(ctx));
        }
        init() {
            require(_.keys(this.getConfig().modules));
        }
        constructor() {
            this.debug = true;
            this.config = null;
        }
    }

    window.forumTools = new ForumTools();

    // GUI Configuration Module
    forumTools.module('configurator', ['Vue'], {}, function(Vue){
        const navItem = $(`<li role="presentation" class="dropdown">
            <a href="javascript:void(0);" v-on:click="toggle">Tools</a>
        </li>`);
        $('#header-nav-top .nav:first').append(navItem);
        var app = new Vue({
            el: navItem[0],
            data: {},
            methods: {
                toggle: function() {
                    alert("I do nothing");
                }
            }
        });
    });

    forumTools.init();

});