
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.53.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Logo.svelte generated by Svelte v3.53.1 */

    const file$6 = "src/Logo.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let text_1;
    	let t;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			text_1 = svg_element("text");
    			t = text("ACME");
    			attr_dev(text_1, "x", "0");
    			attr_dev(text_1, "y", "20");
    			attr_dev(text_1, "class", "svelte-c20ww7");
    			add_location(text_1, file$6, 1, 1, 28);
    			attr_dev(svg, "width", "auto");
    			attr_dev(svg, "height", "30");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, text_1);
    			append_dev(text_1, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logo> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Hamburger.svelte generated by Svelte v3.53.1 */

    const file$5 = "src/Hamburger.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let svg;
    	let line0;
    	let line1;
    	let line2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			attr_dev(line0, "id", "top");
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "2");
    			attr_dev(line0, "x2", "32");
    			attr_dev(line0, "y2", "2");
    			attr_dev(line0, "class", "svelte-13d4q11");
    			add_location(line0, file$5, 6, 4, 220);
    			attr_dev(line1, "id", "middle");
    			attr_dev(line1, "x1", "0");
    			attr_dev(line1, "y1", "12");
    			attr_dev(line1, "x2", "24");
    			attr_dev(line1, "y2", "12");
    			attr_dev(line1, "class", "svelte-13d4q11");
    			add_location(line1, file$5, 7, 4, 263);
    			attr_dev(line2, "id", "bottom");
    			attr_dev(line2, "x1", "0");
    			attr_dev(line2, "y1", "22");
    			attr_dev(line2, "x2", "32");
    			attr_dev(line2, "y2", "22");
    			attr_dev(line2, "class", "svelte-13d4q11");
    			add_location(line2, file$5, 8, 4, 310);
    			attr_dev(svg, "width", "32");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "class", "svelte-13d4q11");
    			add_location(svg, file$5, 5, 2, 191);
    			attr_dev(button, "class", "text-gray-500 hover:text-gray-700 cursor-pointer mr-4 border-none focus:outline-none svelte-13d4q11");
    			toggle_class(button, "open", /*open*/ ctx[0]);
    			add_location(button, file$5, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*open*/ 1) {
    				toggle_class(button, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hamburger', slots, []);
    	let { open = false } = $$props;
    	const writable_props = ['open'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hamburger> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, open = !open);

    	$$self.$$set = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    	};

    	$$self.$capture_state = () => ({ open });

    	$$self.$inject_state = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open, click_handler];
    }

    class Hamburger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { open: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hamburger",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get open() {
    		throw new Error("<Hamburger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Hamburger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Menu.svelte generated by Svelte v3.53.1 */

    const file$4 = "src/Menu.svelte";

    function create_fragment$4(ctx) {
    	let nav;
    	let a0;
    	let t1;
    	let a1;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "About";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Contact";
    			attr_dev(a0, "href", "/about");
    			attr_dev(a0, "class", "hover:text-gray-700 hover:no-underline");
    			add_location(a0, file$4, 1, 2, 66);
    			attr_dev(a1, "href", "/contact");
    			attr_dev(a1, "class", "hover:text-gray-700 hover:no-underline");
    			add_location(a1, file$4, 2, 1, 141);
    			attr_dev(nav, "class", "hidden text-gray-500 uppercase text-bold sm:block");
    			add_location(nav, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Navbar.svelte generated by Svelte v3.53.1 */
    const file$3 = "src/Navbar.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let nav;
    	let hamburger;
    	let updating_open;
    	let t0;
    	let logo;
    	let t1;
    	let menu;
    	let current;

    	function hamburger_open_binding(value) {
    		/*hamburger_open_binding*/ ctx[1](value);
    	}

    	let hamburger_props = {};

    	if (/*sidebar*/ ctx[0] !== void 0) {
    		hamburger_props.open = /*sidebar*/ ctx[0];
    	}

    	hamburger = new Hamburger({ props: hamburger_props, $$inline: true });
    	binding_callbacks.push(() => bind(hamburger, 'open', hamburger_open_binding));
    	logo = new Logo({ $$inline: true });
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			create_component(hamburger.$$.fragment);
    			t0 = space();
    			create_component(logo.$$.fragment);
    			t1 = space();
    			create_component(menu.$$.fragment);
    			attr_dev(nav, "class", "flex");
    			add_location(nav, file$3, 9, 1, 254);
    			attr_dev(header, "class", "flex justify-between bg-gray-200 p-2 items-center text-gray-600 border-b-2");
    			add_location(header, file$3, 8, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			mount_component(hamburger, nav, null);
    			append_dev(nav, t0);
    			mount_component(logo, nav, null);
    			append_dev(header, t1);
    			mount_component(menu, header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburger_changes = {};

    			if (!updating_open && dirty & /*sidebar*/ 1) {
    				updating_open = true;
    				hamburger_changes.open = /*sidebar*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			hamburger.$set(hamburger_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburger.$$.fragment, local);
    			transition_in(logo.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburger.$$.fragment, local);
    			transition_out(logo.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(hamburger);
    			destroy_component(logo);
    			destroy_component(menu);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { sidebar = false } = $$props;
    	const writable_props = ['sidebar'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	function hamburger_open_binding(value) {
    		sidebar = value;
    		$$invalidate(0, sidebar);
    	}

    	$$self.$$set = $$props => {
    		if ('sidebar' in $$props) $$invalidate(0, sidebar = $$props.sidebar);
    	};

    	$$self.$capture_state = () => ({ Logo, Hamburger, Menu, sidebar });

    	$$self.$inject_state = $$props => {
    		if ('sidebar' in $$props) $$invalidate(0, sidebar = $$props.sidebar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [sidebar, hamburger_open_binding];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { sidebar: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get sidebar() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sidebar(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Sidebar.svelte generated by Svelte v3.53.1 */

    const file$2 = "src/Sidebar.svelte";

    function create_fragment$2(ctx) {
    	let aside;
    	let nav;
    	let a0;
    	let t1;
    	let a1;

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			nav = element("nav");
    			a0 = element("a");
    			a0.textContent = "About";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Contact";
    			attr_dev(a0, "class", "block");
    			attr_dev(a0, "href", "#about");
    			add_location(a0, file$2, 6, 2, 158);
    			attr_dev(a1, "class", "block");
    			attr_dev(a1, "href", "#contact");
    			add_location(a1, file$2, 7, 2, 201);
    			attr_dev(nav, "class", "p-12 text-xl");
    			add_location(nav, file$2, 5, 1, 129);
    			attr_dev(aside, "class", "absolute w-full h-full bg-gray-200 border-r-2 shadow-lg svelte-heyhuw");
    			toggle_class(aside, "open", /*open*/ ctx[0]);
    			add_location(aside, file$2, 4, 0, 45);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, nav);
    			append_dev(nav, a0);
    			append_dev(nav, t1);
    			append_dev(nav, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*open*/ 1) {
    				toggle_class(aside, "open", /*open*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);
    	let { open = false } = $$props;
    	const writable_props = ['open'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    	};

    	$$self.$capture_state = () => ({ open });

    	$$self.$inject_state = $$props => {
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [open];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { open: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get open() {
    		throw new Error("<Sidebar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Sidebar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Main.svelte generated by Svelte v3.53.1 */

    const file$1 = "src/Main.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let svg;
    	let line0;
    	let line1;
    	let line2;
    	let line3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			line2 = svg_element("line");
    			line3 = svg_element("line");
    			attr_dev(line0, "x1", "0");
    			attr_dev(line0, "y1", "4");
    			attr_dev(line0, "x2", "400");
    			attr_dev(line0, "y2", "4");
    			attr_dev(line0, "class", "svelte-ujyhxt");
    			add_location(line0, file$1, 2, 2, 69);
    			attr_dev(line1, "x1", "0");
    			attr_dev(line1, "y1", "34");
    			attr_dev(line1, "x2", "200");
    			attr_dev(line1, "y2", "34");
    			attr_dev(line1, "class", "svelte-ujyhxt");
    			add_location(line1, file$1, 3, 2, 101);
    			attr_dev(line2, "x1", "0");
    			attr_dev(line2, "y1", "64");
    			attr_dev(line2, "x2", "300");
    			attr_dev(line2, "y2", "64");
    			attr_dev(line2, "class", "svelte-ujyhxt");
    			add_location(line2, file$1, 4, 2, 135);
    			attr_dev(line3, "x1", "0");
    			attr_dev(line3, "y1", "94");
    			attr_dev(line3, "x2", "280");
    			attr_dev(line3, "y2", "94");
    			attr_dev(line3, "class", "svelte-ujyhxt");
    			add_location(line3, file$1, 5, 2, 169);
    			attr_dev(svg, "height", "100%");
    			attr_dev(svg, "width", "100%");
    			attr_dev(svg, "class", "svelte-ujyhxt");
    			add_location(svg, file$1, 1, 1, 34);
    			attr_dev(main, "class", "p-4 text-gray-300");
    			add_location(main, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, svg);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    			append_dev(svg, line2);
    			append_dev(svg, line3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.53.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let sidebar;
    	let updating_open;
    	let t0;
    	let navbar;
    	let updating_sidebar;
    	let t1;
    	let link;
    	let t2;
    	let main;
    	let h1;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let p0;
    	let t7;
    	let a0;
    	let t9;
    	let t10;
    	let p1;
    	let t11;
    	let a1;
    	let t13;
    	let current;

    	function sidebar_open_binding(value) {
    		/*sidebar_open_binding*/ ctx[2](value);
    	}

    	let sidebar_props = {};

    	if (/*open*/ ctx[1] !== void 0) {
    		sidebar_props.open = /*open*/ ctx[1];
    	}

    	sidebar = new Sidebar({ props: sidebar_props, $$inline: true });
    	binding_callbacks.push(() => bind(sidebar, 'open', sidebar_open_binding));

    	function navbar_sidebar_binding(value) {
    		/*navbar_sidebar_binding*/ ctx[3](value);
    	}

    	let navbar_props = {};

    	if (/*open*/ ctx[1] !== void 0) {
    		navbar_props.sidebar = /*open*/ ctx[1];
    	}

    	navbar = new Navbar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, 'sidebar', navbar_sidebar_binding));

    	const block = {
    		c: function create() {
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			create_component(navbar.$$.fragment);
    			t1 = space();
    			link = element("link");
    			t2 = space();
    			main = element("main");
    			h1 = element("h1");
    			t3 = text("Welcome ");
    			t4 = text(/*name*/ ctx[0]);
    			t5 = text("!");
    			t6 = space();
    			p0 = element("p");
    			t7 = text("Visit the ");
    			a0 = element("a");
    			a0.textContent = "Svelte tutorial";
    			t9 = text(" to learn how to build Svelte apps.");
    			t10 = space();
    			p1 = element("p");
    			t11 = text("Visit the ");
    			a1 = element("a");
    			a1.textContent = "Google";
    			t13 = text(" Test.");
    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file, 13, 1, 236);
    			attr_dev(h1, "class", "svelte-1v4dofq");
    			add_location(h1, file, 17, 1, 349);
    			attr_dev(a0, "href", "https://svelte.dev/tutorial");
    			add_location(a0, file, 18, 14, 388);
    			add_location(p0, file, 18, 1, 375);
    			attr_dev(a1, "href", "https://google.com");
    			add_location(a1, file, 19, 14, 499);
    			add_location(p1, file, 19, 1, 486);
    			attr_dev(main, "class", "svelte-1v4dofq");
    			add_location(main, file, 16, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sidebar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t1, anchor);
    			append_dev(document.head, link);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t3);
    			append_dev(h1, t4);
    			append_dev(h1, t5);
    			append_dev(main, t6);
    			append_dev(main, p0);
    			append_dev(p0, t7);
    			append_dev(p0, a0);
    			append_dev(p0, t9);
    			append_dev(main, t10);
    			append_dev(main, p1);
    			append_dev(p1, t11);
    			append_dev(p1, a1);
    			append_dev(p1, t13);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebar_changes = {};

    			if (!updating_open && dirty & /*open*/ 2) {
    				updating_open = true;
    				sidebar_changes.open = /*open*/ ctx[1];
    				add_flush_callback(() => updating_open = false);
    			}

    			sidebar.$set(sidebar_changes);
    			const navbar_changes = {};

    			if (!updating_sidebar && dirty & /*open*/ 2) {
    				updating_sidebar = true;
    				navbar_changes.sidebar = /*open*/ ctx[1];
    				add_flush_callback(() => updating_sidebar = false);
    			}

    			navbar.$set(navbar_changes);
    			if (!current || dirty & /*name*/ 1) set_data_dev(t4, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(navbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sidebar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t1);
    			detach_dev(link);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	let open = false;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function sidebar_open_binding(value) {
    		open = value;
    		$$invalidate(1, open);
    	}

    	function navbar_sidebar_binding(value) {
    		open = value;
    		$$invalidate(1, open);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name, Navbar, Sidebar, Main, open });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('open' in $$props) $$invalidate(1, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, open, sidebar_open_binding, navbar_sidebar_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
