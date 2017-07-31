    // ==UserScript==
    // @name         OnePlus Forum Tools
    // @namespace    *.oneplus.net*
    // @version      2.0.1
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
        return `https://cdn.rawgit.com/rag3trey/Forum-Tools-2.0/2.0.1/${path}`;
    };

    requirejs.config({
        paths: {
            "Vue": "https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.1/vue.min"
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

    require(['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js', `css!${nativeAsset('spectre/dist/spectre.min')}`, `css!${nativeAsset('spectre/dist/spectre-icons.min')}`], (_) => {
        
        class ConfigModule{
            constructor(name, manifest, _tools) {
                this._config = null;
                this.name = name;
                this.defaultConfig = manifest.config;
                this.manifest = manifest;
                this._tools = _tools;
                this.getConfig();
            }
            setConfig(config) {
                this._tools.setConfig({
                    modules: {
                        [this.name]: {
                            config: config
                        }
                    }
                });
            }
            getConfig() {
                if (this._config === null) {
                    const mergedConfigs = _.merge({modules: {
                        [this.name]: {
                            config: _.mapValues(this.defaultConfig, 'default')
                        }
                    }}, this._tools.getConfig());
                    mergedConfigs.modules[this.name].manifest = this.manifest;
                    this._config = this._tools.overrideConfig(mergedConfigs).modules[this.name].config;
                }
                return this._config;
            }
        }

        class ForumTools {
            overrideConfig(config) {
                window.localStorage.setItem('forumTools', JSON.stringify(config));
                return config;
            }
            setConfig(config) {
                return this.overrideConfig(_.merge(JSON.parse(window.localStorage.getItem('forumTools')), config));
            }
            getConfig(forceLoad = false) {
                const config = this.config || JSON.parse(window.localStorage.getItem('forumTools'));
                return config || this.setConfig({
                    modules: {
                        configurator: {
                            config: {},
                            enabled: true
                        },
                        general: {
                            config: {},
                            enabled: true
                        }
                    }
                });
            }
            toggleModule(name) {
                this.setConfig({modules: {
                    [name]: {
                        enabled: !this.getConfig().modules[name].enabled
                    }
                }});
            }
            module(name, deps, manifest, init) {
                const ctx = new ConfigModule(name, manifest, this);
                define(name, deps, init.bind(ctx));
            }
            init() {
                require(_.keys(_.pickBy(this.getConfig().modules, (val) => val.enabled)));
            }
            constructor() {
                this.debug = true;
                this.config = null;
                this._modules = {};
            }
        }

        window.forumTools = new ForumTools();

        // GUI Configuration Module
        forumTools.module('configurator', ['Vue'], {
            name: "Configurator",
            description: "Default configuration module for the OnePlus Forum Tools.",
            config: {}
        }, function(Vue){
            const navItem = $(`<li role="presentation" class="dropdown">
                <a href="javascript:void(0);" v-on:click="toggle">Tools</a>
            </li>`);
            const configMenu = $(`
                <div class="fsc" style="position: absolute;">
                <div class="modal" v-bind:class="{active:active}" style="align-items: flex-start;">
                    <div class="modal-overlay"></div>
                    <div class="modal-container" style="width: 64rem; margin-top: 4rem;">
                        <div class="modal-header" style="border-bottom-style: none;">
                            <button class="btn btn-clear float-right" v-on:click="toggle()"></button>
                            <div class="modal-title">OnePlus Forum Tools 2.0</div>
                        </div>
                        <div class="modal-body" style="max-height: none; overflow-y: visible;">
                            <div class="content">
                                <div class="container" style="max-width:62rem;min-width:62rem;margin: -2.5rem -1.5rem -1.5rem -1.5rem;">
                                    <div class="columns">
                                        <div class="column col-3">
                                            <ul class="menu" style="padding: 0; box-shadow: none; min-width: 0;">
                                                <li class="menu-item">
                                                    <a href="javascript:void(0);" v-on:click="changeTab(null)" v-bind:class="{active: tab === null}">Home</a>
                                                </li>
                                                <li class="divider" data-content="PLUGINS"></li>
                                                <li class="menu-item" v-for="(module, key) of modules">
                                                    <a href="javascript:void(0);" v-on:click="changeTab(key)" v-bind:class="{active: tab === key}">{{module.manifest.name}}</a>
                                                </li>
                                            </ul>
                                        </div>
                                        <div v-if="tab === null" class="column col-9">
                                            <h4>Hi there! Welcome to forum tools</h4>
                                            <p>This script exists because @Baymax wanted it. @kp1234 came to the rescue. <!-- Use it to install modules into the forum. --> Yay!</p>
                                            <!-- <div class="empty">
                                              <h4 class="empty-title">Need something?</h4>
                                              <div class="empty-action">
                                                <button class="btn btn-primary">Install a module</button>
                                              </div>
                                            </div> -->
                                        </div>
                                        <div v-if="tab !== null" class="column col-9">
                                            <h5 class="float-left">{{modules[tab].manifest.name}}</h5>
                                            <label class="form-switch float-right" style="padding-right: 0;">
                                                <input type="checkbox" v-bind:disabled="whitelist.includes(tab)" v-on:change="toggleModule(tab)" :checked="modules[tab].enabled"/>
                                                <i class="form-icon"></i> Enabled
                                            </label>
                                            <div class="clearfix"></div>
                                            <p><i v-if="whitelist.includes(tab)">This module cannot be disabled.</i></p>
                                            <h6>Description</h6>
                                            <p>{{modules[tab].manifest.description}}</p>
                                            <h6>Module Configuration</h6>
                                            <div v-if="_.size(modules[tab].config) === 0" class="empty">
                                                <h6 class="empty-subtitle">This module has no settings</h6>
                                            </div>
                                            <div v-if="_.size(modules[tab].config) != 0" style="margin-bottom: 20px;">
                                                <div class="form-group" style="padding: 0;" v-for="(config, key) of modules[tab].manifest.config">
                                                    <template v-if="config.type === 'text'">
                                                        <label class="form-label" :for="'op-tools-config-' + key">{{config.label}}</label>
                                                        <input v-on:change="makeDirty()" class="form-input" v-model="modules[tab].config[key]" type="text" id="'op-tools-config-' + key" placeholder="Enter value here..." />
                                                    </template>
                                                    <template v-if="config.type === 'textarea'">
                                                        <label class="form-label" :for="'op-tools-config-' + key">{{config.label}}</label>
                                                        <textarea style="height: auto" rows="3" v-on:change="makeDirty()" class="form-input" v-model="modules[tab].config[key]" type="text" id="'op-tools-config-' + key" placeholder="Enter value here..."></textarea>
                                                    </template>
                                                    <label v-if="config.type === 'boolean'" class="form-switch">
                                                        <input v-on:change="makeDirty()" type="checkbox" v-model="modules[tab].config[key]"/>
                                                        <i class="form-icon"></i> {{config.label}}
                                                    </label>
                                                    <template v-if="config.type === 'select'">
                                                        <label class="form-label" :for="'op-tools-config-' + key">{{config.label}}</label>
                                                        <select v-on:change="makeDirty()" v-model="modules[tab].config[key]" id="'op-tools-config-' + key" class="form-select">
                                                          <option v-for="option in config.options" v-bind:value="option.value">{{option.title}}</option>
                                                        </select>
                                                    </template>
                                                </div>
                                                <button v-bind:disabled="!dirty" class="btn" v-on:click="save()">Save Changes</button>&nbsp;&nbsp;<button v-bind:disabled="!dirty" class="btn btn-link" v-on:click="reload()">Discard Changes</button>
                                            </div>
                                            <p>You may need to refresh for changes to take effect</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer"></div>
                      </div>
                    </div>
                </div>`);
            $('.sticky-wrapper').css({'position': 'relative', 'z-index': '100'});
            $('#header-nav-top .nav:first').append(navItem);
            $('#header-nav-top .row:first').css('z-index', '2');
            $('#header-nav-top').append(configMenu);
            var app = new Vue({
                el: configMenu[0],
                data: {
                    active: false,
                    tab: null,
                    dirty: false,
                    whitelist: ['configurator'],
                    modules: _.cloneDeep(forumTools.getConfig().modules)
                },
                methods: {
                    toggle: function() {
                        this.active = !this.active;
                    },
                    toggleModule: function(name) {
                        forumTools.toggleModule(name);
                        this.reload();
                    },
                    makeDirty: function() {
                        this.dirty = true;
                    },
                    changeTab: function(tab) {
                        this.dirty = false;
                        this.tab = tab;
                    },
                    save: function() {
                        if (this.tab != null) {
                            this.modules = _.cloneDeep(forumTools.setConfig({
                                modules: {
                                    [this.tab]: {
                                        config: this.modules[this.tab].config
                                    }
                                }
                            }).modules);
                            this.dirty = false;
                        }
                    },
                    reload: function() {
                        this.modules = _.cloneDeep(forumTools.getConfig(true).modules);
                        this.dirty = false;
                    }
                }
            });
            navItem.click(() => app.toggle());

        });

        // GUI Configuration Module
        forumTools.module('general', [], {
            name: "General",
            description: "Default module for the OnePlus Forum Tools that does general stuff.",
            config: {
                homepage: {
                    type: 'select',
                    options: [
                        {title: "None", value: "none"},
                        {title: "Recent", value: "recent"},
                        {title: "Recommended", value: "recommend"},
                        {title: "Most Viewed", value: "hot"},
                        {title: "Most Liked", value: "popular"}
                    ],
                    label: 'Default Homepage',
                    default: "none"
                },
                links: {
                    type: 'textarea',
                    label: 'Quick Links (one per line)',
                    default: "Wormhole: Unread -> /threads/wormhole.269956/unread"
                }
            }
        }, function(){
            const config = this.getConfig();

            // Homepage defaults
            (() => {
                if (config.homepage != "none") {
                    const homeUri = `https://forums.oneplus.net?order=${config.homepage}`;
                    if (location.href.match(/https:\/\/forums.oneplus.net\/?$/g)) location.href=homeUri;
                    $('#header-nav-top a[href="/"]').attr('href', homeUri);
                }
            })();

            // Quick links
            ((links) => {
                if (links[0][0] != "") {
                    const linkContainer = $('<div><span>Quick Links</span></div>').css({
                        position: 'absolute',
                        left: '63px',
                        borderBottomLeftRadius: '3px',
                        borderBottomRightRadius: '3px',
                        padding: '4px 10px',
                        background: '#e5e5e6',
                        bottom: '10px'
                    });
                    for (const link of links) {
                        $('<a />').attr('href', link[1]).text(link[0]).css({
                            marginLeft: '10px',
                            color: 'rgb(235,0,40)'
                        }).appendTo(linkContainer);
                    }
                    $('#header-nav-top').append(linkContainer);
                }
            })(config.links.split('\n').map(v => v.split('->').map(s => s.trim())));
        });
        forumTools.init();

    });