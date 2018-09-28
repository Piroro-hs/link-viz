/* eslint fp/no-mutation: ['error', {commonjs: true, allowThis: true, exceptions: [{object: 'ctx'}]}] */
const {createStore} = require('redux');

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

const linearAreaTheta = (a, l, tolerance) => {
  const step = 500;
  return Array(step)
    .fill()
    .map((_, i) => (1 - i / step) * Math.PI)
    .reduce(
      (acc, cur) => {
        const x = trajectoryX(a, l, cur);
        const min = Math.min(x, acc.min);
        const max = Math.max(x, acc.max);
        return max - min > tolerance || acc.break
          ? {...acc, break: true}
          : {...acc, min, max, theta: cur};
      },
      {min: Infinity, max: -Infinity, theta: 0, break: false},
    ).theta;
};

const SET_A = 'CHANGE_A';
const SET_LINEAR_TOLERANCE = 'SET_LINEAR_TOLERANCE';

const initialState = {
  a: 0,
  l: 1,
  tolerance: 0,
  ui: {
    input: {
      a: 0,
      tolerance: 0,
    },
    startTime: Date.now(),
    scale: 10,
  },
};

const reducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_A: {
      const parsed = parseFloat(payload);
      const a = Number.isNaN(parsed) ? state.a : parsed;
      const l =
        ((a ** 6 + 6 * a ** 5 + 15 * a ** 4 + 4 * a ** 3 + 15 * a ** 2 + 6 * a + 1) /
          (a ** 2 + 2 * a + 1)) **
        0.5;
      return {...state, a, l, ui: {...state.ui, input: {...state.ui.input, a: payload}}};
    }
    case SET_LINEAR_TOLERANCE: {
      const parsed = parseFloat(payload);
      const tolerance = Number.isNaN(parsed) ? state.tolerance : parsed;
      return {
        ...state,
        tolerance,
        ui: {...state.ui, input: {...state.ui.input, tolerance: payload}},
      };
    }
    default:
      return state;
  }
};

const store = createStore(reducer);

store.subscribe(() => {
  const {
    a,
    l,
    tolerance,
    ui: {input},
  } = store.getState();
  const theta = linearAreaTheta(a, l, tolerance);
  document.querySelector('#a_range').value = a; // eslint-disable-line fp/no-mutation
  document.querySelector('#a_text').value = input.a; // eslint-disable-line fp/no-mutation
  document.querySelector('#l').textContent = l; // eslint-disable-line fp/no-mutation
  document.querySelector('#linear_tolerance_text').value = input.tolerance; // eslint-disable-line fp/no-mutation
  document.querySelector('#linear_theta').textContent = Math.PI - theta; // eslint-disable-line fp/no-mutation
  document.querySelector('#linear_y').textContent = Math.abs(trajectoryY(a, l, theta)); // eslint-disable-line fp/no-mutation
});

const update = (type, {target: {value}}) => {
  store.dispatch({type, payload: value});
};
document.querySelector('#a_range').addEventListener('input', update.bind(undefined, SET_A));
document.querySelector('#a_text').addEventListener('input', update.bind(undefined, SET_A));
document
  .querySelector('#linear_tolerance_text')
  .addEventListener('input', update.bind(undefined, SET_LINEAR_TOLERANCE));

const ctx = document.querySelector('canvas').getContext('2d');
ctx.transform(1, 0, 0, 1, 400, 200);

const motor = (scale = 1) => {
  ctx.beginPath();
  ctx.arc(0, 0, 1 * scale, 0, 2 * Math.PI);
  ctx.strokeStyle = '#888888';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1;
  ctx.stroke();
};
const trajectory = (a, l, scale = 1) => {
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
const line = (a, l, theta, scale = 1) => {
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
const motorPin = (theta, scale = 1) => {
  ctx.beginPath();
  ctx.arc(Math.cos(theta) * scale, Math.sin(theta) * scale, 3, 0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
};
const pin = (a, scale = 1) => {
  ctx.beginPath();
  ctx.arc(a * scale, 0, 5, 0, 2 * Math.PI);
  ctx.fillStyle = '#ff0000';
  ctx.fill();
};
const linearArea = (a, l, tolerance, scale = 1) => {
  const theta = linearAreaTheta(a, l, tolerance);
  const x = trajectoryX(a, l, theta);
  const y = Math.abs(trajectoryY(a, l, theta));
  ctx.fillStyle = 'rgba(255, 0, 255, 0.48)';
  ctx.fillRect(
    x * scale,
    -y * scale,
    (x > trajectoryX(a, l, Math.PI) ? -1 : 1) * Math.max(tolerance * scale, 1),
    y * 2 * scale,
  );
};

const draw = () => {
  ctx.clearRect(-400, -200, 800, 400);

  const {
    a,
    l,
    tolerance,
    ui: {startTime, scale},
  } = store.getState();
  const theta = ((Date.now() - startTime) / 2000) * 2 * Math.PI;
  motor(scale);
  if (Math.abs(a) !== 1) {
    trajectory(a, l, scale);
    line(a, l, theta, scale);
    linearArea(a, l, tolerance, scale);
  }
  motorPin(theta, scale);
  pin(a, scale);

  window.requestAnimationFrame(draw);
};
window.requestAnimationFrame(draw);
