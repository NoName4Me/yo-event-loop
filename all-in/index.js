let logs = [];

function makeLog(timeStart) {
  logs = [];
  return function log(type, msg) {
    logs.push([type, msg, performance.now() - timeStart]);
  };
}

let log = () => {};

const Types = {
  Promise: 'promise',
  Mutation: 'mutation',
  Timer: 'timer',
  Event: 'event',
  Message: 'message',
  Sync: 'sync',
  MicroTask: 'micro',
  Raf: 'raf',
  Idle: 'idle'
};
let isProcessing = false;
window.addEventListener('message', function msgHandler(event) {
  log(Types.Message, '1. message callback ' + event.data);
});
window.addEventListener('message', function msgHandler(event) {
  log(Types.Message, '2. message callback ' + event.data);
});
window.addEventListener('click', function clickHandler() {
  log(Types.Event, 'click event on window');
});
button.addEventListener('click', start);
window.addEventListener('custom-event', function clickHandler() {
  log(Types.Event, 'custom event');
});

const observer = new MutationObserver(function mutationHandler(
  mutationsList,
  observer
) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'attributes') {
      const { target } = mutation;
      log(Types.Mutation, `mutation: to ${target.style.backgroundColor}`);
    }
  }
});

observer.observe(button, { attributes: true });

function makeScript(location) {
  const script = document.createElement('script');
  script.innerHTML = `!function executeScript(){log("${
    location === 'start()' ? Types.Sync : Types.Promise
  }", 'append script in ${location}')}()`;
  document.body.appendChild(script);
}

function makeInterval() {
  let count = 1;
  const interval = setInterval(function intervalHandler() {
    if (count < 3) {
      log(Types.Timer, `0 delay interval: ${count++}`);
    } else {
      clearInterval(interval);
    }
  }, 0);
}

function makeTimeout(count) {
  setTimeout(function timeoutHandler() {
    log(Types.Timer, '0 delay setTimeout ' + count);
  });
}

function makeRaf() {
  let count = 1;

  function rafHandler() {
    if (count < 3) {
      log(Types.Raf, `raf counter ${count++}`);
      Promise.resolve().then(() => {
        log(Types.Promise, 'promise then in raf');
      });
      raf = requestAnimationFrame(rafHandler);
    } else {
      cancelAnimationFrame(raf);
    }
  }
  let raf = requestAnimationFrame(rafHandler);
}

function start() {
  if (isProcessing) return;
  isProcessing = true;
  log = makeLog(performance.now());

  log(Types.Sync, 'start() begin');
  window.postMessage('1', '*');

  makeTimeout(1);
  makeRaf();
  makeInterval();

  requestIdleCallback(function idleHandler() {
    log(Types.Idle, 'idle');
  });
  IntersectionObserver;
  button.style.backgroundColor = 'lightblue';

  window.postMessage('2', '*');

  makeScript('start()');

  window.dispatchEvent(new Event('custom-event'));

  queueMicrotask(function queueMicrotaskHandler() {
    log(Types.MicroTask, 'queueMicrotask');
    button.style.backgroundColor = 'lightgrey';
    Promise.resolve().then(function promiseHandler() {
      log(Types.Promise, 'promise then in queueMicrotask');
    });
  });

  makeTimeout(2);

  Promise.resolve().then(function promiseHandler() {
    makeScript('promise then');
    log(Types.Promise, 'promise then in start()');
  });

  setTimeout(() => {
    log(Types.Timer, 'timeout print log');
    mesgPanel.innerHTML =
      `<div class="header"><span>Logs</span><span>Time Stamp(ms)</span></div>` +
      logs
        .map((item) => {
          return `<div class="row ${item[0]}"><span>${item[1]}</span><span>${item[2]}</span></div>`;
        })
        .join('');
    isProcessing = false;
  }, 200);

  log(Types.Sync, 'start() stop');
}
