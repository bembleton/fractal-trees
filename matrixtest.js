function run() {
	const c = document.getElementById('canvas');
    const g = c.getContext('2d');

    const p = new Vector(0,1);
    const q = new Vector(1,-1);
    const r = new Vector(-1,-1);

    const model = [p,q,r];

    // draw the model
    drawPoly(g, model);

    for (let i=0;i<10;i++) {
    	drawPoly(g, poly(model, [5,5], [i*12 + 12,50], i*36));
    }
}

function drawPoly (g, points, fillStyle = '#666666') {
	const last = points[points.length-1];
	g.beginPath();
	g.moveTo(last.x, last.y);
	points.forEach(p => g.lineTo(p.x, p.y));
	g.fillStyle = fillStyle;
	g.fill();
}

function poly (model, scale, position, rotation) {
	// scale, rotate, translate
	//const t = Matrix2d.scale(...scale).rotate(rotation).translate(...position);
	const t = Matrix2d.translate(...position).rotate(rotation).scale(...scale);
	// transform model
	const points = model.map(p => p.transform(t));
	return points;
}

window.onload = run;