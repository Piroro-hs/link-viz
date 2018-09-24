/* eslint fp/no-mutation: ['error', {commonjs: true, allowThis: true, exceptions: [{object: 'ctx'}]}] */

const state = {
  a: 0,
  startTime: Date.now(),
};

const scale = 10;

const ctx = document.querySelector('canvas').getContext('2d');
ctx.transform(1, 0, 0, 1, 400, 200);

const trajectoryX = (a, l, theta) =>
  a > 0
    ? Math.cos(theta) + ((a - Math.cos(theta)) * l) / (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5
    : Math.cos(theta) + ((Math.cos(theta) - a) * l) / (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5;
const trajectoryY = (a, l, theta) =>
  a > 0
    ? (-Math.sin(theta) * (l - (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5)) /
      (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5
    : (Math.sin(theta) * (l + (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5)) /
      (a ** 2 - 2 * a * Math.cos(theta) + 1) ** 0.5;

const motor = () => {
  ctx.beginPath();
  ctx.arc(0, 0, 1 * scale, 0, 2 * Math.PI);
  ctx.strokeStyle = '#888888';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;
  ctx.stroke();
};
const trajectory = (a, l) => {
  const step = 500;
  ctx.beginPath();
  ctx.moveTo(trajectoryX(a, l, 0) * scale, trajectoryY(a, l, 0) * scale);
  Array(step)
    .fill()
    .map((_, i) => ((i + 1) / step) * 2 * Math.PI)
    .forEach(theta => {
      ctx.lineTo(trajectoryX(a, l, theta) * scale, trajectoryY(a, l, theta) * scale);
    });
  ctx.strokeStyle = '#888888';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;
  ctx.stroke();
};
const line = (a, l, theta) => {
  ctx.beginPath();
  const x = trajectoryX(a, l, theta);
  const y = trajectoryY(a, l, theta);
  if (a > 0) {
    ctx.moveTo(Math.cos(theta) * scale, Math.sin(theta) * scale);
  } else {
    ctx.moveTo(
      (x - (x - a) * ((l + (1 - a)) / ((x - a) ** 2 + y ** 2) ** 0.5)) * scale,
      -y *
        ((l + (1 - a) - ((x - a) ** 2 + y ** 2) ** 0.5) / ((x - a) ** 2 + y ** 2) ** 0.5) *
        scale,
    );
  }
  ctx.lineTo(trajectoryX(a, l, theta) * scale, trajectoryY(a, l, theta) * scale);
  ctx.strokeStyle = '#000000';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.stroke();
};
const motorPin = theta => {
  ctx.beginPath();
  ctx.arc(Math.cos(theta) * scale, Math.sin(theta) * scale, 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
};
const pin = a => {
  ctx.beginPath();
  ctx.arc(a * scale, 0, 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#ff0000';
  ctx.fill();
};

const draw = () => {
  // ctx.fillStyle = '#ffffff';
  // ctx.fillRect(-100, -200, 800, 400);
  ctx.clearRect(-400, -200, 800, 400);

  const {a} = state;
  const theta = ((Date.now() - state.startTime) / 2000) * 2 * Math.PI;
  motor();
  if (Math.abs(a) !== 1) {
    const l =
      ((a ** 6 + 6 * a ** 5 + 15 * a ** 4 + 4 * a ** 3 + 15 * a ** 2 + 6 * a + 1) /
        (a ** 2 + 2 * a + 1)) **
      0.5;
    trajectory(a, l);
    line(a, l, theta);
  }
  motorPin(theta);
  pin(a);

  window.requestAnimationFrame(draw);
};

window.requestAnimationFrame(draw);

const update = ({target: {value}}) => {
  const parsed = Number.parseFloat(value);
  state.a = Number.isNaN(parsed) ? state.a : parsed; // eslint-disable-line fp/no-mutation
  document.querySelector('#a_range').value = state.a; // eslint-disable-line fp/no-mutation
  document.querySelector('#a_text').value = value; // eslint-disable-line fp/no-mutation
};

document.querySelector('#a_range').addEventListener('input', update);
document.querySelector('#a_text').addEventListener('input', update);
