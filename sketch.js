// on window resize, adjust the canvas size
let distance_settings = [
    0.3,
    0.5,
    1,
    2,
    5,
    10,
]
let distance_settings_labels = [
    "< 0.5 m",
    "0.5 m",
    "1 m",
    "2 m",
    "5 m",
    "10 m",
]

let power_settings = [
    0.0625, // 1/16
    0.125,  // 1/8
    0.25,   // 1/4
    0.5,    // 1/2
    1,      // 1
]

let power_settings_labels = [
    "1/16",
    "1/8",
    "1/4",
    "1/2",
    "1",
]

let aperture_steps = [
    1.8,
    2.0,
    2.8,
    4.0,
    5.6,
    8.0,
    11.0,
    16.0,
    22.0
];

let guide_number = 10; // 10 m @ ISO 100 @ 1.0 power
let iso = 800;
let use_diffuser = false; // if true, the guide number is reduced by 1 stop

let current_distance_setting = 0;
let current_power_setting = 0;
let isPointerDown = false;

let is_under_exposed = false;
let is_over_exposed = false;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    noStroke();
    fill(255);
}

function compute_aperture(power, distance) {

    let diffuser_mult = use_diffuser ? 0.5 : 1.0; // Diffuser reduces the guide number by 1 stop

    // for every doubling of iso, guide number increases by 1 stop
    // so iso 200 mult GN by 1.4142
    let iso_mult = Math.sqrt(iso / 100); // ISO 100 is the base

    return (guide_number * iso_mult * diffuser_mult * power) / (distance);

}

function draw() {
    // Clear the canvas with a black background

    if (is_under_exposed) {
        background(50, 0, 0);
    } else {
        background(0);
    }

    // Draw distance slider
    if (is_under_exposed) {
        fill(150, 0, 0);
    } else {
        fill(88);
    }
    rectMode(CORNER);
    rect(0, map(current_distance_setting, 0, distance_settings.length - 1, height, 0), width, height);

    // Draw power slider

    // Display the current distance setting
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    textFont('DM Mono');
    text(distance_settings_labels[current_distance_setting], width / 2, height / 2 + 80);

    // Display ISO
    textSize(24);
    textAlign(LEFT, TOP);
    text("ISO: " + iso, 10, 10);

    // Display diffuser status
    text("Diffuser: " + (use_diffuser ? "ON" : "OFF"), 10, 40);
    text("Guide Number: " + (use_diffuser ? guide_number / 2 : guide_number), 10, 70);

    // Display the current power setting
    // Draw dots for power settings
    let start = 0.4 * width; // Start margin
    let end = width - start; // End margin
    let dot_size = 12;
    let dot_off_color = color(50, 50, 50);
    let dot_on_color = color(0, 255, 0);
    for (let i = 0; i < power_settings.length; i++) {
        let x = map(i, 0, power_settings.length - 1, start, end);

        if (i === current_power_setting) {
            fill(dot_on_color); // Color for the selected power setting
        } else {
            fill(dot_off_color); // Color for the unselected power settings
        }
        ellipse(x, height / 4, dot_size, dot_size); // Draw a dot for each power setting
    }
    fill(255);
    text(power_settings_labels[current_power_setting], width / 2, height / 4 + 40);

    // display the aperture
    // let calculated_aperture = power_settings[current_power_setting] * guide_number / distance_settings[current_distance_setting];
    let calculated_aperture = compute_aperture(power_settings[current_power_setting], distance_settings[current_distance_setting]);
    is_under_exposed = false;
    is_over_exposed = false;
    let aperture = aperture_steps[0];

    if (calculated_aperture < aperture_steps[0]) {
        is_under_exposed = true;
        aperture = aperture_steps[0];
    } else if (calculated_aperture > aperture_steps[aperture_steps.length - 1]) {
        is_over_exposed = true;
        aperture = aperture_steps[aperture_steps.length - 1];
    } else {
        for (let i = 0; i < aperture_steps.length; i++) {
            if (aperture_steps[i] <= calculated_aperture) {
                aperture = aperture_steps[i];
            }
        }
    }

    textSize(64);

    textAlign(CENTER, CENTER);
    text("f/" + aperture.toFixed(1), width / 2, height / 2 - 40);
}

function mouseDragged() {
    if (isPointerDown) {

        let margin = 0.1 * max(width, height); // Margin for the sliders

        current_distance_setting = int(map(mouseY, height - margin, margin, 0, distance_settings.length - 1));
        current_distance_setting = constrain(current_distance_setting, 0, distance_settings.length - 1);
        current_power_setting = int(map(mouseX, margin, width - margin, 0, power_settings.length - 1));
        current_power_setting = constrain(current_power_setting, 0, power_settings.length - 1);
    }
}

function mousePressed() {
    isPointerDown = true;
}

function mouseReleased() {
    isPointerDown = false;
}