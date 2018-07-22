// #FF8800 -> [255, 136, 0]
function color2rgb(c) {
    var a = [];
    for (var i = 1, len = c.length; i < len; i+=2) {
        a.push(parseInt(c.substr(i,2),16));
    }
    return a;
}

function rgb2color(rgb, alpha) {
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]}${alpha ? ','+alpha : ''})`;
}

function lerpRgb(a, b, f) {
    f = clamp(f,0,1);
    return a.map((x,i) => { 
        return (b[i] - x)*f + x;
    });
}

function palette(c1, c2, f1, f2) {
    const palette = [];
    for (var i=0;i<5;i++) {
        palette[i] = [];
        var a = palette[i][0] = lerpRgb(c1, c2, i/4.0);
        var b = palette[i][4] = lerpRgb(f1, f2, i/4.0);
        for (var j=1;j<4;j++) {
            palette[i][j] = lerpRgb(a, b, j/4.0);
        }
    }

    var colors = [];
    for (var i=0;i<5;i++) {
        colors[i] = [];
        for (var j=0;j<5;j++) {
            colors[i][j] = rgb2color(palette[i][j]);
        }
    }

    return colors;
}

function getColor(colors, indices) {
    return colors[indices[0]][indices[1]];
}