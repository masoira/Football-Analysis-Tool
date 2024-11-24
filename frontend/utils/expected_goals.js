export function calculateXG(action) {
    const pitch = document.getElementById('football-pitch');

    // NOTE: Width of the pitch object is used as a length and vice versa. pitchLength refers to the real lenght of the pitch.
    const pitchLengthPx = pitch.offsetWidth;  // Full pitch length in pixels (e.g., 800px)
    const pitchWidthPx = pitch.offsetHeight;  // Full pitch width in pixels (e.g., 500px)

    // COORDINATE CONVERSION:
    // Convert pixel coordinates to real-world meters
    const pitchX = action.x * 105 / pitchLengthPx;       // Length in meters (goal to goal)
    const pitchY = action.y * 68 / pitchWidthPx;         // Width in meters (sideline to sideline)

    console.log('Converted to meters:', pitchX, pitchY);

    // Goal coordinates centered on the right end
    const goalCenterX = 105; // Goal is at the right end (length in meters)
    const goalCenterY = 68 / 2; // Center of the goal (width in meters)

    const goalWidth = 8.05 // Original reference's scaled goal width in meters

    const halfGoalWidth = goalWidth / 2;

    // Goalpost positions
    const leftPostXY = [goalCenterX, goalCenterY - halfGoalWidth];
    const rightPostXY = [goalCenterX, goalCenterY + halfGoalWidth];
    const centreGoalXY = [goalCenterX, goalCenterY];

    // Calculate distances to each goal post
    const distNearPost = Math.sqrt(
        Math.pow(pitchX - leftPostXY[0], 2) + Math.pow(pitchY - leftPostXY[1], 2)
    );
    const distFarPost = Math.sqrt(
        Math.pow(pitchX - rightPostXY[0], 2) + Math.pow(pitchY - rightPostXY[1], 2)
    );

    // Calculate angle between posts using cosine rule
    const goalAngle = Math.acos(
        (Math.pow(distNearPost, 2) + Math.pow(distFarPost, 2) - Math.pow(goalWidth, 2)) /
        (2 * distNearPost * distFarPost)
    );

    // Calculate distance to the center of the goal
    const goalDistance = Math.sqrt(
        Math.pow(centreGoalXY[0] - pitchX, 2) + Math.pow(centreGoalXY[1] - pitchY, 2)
    );

    const isHeader = action.header || false;

    console.log('Distances to posts:', distNearPost, distFarPost);
    console.log('Angle and distance:', goalAngle, goalDistance);

    // Calculate xG using logistic regression
    const xG = -1.745598 +
               1.338737 * goalAngle -
               0.110384 * goalDistance +
               0.646730 * isHeader +
               0.168798 * goalAngle * goalDistance -
               0.424885 * goalAngle * isHeader -
               0.134178 * goalDistance * isHeader -
               0.055093 * goalAngle * goalDistance * isHeader;

    const result = 1 / (1 + Math.exp(-xG));
    console.log('Final xG:', result);

    return result;
}
