var f,
  ha,
  aa = function (c) {
    var a = 0;
    return function () {
      return a < c.length ? { done: !1, value: c[a++] } : { done: !0 };
    };
  },
  ba =
    "function" == typeof Object.defineProperties
      ? Object.defineProperty
      : function (d, a, b) {
          d != Array.prototype && d != Object.prototype && (d[a] = b.value);
        },
  p =
    "undefined" != typeof window && window === this
      ? this
      : "undefined" != typeof global && null != global
      ? global
      : this,
  u = function () {
    (u = function () {}), p.Symbol || (p.Symbol = ca);
  },
  ca = (function () {
    var c = 0;
    return function (a) {
      return "jscomp_symbol_" + (a || "") + c++;
    };
  })(),
  v = function () {
    u();
    var b = p.Symbol.iterator;
    b || (b = p.Symbol.iterator = p.Symbol("iterator")),
      "function" != typeof Array.prototype[b] &&
        ba(Array.prototype, b, {
          configurable: !0,
          writable: !0,
          value: function () {
            return da(aa(this));
          },
        }),
      (v = function () {});
  },
  da = function (b) {
    return (
      v(),
      (b = { next: b }),
      (b[p.Symbol.iterator] = function () {
        return this;
      }),
      b
    );
  },
  w = function (c) {
    var a =
      "undefined" != typeof Symbol && Symbol.iterator && c[Symbol.iterator];
    return a ? a.call(c) : { next: aa(c) };
  },
  ea = function (d) {
    if (!(d instanceof Array)) {
      d = w(d);
      for (var e, f = []; !(e = d.next()).done; ) f.push(e.value);
      d = f;
    }
    return d;
  },
  fa =
    "function" == typeof Object.create
      ? Object.create
      : function (c) {
          var a = function () {};
          return (a.prototype = c), new a();
        };
if ("function" == typeof Object.setPrototypeOf) ha = Object.setPrototypeOf;
else {
  var ia;
  a: {
    var ka = { i: !0 },
      la = {};
    try {
      (la.__proto__ = ka), (ia = la.i);
      break a;
    } catch (b) {}
    ia = !1;
  }
  ha = ia
    ? function (c, a) {
        if (((c.__proto__ = a), c.__proto__ !== a))
          throw new TypeError(c + " is not extensible");
        return c;
      }
    : null;
}
var ma = ha,
  x = function (e, a) {
    if (((e.prototype = fa(a.prototype)), (e.prototype.constructor = e), ma))
      ma(e, a);
    else
      for (var b in a)
        if ("prototype" != b)
          if (Object.defineProperties) {
            var c = Object.getOwnPropertyDescriptor(a, b);
            c && Object.defineProperty(e, b, c);
          } else e[b] = a[b];
    e.Gc = a.prototype;
  },
  qa = this,
  A = function (d, a, b) {
    return Math.min(Math.max(d, a), b);
  },
  Qa = new Map(),
  Ta = function (d, a) {
    var b = Ra;
    (b = void 0 === b ? Sa : b),
      (this.c = d),
      (this.values = a),
      (this.type = "html"),
      (this.Da = b);
  };
function Ua(d) {
  var a = Qa.get(d.type);
  void 0 === a && ((a = new Map()), Qa.set(d.type, a));
  var e = a.get(d.c);
  return e;
}
var G = "{{lit-" + (Math.random() + "").slice(2) + "}}",
  Va = "<!--" + G + "-->",
  Xa = new RegExp(G + "|" + Va),
  Ya =
    /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/,
  Za = function (f, a, b, c, d) {
    (this.type = f),
      (this.index = a),
      (this.name = b),
      (this.Ea = c),
      (this.c = d);
  },
  Wa = function () {},
  J = function (c, a) {
    return "function" == typeof a && !0 === a.Vb
      ? (a(c), I)
      : null === a
      ? void 0
      : a;
  },
  $a = function (b) {
    return (b.Vb = !0), b;
  },
  I = {},
  ab = function (b) {
    return null === b || ("object" != typeof b && "function" != typeof b);
  },
  K = function (e, a, b, c) {
    (this.aa = e),
      (this.element = a),
      (this.name = b),
      (this.c = c),
      (this.size = c.length - 1),
      (this.ra = []);
  };
(K.prototype.Sa = function (f, a) {
  for (var b = this.c, c = b.length - 1, d = "", i = 0; i < c; i++) {
    d += b[i];
    var j = J(this, f[a + i]);
    if (
      (u(),
      v(),
      j &&
        j !== I &&
        (Array.isArray(j) || ("string" != typeof j && j[Symbol.iterator])))
    ) {
      j = w(j);
      for (var l = j.next(); !l.done; l = j.next()) d += l.value;
    } else d += j;
  }
  return d + b[c];
}),
  (K.prototype.Pa = function (d, a) {
    for (var b = a; b < a + this.size; b++)
      if (this.ra[b] !== d[b] || !ab(d[b])) return !1;
    return !0;
  }),
  (K.prototype.o = function () {});
var bb = function (d, a, b) {
  (this.aa = d), (this.W = a), (this.l = b), (this.g = void 0);
};
(f = bb.prototype),
  (f.o = function (b) {
    (b = J(this, b)),
      b !== I &&
        (ab(b)
          ? b !== this.g && this.Va(b)
          : b instanceof Ta
          ? this.Zb(b)
          : (u(),
            v(),
            Array.isArray(b) || b[Symbol.iterator]
              ? this.Xb(b)
              : b instanceof Node
              ? this.sa(b)
              : void 0 === b.then
              ? this.Va(b)
              : this.Yb(b)));
  }),
  (f.Ra = function (b) {
    this.l.parentNode.insertBefore(b, this.l);
  }),
  (f.sa = function (b) {
    this.g !== b && (this.clear(), this.Ra(b), (this.g = b));
  }),
  (f.Va = function (c) {
    var d = this.W.nextSibling;
    (c = void 0 === c ? "" : c),
      d === this.l.previousSibling && d.nodeType === Node.TEXT_NODE
        ? (d.textContent = c)
        : this.sa(document.createTextNode(c)),
      (this.g = c);
  }),
  (f.Zb = function (c) {
    var a = this.aa.Qa(c);
    this.g && this.g.pa === a
      ? (a = this.g)
      : ((a = new cb(a, c.Da, this.aa.Qa)), this.sa(a.Oa()), (this.g = a)),
      a.update(c.values);
  }),
  (f.Xb = function (f) {
    Array.isArray(this.g) || (this.clear(), (this.g = []));
    var g = this.g,
      b = 0;
    f = w(f);
    for (var h = f.next(); !h.done; h = f.next()) {
      h = h.value;
      var i = g[b];
      void 0 === i &&
        ((i = this.W),
        0 < b && ((i = g[b - 1].l = document.createTextNode("")), this.Ra(i)),
        (i = new bb(this.aa, i, this.l)),
        g.push(i)),
        i.o(h),
        b++;
    }
    0 == b
      ? (this.clear(), (this.g = void 0))
      : b < g.length &&
        ((f = g[b - 1]),
        (g.length = b),
        this.clear(f.l.previousSibling),
        (f.l = this.l));
  }),
  (f.Yb = function (d) {
    var a = this;
    (this.g = d),
      d.then(function (b) {
        a.g === d && a.o(b);
      });
  }),
  (f.clear = function (b) {
    (b = void 0 === b ? this.W : b),
      db(this.W.parentNode, b.nextSibling, this.l);
  });
var Sa = function (d, a, b) {
    if ("attribute" === a.type) return new K(d, b, a.name, a.c);
    if ("node" === a.type) return new bb(d, b, b.nextSibling);
    throw Error("Unknown part type " + a.type);
  },
  cb = function (d, a, b) {
    (this.Ua = []), (this.pa = d), (this.Ta = a), (this.Qa = b);
  };
(cb.prototype.update = function (e) {
  for (var a = 0, f = w(this.Ua), c = f.next(); !c.done; c = f.next())
    (c = c.value)
      ? void 0 === c.size
        ? (c.o(e[a]), a++)
        : (c.o(e, a), (a += c.size))
      : a++;
}),
  (cb.prototype.Oa = function () {
    return null;
  });
var db = function () {},
  L = function (b) {
    for (var a = [], c = 1; c < arguments.length; ++c) a[c - 1] = arguments[c];
    return new Ta(b, a);
  },
  Ra = function (e, a, b) {
    if ("attribute" === a.type) {
      if ("on-" === a.Ea.substr(0, 3)) return new eb(e, b, a.Ea.slice(3));
      var c = a.name.substr(a.name.length - 1);
      return "$" === c
        ? new K(e, b, a.name.slice(0, -1), a.c)
        : "?" === c
        ? new fb(e, b, a.name.slice(0, -1), a.c)
        : new gb(e, b, a.Ea, a.c);
    }
    return Sa(e, a, b);
  },
  fb = function () {
    K.apply(this, arguments);
  };
x(fb, K),
  (fb.prototype.o = function (d, e) {
    var b = this.c;
    if (2 === b.length && "" === b[0] && "" === b[1])
      (d = J(this, d[e])),
        d !== I &&
          (d
            ? this.element.setAttribute(this.name, "")
            : this.element.removeAttribute(this.name));
    else throw Error("boolean attributes can only contain a single expression");
  });
var gb = function () {
  K.apply(this, arguments);
};
x(gb, K),
  (gb.prototype.o = function (d, a) {
    var e = this.c;
    this.Pa(d, a) ||
      ((a =
        2 === e.length && "" === e[0] && "" === e[1]
          ? J(this, d[a])
          : this.Sa(d, a)),
      a !== I && (this.element[this.name] = a),
      (this.ra = d));
  });
var eb = function (d, a, b) {
  (this.aa = d), (this.element = a), (this.kb = b);
};
(eb.prototype.o = function (b) {
  (b = J(this, b)),
    b !== this.O &&
      (null == b
        ? this.element.removeEventListener(this.kb, this)
        : null == this.O && this.element.addEventListener(this.kb, this),
      (this.O = b));
}),
  (eb.prototype.handleEvent = function (b) {
    "function" == typeof this.O
      ? this.O.call(this.element, b)
      : "function" == typeof this.O.handleEvent && this.O.handleEvent(b);
  });
function M(d, a, b) {
  if (isNaN(d) || 0 > d || d > a)
    throw new RangeError(d + " for " + b + " is not between 0 and " + a);
}
var O = Math.pow(2, -16),
  P = function (e, a, b, c) {
    (c = void 0 === c ? 1 : c),
      (this.red = e),
      (this.green = a),
      (this.blue = b),
      (this.alpha = c),
      M(e, 1, "red"),
      M(a, 1, "green"),
      M(b, 1, "blue"),
      M(c, 1, "alpha");
  };
P.prototype.M = function () {
  return (
    "rgba(" +
    100 * this.red +
    "%, " +
    100 * this.green +
    "%, " +
    (100 * this.blue + "%, " + this.alpha + ")")
  );
};
var Q = function (b) {
  return (
    hb(Math.round(255 * b.red)) +
    hb(Math.round(255 * b.green)) +
    hb(Math.round(255 * b.blue)) +
    (1 > b.alpha ? hb(Math.round(255 * b.alpha)) : "")
  );
};
P.prototype.ka = function (b) {
  return (
    Math.abs(this.red - b.red) < O &&
    Math.abs(this.green - b.green) < O &&
    Math.abs(this.blue - b.blue) < O &&
    Math.abs(this.alpha - b.alpha) < O
  );
};
var ib = function (b) {
    return 1 - b.alpha < O ? b : new P(b.red, b.green, b.blue);
  },
  jb = function (e, f) {
    var g = ib(f);
    if (!(1 - e.alpha < O)) {
      var c = g.alpha * (1 - e.alpha);
      e = new P(
        e.red * e.alpha + g.red * c,
        e.green * e.alpha + g.green * c,
        e.blue * e.alpha + g.blue * c,
        e.alpha + c,
      );
    }
    return (
      (e = 0.2126 * R(e.red) + 0.7152 * R(e.green) + 0.0722 * R(e.blue)),
      (f = 0.2126 * R(f.red) + 0.7152 * R(f.green) + 0.0722 * R(f.blue)),
      e >= f ? (e + 0.05) / (f + 0.05) : (f + 0.05) / (e + 0.05)
    );
  },
  kb = function (f, i, b, c) {
    var j = c,
      k = c;
    f = (f % 360) / 60;
    var l = b * (1 - Math.abs((f % 2) - 1));
    switch (Math.floor(f)) {
      case 0:
        (j += b), (k += l);
        break;
      case 1:
        (j += l), (k += b);
        break;
      case 2:
        (k += b), (c += l);
        break;
      case 3:
        (k += l), (c += b);
        break;
      case 4:
        (j += l), (c += b);
        break;
      case 5:
        (j += b), (c += l);
    }
    return new P(j, k, c, i);
  },
  lb = function (c) {
    var a = (1 - Math.abs(2 * c.b - 1)) * c.saturation;
    return kb(c.hue, c.alpha, a, Math.max(0, c.b - a / 2));
  },
  S = function (c) {
    var a = c.value * c.saturation;
    return kb(c.hue, c.alpha, a, Math.max(0, c.value - a));
  },
  nb = function (e) {
    if (!/^[a-fA-F0-9]{3,8}$/.test(e))
      throw Error("Invalid hex color string: " + e);
    if (3 === e.length || 4 === e.length)
      var f = /^(.)(.)(.)(.)?$/
        .exec(e)
        .slice(1, 5)
        .map(function (b) {
          return b ? b + b : "ff";
        });
    else if (6 === e.length || 8 === e.length)
      (f = /^(..)(..)(..)(..)?$/.exec(e).slice(1, 5)),
        void 0 === f[3] && (f[3] = "ff");
    else throw Error("Invalid hex color string: " + e);
    e = mb(f[0]) / 255;
    var g = mb(f[1]) / 255,
      c = mb(f[2]) / 255;
    return (f = mb(f[3]) / 255), new P(e, g, c, f);
  },
  ob = new P(1, 1, 1),
  pb = new P(0, 0, 0);
function mb(b) {
  if (!/^[a-fA-F0-9]+$/.test(b)) throw Error("Invalid hex string: " + b);
  return parseInt(b, 16);
}
function hb(b) {
  return (b = b.toString(16)), 2 <= b.length ? b : "0" + b;
}
var T = function (e, a, b, c) {
  (c = void 0 === c ? 1 : c),
    (this.hue = e),
    (this.saturation = a),
    (this.b = b),
    (this.alpha = c),
    M(e, 360, "hue"),
    M(a, 1, "saturation"),
    M(b, 1, "lightness"),
    M(c, 1, "alpha");
};
T.prototype.M = function () {
  return (
    "hsla(" +
    this.hue +
    ", " +
    100 * this.saturation +
    "%, " +
    (100 * this.b + "%, " + this.alpha + ")")
  );
};
T.prototype.rotate = function (a) {
  return new T((this.hue + a + 360) % 360, this.saturation, this.b, this.alpha);
};
var rb = function (a) {
    var b = Math.max(a.red, a.green, a.blue),
      c = Math.min(a.red, a.green, a.blue),
      d = 0,
      e = 0,
      g = A(0.5 * (b + c), 0, 1);
    b - c > O &&
      (b === a.red
        ? (d = (60 * (a.green - a.blue)) / (b - c))
        : b === a.green
        ? (d = (60 * (a.blue - a.red)) / (b - c) + 120)
        : b === a.blue && (d = (60 * (a.red - a.green)) / (b - c) + 240),
      (e =
        0 < g && 0.5 >= g
          ? A((b - c) / (2 * g), 0, 1)
          : A((b - c) / (2 - 2 * g), 0, 1)));
    d = Math.round(d + 360) % 360;
    return new T(d, e, g, a.alpha);
  },
  U = function (e, a, b, c) {
    (c = void 0 === c ? 1 : c),
      (this.hue = e),
      (this.saturation = a),
      (this.value = b),
      (this.alpha = c),
      M(e, 360, "hue"),
      M(a, 1, "saturation"),
      M(b, 1, "value"),
      M(c, 1, "alpha");
  },
  tb = function (f) {
    var a = Math.max(f.red, f.green, f.blue),
      b = Math.min(f.red, f.green, f.blue),
      c = 0,
      g = 0;
    return (
      a - b > O &&
        ((g = (a - b) / a),
        a === f.red
          ? (c = (60 * (f.green - f.blue)) / (a - b))
          : a === f.green
          ? (c = (60 * (f.blue - f.red)) / (a - b) + 120)
          : a === f.blue && (c = (60 * (f.red - f.green)) / (a - b) + 240)),
      (c = Math.round(c + 360) % 360),
      new U(c, g, a, f.alpha)
    );
  },
  V = function (e, a, b, c) {
    (c = void 0 === c ? 1 : c),
      (this.b = e),
      (this.i = a),
      (this.j = b),
      (this.alpha = c),
      M(e, Number.MAX_VALUE, "lightness"),
      M(c, 1, "alpha");
  };
V.prototype.ka = function (b) {
  return (
    1e-4 > Math.abs(this.b - b.b) &&
    1e-4 > Math.abs(this.i - b.i) &&
    1e-4 > Math.abs(this.j - b.j) &&
    Math.abs(this.alpha - b.alpha) < O
  );
};
var vb = function (f) {
    var a = R(f.red),
      b = R(f.green),
      c = R(f.blue),
      d = 0.2126729 * a + 0.7151522 * b + 0.072175 * c;
    return new V(
      116 * W(d) - 16,
      500 *
        (W((0.4124564 * a + 0.3575761 * b + 0.1804375 * c) / 0.95047) - W(d)),
      200 *
        (W(d) - W((0.0193339 * a + 0.119192 * b + 0.9503041 * c) / 1.08883)),
      f.alpha,
    );
  },
  wb = function (e, a, b, c) {
    (c = void 0 === c ? 1 : c),
      (this.b = e),
      (this.v = a),
      (this.hue = b),
      (this.alpha = c),
      M(e, Number.MAX_VALUE, "lightness"),
      M(a, Number.MAX_VALUE, "chroma"),
      M(b, 360, "hue"),
      M(c, 1, "alpha");
  };
wb.prototype.ka = function (b) {
  return (
    1e-4 > Math.abs(this.b - b.b) &&
    1e-4 > Math.abs(this.v - b.v) &&
    1e-4 > Math.abs(this.hue - b.hue) &&
    Math.abs(this.alpha - b.alpha) < O
  );
};
var xb = function (b) {
  return new wb(
    b.b,
    Math.sqrt(Math.pow(b.i, 2) + Math.pow(b.j, 2)),
    ((180 * Math.atan2(b.j, b.i)) / Math.PI + 360) % 360,
    b.alpha,
  );
};
function R(b) {
  return 0.04045 >= b ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
}
function yb(b) {
  return 0.0031308 >= b ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055;
}
function W(d) {
  var a = 6 / 29,
    b = 1 / (3 * Math.pow(a, 2));
  return d > Math.pow(a, 3) ? Math.pow(d, 1 / 3) : b * d + 4 / 29;
}
function zb(d) {
  var a = 6 / 29,
    b = 3 * Math.pow(a, 2);
  return d > a ? Math.pow(d, 3) : b * (d - 4 / 29);
}
var Ab = function (c, d) {
    return 1e-4 > Math.abs(c) && 1e-4 > Math.abs(d)
      ? 0
      : ((c = (180 * Math.atan2(c, d)) / Math.PI), 0 <= c ? c : c + 360);
  },
  Bb = [
    [
      new V(94.67497003305085, 7.266715066863771, 1.000743882272359),
      new V(86.7897416761699, 18.370736761658012, 4.23637133971424),
      new V(72.0939162832561, 31.7948058298117, 13.2972443996896),
      new V(61.79353370051851, 44.129498163764545, 20.721477326799608),
      new V(57.194195398949574, 59.6450006197361, 34.999830012940194),
      new V(55.603951071861374, 66.01287384845483, 47.67169313982772),
      new V(51.66348502954747, 64.7487785020625, 43.244876694855286),
      new V(47.09455666350969, 62.29836039074277, 40.67775424698388),
      new V(43.77122063388739, 60.28633509183384, 40.31444686692952),
      new V(39.555187078007386, 58.703681355389975, 41.66495027798629),
    ],
    [
      new V(92.68053776327665, 9.515385232804263, -0.8994072969754852),
      new V(81.86756643628922, 25.05688089723257, -1.9475235115390621),
      new V(70.90987389545768, 42.21705257720526, -1.095154624057959),
      new V(61.08140805216186, 58.871233307587204, 2.1008764804626434),
      new V(54.97970219986448, 68.56530938366889, 7.327430728560569),
      new V(50.872250340749176, 74.60459195925529, 15.353576256896073),
      new V(47.27738650144558, 70.77855776427805, 11.70434273264508),
      new V(42.58424189486517, 65.5411953138309, 7.595596439803797),
      new V(37.977492407254836, 60.74362621842075, 2.9847124951453474),
      new V(29.699290034849604, 51.90485023721311, -4.830186634107636),
    ],
    [
      new V(92.4362655169016, 7.542927467702299, -6.039842848605881),
      new V(81.07399776904751, 19.563870217805036, -15.719625491986044),
      new V(68.71394717711831, 33.79992812490556, -26.49539972339321),
      new V(56.596161226236305, 47.5856631835152, -36.480816605410915),
      new V(48.002791217624434, 57.30866443934879, -43.2561127152548),
      new V(40.66211534692161, 64.01910773818436, -48.05930162591041),
      new V(37.690702208992185, 61.13762767732481, -49.384803274243026),
      new V(33.56291870731981, 57.637381239254104, -51.39557249855828),
      new V(29.865391314234515, 54.29737439901333, -52.6601973712463),
      new V(23.16724235420436, 48.51764437280498, -55.16267949015293),
    ],
    [
      new V(92.49103426017201, 4.712320025752947, -6.532868071709763),
      new V(81.24668319505597, 11.50642734909485, -16.666600637245367),
      new V(68.61488216554629, 20.395329051982824, -28.522018851715416),
      new V(55.60369793053023, 30.933537768905005, -41.16439122358484),
      new V(45.834566190969426, 39.28806272235674, -50.523322052772635),
      new V(36.608620229358664, 47.29686002828143, -59.111766586186846),
      new V(34.189791237562616, 46.60426065139123, -59.53961627676729),
      new V(30.52713367338361, 46.01498224754519, -60.19975052509064),
      new V(27.44585524877222, 44.96180431854785, -60.46395810756433),
      new V(21.98627670328218, 44.29296076245473, -60.93653655172098),
    ],
    [
      new V(92.86314411983918, 1.5318147061061937, -6.025243528950552),
      new V(81.8348073705298, 4.460934955458907, -15.873561009736136),
      new V(69.7796913795672, 7.9043652558912765, -26.3170846346932),
      new V(57.48786519938736, 12.681019504822533, -37.23202012914528),
      new V(47.74592578811101, 18.520799302452374, -46.47540679000397),
      new V(38.334403614455404, 25.57700668170812, -55.28224153299287),
      new V(35.15116453901552, 26.231812080381168, -54.53700978785404),
      new V(31.080429988007957, 27.07394930110124, -53.97505274579958),
      new V(27.026672080454922, 28.165266427558983, -53.28987325482218),
      new V(19.751201587921678, 30.60784576895101, -52.13866519297474),
    ],
    [
      new V(94.70682457348717, -2.835484735987326, -6.978044694792707),
      new V(86.8839842970016, -5.16908728759552, -17.88561192754956),
      new V(79.0451532401558, -6.817753527015746, -28.968537490432176),
      new V(71.15083697242613, -5.994763756850707, -39.72549451158927),
      new V(65.48106058907833, -2.735745792537936, -48.15471238926561),
      new V(60.43009440850862, 2.079928897321559, -55.10935847069616),
      new V(55.62267676922188, 4.998684384486918, -55.02164729429915),
      new V(49.27006645904875, 8.470398370314381, -54.494796838457546),
      new V(43.16828856394358, 11.968483076143844, -53.972567377977974),
      new V(32.17757793894193, 18.96054990229354, -53.45146365049088),
    ],
    [
      new V(95.35713467762652, -4.797149155388203, -6.550002550504308),
      new V(88.27942649540043, -10.836006614583892, -16.359361821940375),
      new V(81.10009044900976, -15.323054522981716, -26.419121191320947),
      new V(74.44713958259777, -16.664432625362547, -35.19702686900037),
      new V(69.87836465637318, -14.291515332054693, -41.827430329755174),
      new V(65.68851259178913, -9.612635721963692, -47.34091616039191),
      new V(60.88357994308973, -7.252819027184943, -46.67753731595634),
      new V(54.26166495426166, -3.8141836897908066, -45.97939475762498),
      new V(48.10661895072673, -1.378998784464347, -44.34466750206778),
      new V(36.34401147057282, 5.067812404713545, -43.11786257561915),
    ],
    [
      new V(95.69295154599753, -6.898716127301141, -3.994284229654421),
      new V(89.52842524059004, -16.412398289601725, -9.260466069266693),
      new V(83.32031214655748, -24.83036840728098, -14.568673583304603),
      new V(77.35338313752958, -30.201708572215104, -18.92358284721101),
      new V(73.45322093857781, -31.88590390189383, -21.130459992513686),
      new V(69.97638465064783, -30.679850324547953, -23.186685661136707),
      new V(64.44491716553777, -29.08337434584457, -21.154935769156214),
      new V(56.99816432961103, -27.31081477279451, -17.86988815767443),
      new V(49.75464182255671, -25.335383503694242, -15.024722591662787),
      new V(36.52725894264432, -22.129641744194515, -9.176159146894303),
    ],
    [
      new V(94.18453941589918, -6.08351703428972, -1.5488916051161983),
      new V(85.68177077414457, -15.333179440298606, -2.8519825761476048),
      new V(76.85067847190405, -24.844059173189713, -3.8750785132192656),
      new V(68.02762242570138, -32.566861154120716, -4.015231084407134),
      new V(61.667257304525464, -36.06752603289354, -3.4734046401753815),
      new V(55.67310397390196, -36.66069960626328, -2.125617915169653),
      new V(51.059149495197715, -34.65019160301408, -1.3910484300432513),
      new V(45.269081019218405, -32.13244775422941, -0.4526371852697775),
      new V(39.36899076059384, -29.25264468583161, -0.03562564673170732),
      new V(28.58363043701477, -24.585465516136413, 1.8037402162492389),
    ],
    [
      new V(95.30530183565223, -6.430415645739263, 4.292950594459599),
      new V(88.49014579152143, -15.23147744952702, 10.848261177683138),
      new V(81.22616870575376, -24.993886168551583, 18.144696803330884),
      new V(74.30361721558802, -35.56088696067356, 26.781515251907727),
      new V(69.0430995277442, -42.61556126595995, 33.17109563126665),
      new V(63.977421814072926, -48.54292673319982, 39.73241526342939),
      new V(58.777960853461366, -46.1153692478013, 37.838910745225576),
      new V(52.41108688974904, -43.21761792485762, 35.62250659009424),
      new V(46.2813873076426, -40.25816227675361, 33.32343229338761),
      new V(34.685655305814514, -34.75343878510312, 28.866739034359767),
    ],
    [
      new V(96.70518169355954, -4.929987845095463, 6.397084523168894),
      new V(91.66416061199438, -12.057032041945693, 16.054604579275143),
      new V(86.2244395865449, -19.613646834080622, 26.384906423454236),
      new V(80.83404879636919, -27.080171840756893, 37.378493742021334),
      new V(76.79543725108964, -32.76659719736752, 45.912190572444445),
      new V(72.90025297028019, -37.549139223927384, 53.51959496103027),
      new V(67.21532310272079, -36.56304870773486, 50.49629051268894),
      new V(59.91051142210195, -35.77011466063357, 46.56465847976187),
      new V(52.51015841084511, -34.47903440699235, 42.20723868724268),
      new V(39.41191983353878, -32.80460974352642, 35.255490585630014),
    ],
    [
      new V(97.99506057883428, -4.059632482741494, 9.355797602381521),
      new V(94.80926235976536, -9.237091467352855, 23.230650064824985),
      new V(91.85205843526167, -15.053917327011114, 38.86115182206598),
      new V(88.75812142080242, -19.542900400164097, 53.71785675783709),
      new V(86.27404180729515, -22.173992891121596, 63.978639065232514),
      new V(84.20566835376492, -24.270643520989342, 72.79624067033038),
      new V(78.27915100603997, -21.181850056402496, 68.82763412297965),
      new V(70.82385811892824, -17.788148932525672, 64.00327817988128),
      new V(62.936867012868035, -13.697412111684903, 58.513000509287835),
      new V(49.498610881452535, -6.485230564384715, 49.67432722833751),
    ],
    [
      new V(98.93885129752759, -3.0098470288543178, 10.765736833790008),
      new V(97.22689784824074, -6.174599368734491, 26.22932417355146),
      new V(95.58092947828766, -8.907132848473886, 43.56297291446567),
      new V(94.09009515702486, -10.509628942710735, 60.20019514231188),
      new V(93.06546746683087, -11.008558476013008, 71.76500826005477),
      new V(92.12975017760128, -10.830023094868302, 80.9090559640089),
      new V(87.12188349168609, -2.3764300099239355, 78.14868195373407),
      new V(80.96200442419905, 8.849333792729064, 75.05050700092679),
      new V(75.00342770718086, 20.340173566879283, 72.24841925958934),
      new V(65.48207757431567, 39.647064970476094, 68.34872841768654),
    ],
    [
      new V(97.5642392074337, -1.445525639405032, 11.881254316297674),
      new V(93.67057953749456, -1.8693096862072434, 30.02888670415651),
      new V(89.94571492804107, -1.0224503814769692, 49.649542361642276),
      new V(86.71009164153801, 1.0496066396428194, 68.77377342409739),
      new V(83.78773993319211, 5.248231820098425, 78.92920457852716),
      new V(81.52191382080228, 9.403655370707199, 82.69257112982746),
      new V(78.17240973804697, 16.628512886531887, 81.09358318806208),
      new V(73.80899654381052, 26.53614315250874, 78.21754052181723),
      new V(70.1134511665764, 35.3007623359744, 75.87510992138593),
      new V(63.86460405565717, 50.94648214505959, 72.17815682124423),
    ],
    [
      new V(96.30459517801387, 0.923151172282477, 10.598439446083074),
      new V(90.68320082865087, 4.103774964681062, 26.485793721916128),
      new V(85.00055287186233, 9.047181758866651, 44.51407622580792),
      new V(79.42428495742953, 16.452610724439875, 62.08721739074201),
      new V(75.47792699289774, 23.395742928451867, 72.64347611236501),
      new V(72.04246561548388, 30.681921012382098, 77.08579298904603),
      new V(68.94724338946975, 35.22014778433863, 74.88425044595111),
      new V(64.83017495535229, 40.91200730099703, 71.9596053545428),
      new V(60.8534207471871, 46.41483590510681, 69.18061963415211),
      new V(54.77571742962287, 55.282751019360035, 65.10193403547922),
    ],
    [
      new V(93.69219844671957, 5.763979334358293, 3.1700162796469034),
      new V(86.04629434276428, 15.750843803958192, 14.828476927090994),
      new V(77.54010042938336, 27.90113842540043, 25.99645229289065),
      new V(69.74095456707857, 41.14487377552256, 39.443320178900024),
      new V(64.37085344539341, 51.890379620443575, 50.81312471046415),
      new V(60.06780837277435, 61.65258736118817, 61.54771829165221),
      new V(57.28707915232363, 60.3250664308812, 60.07341536376447),
      new V(53.810052616293845, 58.36760943780162, 58.19586806694884),
      new V(50.301352405105874, 56.40104898089937, 55.924141992404344),
      new V(43.86477994548343, 52.970887703910726, 52.30067989225532),
    ],
    [
      new V(93.29864888069987, 0.9915456090475727, 1.442353076378411),
      new V(82.80884359004081, 3.116221903342209, 3.3523059451463055),
      new V(70.95493047668185, 5.469742193344784, 5.449009494553492),
      new V(58.712934619103066, 7.990991075363385, 8.352488495367627),
      new V(49.150208552875895, 10.570984981000397, 10.831440151197924),
      new V(39.63200151837749, 13.138881961627241, 13.531574711511885),
      new V(35.600996682015754, 12.40352847757295, 12.10432183902449),
      new V(30.084271265759952, 11.317148149878081, 10.547484304296217),
      new V(24.555014696416578, 10.816613316782464, 8.506555306791984),
      new V(18.35055226514404, 10.225725550338765, 7.058582769882571),
    ],
    [
      new V(98.27202740980219, -1.6418393644634932e-5, 6.567357457853973e-6),
      new V(96.53749336548567, -1.616917905122861e-5, 6.467671598286984e-6),
      new V(94.0978378987781, -1.581865383126768e-5, 6.327461532507073e-6),
      new V(89.17728373493613, -1.511167768697419e-5, 6.044671074789676e-6),
      new V(76.61119902231323, -1.330620591488696e-5, 5.322482343750323e-6),
      new V(65.11424774127516, -1.1654345155598378e-5, 4.661738062239351e-6),
      new V(49.238989620828065, -9.373417431124409e-6, 3.7493669724497636e-6),
      new V(41.14266843804848, -8.210152946386273e-6, 3.2840611896567395e-6),
      new V(27.974857206003705, -6.318226192236764e-6, 2.5272904768947058e-6),
      new V(12.740011331302725, -4.129311698131133e-6, 1.6517246792524531e-6),
    ],
    [
      new V(94.27665212516236, -0.637571046109342, -1.313515378996688),
      new V(85.77788001492097, -2.2777811084512822, -3.0177758416151557),
      new V(76.12296325015231, -3.401502988883809, -5.16867892977908),
      new V(66.16340108908365, -4.819627183079045, -7.520697631614404),
      new V(58.35752478513645, -5.7195089100892105, -9.165988916613488),
      new V(50.70748082202715, -6.837992965799455, -10.956055112409357),
      new V(44.85917867647632, -6.411990559239578, -9.74511982878765),
      new V(36.92458930566504, -5.319878610845596, -8.341943474561553),
      new V(29.115334784637618, -4.168907828645069, -6.8629962199973304),
      new V(19.958338450799914, -3.3116721453186617, -5.4486142104736786),
    ],
  ],
  Cb = [
    2.048875457, 5.124792061, 8.751659557, 12.07628774, 13.91449542,
    15.92738893, 15.46585818, 15.09779227, 15.13738673, 15.09818372,
  ],
  Db = [
    1.762442714, 4.213532634, 7.395827458, 11.07174158, 13.89634504,
    16.37591477, 16.27071136, 16.54160806, 17.35916727, 19.88410864,
  ],
  Eb = new P(1, 1, 1, 1),
  Fb = new P(1, 1, 1, 0.6),
  Gb = new P(1, 1, 1, 0.38),
  Hb = {},
  Ib = ((Hb.HIGH = Eb), (Hb.MEDIUM = Fb), (Hb.DISABLED = Gb), Hb),
  Jb = new P(0, 0, 0, 0.87),
  Kb = new P(0, 0, 0, 0.6),
  Lb = new P(0, 0, 0, 0.38),
  Mb = {},
  Nb = ((Mb.HIGH = Jb), (Mb.MEDIUM = Kb), (Mb.DISABLED = Lb), Mb);
function Ob(d) {
  var e = void 0 === e ? 4.5 : e,
    b = jb(ob, d);
  return b >= e ? 0 : ((d = jb(pb, d)), d >= e ? 1 : b > d ? 0 : 1);
}
function Pb(f) {
  var i = 0 === Ob(f) ? Ib.HIGH : Nb.HIGH,
    b = i.alpha,
    c = void 0 === c ? 1 : c;
  f = ib(f);
  for (var d, j = b - 0.01, k = c; 0.01 < k - j; )
    (d = (j + k) / 2),
      4.5 >
      jb(Math.abs(i.alpha - d) < O ? i : new P(i.red, i.green, i.blue, d), f)
        ? (j = d)
        : (k = d);
  return new P(i.red, i.green, i.blue, A(k, b, c));
}
function X(f) {
  var a = void 0 === a ? Bb : a,
    i = vb(f),
    c = Qb(i, a);
  (a = c.fc), (c = c.ec);
  var j = a[c],
    e = xb(j),
    o = xb(i),
    h = 30 > xb(a[5]).v,
    k = e.b - o.b,
    l = e.v - o.v,
    m = e.hue - o.hue,
    p = Cb[c],
    q = Db[c],
    n = 100;
  return a.map(function (a, e) {
    if (a === j) return (n = Math.max(o.b - 1.7, 0)), f;
    a = xb(a);
    var i = a.b - (Cb[e] / p) * k;
    (i = Math.min(i, n)),
      (e = new wb(
        A(i, 0, 100),
        Math.max(0, h ? a.v - l : a.v - l * Math.min(Db[e] / q, 1.25)),
        (a.hue - m + 360) % 360,
      )),
      (n = Math.max(e.b - 1.7, 0)),
      (a = (e.hue * Math.PI) / 180),
      (e = new V(e.b, e.v * Math.cos(a), e.v * Math.sin(a), e.alpha));
    var r = (e.b + 16) / 116;
    return (
      (a = 0.95047 * zb(r + e.i / 500)),
      (i = 1 * zb(r)),
      (r = 1.08883 * zb(r - e.j / 200)),
      new P(
        A(yb(3.2404542 * a + -1.5371385 * i + -0.4985314 * r), 0, 1),
        A(yb(-0.969266 * a + 1.8760108 * i + 0.041556 * r), 0, 1),
        A(yb(0.0556434 * a + -0.2040259 * i + 1.0572252 * r), 0, 1),
        e.alpha,
      )
    );
  });
}
function Qb(f, a) {
  if (((a = void 0 === a ? Bb : a), !a.length || !a[0].length))
    throw Error("Invalid golden palettes");
  for (var i = 1 / 0, j = a[0], o = -1, p = 0; p < a.length; p++)
    for (var s = 0; s < a[p].length && 0 < i; s++) {
      var u = a[p][s],
        v = (u.b + f.b) / 2,
        l = Math.sqrt(Math.pow(u.i, 2) + Math.pow(u.j, 2)),
        w = Math.sqrt(Math.pow(f.i, 2) + Math.pow(f.j, 2)),
        x = (l + w) / 2;
      x =
        0.5 *
        (1 - Math.sqrt(Math.pow(x, 7) / (Math.pow(x, 7) + Math.pow(25, 7))));
      var y = u.i * (1 + x),
        z = f.i * (1 + x),
        A = Math.sqrt(Math.pow(y, 2) + Math.pow(u.j, 2)),
        B = Math.sqrt(Math.pow(z, 2) + Math.pow(f.j, 2));
      x = B - A;
      var C = (A + B) / 2;
      (y = Ab(u.j, y)),
        (z = Ab(f.j, z)),
        (A =
          2 *
          Math.sqrt(A * B) *
          Math.sin(
            (((1e-4 > Math.abs(l) || 1e-4 > Math.abs(w)
              ? 0
              : 180 >= Math.abs(z - y)
              ? z - y
              : z <= y
              ? z - y + 360
              : z - y - 360) /
              2) *
              Math.PI) /
              180,
          )),
        (l =
          1e-4 > Math.abs(l) || 1e-4 > Math.abs(w)
            ? 0
            : 180 >= Math.abs(z - y)
            ? (y + z) / 2
            : 360 > y + z
            ? (y + z + 360) / 2
            : (y + z - 360) / 2),
        (w = 1 + 0.045 * C),
        (B =
          1 +
          0.015 *
            C *
            (1 -
              0.17 * Math.cos(((l - 30) * Math.PI) / 180) +
              0.24 * Math.cos((2 * l * Math.PI) / 180) +
              0.32 * Math.cos(((3 * l + 6) * Math.PI) / 180) -
              0.2 * Math.cos(((4 * l - 63) * Math.PI) / 180))),
        (u = Math.sqrt(
          Math.pow(
            (f.b - u.b) /
              (1 +
                (0.015 * Math.pow(v - 50, 2)) /
                  Math.sqrt(20 + Math.pow(v - 50, 2))),
            2,
          ) +
            Math.pow(x / (1 * w), 2) +
            Math.pow(A / (1 * B), 2) +
            -2 *
              ((x / (1 * w)) *
                Math.sqrt(Math.pow(C, 7) / (Math.pow(C, 7) + Math.pow(25, 7))) *
                Math.sin(
                  (60 * Math.exp(-Math.pow((l - 275) / 25, 2)) * Math.PI) / 180,
                )) *
              (A / (1 * B)),
        )),
        u < i && ((i = u), (j = a[p]), (o = s));
    }
  return { fc: j, ec: o };
}
var qa = globalThis;
X(ob),
  qa.__materialGlobalErrorHandler ||
    (qa.__materialGlobalErrorHandler = function (b) {
      throw b;
    });
var Yc = ["900", "800", "700", "600", "500", "400", "300", "200", "100", "50"],
  $c = function (f, a, h, c) {
    var i = a ? "color-palette__cell--selected" : "";
    (c = a && c ? c.charAt(0) : ""),
      (a = a ? (f ? Pb(f).M() : "rgba(255, 255, 255, 0.6)") : "");
    var e = 0 === Ob(f) ? "ripple-white" : "";
    return L([], i, e, f.M(), a, h, c, Q(f), null);
  },
  ad = function (f, a, b, c) {
    var d = f.map(function (d, e) {
      var h = b.some(function (b) {
        return d.ka(b);
      });
      return $c(
        d,
        h,
        function () {
          return a(f, e);
        },
        c,
      );
    });
    return d.reverse(), L([], d);
  },
  Z = function (f, a, b, h, d) {
    if ("PRIMARY" === d) {
      var c = [];
      c.push(L([], a)),
        b.reduce(function (a, b) {
          return (
            a.push(
              ad(
                b,
                function (a, d) {
                  a = "#" + Q(a[d]);
                },
                h,
                d,
              ),
            ),
            a
          );
        }, c),
        Yc.reduce(function (c, a) {
          return c.push(L([], a)), c;
        }, c);
      var e = {};
      return (
        1 < c.length &&
          c[1].values.forEach(function (a) {
            for (var b, c = 0; c < a.length; c++)
              (b = a[c].values[6]), (e[Yc[c]] = b);
            context = e;
          }),
        e
      );
    }
  },
  cd = function (d, a) {
    var b = [Z(d, "Primary", [X(a)], [a], "PRIMARY")];
    return L([], b);
  },
  ef = function (d, a) {
    var e = lb(rb(a).rotate(180));
    var b = [Z(d, "Complementary", [X(e)], [e])];
    return L([], b);
  };
let context = null;
export function materialColorGenerator(a) {
  a = a.replace("#", "");
  const b = tb(nb(a));
  return cd(this, S(b)), context;
}

/* hexToComplimentary : Converts hex value to HSL, shifts
 * hue by 180 degrees and then converts hex, giving complimentary color
 * as a hex value
 * @param  [String] hex : hex value
 * @return [String] : complimentary color as hex value
 */
export function hexToComplimentary(hex) {
  // Convert hex to rgb
  // Credit to Denis http://stackoverflow.com/a/36253499/4939630
  var rgb =
    "rgb(" +
    (hex = hex.replace("#", ""))
      .match(new RegExp("(.{" + hex.length / 3 + "})", "g"))
      .map(function (l) {
        return parseInt(hex.length % 2 ? l + l : l, 16);
      })
      .join(",") +
    ")";

  // Get array of RGB values
  rgb = rgb.replace(/[^\d,]/g, "").split(",");

  var r = rgb[0],
    g = rgb[1],
    b = rgb[2];

  // Convert RGB to HSL
  // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
  r /= 255.0;
  g /= 255.0;
  b /= 255.0;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2.0;

  if (max == min) {
    h = s = 0; //achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);

    if (max == r && g >= b) {
      h = (1.0472 * (g - b)) / d;
    } else if (max == r && g < b) {
      h = (1.0472 * (g - b)) / d + 6.2832;
    } else if (max == g) {
      h = (1.0472 * (b - r)) / d + 2.0944;
    } else if (max == b) {
      h = (1.0472 * (r - g)) / d + 4.1888;
    }
  }

  h = (h / 6.2832) * 360.0 + 0;

  // Shift hue to opposite side of wheel and convert to [0-1] value
  h += 180;
  if (h > 360) {
    h -= 360;
  }
  h /= 360;

  // Convert h s and l values into r g and b values
  // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  // Convert r b and g values to hex
  rgb = b | (g << 8) | (r << 16);
  return "#" + (0x1000000 | rgb).toString(16).substring(1);
}
