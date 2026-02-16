// ============================================================================
// FUNCTIONAL ELEMENTS FOR STROOP TASK
// ============================================================================

/**
 * Build the "non-trial" parts of the experiment (welcome, consent, instructions, etc.).
 *
 * @returns {Object} Collection of jsPsych timeline elements
 */
function buildFunctionalElements() {
	// ========== Welcome screen ==========
	const welcome = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: "<p>Welcome to the study.</p><p>Press any key to continue.</p>",
	};

	// ========== Consent screen ==========
	// If the participant declines, the experiment ends immediately.
	const informedConsent = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus:
			"<p>Please read the informed consent information below.</p>" +

            "<p>ADD YOUR CONSENT FORM HERE</p>" +

			"<p>Press 'y' to consent or 'n' to decline.</p>",
		choices: ["y", "n"],
		on_finish: (data) => {
			// If the user presses "n", stop the study
			if (data.response === "n") {
				jsPsych.abortExperiment("Participant did not consent.");
			}
		},
	};

	// ========== Instructions ==========
	// Multiple pages that explain the task and response keys.
	const instructions = {
		type: jsPsychInstructions,
		pages: [
			"<p>These are the instructions. You can go forward with 'F' and backwards with 'A'.</p>",
			"<p style='font-size:18px; margin-bottom:10px;'>Please read carefully before you begin.</p>" +
			"<p>In this task, you will see words displayed in different colors in the center of the screen.</p>" +
			"<p>Your task is to <strong>identify the color of the text</strong>, not the meaning of the word.</p>" +
			"<p style='color:#444;'>Example: If the word <em>BLUE</em> is displayed in green ink, the correct answer is <strong>green</strong>.</p>" +
			"<p>Please respond as quickly and as accurately as possible using the following keys:</p>" +
			"<p style='font-size:18px;'>" +
			"<strong>A</strong> = <span style='color:blue;'>&#9632;</span> &nbsp;&nbsp;&nbsp;" +
			"<strong>S</strong> = <span style='color:green;'>&#9632;</span> &nbsp;&nbsp;&nbsp;" +
			"<strong>D</strong> = <span style='color:gold;'>&#9632;</span> &nbsp;&nbsp;&nbsp;" +
			"<strong>F</strong> = <span style='color:red;'>&#9632;</span> &nbsp;&nbsp;&nbsp;" +
			"</p>" +
			"<p>Place your left hand on the keys <strong>A</strong> and <strong>S</strong>, and your right hand on <strong>D</strong> and <strong>F</strong>.</p>" +
			"<p>Each trial begins with a fixation cross. Then a colored word will appear. Press the corresponding key for the <strong>ink color</strong> of the word.</p>" +
			"<p>Some trials may be easy, and some may feel more difficult. Always focus on responding to the <strong>color of the text</strong>, ignoring what the word says.</p>",
			"<p>The experiment will start if you press F again.</p>",
		],
		key_forward: "f",
		key_backward: "a",
		allow_backward: true,
	};

	// ========== Data display (demo only) ==========
	// Shows collected data on-screen as CSV. In real studies, send to a server.
	const dataDisplay = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: () => {
			// Pull only the keyboard-response trials and convert to CSV
			const summary = jsPsych.data.get().filter({ trial_type: "html-keyboard-response" });
			return (
				"<p>At this point you would send the collected data to the server.</p>" +
				"<p>This is the collected data in CSV format:</p>" +
				`<textarea rows="50" cols="100" readonly>${summary.csv()}</textarea>`
			);
		},
		choices: [" "],
		prompt: "<p>Press space to finish.</p>",
	};

	// ========== End screen ==========
	const endScreen = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: "<p>Thank you for participating.</p><p>You may now close this window.</p>",
		choices: "NO_KEYS"
	};

	// Return all elements so they can be added to the timeline in STEP4
	return {
		welcome,
		informedConsent,
		instructions,
		dataDisplay,
		endScreen,
	};
}
