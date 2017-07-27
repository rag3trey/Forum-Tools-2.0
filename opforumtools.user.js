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

require(['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js', `css!${nativeAsset('spectre/dist/spectre.min')}`, `css!${nativeAsset('spectre/dist/spectre-icons.min')}`], (_) => {
    
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
                }}, this._tools.getConfig())).modules[this.name].config;
            }
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
        _addModule(name, manifest) {
        	this._modules[name] = manifest;
        }
        getModules() {
        	return this._modules;
        }
        module(name, deps, manifest, init) {
        	manifest.config = new ConfigModule(name, manifest.config, this);
        	this._addModule(name, manifest);
            define(name, deps, init.bind(manifest.config));
        }
        init() {
            require(_.keys(this.getConfig().modules));
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
    	config: {}
    }, function(Vue){

        const navItem = $(`<li role="presentation" class="dropdown">
            <a href="javascript:void(0);" v-on:click="toggle">Tools</a>
        </li>`);
        const configMenu = $(`
            <div class="fsc" style="position: absolute;">
            <div class="modal" v-bind:class="{active:active}">
				<div class="modal-overlay"></div>
				<div class="modal-container">
				    <div class="modal-header" style="border-bottom-style: none;">
				    	<button class="btn btn-clear float-right" v-on:click="toggle()"></button>
				      	<div class="modal-title">OnePlus Forum Tools 2.0</div>
				    </div>
				    <div class="modal-body">
					    <div class="content">
					      	<div class="container" style="max-width:62rem;min-width:62rem;margin: -2.5rem -1.5rem -1.5rem -1.5rem;">
							  	<div class="columns">
								    <div class="column col-3">
						            	<ul class="menu" style="padding: 0; box-shadow: none; min-width: 0;">
									  		<li class="menu-item">
									    		<a href="#" class="active">Home</a>
									  		</li>
											<li class="divider" data-content="PLUGINS"></li>
									  		<li class="menu-item" v-for="(module, key) of modules">
									    		<a href="#">{{module.name}}</a>
									  		</li>
										</ul>
									</div>
								    <div class="column col-9">
								    	<h4>Hi there! Welcome to forum tools</h4>
								    	<p>This script exists because @Baymax wanted it. @kp1234 came to the rescue. Use it to install plugins into the forum. Yay!</p>
								    	<div class="empty">
										  <h4 class="empty-title">Need something?</h4>
										  <div class="empty-action">
										    <button class="btn btn-primary">Install a plugin</button>
										  </div>
										</div>
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
            	modules: forumTools.getModules()
            },
            methods: {
                toggle: function() {
                	this.active = !this.active;
                }
            }
        });
        navItem.click(() => app.toggle());

    });

    forumTools.init();

});