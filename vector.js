var twoPI = Math.PI*2;

class Vector extends Matrix {
    constructor(x,y) {
        super(3,1, [x,y,1]);
    }

    get x() { return this[0]; }
    set x(val) { this[0] = val; }

    get y() { return this[1]; }
    set y(val) { this[1] = val; }

    add (v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }

    sub (v) {
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mul (s) {
        return new Vector(this.x*s, this.y*s);
    }

    div (s) {
        if (s == 0) {
            throw "division by zero";
        }
        return new Vector(this.x/s, this.y/s);
    }

    length2 () {
        return this.x*this.x + this.y*this.y;
    }

    magnitude () {
        const l2 = this.length2();
        return Math.sqrt(l2);
    }

    normalize () {
        if (this.x == 0 && this.y == 0) return this;
        const l = this.magnitude();
        return this.div(l);
    }

    rotate (theta) {
        if (isNaN(theta)) {
            throw "invalid rotation";
        }
        const a = this.x*Math.cos(theta)-this.y*Math.sin(theta);
        const b = this.x*Math.sin(theta)+this.y*Math.cos(theta);
        return new Vector(a,b);
    }

    dot (v) {
        return this.x*v.x + this.y*v.y;
    }

    transform (m) {
        const output = new Vector(0,0);
        return m.mul(this, output);
    }
}

function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function toRadians(degrees) {
    return degrees/360.0*twoPI;
}

function toDegrees(radians) {
    return radians/twoPI*360.0;
}