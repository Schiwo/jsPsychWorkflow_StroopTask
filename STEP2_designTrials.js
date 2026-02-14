// ============================================================================
// TRIAL CONSTRUCTION FOR STROOP TASK
// ============================================================================

const stroop_colors = ["blue", "green", "yellow", "red"]
const stroop_words = ["BLUE", "GREEN", "YELLOW", "RED"]
const keys = ["a", "s", "d", "f"];

function pickIncongruentWord(colorIndex) {
    const available = stroop_words.filter((_, i) => i !== colorIndex);
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
	const congruency = trial[0];
	const colorIndex = trial[1];

	if (trialPart === "fixationCross") {
		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: "<div style='font-size:48px;'>+</div>",
			choices: "NO_KEYS",
			trial_duration: 500,
            data:{}
		};
	}

	if (trialPart === "stimulusDisplay") {
              
        const color = stroop_colors[colorIndex]; 
        const word = congruency === 0 ? stroop_words[colorIndex] : pickIncongruentWord(colorIndex);

		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: `<p style="font-size:48px; color:${color};">${word}</p>`,
			choices: ["a", "s", "d", "f"],
			trial_duration: 1000,
			data: {
				congruency: congruency,
				ink_color: color,
				word: word,
				correct_key: keys[colorIndex],
			},
			on_finish: (data) => {
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
		return {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: () => {
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

	throw new Error(`Unknown trial part: ${trialPart}`);
}
