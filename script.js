
"use strict";

// Five blocks, two trials each.
// Targets use images; attributes use text.
const blocks = [

  {
    title: "Congruent train-1",
    left: ["Pleasant"],
    right: ["Unpleasant"],
    trials: [
      { type: "word", value: "Joy", category: "Pleasant" },
      { type: "word", value: "Nasty", category: "Unpleasant" },
	  { type: "word", value: "Pleasure", category: "Pleasant" },
      { type: "word", value: "Agony", category: "Unpleasant" }
    ]
  },
  {
    title: "Congruent train-2",
    left: ["White"],
    right: ["Black"],
    trials: [
      { type: "image", value: "images/black_1.jpg", category: "Black" },
	  { type: "image", value: "images/white_1.jpg", category: "White" },
	  { type: "image", value: "images/black_2.jpg", category: "Black" },
      { type: "image", value: "images/white_2.jpg", category: "White" }
    ]
  },
  {
    title: "Congruent test",
    left: ["White", "Pleasant"],
    right: ["Black", "Unpleasant"],
    condition: "compatible",
    trials: [
	  { type: "word", value: "Agony", category: "Unpleasant" },
	  { type: "image", value: "images/white_1.jpg", category: "White" },
	  { type: "word", value: "Pleasure", category: "Pleasant" },
	  { type: "image", value: "images/black_2.jpg", category: "Black" },
    ]
  },
  {
    title: "InCongruent train",
    left: ["Black"],
    right: ["White"],
    trials: [
      { type: "image", value: "images/black_1.jpg", category: "Black" },
	  { type: "image", value: "images/white_1.jpg", category: "White" },
	  { type: "image", value: "images/black_2.jpg", category: "Black" },
      { type: "image", value: "images/white_2.jpg", category: "White" }
    ]
  },
  {
    title: "InCongruent test",
    left: ["Black", "Pleasant"],
    right: ["White", "Unpleasant"],
    condition: "incompatible",
    trials: [
	  { type: "word", value: "Nasty", category: "Unpleasant" },
	  { type: "image", value: "images/white_2.jpg", category: "White" },
	  { type: "image", value: "images/black_1.jpg", category: "Black" },
	  { type: "word", value: "Joy", category: "Pleasant" }
    ]
  }
];

const $ = id => document.getElementById(id);

const screens = [
  "welcome-screen",
  "instructions-screen",
  "test-screen",
  "completion-screen"
];

let blockIndex = 0;
let trialIndex = 0;
let startedAt = 0;
let hadError = false;
let awaitingResponse = false;
let results = [];

// Show only the requested screen.
function showScreen(id) {
  for (const screen of screens) {
    $(screen).hidden = screen !== id;
  }
}

// Display instructions before each block.
function showBlockInstructions() {
  awaitingResponse = false;
  const block = blocks[blockIndex];
  $("instructions-progress").textContent =`Block ${blockIndex + 1} of ${blocks.length}`;
  $("instructions-title").textContent = block.title;
  $("instructions-text").textContent = "Tap the correct category for each image or word.";
  showScreen("instructions-screen");
}

// Present one stimulus.
function presentTrial() {
  awaitingResponse = false;

  const block = blocks[blockIndex];
  const trial = block.trials[trialIndex];

  $("block-info").textContent = `Block ${blockIndex + 1} of ${blocks.length}`;
  $("trial-info").textContent = `Trial ${trialIndex + 1} of ${block.trials.length}`;
  $("left-button").textContent = block.left.join(" / ");
  $("right-button").textContent = block.right.join(" / ");
  $("feedback").textContent = "";

  const img = $("stimulus-image");
  const word = $("stimulus-word");

    img.onload = null;
    img.onerror = null;

    img.hidden = true;
    word.hidden = true;

    hadError = false;

    if (trial.type === "image") {
        img.alt = `${trial.category} picture`;
        img.onload = () => {
            img.onload = null;
            img.hidden = false;
            startedAt = performance.now();
            awaitingResponse = true;
        };
        img.onerror = () => {
            $("feedback").textContent =
                "Image missing. Check images folder.";
        };
        img.src = trial.value;

    } else {
        img.removeAttribute("src");
        word.textContent = trial.value;
        word.hidden = false;
    }
  showScreen("test-screen");

    // Start timing word trials immediately
    if (trial.type === "word") {
        startedAt = performance.now();
        awaitingResponse = true;
    }
}


function handleResponse(key) {
    if (!awaitingResponse) return;

    if (key !== "e" && key !== "i") return;

    const block = blocks[blockIndex];
    const trial = block.trials[trialIndex];

    const correctKey =
        block.left.includes(trial.category) ? "e" : "i";

    if (key !== correctKey) {
        hadError = true;

        $("feedback").textContent =
            "✕ Incorrect — try the other button";

        return;
    }

    const rt = performance.now() - startedAt;

    awaitingResponse = false;

    results.push({
        block: blockIndex + 1,
        condition: block.condition || "practice",
        stimulus: trial.value,
        category: trial.category,
        reactionTime: rt,
        hadError
    });

    trialIndex++;

    if (trialIndex < block.trials.length) {
        presentTrial();
    } else {
        blockIndex++;
        trialIndex = 0;

        if (blockIndex < blocks.length) {
            showBlockInstructions();
        } else {
            showResults();
        }
    }
}


// // Handle E and I keyboard responses.
// function handleResponse(event) {
//   if (!awaitingResponse || event.repeat) return;

//   const key = event.key.toLowerCase();

//   if (key !== "e" && key !== "i") return;

//   event.preventDefault();

//   const block = blocks[blockIndex];
//   const trial = block.trials[trialIndex];

//   const correctKey =
//     block.left.includes(trial.category) ? "e" : "i";

//   if (key !== correctKey) {
//     hadError = true;

//     $("feedback").textContent =
//       "✕ Incorrect — press the other key";

//     return;
//   }

//   // Reaction time includes correction time.
//   const rt = performance.now() - startedAt;

//   awaitingResponse = false;

//   results.push({
//     block: blockIndex + 1,
//     condition: block.condition || "practice",
//     stimulus: trial.value,
//     category: trial.category,
//     reactionTime: rt,
//     hadError
//   });

//   trialIndex++;

//   if (trialIndex < block.trials.length) {
//     presentTrial();
//   } else {
//     blockIndex++;
//     trialIndex = 0;

//     if (blockIndex < blocks.length) {
//       showBlockInstructions();
//     } else {
//       showResults();
//     }
//   }
// }

// Calculate mean.
function mean(values) {
  return values.reduce((sum, value) => sum + value, 0)
    / values.length;
}

// Calculate sample standard deviation.
function sampleStandardDeviation(values) {
  if (values.length < 2) return NaN;

  const avg = mean(values);

  const variance = values.reduce(
    (sum, value) => sum + (value - avg) ** 2,
    0
  ) / (values.length - 1);

  return Math.sqrt(variance);
}

// Calculate and display the final D-score.
function showResults() {
  const compatible = results
    .filter(r => r.condition === "compatible")
    .map(r => r.reactionTime);

  const incompatible = results
    .filter(r => r.condition === "incompatible")
    .map(r => r.reactionTime);

  const sd = sampleStandardDeviation([
    ...compatible,
    ...incompatible
  ]);

  const score =
    (mean(incompatible) - mean(compatible)) / sd;

  if (Number.isFinite(score)) {
    $("d-score").textContent =
      `${score >= 0 ? "+" : ""}${score.toFixed(2)}`;

    $("score-interpretation").textContent =
      score > 0
        ? "Faster on White + Pleasant over Black + Unpleasant trials."
        : score < 0
          ? "Faster on Black + Pleasant over White + Unpleasant trials."
          : "Same average response time in both combined conditions.";
  } else {
    $("d-score").textContent = "N/A";

    $("score-interpretation").textContent =
      "The reaction times have insufficient variation for a score.";
  }

  const errors = results.filter(r => r.hadError).length;

  $("score-details").textContent =
    `${errors} corrected error(s) in ${results.length} trials. ` +
    "Correction time is included. " +
    "This is only a software demonstration, not a validated IAT result.";

  showScreen("completion-screen");
}

// Reset the test.
function startTest() {
  blockIndex = 0;
  trialIndex = 0;
  results = [];
  awaitingResponse = false;

  showBlockInstructions();
}

// Event listeners.
$("start-button").addEventListener("click", startTest);

$("continue-button").addEventListener(
  "click",
  presentTrial
);

$("restart-button").addEventListener(
  "click",
  startTest
);


// Physical keyboard support
document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    const key = event.key.toLowerCase();

    if (key === "e" || key === "i") {
        event.preventDefault();
        handleResponse(key);
    }
});

// iPad / touchscreen support
$("left-button").addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    event.preventDefault();
    handleResponse("e");
});

$("right-button").addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    event.preventDefault();
    handleResponse("i");
});

