/**
 * Build the complete experiment timeline for jsPsych
 * 
 * This function constructs the sequence of experimental trials and blocks
 * that will be presented to the participant. It is called from main.html
 * and should return an array of jsPsych trial objects.
 * 
 * @returns {Array} The complete experiment timeline (array of jsPsych elements)
 */
function timelineBuilder(timeline) {
    // ========== b.	Generate the trial list.  ==========
    // To generate the counterbalanced trial list, call the generateTrialList() function from STEP1_counterbalancing.js
    // This will give us an array of [congruency, color] pairs that follow our rules for conditions and constraints on factor transitions.
    const trialList = generateTrialList();
    
    // ========== c.	Add initial functional elements.  ==========
    // First we need to build the functional elements of the experiment.
    // To do this, call the buildFunctionalElements() function from STEP3_functionalElements.js
    // This will give us an object containing all the functional elements we defined in that file.
    const functionalElements = buildFunctionalElements();

    // Now we can add the initial functional elements to the timeline. For example, we can start with a welcome message, the informed consent form, and instructions.
    timeline.push(functionalElements.welcome);
    timeline.push(functionalElements.informedConsent);
    timeline.push(functionalElements.instructions);


    // ========== d.	Construct and append experimental trials.  ==========
    // First we need to decide the structure of our experimental trials. For example, a fixation cross followed by a stimulus display, followed by a feedback screen.
    const trialStructure = ["fixationCross", "stimulusDisplay", "feedbackScreen"]; 
    // Next, we will iterate over the trialList and for each trial, we will create the corresponding jsPsych trial objects based on the trial structure and the conditions specified in the trialList.
    for (let t = 0; t < trialList.length; t++) {
        const trial = trialList[t];
        for (const trialPart of trialStructure) {
            part = constructTrial(trialPart, trial);
            console.log(part);
            
            part.data.trial_number = t + 1; // Add trial number to the data for each trial part
            timeline.push(part);
        }
    }

    // ========== e.	Add final functional elements.  ==========
    timeline.push(functionalElements.dataDisplay);
    timeline.push(functionalElements.endScreen);
    
    //return the complete timeline to be started in main.html
    return timeline;
}
