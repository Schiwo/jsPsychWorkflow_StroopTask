// ============================================================================
// TRIAL CONSTRUCTION FOR STROOP TASK
// ============================================================================

// ========== Define the basic materials used in the task ==========
// Word in colors (these strings can be interpreted as CSS color names)
const stroop_colors = ["blue", "green", "yellow", "red"]
// Words that appear on screen 
const stroop_words = ["BLUE", "GREEN", "YELLOW", "RED"]
// Keyboard keys used for responses (one key per color). The order corresponds to the ink color index
const keys = ["a", "s", "d", "f"];

// ========== Helper: pick a word that does NOT match the ink color ==========
// This is used for incongruent trials (mismatch between word and ink color)
function pickIncongruentWord(colorIndex) {
	// Keep all words except the one that matches the colorIndex
    const available = stroop_words.filter((_, i) => i !== colorIndex);
	// Randomly choose one from the remaining options
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}

/**
 * Construct a jsPsych trial element based on the trial part and trial definition.
 * @param {string} trialPart - "fixationCross" | "stimulusDisplay" | "feedbackScreen"
 * @param {Array} trial - [congruency, colorIndex]
 * @returns {Object} jsPsych trial object
 */
function constructTrial(trialPart, trial) {
	// Break the trial definition into readable pieces
	const congruency = trial[0];
	const colorIndex = trial[1];

	// If else statements for each trial part to construct the appropriate jsPsych trial element.
	if (trialPart === "fixationCross") {
		// -------- Fixation cross: a brief "+" shown centrally before the stimulus --------
		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: "<div style='font-size:48px;'>+</div>",
			choices: "NO_KEYS",
			trial_duration: 500,
            data:{}
		};
	}

	if (trialPart === "stimulusDisplay") {
		// -------- Main stimulus: colored word the participant responds to --------
              
        // Get the ink color for this trial
        const color = stroop_colors[colorIndex]; 
        // If congruent (0), word matches the color; otherwise pick a mismatch
        const word = congruency === 0 ? stroop_words[colorIndex] : pickIncongruentWord(colorIndex);

		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: `<p style="font-size:48px; color:${color};">${word}</p>`,
			choices: ["a", "s", "d", "f"],
			trial_duration: 1000,
			data: {
				// Save useful details for later analysis
				congruency: congruency,
				ink_color: color,
				word: word,
				correct_key: keys[colorIndex],
			},
			on_finish: (data) => {
				// Evaluate the accuracy for this trial: correct, incorrect, or too slow
				const response = data.response ? data.response.toLowerCase() : null;
				if (!response) {
					data.accuracy = "too_slow";
					data.correct = false;
				} else if (response === keys[colorIndex]) {
					data.accuracy = "correct";
					data.correct = true;
				} else {
					data.accuracy = "incorrect";
					data.correct = false;
				}
			},
		};
	}

	if (trialPart === "feedbackScreen") {
		// -------- Feedback screen: tell the participant if they responded correctly, incorrectly, or too slow --------
		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: () => {
				// Look at the last trial to decide which feedback to show
				const lastTrial = jsPsych.data.get().last(1).values()[0];
				const accuracy = lastTrial && lastTrial.accuracy ? lastTrial.accuracy : "too_slow";
				if (accuracy === "correct") {
					return "<p style='color:green;'>Correct</p>";
				}
				if (accuracy === "incorrect") {
					return "<p style='color:red;'>Incorrect</p>";
				}
				return "<p style='color:gray;'>Too slow</p>";
			},
			choices: "NO_KEYS",
			trial_duration: 500,
            data:{}
		};
	}

	// If we reach here, the trialPart was not recognized
	throw new Error(`Unknown trial part: ${trialPart}`);
}
