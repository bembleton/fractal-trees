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

var trees = [];
var start;
var c,g;
var t = 0;

function run() {
    c = document.getElementById('canvas');
    g = c.getContext('2d');

    g.translate(0, c.height);
    g.scale(1,-1);

    minBranch = 0.5;
    minBranchAngle = Math.PI/15;
    maxBranchAngle = Math.PI/6;

    trees = [];
    for (var i=0; i<3; i++) {
        var x = randBetween(0,c.width);
        trees.push(makeTree(x));
    }

    window.requestAnimationFrame(step);
}

function step(timestamp) {
    g.clearRect(0, 0, c.width, c.height);

    t += 0.1;

    for (var i=0;i<trees.length;i++) {
        drawTree(g, trees[i]);
    }

    window.requestAnimationFrame(step);
}


function makeTree(x) {
    var width = randBetween(16,32);

    lengthRatio = randBetween(4,7);
    lengthVariance = randBetween(0.4,0.8);
    minBranchRatio = randBetween(0.4,0.5);
    minBranch = 0.5;
    minBranchAngle = Math.PI/15;
    maxBranchAngle = Math.PI/6;

    var root = new Vector(x,0);
    var direction = new Vector(0,1);

    var color = lerpColor("#222222","#666666", Math.random());

    // define leaf color range once per tree
    var f = Math.random();
    minLeaveColor = lerpColor(green, red, f-0.25);
    maxLeaveColor = lerpColor(green, red, f+0.25);
    var leafColors = [];
    for (var i=0; i<5; i++) {
        leafColors[i] = lerpColor(minLeaveColor, maxLeaveColor, i/4.0);
    }

    var makeLeaf = function(v) {
        var color = leafColors[Math.ceil(Math.random()*5)-1]
        var offset = v.rotate(randBetween(-Math.PI/4, Math.PI/4)).normalize().mul(Math.random()*18);
        return {
            color,
            offset
        }
    }

    var trunk = makeBranch(direction, width, makeLeaf);

    return {
        root,
        color,
        trunk
    }
}

function makeBranch(direction, width, makeLeaf) {
    var length = branchLength(width);

    var branch = {
        width,
        length,
        direction
    };

    // add leaves to twigs
    if (width < 3) {
        var leaves = [];
        for (var i=0;i<5;i++) {
            leaves.push(makeLeaf(direction));
        }
        branch.leaves = leaves;
    }

    // add branches
    var a = randBetween(minBranchRatio, 1-minBranchRatio) * width;
    var b = Math.sqrt(width*width - a*a);

    if (a > minBranch && b > minBranch) {
        if (Math.random() < 0.5) {
            var t = a;
            a = b;
            b = t;
        }

        var leftDir = direction.rotate(-randBetween(minBranchAngle, maxBranchAngle));
        var rightDir = direction.rotate(randBetween(minBranchAngle, maxBranchAngle));

        branch.branches = {
            left: makeBranch(leftDir, a, makeLeaf),
            right: makeBranch(rightDir, b, makeLeaf)
        };
    }

    return branch;
}

function drawWind(g) {
    var px = 82; //-c.width/2 + 50 + 32;
    var py = c.height/2 - 50 + 32;
    var p = new Vector(px, py);
    var q = p.add(new Vector(wind*32, 0));

    var color = "#000000";

    g.beginPath();
    g.arc(px, py, 32, 0, twoPI);
    g.lineWidth = 2;
    g.strokeStyle = color;
    g.stroke();

    line(g, p, q, 2, color);
}

function drawTree(g, tree) {
    var p = tree.root;
    var color = tree.color;
    var trunk = tree.trunk;

    drawBranch(g, p, trunk, color, 0);
}

function drawBranch(g, p, branch, color, accumulatedTorque) {
    var vn = branch.direction.rotate(accumulatedTorque);
    
    // apply additional wind
    var wind = windAt(p.x)*2;
    var windn = new Vector(wind, 0);

    var winds = Math.abs(vn.dot(windn)*wind);
    var twist = toRadians(clamp(branch.length*winds/branch.width*Math.sign(vn.y), -10, 10));

    // to radians
    vn = vn.rotate(twist);
    accumulatedTorque += twist;

    var v = vn.mul(branch.length);
    var q = p.add(v);
    var pd = p.add(v.mul(-0.07))
    var width = branch.width;
    line(g, pd, q, width, color);

    if (branch.branches) {
        var left = vn.rotate(-Math.PI/2);
        var right = left.mul(-1);
        var  a = branch.branches.left.width;
        var  b = branch.branches.right.width;
        var ap = q.add(left.mul(width/2)).add(right.mul(a/2));
        var bp = q.add(right.mul(width/2).add(left.mul(b/2)));
        drawBranch(g, ap, branch.branches.left, color, accumulatedTorque);
        drawBranch(g, bp, branch.branches.right, color, accumulatedTorque);
    }

    if (branch.leaves) {
        for (var i=0;i<branch.leaves.length;i++) {
            var leaf = branch.leaves[i];
            drawLeaf(g, p, leaf, accumulatedTorque);
        }
    }
}

function drawLeaf(g, p, leaf, accumulatedTorque) {
    g.beginPath();
    g.fillStyle = leaf.color;
    var q = p.add(leaf.offset.rotate(accumulatedTorque));
    var wind = windAt(p.x);
    q.x += wind*2;
    g.rect(q.x, q.y, 4, 4);
    g.fill();
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

const slopeAt = [];
for (let i = 0; i < 100; i++) {
  slopeAt[i] = Math.random();
}

function samplePerlin(x) {
  const lo = Math.floor(x);
  const hi = lo+1;
  const dist = x-lo;
  loSlope = slopeAt[lo];
  hiSlope = slopeAt[hi];
  loPos = loSlope * dist;
  hiPos = -hiSlope * (1-dist);
  const u = dist * dist * (3.0 - 2.0 * dist);  // cubic curve
  return (loPos*(1-u)) + (hiPos*u);  // interpolate
}

function windAt(x) {
    var i = (x/c.width * 90.0 + t)%90.0;
    return samplePerlin(i);
}


window.onload = run;