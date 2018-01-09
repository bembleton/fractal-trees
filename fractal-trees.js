var lengthRatio;
var lengthVariance;
var minBranchRatio;
var minBranch;
var minBranchAngle;
var maxBranchAngle;

var green = "#5fa536";
var red = "#a54736";
var minLeaveColor;
var maxLeaveColor;
var branchColor;

function run() {
    const c = document.getElementById('canvas');
    const g = c.getContext('2d');
    g.translate(0, c.height);
    g.scale(1,-1);

    for (var i=0; i<5; i++) {
        var trunk = randBetween(16,32);

        lengthRatio = randBetween(4,7);
        lengthVariance = randBetween(0.4,0.8);
        minBranchRatio = randBetween(0.4,0.5);
        minBranch = 0.5;
        minBranchAngle = Math.PI/15;
        maxBranchAngle = Math.PI/6;

        var x = randBetween(0,c.width);
        var root = new Vector(x,0);
        var v = new Vector(0,1).mul(branchLength(trunk));

        var f = Math.random();
        minLeaveColor = lerpColor(green, red, f-0.25);
        maxLeaveColor = lerpColor(green, red, f+0.25);
        branchColor = lerpColor("#222222","#666666", Math.random());

        branch(g, root, v, trunk);
    }
}

function branch(g, p, v, trunk) {
    var q = p.add(v);
    var pd = p.add(v.mul(-0.07))
    line(g, pd, q, trunk, branchColor);
    var a = randBetween(minBranchRatio, 1-minBranchRatio) * trunk;
    var b = Math.sqrt(trunk*trunk - a*a);

    if (Math.random() < 0.5) {
        var t = a;
        a = b;
        b = t;
    }

    if (a < minBranch || b < minBranch) return;
    if (trunk < 3) {
        drawLeaves(g, p, v);
    }

    var vn = v.normalize();
    var left = vn.rotate(-Math.PI/2);
    var right = left.mul(-1);

    var ap = q.add(left.mul(trunk/2)).add(right.mul(a/2));
    var av = vn.rotate(-randBetween(minBranchAngle, maxBranchAngle)).mul(branchLength(a));
    branch(g, ap, av, a);

    var bp = q.add(right.mul(trunk/2).add(left.mul(b/2)));
    var bv = vn.rotate(randBetween(minBranchAngle, maxBranchAngle)).mul(branchLength(b));
    branch(g, bp, bv, b);
}

function branchLength(trunk) {
    var variance = Math.random()*lengthVariance;
    return trunk*lengthRatio*(1-variance);
}

function line (g, p, q, width, color) {
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(q.x, q.y);
    g.lineWidth = width||1;
    g.strokeStyle = color||"#000000";
    g.stroke();
}

function drawLeaves(g, p, v) {
    for (var i=0;i<5;i++) {
        g.beginPath();
        g.fillStyle = lerpColor(minLeaveColor, maxLeaveColor, Math.random());
        var q = p.add(v.rotate(randBetween(-Math.PI/4, Math.PI/4)).normalize().mul(Math.random()*18));
        g.arc(q.x, q.y, 2, 0, Math.PI*2, false);
        g.fill();
    }
}

function hex2bytes (str) {
    var a = [];
    for (var i = 0, len = str.length; i < len; i+=2) {
        a.push(parseInt(str.substr(i,2),16));
    }
    return a;
}

function bytes2hex (arr) {
    var hexStr = '';
    for (var i = 0; i < arr.length; i++) {
        var hex = (arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }
    return hexStr;
}

function color2hex (c) {
    return c.substring(1);
}

function hex2color (a) {
    return '#'+a;
}

function lerpColor (a, b, f) {
    var aa = hex2bytes(color2hex(a));
    var bb = hex2bytes(color2hex(b));
    var cc = aa.map((a,i) => { 
        return (bb[i] - a)*f + a;
    });
    return hex2color(bytes2hex(cc));
}

function randBetween(p,q) {
    return Math.random()*(q-p)+p;
}

function randomAngle() {
    return Math.random()*Math.PI*2;
}

function randomColor () {
    var c = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
    return hex2color(bytes2hex(c));
}

window.onload = run;