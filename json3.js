/*! JSON v3.3.2 | https://bestiejs.github.io/json3 | Copyright 2012-2015, Kit Cambridge, Benjamin Tan | http://kit.mit-license.org */
/*
 JSON v3.3.2 | https://bestiejs.github.io/json3 | Copyright 2012-2015, Kit Cambridge, Benjamin Tan | http://kit.mit-license.org */
(function () {
    function O(u, v) {
        function B(a, d) {
            try {
                a()
            } catch (c) {
                d && d()
            }
        }

        function q(a) {
            if (null != q[a]) return q[a];
            if ("bug-string-char-index" == a) var d = !1;
            else if ("json" == a) d = q("json-stringify") && q("date-serialization") && q("json-parse");
            else if ("date-serialization" == a) {
                if (d = q("json-stringify") && y) {
                    var c = v.stringify;
                    B(function () {
                        d = '"-271821-04-20T00:00:00.000Z"' == c(new z(-864E13)) && '"+275760-09-13T00:00:00.000Z"' == c(new z(864E13)) && '"-000001-01-01T00:00:00.000Z"' == c(new z(-621987552E5)) && '"1969-12-31T23:59:59.999Z"' ==
                            c(new z(-1))
                    })
                }
            } else {
                var e;
                if ("json-stringify" == a) {
                    c = v.stringify;
                    var g = "function" == typeof c;
                    g && ((e = function () {
                        return 1
                    }).toJSON = e, B(function () {
                        g = "0" === c(0) && "0" === c(new ca) && '""' == c(new U) && c(w) === x && c(x) === x && c() === x && "1" === c(e) && "[1]" == c([e]) && "[null]" == c([x]) && "null" == c(null) && "[null,null,null]" == c([x, w, null]) && '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}' == c({
                            a: [e, !0, !1, null, "\x00\b\n\f\r\t"]
                        }) && "1" === c(null, e) && "[\n 1,\n 2\n]" == c([1, 2], null, 1)
                    }, function () {
                        g = !1
                    }));
                    d = g
                }
                if ("json-parse" ==
                    a) {
                    var l = v.parse,
                        b;
                    "function" == typeof l && B(function () {
                        0 === l("0") && !l(!1) && (e = l('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'), b = 5 == e.a.length && 1 === e.a[0]) && (B(function () {
                            b = !l('"\t"')
                        }), b && B(function () {
                            b = 1 !== l("01")
                        }), b && B(function () {
                            b = 1 !== l("1.")
                        }))
                    }, function () {
                        b = !1
                    });
                    d = b
                }
            }
            return q[a] = !!d
        }
        u || (u = r.Object());
        v || (v = r.Object());
        var ca = u.Number || r.Number,
            U = u.String || r.String,
            I = u.Object || r.Object,
            z = u.Date || r.Date,
            da = u.SyntaxError || r.SyntaxError,
            ea = u.TypeError || r.TypeError,
            fa = u.Math || r.Math;
        u = u.JSON ||
            r.JSON;
        "object" == typeof u && u && (v.stringify = u.stringify, v.parse = u.parse);
        I = I.prototype;
        var w = I.toString,
            J = I.hasOwnProperty,
            x, y = new z(-0xc782b5b800cec);
        B(function () {
            y = -109252 == y.getUTCFullYear() && 0 === y.getUTCMonth() && 1 === y.getUTCDate() && 10 == y.getUTCHours() && 37 == y.getUTCMinutes() && 6 == y.getUTCSeconds() && 708 == y.getUTCMilliseconds()
        });
        q["bug-string-char-index"] = q["date-serialization"] = q.json = q["json-stringify"] = q["json-parse"] = null;
        if (!q("json")) {
            var P = q("bug-string-char-index"),
                G = function (a, d) {
                    var c = 0,
                        e, g;
                    (e = function () {
                        this.valueOf = 0
                    }).prototype.valueOf = 0;
                    var l = new e;
                    for (g in l) J.call(l, g) && c++;
                    e = l = null;
                    c ? G = function (b, h) {
                        var p = "[object Function]" == w.call(b),
                            k, n;
                        for (k in b) p && "prototype" == k || !J.call(b, k) || (n = "constructor" === k) || h(k);
                        (n || J.call(b, k = "constructor")) && h(k)
                    } : (l = "valueOf toString toLocaleString propertyIsEnumerable isPrototypeOf hasOwnProperty constructor".split(" "), G = function (b, h) {
                        var p = "[object Function]" == w.call(b),
                            k, n = !p && "function" != typeof b.constructor && H[typeof b.hasOwnProperty] &&
                            b.hasOwnProperty || J;
                        for (k in b) p && "prototype" == k || !n.call(b, k) || h(k);
                        for (p = l.length; k = l[--p];) n.call(b, k) && h(k)
                    });
                    return G(a, d)
                };
            if (!q("json-stringify") && !q("date-serialization")) {
                var ha = {
                        92: "\\\\",
                        34: '\\"',
                        8: "\\b",
                        12: "\\f",
                        10: "\\n",
                        13: "\\r",
                        9: "\\t"
                    },
                    A = function (a, d) {
                        return ("000000" + (d || 0)).slice(-a)
                    },
                    L = function (a) {
                        var d, c, e, g, l, b, h, p;
                        if (y) var k = function (m) {
                            d = m.getUTCFullYear();
                            c = m.getUTCMonth();
                            e = m.getUTCDate();
                            l = m.getUTCHours();
                            b = m.getUTCMinutes();
                            h = m.getUTCSeconds();
                            p = m.getUTCMilliseconds()
                        };
                        else {
                            var n =
                                fa.floor,
                                K = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                                D = function (m, C) {
                                    return K[C] + 365 * (m - 1970) + n((m - 1969 + (C = +(1 < C))) / 4) - n((m - 1901 + C) / 100) + n((m - 1601 + C) / 400)
                                };
                            k = function (m) {
                                e = n(m / 864E5);
                                for (d = n(e / 365.2425) + 1970 - 1; D(d + 1, 0) <= e; d++);
                                for (c = n((e - D(d, 0)) / 30.42); D(d, c + 1) <= e; c++);
                                e = 1 + e - D(d, c);
                                g = (m % 864E5 + 864E5) % 864E5;
                                l = n(g / 36E5) % 24;
                                b = n(g / 6E4) % 60;
                                h = n(g / 1E3) % 60;
                                p = g % 1E3
                            }
                        }
                        L = function (m) {
                            m > -1 / 0 && m < 1 / 0 ? (k(m), m = (0 >= d || 1E4 <= d ? (0 > d ? "-" : "+") + A(6, 0 > d ? -d : d) : A(4, d)) + "-" + A(2, c + 1) + "-" + A(2, e) + "T" + A(2, l) + ":" + A(2, b) + ":" + A(2,
                                h) + "." + A(3, p) + "Z", d = c = e = l = b = h = p = null) : m = null;
                            return m
                        };
                        return L(a)
                    };
                if (q("json-stringify") && !q("date-serialization")) {
                    var ia = function () {
                            return L(this)
                        },
                        ja = v.stringify;
                    v.stringify = function (a, d, c) {
                        var e = z.prototype.toJSON;
                        z.prototype.toJSON = ia;
                        a = ja(a, d, c);
                        z.prototype.toJSON = e;
                        return a
                    }
                } else {
                    var ka = function (a) {
                            a = a.charCodeAt(0);
                            var d = ha[a];
                            return d ? d : "\\u00" + A(2, a.toString(16))
                        },
                        Q = /[\x00-\x1f\x22\x5c]/g,
                        V = function (a) {
                            Q.lastIndex = 0;
                            return '"' + (Q.test(a) ? a.replace(Q, ka) : a) + '"'
                        },
                        R = function (a, d, c, e, g, l, b) {
                            var h,
                                p;
                            B(function () {
                                h = d[a]
                            });
                            "object" == typeof h && h && (h.getUTCFullYear && "[object Date]" == w.call(h) && h.toJSON === z.prototype.toJSON ? h = L(h) : "function" == typeof h.toJSON && (h = h.toJSON(a)));
                            c && (h = c.call(d, a, h));
                            if (h == x) return h === x ? h : "null";
                            var k = typeof h;
                            "object" == k && (p = w.call(h));
                            switch (p || k) {
                                case "boolean":
                                case "[object Boolean]":
                                    return "" + h;
                                case "number":
                                case "[object Number]":
                                    return h > -1 / 0 && h < 1 / 0 ? "" + h : "null";
                                case "string":
                                case "[object String]":
                                    return V("" + h)
                            }
                            if ("object" == typeof h) {
                                for (k = b.length; k--;)
                                    if (b[k] ===
                                        h) throw ea();
                                b.push(h);
                                var n = [];
                                var K = l;
                                l += g;
                                if ("[object Array]" == p) {
                                    var D = 0;
                                    for (k = h.length; D < k; D++) p = R(D, h, c, e, g, l, b), n.push(p === x ? "null" : p);
                                    k = n.length ? g ? "[\n" + l + n.join(",\n" + l) + "\n" + K + "]" : "[" + n.join(",") + "]" : "[]"
                                } else G(e || h, function (m) {
                                    var C = R(m, h, c, e, g, l, b);
                                    C !== x && n.push(V(m) + ":" + (g ? " " : "") + C)
                                }), k = n.length ? g ? "{\n" + l + n.join(",\n" + l) + "\n" + K + "}" : "{" + n.join(",") + "}" : "{}";
                                b.pop();
                                return k
                            }
                        };
                    v.stringify = function (a, d, c) {
                        var e;
                        if (H[typeof d] && d) {
                            var g = w.call(d);
                            if ("[object Function]" == g) var l = d;
                            else if ("[object Array]" ==
                                g) {
                                var b = {};
                                for (var h = 0, p = d.length, k; h < p;)
                                    if (k = d[h++], g = w.call(k), "[object String]" == g || "[object Number]" == g) b[k] = 1
                            }
                        }
                        if (c)
                            if (g = w.call(c), "[object Number]" == g) {
                                if (0 < (c -= c % 1))
                                    for (10 < c && (c = 10), e = ""; e.length < c;) e += " "
                            } else "[object String]" == g && (e = 10 >= c.length ? c : c.slice(0, 10));
                        return R("", (k = {}, k[""] = a, k), l, b, e, "", [])
                    }
                }
            }
            if (!q("json-parse")) {
                var la = U.fromCharCode,
                    ma = {
                        92: "\\",
                        34: '"',
                        47: "/",
                        98: "\b",
                        116: "\t",
                        110: "\n",
                        102: "\f",
                        114: "\r"
                    },
                    f, M, t = function () {
                        f = M = null;
                        throw da();
                    },
                    E = function () {
                        for (var a = M, d = a.length,
                                c, e, g, l, b; f < d;) switch (b = a.charCodeAt(f), b) {
                            case 9:
                            case 10:
                            case 13:
                            case 32:
                                f++;
                                break;
                            case 123:
                            case 125:
                            case 91:
                            case 93:
                            case 58:
                            case 44:
                                return c = P ? a.charAt(f) : a[f], f++, c;
                            case 34:
                                c = "@";
                                for (f++; f < d;)
                                    if (b = a.charCodeAt(f), 32 > b) t();
                                    else if (92 == b) switch (b = a.charCodeAt(++f), b) {
                                    case 92:
                                    case 34:
                                    case 47:
                                    case 98:
                                    case 116:
                                    case 110:
                                    case 102:
                                    case 114:
                                        c += ma[b];
                                        f++;
                                        break;
                                    case 117:
                                        e = ++f;
                                        for (g = f + 4; f < g; f++) b = a.charCodeAt(f), 48 <= b && 57 >= b || 97 <= b && 102 >= b || 65 <= b && 70 >= b || t();
                                        c += la("0x" + a.slice(e, f));
                                        break;
                                    default:
                                        t()
                                } else {
                                    if (34 ==
                                        b) break;
                                    b = a.charCodeAt(f);
                                    for (e = f; 32 <= b && 92 != b && 34 != b;) b = a.charCodeAt(++f);
                                    c += a.slice(e, f)
                                }
                                if (34 == a.charCodeAt(f)) return f++, c;
                                t();
                            default:
                                e = f;
                                45 == b && (l = !0, b = a.charCodeAt(++f));
                                if (48 <= b && 57 >= b) {
                                    for (48 == b && (b = a.charCodeAt(f + 1), 48 <= b && 57 >= b) && t(); f < d && (b = a.charCodeAt(f), 48 <= b && 57 >= b); f++);
                                    if (46 == a.charCodeAt(f)) {
                                        for (g = ++f; g < d && !(b = a.charCodeAt(g), 48 > b || 57 < b); g++);
                                        g == f && t();
                                        f = g
                                    }
                                    b = a.charCodeAt(f);
                                    if (101 == b || 69 == b) {
                                        b = a.charCodeAt(++f);
                                        43 != b && 45 != b || f++;
                                        for (g = f; g < d && !(b = a.charCodeAt(g), 48 > b || 57 < b); g++);
                                        g == f && t();
                                        f = g
                                    }
                                    return +a.slice(e, f)
                                }
                                l && t();
                                c = a.slice(f, f + 4);
                                if ("true" == c) return f += 4, !0;
                                if ("fals" == c && 101 == a.charCodeAt(f + 4)) return f += 5, !1;
                                if ("null" == c) return f += 4, null;
                                t()
                        }
                        return "$"
                    },
                    S = function (a) {
                        var d;
                        "$" == a && t();
                        if ("string" == typeof a) {
                            if ("@" == (P ? a.charAt(0) : a[0])) return a.slice(1);
                            if ("[" == a) {
                                for (d = [];;) {
                                    a = E();
                                    if ("]" == a) break;
                                    if (c) "," == a ? (a = E(), "]" == a && t()) : t();
                                    else var c = !0;
                                    "," == a && t();
                                    d.push(S(a))
                                }
                                return d
                            }
                            if ("{" == a) {
                                for (d = {};;) {
                                    a = E();
                                    if ("}" == a) break;
                                    c ? "," == a ? (a = E(), "}" == a && t()) : t() : c = !0;
                                    "," !=
                                    a && "string" == typeof a && "@" == (P ? a.charAt(0) : a[0]) && ":" == E() || t();
                                    d[a.slice(1)] = S(E())
                                }
                                return d
                            }
                            t()
                        }
                        return a
                    },
                    X = function (a, d, c) {
                        c = W(a, d, c);
                        c === x ? delete a[d] : a[d] = c
                    },
                    W = function (a, d, c) {
                        var e = a[d],
                            g;
                        if ("object" == typeof e && e)
                            if ("[object Array]" == w.call(e))
                                for (g = e.length; g--;) X(w, G, e, g, c);
                            else G(e, function (l) {
                                X(e, l, c)
                            });
                        return c.call(a, d, e)
                    };
                v.parse = function (a, d) {
                    var c;
                    f = 0;
                    M = "" + a;
                    a = S(E());
                    "$" != E() && t();
                    f = M = null;
                    return d && "[object Function]" == w.call(d) ? W((c = {}, c[""] = a, c), "", d) : a
                }
            }
        }
        v.runInContext = O;
        return v
    }
    var Y = typeof define === "function" && define.amd,
        H = {
            "function": !0,
            object: !0
        },
        T = H[typeof exports] && exports && !exports.nodeType && exports,
        r = H[typeof window] && window || this,
        F = T && H[typeof module] && module && !module.nodeType && "object" == typeof global && global;
    !F || F.global !== F && F.window !== F && F.self !== F || (r = F);
    if (T && !Y) O(r, T);
    else {
        var Z = r.JSON,
            aa = r.JSON3,
            ba = !1,
            N = O(r, r.JSON3 = {
                noConflict: function () {
                    ba || (ba = !0, r.JSON = Z, r.JSON3 = aa, Z = aa = null);
                    return N
                }
            });
        r.JSON = {
            parse: N.parse,
            stringify: N.stringify
        }
    }
    Y && define(function () {
        return N
    })
}).call(this);
