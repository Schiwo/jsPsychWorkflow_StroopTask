// ============================================================================
// SIMPLIFIED COUNTERBALANCING FOR STROOP TASK
// ============================================================================
/**
 * Generate a counterbalanced trial list for the Stroop task
 * This function creates a sequence of trials where:
 * - Each combination of congruency (2 levels) and color (4 levels) appears exactly 3 times
 * - The color must be different from the previous trial (no immediate repetitions).
 * - The sequence is randomized while respecting this constraint.
 * - The algorithm picks the conditions from a uniform distribution over non-zero conditions.
 * 
 * @returns {Array} Array of trials, each trial is [congruency, color]
 *                  congruency: 0 = congruent, 1 = incongruent
 *                  color: 0-3 representing different ink colors (e.g., blue, green, yellow, red)
 */
function generateTrialList() {
  // Define the experimental design factors
  const factors = [2, 4];  // 2 congruency levels (congruent/incongruent), 4 color levels
  
  // ========== Initialize the condition frequency (cf) matrix of available trials ==========
  // The cfmatrix is a 2D array/matrix [congruency][color] tracking how many times each trial combination is still available
  const cfmatrix = [
    [3, 3, 3, 3],  // Congruent trials (congruency = 0) for each color
    [3, 3, 3, 3]   // Incongruent trials (congruency = 1) for each color
  ];
  // After initialization, each cell value is: 3 
  // Consequently, each factor combination appears 3 times (total: 2 × 4 × 3 = 24 trials)

  // ========== Pick a random first trial (seed) ==========
  // We need to start somewhere, so randomly pick any combination
  const seed = [
    Math.floor(Math.random() * 2),  // Random congruency (0 or 1)
    Math.floor(Math.random() * 4)   // Random color (0, 1, 2, or 3)
  ];
  
  // Initialize trial list with the seed trial and decrement its count in the cfmatrix
  const trialList = [seed];
  cfmatrix[seed[0]][seed[1]]--;

  // ========== Build the rest of the trial list ==========
  let restartCount = 0;  // Track how many times we've had to restart (for safety)
  
  // Continue until all trials from the cfmatrix have been used
  // Check if any combination still has remaining uses by summing all cfmatrix values
  while (cfmatrix.flat().reduce((sum, count) => sum + count, 0) > 0) {
    
    // Get the previous trial to enforce transition rules
    const prevTrial = trialList[trialList.length - 1];
    
    // -------- Impose transition constraints --------
    
    // Rule for congruency (factor 0): No constraint, any value (0 or 1) is valid
    const validCongruencies = [0, 1];
    
    // Rule for color (factor 1): Must be DIFFERENT from the previous trial's color
    // Filter out the previous color to prevent immediate repetition
    const validColors = [0, 1, 2, 3].filter(color => color !== prevTrial[1]);
    
    // -------- Find all valid trial combinations that are still available --------
    const validTrials = [];
    for (const c of validCongruencies) {          // Check each congruency level
      for (const color of validColors) {          // Check each valid color
        if (cfmatrix[c][color] > 0) {                 // Only include if still available in cfmatrix
          validTrials.push([c, color]);
        }
      }
    }
    
    // -------- Select and add a valid trial, or restart if stuck --------
    if (validTrials.length > 0) {
      // We found at least one valid option
      // Randomly select one of the valid trials (uniform selection)
      const selected = validTrials[Math.floor(Math.random() * validTrials.length)];
      
      // Add the selected trial to our list
      trialList.push(selected);
      // Decrement the count for this combination in the cfmatrix
      cfmatrix[selected[0]][selected[1]]--;
      
    } else {
      // No valid trials found - we're stuck!
      // This can happen when the randomization leads to a dead end
      // Solution: Start over with a new random seed
      
      // Safety check: Don't restart infinitely
      if (restartCount > 20) {
        throw new Error("Cannot find valid trial sequence after 20 restarts");
      }
      
      // -------- Reset everything and try again --------
      
      // Refill the cfmatrix to its initial state
      for (let c = 0; c < 2; c++) {
        for (let color = 0; color < 4; color++) {
          cfmatrix[c][color] = 3;
        }
      }
      
      // Pick a new random seed trial
      const newSeed = [
        Math.floor(Math.random() * 2),  // Random congruency (0 or 1)
        Math.floor(Math.random() * 4)   // Random color (0, 1, 2, or 3)
      ];
      
      // Clear the trial list and start fresh with the new seed
      trialList.length = 1;
      trialList[0] = newSeed;
      cfmatrix[newSeed[0]][newSeed[1]]--;
      
      // Increment restart counter
      restartCount++;
    }
  }

  // Return the completed, counterbalanced trial list
  return trialList;
}

// ============================================================================
// ALTERNATIVE: COUNTERBALANCING WITH jsPsych's NATIVE FUNCTIONALITY
// ============================================================================
// HOW TO USE:
//   1. Remove the leading "// " of every line of the code below.
//   2. Add comments "//" or delete the custom generateTrialList() above (same name!).
// Input/output behavior is the same: returns an array of [congruency, color]
// pairs (24 trials, each combination 3 times, no color repeated on
// consecutive trials). Suitable for short lists and simple constraints; the
// shuffle-and-check approach becomes infeasible for long lists (e.g., 96 trials
// need ~2.6e9 shuffles on average). Use the custom algorithm above then.
//
// function generateTrialList(jsPsych) {
//   const maxAttempts = 100000;
//
//   // Factorial design: congruency (0 = congruent, 1 = incongruent) x
//   // ink color (0 = blue, 1 = green, 2 = yellow, 3 = red), 3 repetitions each
//   const factors = {
//     congruency: [0, 1],
//     inkColor: [0, 1, 2, 3]
//   };
//   const repetitions = 3;
//   const conditions = jsPsych.randomization.factorial(factors, repetitions);
//
//   // Unequal frequencies (optional): e.g., incongruent 3x as often as congruent
//   //   const base = jsPsych.randomization.factorial(factors, 1);
//   //   const reps = base.map(c => (c.congruency === 0 ? 3 : 1));
//   //   const conditions = jsPsych.randomization.repeat(base, reps);
//
//   // Shuffle until no ink color appears on consecutive trials
//   for (let attempt = 0; attempt < maxAttempts; attempt++) {
//     const candidate = jsPsych.randomization.shuffle(conditions);
//
//     let valid = true;
//     for (let index = 1; index < candidate.length; index++) {
//       if (candidate[index].inkColor === candidate[index - 1].inkColor) {
//         valid = false;
//         break;
//       }
//     }
//
//     if (valid) {
//       // Convert to the [congruency, color] format of the custom version
//       return candidate.map(trial => [trial.congruency, trial.inkColor]);
//     }
//   }
//   throw new Error("No valid sequence found within the maximum number of attempts.");
// }
