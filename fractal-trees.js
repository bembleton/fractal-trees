var green = color2rgb("#5fba2a");
var darkgreen = color2rgb("#135622");
var lightgreen = color2rgb("#abd112");
var yellow = color2rgb("#d8b60d");
var red = color2rgb("#ce2d10");
var orange = color2rgb("#d1550e");
var gray = color2rgb("#666666");
var darkgray = color2rgb("#222222");
var c,g;

var world = {
    t: 0,
    trees: [],
    leaves: []
};

var springcolors = [darkgreen, green, lightgreen];
var fallcolors = [yellow, orange, red];

var stepSize = 0.1;
var numTrees = 3;
var treeStiffness = 1;
var leafsPerTwig = 4;
var windSpeed = 5;
var leafFallSpeed = 3;

function run() {
    c = document.getElementById('canvas');
    g = c.getContext('2d');

    // move 0,0 to the bottom center
    g.translate(0, c.height);
    // flip y so it increases going up
    g.scale(1,-1);

    for (var i=0; i<numTrees; i++) {
        
        world.trees.push(makeTree());
    }

    window.requestAnimationFrame(step);
}

var lastUpdate;

function step(timestamp) {
    if (!lastUpdate) lastUpdate = timestamp;
    var elapsed = timestamp - lastUpdate;

    if (elapsed > 33 && numTrees > 1) {
        numTrees--;
        delete world.trees.pop();
    }
    
    g.clearRect(0, 0, c.width, c.height);

    var {
        trees,
        leaves
    } = world;

    world.t += stepSize;

    for (var i=0;i<trees.length;i++) {
        drawTree(g, trees[i]);
    }

    for (var i=leaves.length-1;i>0;i--) {
        if (Math.random()<0.005) {
            leaves.splice(i, 1);
            continue;
        }
        drawWorldLeaf(g, leaves[i]);
    }

    window.requestAnimationFrame(step);
}


function makeTree() {
    var x = randBetween(c.width*0.2,c.width*0.8);
    var width = randBetween(16,32);

    var treeSettings = {
        lengthRatio: randBetween(4,7),
        lengthVariance: randBetween(0.4,0.8),
        minBranchRatio: randBetween(0.4,0.5),
        minBranch: 0.75,
        minBranchAngle: Math.PI/15,
        maxBranchAngle: Math.PI/6
    };

    var root = new Vector(x,0);
    var direction = new Vector(0,1);

    var color = rgb2color(lerpRgb(darkgray,gray, Math.random()));

    // define leaf color range once per tree
    // pick two spring colors and two fall colors
    var springs = nChooseK(springcolors, 2);
    var falls = nChooseK(fallcolors, 2);
    var leafColors = palette(springs[0], springs[1], falls[0], falls[1]);

    var trunk = makeBranch(direction, width, treeSettings);

    return {
        root,
        color,
        trunk,
        leafColors
    }
}

function makeBranch(direction, width, treeSettings) {
    var {
        lengthRatio,
        lengthVariance,
        minBranchRatio,
        minBranch,
        minBranchAngle,
        maxBranchAngle,
    } = treeSettings;

    var variance = Math.random()*lengthVariance;
    var length = width*lengthRatio*(1-variance);
    
    var branch = {
        width,
        length,
        direction
    };

    // add leaves to twigs
    if (width < 3) {
        var leaves = [];
        for (var i=0;i<leafsPerTwig;i++) {
            leaves.push(makeBranchLeaf(direction));
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
            left: makeBranch(leftDir, a, treeSettings),
            right: makeBranch(rightDir, b, treeSettings)
        };
    }

    return branch;
}

function makeBranchLeaf(v) {
    var colorIndex = [randomInt(5), 0];
    var offset = v.rotate(randBetween(-Math.PI/4, Math.PI/4)).normalize().mul(Math.random()*18);
    return {
        colorIndex,
        offset,
        size: 4
    }
}

function drawTree(g, tree) {
    var {
        root,
        color,
        trunk,
        leafColors
    } = tree;

    drawBranch(g, root, trunk, color, leafColors, 0);
}

function drawBranch(g, p, branch, color, leafColors, accumulatedTorque) {
    if (isNaN(p.x) || isNaN(p.y)) {
        throw "branch root is invalid";
    }
    var vn = branch.direction.rotate(accumulatedTorque);
    
    // apply additional wind
    var wind = windAt(p.x)*windSpeed;
    var windn = new Vector(wind, 0);

    var winds = (1 - Math.abs(vn.dot(windn)))*wind;
    var twist = toRadians(clamp(winds/treeStiffness*Math.sign(vn.y), -5, 5));

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
        drawBranch(g, ap, branch.branches.left, color, leafColors, accumulatedTorque);
        drawBranch(g, bp, branch.branches.right, color, leafColors, accumulatedTorque);
    }

    if (branch.leaves) {
        drawBranchLeaves(g, p, branch, accumulatedTorque, leafColors);
    }
}

function drawBranchLeaves(g, p, branch, accumulatedTorque, leafColors) {
    var {
        direction,
        leaves
    } = branch;

    var season = getSeason();

    for (var i=leaves.length-1;i>0;i--) {
        var leaf = leaves[i];
        if (!updateBranchLeaf(leaf, p, leaves, i, leafColors)) continue;
        drawBranchLeaf(g, p, leaf, accumulatedTorque, leafColors);
    }

    if (season == 4) {
        // random chance to sprout a leaf
        if (leaves.length < leafsPerTwig) {
            if (Math.random()*0.01) {
                var bud = makeBranchLeaf(direction);
                bud.size = 1;
                leaves.push(bud);
            }
        }
    }
}

function updateBranchLeaf(leaf, p, leaves, leafIndex, leafColors) {
    var season = getSeason();

    if (season == 1) {
        // random chance to increase leaf color towards 4
        if (Math.random()<0.02) {
            leaf.colorIndex[1] = Math.min(4, leaf.colorIndex[1]+1);
        }
    }
    else if (season == 2) {
        if (Math.random()<0.01) {
            leaves.splice(leafIndex,1);
            var rgb = getColor(leafColors, leaf.colorIndex);
            var rgba = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.random()*0.4+0.2})`;
            var worldLeaf = {
                p: p.add(leaf.offset),
                color: rgba
            };
            world.leaves.push(worldLeaf);
            return false;
        }
    }
    else if (season == 4) {
        if (leaf.size < 4) {
            if (Math.random()<0.02) {
                leaf.size++;
            }
        }
    }
    return true;
}

function getSeason() {
    // a year is 3600 frames
    // a season is 900 frames
    // [summer, earlyFall, fall, winter, spring]
    var dayOfYear = world.t%500;
    var season = Math.floor(dayOfYear/100);
    return season;
}

function drawBranchLeaf(g, p, leaf, accumulatedTorque, leafColors) {
    var color = getColor(leafColors, leaf.colorIndex);
    var q = p.add(leaf.offset.rotate(accumulatedTorque));
    var wind = windAt(p.x);
    q.x += wind*windSpeed;
    drawLeaf(g, q, leaf.size, color);
}

function drawWorldLeaf(g, leaf) {
    var size = 4;
    // float down
    var {
        p,
        color
    } = leaf;

    if (p.y > size) {
        p.x += windAt(p.x)*windSpeed*4;
        p.y += -leafFallSpeed;
    }

    drawLeaf(g, p, size, color);
}

function drawLeaf(g, p, size, color) {
    g.beginPath();
    g.fillStyle = color;
    g.rect(p.x, p.y, size, size);
    g.fill();
}

function line (g, p, q, width, color) {
    g.beginPath();
    g.moveTo(p.x, p.y);
    g.lineTo(q.x, q.y);
    g.lineWidth = width||1;
    g.strokeStyle = color||"#000000";
    g.stroke();
}

function randBetween(p,q) {
    return Math.random()*(q-p)+p;
}

function randomInt(a,b) {
    if (b === undefined) {b=a;a=0}
    return Math.ceil(Math.random()*(b-a)) - 1 + a;
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
    x %= 99;
    if (x < 0) x += 99;
    var i = (x/c.width * 99.0 + world.t/5)%99.0;
    return Math.abs(samplePerlin(i));
}

function drawPalette(g, palette) {
    for (var i=0;i<5;i++) {
        for (var j=0;j<5;j++) {
            var x = 50 + i*10;
            var y = 50 + j*10;
            g.beginPath();
            g.fillStyle = palette[i][j];
            g.rect(x,y,9,9);
            g.fill();
        }
    }
}

function nChooseK(values, k) {
    var choices = Array.from(values);
    var result = [];
    for (var i=0;i<k;i++) {
        var j = randomInt(choices.length-1);
        result.push(choices[j]);
        choices.splice(j,1);
    }
    return result;
}

window.onload = run;