// function template (data, attr, context, isVdom, sets, forceCompatible, generatorConfig)

const template1 = `TEMPLATEFUNCTOJSON=function e(t, a, n, i, r, s, l) {
    if ("undefined" === typeof n) var n = arguments[2];
    if ("undefined" === typeof f) eval("var thelpers = null;"), f = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var d = r.fullContext || {};
    var c = 0,
        _ = "tabSpaceTemplate";
    t = f.W(Object.create(this), t, _);
    var u = f.v(a && a.key),
        b = {
            id: [],
            def: void 0
        },
        m = f.G(this, _, t);
    s = "undefined" === typeof s ? false : s;
    var g = i && "undefined" !== typeof window,
        T = f.n(i, s, l),
        w = f.x(this),
        C, y, h = "Compiler/template1",
        v = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    if (f.rdi(f, p, m), w = t, "undefined" === typeof o) eval("var includedTemplates = undefined;"), o = this && this.includedTemplates || {};
    try {
        var B = T.joinElements([T.createTag("div", {
            attributes: {
                class: "browserTabs__middle-area"
            },
            events: {},
            key: u + "0_0_0_0_0_"
        }, [T.createTag("div", {
            attributes: {
                class: "browserTabs__middle-area_block"
            },
            events: {},
            key: u + "0_0_0_0_0_0_"
        }, [f.g(t, ["_drawBack"]) ? [T.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button/BackButton", {
            class: "engine-BrowserTabs__back"
        }, {}, {
            caption: f.g(t, ["_backCaption"]),
            name: "tabsBack",
            style: "accent2",
            size: "h2"
        }, {
            attr: a,
            data: t,
            ctx: this,
            isVdom: i,
            defCollection: b,
            depsLocal: p,
            includedTemplates: o,
            viewController: m,
            context: n,
            key: u + "0_0_0_0_0_0_0_0_",
            pName: _,
            internal: {}
        })] : T.createText(""), T.createControlNew("wsControl", "ws:Lib/Control/SwitchableArea/SwitchableArea", {
            class: "ws-switchableArea engine-browserTabs__tabsArea engine-browserTabs_margin-left"
        }, {}, {
            name: "tabsArea",
            defaultArea: f.g(t, ["tabs", f.g(t, ["_data", "defaultTabPos"])]) && f.g(t, ["tabs", f.g(t, ["_data", "defaultTabPos"]), "tabsArea"]) || "",
            loadType: f.g(t, ["loadType"]),
            activateArea: false,
            items: f.g(t, ["_data", "tabsAreaItems"])
        }, {
            attr: a,
            data: t,
            ctx: this,
            isVdom: i,
            defCollection: b,
            depsLocal: p,
            includedTemplates: o,
            viewController: m,
            context: n,
            key: u + "0_0_0_0_0_0_1_",
            pName: _,
            internal: {}
        }), T.createControlNew("wsControl", "ws:SBIS3.CONTROLS/OperationsPanel/PanelButton/OperationsPanelButton", {
            class: "controls-operationsPanelButton engine-browserTabs__operationsPanelButton controls-OperationsPanelButton__showSeparator " + T.escape(f.g(t, ["_drawBack"]) || f.g(t, ["_data", "tabsAreaItems", 0]) ? " engine-browserTabs_margin-left" : " engine-browserTabs_margin-left-compact")
        }, {}, {
            name: "operationsButton",
            visible: f.g(t, ["operationsButtonVisibility"])
        }, {
            attr: a,
            data: t,
            ctx: this,
            isVdom: i,
            defCollection: b,
            depsLocal: p,
            includedTemplates: o,
            viewController: m,
            context: n,
            key: u + "0_0_0_0_0_0_2_",
            pName: _,
            internal: {}
        })], a ? {
            context: a.context,
            key: u + "0_0_0_0_0_0_"
        } : {}, b, m, false)], a, b, m, false)], u, b);
        if (b && b.def) B = T.chain(B, b, this), b = void 0
    } catch (e) {
        f.L(h, e, t)
    }
    return B || T.createText("")
}`;
const template2 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_0_0_0_0_0_"
        }, [m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_0_0_0_0_0_0_"
        }, [m.createText("Основная область 1", u + "0_4_1_0_0_0_0_0_0_0_")], n ? {
            context: n.context,
            key: u + "0_4_1_0_0_0_0_0_0_"
        } : {}, f, h, false), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {
            class: "width_200"
        }, {}, {
            handlers: {
                onActivated: v.g(t, ["_onActivated_1"])
            },
            name: "Button_3",
            caption: v.g(t, ["opt_3"]),
            esc: false
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_0_0_0_0_0_1_",
            pName: d,
            internal: {},
            blockOptionNames: ["handlers"]
        })], n, f, h, false)], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template3 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_0_0_1_0_0_"
        }, [m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_0_0_1_0_0_0_"
        }, [m.createText("Основная область 2", u + "0_4_1_0_0_1_0_0_0_0_")], n ? {
            context: n.context,
            key: u + "0_4_1_0_0_1_0_0_0_"
        } : {}, f, h, false), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {
            class: "width_200"
        }, {}, {
            handlers: {
                onActivated: v.g(t, ["_onActivated_1"])
            },
            name: "Button_4",
            caption: v.g(t, ["opt_4"]),
            esc: false
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_0_0_1_0_0_1_",
            pName: d,
            internal: {},
            blockOptionNames: ["handlers"]
        })], n, f, h, false)], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template4 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_0_0_2_0_0_1_0_1_0_1_0_0_0_0_"
        }, [function e() {
            for (var r = void 0, _ = 0; _ < v.R.length && !r; _++)
                if (v.R[_].is(2)) r = v.R[_].iterator;
            var o = [];
            if (t.viewController = h || null, function e() {
                    var t = v.E(this);
                    if (r) {
                        var _ = 0,
                            s = u + "'_1'",
                            c = 0;
                        r(2, function e(r, _) {
                            var u = t;
                            t = Object.create(t), v.e(r, t, _, {
                                value: "value"
                            }), _ = s + "_for_" + c + "_", c++;
                            var y = [m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
                                handlers: {
                                    onActivated: v.g(t, ["_onActivated_1"])
                                },
                                name: "tmplButton_" + (v.g(t, ["value"]) + 3),
                                caption: v.g(t, ["value"]) + 3,
                                esc: false
                            }, {
                                attr: n,
                                data: t,
                                ctx: this,
                                isVdom: a,
                                defCollection: f,
                                depsLocal: p,
                                includedTemplates: l,
                                viewController: h,
                                context: i,
                                key: _ + "0_",
                                pName: d,
                                internal: {},
                                blockOptionNames: ["handlers"]
                            })];
                            o = o.concat(y), t = u
                        }.bind(t))
                    } else o = m.createText("")
                }.call(t), "object" === typeof o) Object.defineProperty(o, "for", {
                value: true,
                enumerable: false
            });
            return o
        }.call(this), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
            handlers: {
                onActivated: v.g(t, ["_onActivated_1"])
            },
            name: "Button_1",
            caption: "Кнопка 2 панели",
            esc: false
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_0_0_2_0_0_1_0_1_0_1_0_0_0_0_1_",
            pName: d,
            internal: {},
            blockOptionNames: ["handlers"]
        })], n, f, h, false)], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template5 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createControlNew("template", "tmpl!Intest/integration/_VDOM/Routing/IntRoutingPage_2/resources/RoutingFilterButtonContent", {}, {}, {}, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_0_0_2_0_0_1_1_1_0_1_0_0_",
            pName: d,
            isRootTag: true,
            internal: {},
            mergeType: "attribute"
        })], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template6 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_2_0_0_0_0_"
        }, [m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
            name: "PushButton 1",
            caption: "PushButton 1",
            primary: true
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_2_0_0_0_0_0_",
            pName: d,
            internal: {}
        }), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/TextBox", {}, {}, {
            name: "TextBox_2",
            placeholder: "Для смены фокуса"
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_2_0_0_0_0_1_",
            pName: d,
            internal: {}
        })], n, f, h, false)], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template7 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, r, _, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof v) eval("var thelpers = null;"), v = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (r && r.isSetts) var s = r.fullContext || {};
    var c = 0,
        d = "content";
    t = v.W(Object.create(this), t, d);
    var u = v.v(n && n.key),
        f = {
            id: [],
            def: void 0
        },
        h = v.G(this, d, t);
    _ = "undefined" === typeof _ ? false : _;
    var y = a && "undefined" !== typeof window,
        m = v.n(a, _, o),
        C = v.x(this),
        T, x, w = "Compiler/template2",
        g = function(e) {
            return "__dirtyCheckingVars_" + e
        };
    v.rdi(v, p, h);
    var k = v.k(w);
    if (C = t, "undefined" === typeof l) eval("var includedTemplates = undefined;"), l = this && this.includedTemplates || {};
    try {
        var b = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: u + "0_4_1_2_0_1_0_0_"
        }, [m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
            handlers: {
                onActivated: v.g(t, ["_onActivated_1"])
            },
            name: "PushButton 2",
            caption: "PushButton 2",
            primary: true,
            esc: false
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_2_0_1_0_0_0_",
            pName: d,
            internal: {},
            blockOptionNames: ["handlers"]
        }), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/TextBox", {}, {}, {
            name: "TextBox_3",
            placeholder: "Для смены фокуса"
        }, {
            attr: n,
            data: t,
            ctx: this,
            isVdom: a,
            defCollection: f,
            depsLocal: p,
            includedTemplates: l,
            viewController: h,
            context: i,
            key: u + "0_4_1_2_0_1_0_0_1_",
            pName: d,
            internal: {}
        })], n, f, h, false)], u, f);
        if (f && f.def) b = m.chain(b, f, this), f = void 0
    } catch (e) {
        v.L(w, e, t)
    }
    return b || m.createText("")
}`;
const template8 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_0_0_0_0_0_\`
        }, [m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_0_0_0_0_0_0_\`
        }, [m.createText("Основная область 1", \`\${f}0_4_1_0_0_0_0_0_0_0_\`)], n ? {
            context: n.context,
            key: \`\${f}0_4_1_0_0_0_0_0_0_\`
        } : {}, v, p, false), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {
            class: "width_200"
        }, {}, {
            handlers: {
                onActivated: d.g(t, ["_onActivated_1"])
            },
            name: "Button_3",
            caption: d.g(t, ["opt_3"]),
            esc: false
        }, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_0_0_0_0_0_1_\`,
            [P]: c,
            [I]: {},
            [V]: ["handlers"]
        })], n, v, p, false)], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;
const template9 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_0_0_1_0_0_\`
        }, [m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_0_0_1_0_0_0_\`
        }, [m.createText("Основная область 2", \`\${f}0_4_1_0_0_1_0_0_0_0_\`)], n ? {
            context: n.context,
            key: \`\${f}0_4_1_0_0_1_0_0_0_\`
        } : {}, v, p, false), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {
            class: "width_200"
        }, {}, {
            handlers: {
                onActivated: d.g(t, ["_onActivated_1"])
            },
            name: "Button_4",
            caption: d.g(t, ["opt_4"]),
            esc: false
        }, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_0_0_1_0_0_1_\`,
            [P]: c,
            [I]: {},
            [V]: ["handlers"]
        })], n, v, p, false)], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;
const template10 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([(() => {
            if ((C = d.a(n, {
                    attributes: {},
                    events: {},
                    key: \`\${f}0_4_1_0_0_2_0_0_1_0_0_0_1_0_0_\`,
                    inheritOptions: n ? n.inheritOptions : {},
                    internal: n ? n.internal : {},
                    context: n ? n.context : {}
                })).isInline = true, C.isContainerNodeInline) C.refForContainer = n?.refForContainer;
            T = d.p(Object.create(t || {}), m.prepareDataForCreate("_$inline_template", {
                _onActivated_1: d.g(t, ["_onActivated_1"])
            }, C, {}), false)
        })(), function e(t, n) {
            var _ = d.v(n?.key),
                s = {
                    id: [],
                    def: void 0
                };
            r = r ?? false;
            var l = a && "undefined" !== typeof window,
                c = d.n(a, r, o),
                f = d.x(this),
                v, h, m = "Compiler/template2",
                y = e => \`__dirtyCheckingVars_\${e}\`,
                T = "attr",
                C = "data",
                x = "isVdom",
                g = "defCollection",
                b = "depsLocal",
                w = "includedTemplates",
                O = "viewController",
                $ = "compositeAttributes",
                S = "scope",
                N = "isRootTag",
                B = "internal",
                R = "mergeType",
                j = "blockOptionNames",
                L = "isContainerNode",
                I = "context",
                A = "pName";
            d.rdi(d, u, p);
            var V = d.k(m);
            if (f = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
            try {
                var E = c.joinElements([c.createTag("div", {
                    attributes: {},
                    events: {},
                    key: \`\${_}0_0_0_\`
                }, [function e() {
                    for (var r = void 0, o = 0; o < d.R.length && !r; o++)
                        if (d.R[o].is(2)) r = d.R[o].iterator;
                    var l = [];
                    if (t[O] = p || null, function e() {
                            var t = d.E(this);
                            if (r) {
                                var o = 0,
                                    f = \`\${_}'_0'\`,
                                    v = 0;
                                r(2, function e(_, r) {
                                    var o = t;
                                    t = Object.create(t), d.e(_, t, r, {
                                        value: "value"
                                    }), r = \`\${f}_for_\${v}_\`, v++;
                                    var h = [c.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
                                        handlers: {
                                            onActivated: d.g(t, ["_onActivated_1"])
                                        },
                                        name: "tmplButton_" + (d.g(t, ["value"]) + 1),
                                        caption: d.g(t, ["value"]) + 1,
                                        esc: false
                                    }, {
                                        [T]: n,
                                        [C]: t,
                                        ctx: this,
                                        [x]: a,
                                        [g]: s,
                                        [b]: u,
                                        [w]: k,
                                        [O]: p,
                                        [I]: i,
                                        key: \`\${r}0_\`,
                                        [B]: {},
                                        [j]: ["handlers"]
                                    })];
                                    l = l.concat(h), t = o
                                }.bind(t))
                            } else l = c.createText("")
                        }.call(t), "object" === typeof l) Object.defineProperty(l, "for", {
                        value: true,
                        enumerable: false
                    });
                    return l
                }.call(this)], n, s, p, false)], _, s);
                if (s?.def) E = c.chain(E, s, this), s = void 0
            } catch (e) {
                d.L(m, e, t)
            }
            return E || c.createText("")
        }.call(this, T, C, i, a), (C = null, void(T = null))], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;
const template11 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_0_0_2_0_0_1_0_1_0_1_0_0_0_0_\`
        }, [function e() {
            for (var _ = void 0, r = 0; r < d.R.length && !_; r++)
                if (d.R[r].is(2)) _ = d.R[r].iterator;
            var o = [];
            if (t[B] = p || null, function e() {
                    var t = d.E(this);
                    if (_) {
                        var r = 0,
                            s = \`\${f}'_1'\`,
                            l = 0;
                        _(2, function e(_, r) {
                            var f = t;
                            t = Object.create(t), d.e(_, t, r, {
                                value: "value"
                            }), r = \`\${s}_for_\${l}_\`, l++;
                            var h = [m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
                                handlers: {
                                    onActivated: d.g(t, ["_onActivated_1"])
                                },
                                name: "tmplButton_" + (d.g(t, ["value"]) + 3),
                                caption: d.g(t, ["value"]) + 3,
                                esc: false
                            }, {
                                [b]: n,
                                [w]: t,
                                ctx: this,
                                [O]: a,
                                [$]: v,
                                [S]: u,
                                [N]: k,
                                [B]: p,
                                [W]: i,
                                key: \`\${r}0_\`,
                                [P]: c,
                                [I]: {},
                                [V]: ["handlers"]
                            })];
                            o = o.concat(h), t = f
                        }.bind(t))
                    } else o = m.createText("")
                }.call(t), "object" === typeof o) Object.defineProperty(o, "for", {
                value: true,
                enumerable: false
            });
            return o
        }.call(this), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
            handlers: {
                onActivated: d.g(t, ["_onActivated_1"])
            },
            name: "Button_1",
            caption: "Кнопка 2 панели",
            esc: false
        }, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_0_0_2_0_0_1_0_1_0_1_0_0_0_0_1_\`,
            [P]: c,
            [I]: {},
            [V]: ["handlers"]
        })], n, v, p, false)], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;
const template12 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([m.createControlNew("wsControl", "ws:Intest/integration/_VDOM/Routing/IntRoutingPage_2/resources/RoutingFilterButtonContent", {}, {}, {}, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_0_0_2_0_0_1_1_0_0_1_0_0_\`,
            [P]: c,
            [L]: true,
            [I]: {},
            [A]: "attribute"
        })], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;
const template13 = `TEMPLATEFUNCTOJSON=function e(t, n, i, a, _, r, o) {
    if ("undefined" === typeof i) var i = arguments[2];
    if ("undefined" === typeof d) eval("var thelpers = null;"), d = function() {
        return this || (0, eval)("this")
    }().requirejs("UI/Executor").TClosure;
    if (_?.isSetts) var s = _.fullContext || {};
    var l = 0,
        c = "content";
    t = d.W(Object.create(this), t, c);
    var f = d.v(n?.key),
        v = {
            id: [],
            def: void 0
        },
        p = d.G(this, c, t);
    r = r ?? false;
    var h = a && "undefined" !== typeof window,
        m = d.n(a, r, o),
        y = d.x(this),
        T, C, x = "Compiler/template2",
        g = e => \`__dirtyCheckingVars_\${e}\`,
        b = "attr",
        w = "data",
        O = "isVdom",
        $ = "defCollection",
        S = "depsLocal",
        N = "includedTemplates",
        B = "viewController",
        R = "compositeAttributes",
        j = "scope",
        L = "isRootTag",
        I = "internal",
        A = "mergeType",
        V = "blockOptionNames",
        E = "isContainerNode",
        W = "context",
        P = "pName";
    d.rdi(d, u, p);
    var U = d.k(x);
    if (y = t, "undefined" === typeof k) eval("var includedTemplates = undefined;"), k = this?.includedTemplates || {};
    try {
        var q = m.joinElements([m.createTag("div", {
            attributes: {},
            events: {},
            key: \`\${f}0_4_1_2_0_0_0_0_\`
        }, [m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/Button", {}, {}, {
            name: "PushButton 1",
            caption: "PushButton 1",
            primary: true
        }, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_2_0_0_0_0_0_\`,
            [P]: c,
            [I]: {}
        }), m.createControlNew("wsControl", "ws:SBIS3.CONTROLS/TextBox", {}, {}, {
            name: "TextBox_2",
            placeholder: "Для смены фокуса"
        }, {
            [b]: n,
            [w]: t,
            ctx: this,
            [O]: a,
            [$]: v,
            [S]: u,
            [N]: k,
            [B]: p,
            [W]: i,
            key: \`\${f}0_4_1_2_0_0_0_0_1_\`,
            [P]: c,
            [I]: {}
        })], n, v, p, false)], f, v);
        if (v?.def) q = m.chain(q, v, this), v = void 0
    } catch (e) {
        d.L(x, e, t)
    }
    return q || m.createText("")
}`;

export default [
    {
        mode: 'es5',
        template: template1,
        identifiers: {
            attr: 'a',
            context: 'n',
            data: 't',
            depsLocal: 'p',
            isVdom: 'i',
            sets: 'r',
            thelpers: 'f',
            viewController: 'm'
        }
    },
    {
        mode: 'es5',
        template: template2,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es5',
        template: template3,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es5',
        template: template4,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es5',
        template: template5,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es5',
        template: template6,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es5',
        template: template7,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'p',
            isVdom: 'a',
            sets: 'r',
            thelpers: 'v',
            viewController: 'h'
        }
    },
    {
        mode: 'es2021',
        template: template8,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    },
    {
        mode: 'es2021',
        template: template9,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    },
    {
        mode: 'es2021',
        template: template10,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    },
    {
        mode: 'es2021',
        template: template11,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    },
    {
        mode: 'es2021',
        template: template12,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    },
    {
        mode: 'es2021',
        template: template13,
        identifiers: {
            attr: 'n',
            context: 'i',
            data: 't',
            depsLocal: 'u',
            isVdom: 'a',
            sets: '_',
            thelpers: 'd',
            viewController: 'p'
        }
    }
];
