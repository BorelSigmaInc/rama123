let fuelRods = [];
let neutrons = [];
let controlRods = [false, false, false, false];
let reactorRunning = false;
let neutronCount = 0;
let powerOutput = 0;
let injectorFailed = false;
const coreRadius = 150;
const numRods = 12;
const baseNeutronRate = 1000; // ms per neutron spawn
let neutronInterval;

function setup() {
  createCanvas(400, 500);
  // Initialize fuel rods in a circular pattern
  for (let i = 0; i < numRods; i++) {
    let angle = (i / numRods) * TWO_PI;
    let x = width / 2 + (coreRadius * 0.5) * cos(angle);
    let y = 200 + (coreRadius * 0.5) * sin(angle);
    fuelRods.push({ x, y, active: false });
  }
}

function draw() {
  background(200);
  // Draw reactor core
  fill(50);
  ellipse(width / 2, 200, coreRadius * 2);
  // Draw fuel rods
  for (let rod of fuelRods) {
    fill(rod.active ? color(255, 255, 0) : color(0, 255, 0));
    ellipse(rod.x, rod.y, 20);
  }
  // Draw control rods
  for (let i = 0; i < 4; i++) {
    let angle = (i / 4) * TWO_PI;
    let x1 = width / 2;
    let y1 = 200;
    let x2 = x1 + coreRadius * cos(angle);
    let y2 = y1 + coreRadius * sin(angle);
    stroke(controlRods[i] ? 150 : 50);
    strokeWeight(5);
    line(x1, y1, x2, y2);
  }
  stroke(0);
  strokeWeight(1);
  // Draw neutrons
  fill(255, 0, 0);
  for (let neutron of neutrons) {
    ellipse(neutron.x, neutron.y, 5);
    // Move neutron
    neutron.x += neutron.vx;
    neutron.y += neutron.vy;
    // Reflect off core boundary
    let dx = neutron.x - width / 2;
    let dy = neutron.y - 200;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist > coreRadius) {
      let normalAngle = atan2(dy, dx);
      let incidentAngle = atan2(neutron.vy, neutron.vx);
      let newAngle = 2 * normalAngle - incidentAngle + PI;
      neutron.vx = 2 * cos(newAngle);
      neutron.vy = 2 * sin(newAngle);
      neutron.x = width / 2 + coreRadius * 0.95 * cos(normalAngle);
      neutron.y = 200 + coreRadius * 0.95 * sin(normalAngle);
    }
  }
  // Draw power gauge
  fill(220);
  rect(100, 400, 200, 20);
  fill(0, 0, 255);
  rect(100, 400, powerOutput * 2, 20);
  // Update power
  let insertedRods = controlRods.filter(rod => rod).length;
  powerOutput = max(0, neutronCount * 0.5 - insertedRods * 5);
  powerOutput = min(powerOutput, 100);
  // Update injector status display
  document.getElementById('status').innerText = `Injector Status: ${injectorFailed ? 'Failed' : 'Normal'}`;
}

function spawnNeutron() {
  if (!reactorRunning) return;
  // Adjust spawn rate based on injector status
  if (injectorFailed && random() > 0.1) return; // 10% chance to spawn if failed
  let rod = fuelRods[floor(random(fuelRods.length))];
  let angle = random(TWO_PI);
  neutrons.push({
    x: rod.x,
    y: rod.y,
    vx: 2 * cos(angle),
    vy: 2 * sin(angle)
  });
  neutronCount++;
  setTimeout(() => {
    rod.active = true;
    setTimeout(() => { rod.active = false; }, 200);
    let neutronIndex = neutrons.findIndex(n => n.x === rod.x && n.y === rod.y);
    if (neutronIndex !== -1) neutrons.splice(neutronIndex, 1);
    neutronCount--;
    let insertedRods = controlRods.filter(rod => rod).length;
    let kEffective = (injectorFailed ? 0.8 : 1.2) - (insertedRods * 0.3);
    if (random() < kEffective - 1) {
      spawnNeutron();
    }
  }, 1000);
}

// Global functions for HTML buttons
function startReactor() {
  if (!reactorRunning) {
    reactorRunning = true;
    neutronInterval = setInterval(spawnNeutron, baseNeutronRate);
  }
}

function stopReactor() {
  reactorRunning = false;
  clearInterval(neutronInterval);
  neutrons = [];
  neutronCount = 0;
}

function toggleControlRod(index) {
  controlRods[index] = !controlRods[index];
}

function toggleInjectorFailure() {
  injectorFailed = !injectorFailed;
}
