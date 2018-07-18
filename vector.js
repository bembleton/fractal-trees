var twoPI = Math.PI*2;

class Vector {
    constructor(x,y) {
        this.x=x;
        this.y=y;
    }

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
        return new Vector(this.x/s, this.y/s);
    }

    length2 () {
        return this.x*this.x + this.y*this.y;
    }

    length () {
        const l2 = this.length2();
        return Math.sqrt(l2);
    }

    normalize () {
        const l = this.length();
        return this.div(l);
    }

    rotate (theta) {
        const a = this.x*Math.cos(theta)-this.y*Math.sin(theta);
        const b = this.x*Math.sin(theta)+this.y*Math.cos(theta);
        return new Vector(a,b);
    }

    dot (v) {
        return this.x*v.x + this.y*v.y;
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