class Matrix extends Float32Array {
	constructor (rows, cols, values) {
		if (values) {
			super(values);
		} else {
			super(rows*cols);
		}
		this.size = { rows, cols };
	}

	rowValue (r, offset) {
		return this[r*this.size.rows + offset];
	}

	colValue (c, offset) {
		return this[offset*this.size.cols + c];
	}

	mul (m2, output) {
		if (this.size.cols !== m2.size.rows) {
			throw "Column size must be the same as applicands row size.";
		}

		const cols = output.size.cols;
		const dims = this.size.cols;

		for (let i=0; i<output.length; i++) {
			const r = Math.floor(i/cols);
			const c = Math.floor(i%cols);
			output[i] = 0;
			for (let j=0; j<dims; j++) {
				const a = this.rowValue(r, j);
				const b = m2.colValue(c, j);
				output[i] += a*b;
			}
		}

		return output;
	}
}


class Matrix2d extends Matrix {
	constructor (values) {
		super(3,3, values);
	}

	// constructor methods
	static translate (x,y) {
		return new Matrix2d([1,0,x, 0,1,y, 0,0,1]);
	}

	static rotate (theta) {
		const r = toRadians(theta);
		const c = Math.cos(r);
		const s = Math.sin(r);
		return new Matrix2d([c,-s,0, s,c,0, 0,0,1]);
	}

	static scale (x,y) {
		return new Matrix2d([x,0,0, 0,y,0, 0,0,1]);
	}

	// instance methods
	translate (x,y) {
		const output = new Matrix2d();
		return this.mul(Matrix2d.translate(x,y), output);
	}
	rotate (theta) {
		const output = new Matrix2d();
		return this.mul(Matrix2d.rotate(theta), output);
	}
	scale (x,y) {
		const output = new Matrix2d();
		return this.mul(Matrix2d.scale(x,y), output);
	}
}

Matrix2d.identity = new Matrix2d([1,0,0, 0,1,0, 0,0,1]);