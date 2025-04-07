import { calculateXG } from './expectedGoals.js';

/**
 * Transforms a match object from the backend format to the frontend format.
 * 
 * This function:
 * 1. Extracts actions from the match's periods (defaulting to "Full Match" period)
 * 2. Transforms each action to match the frontend's expected format
 * 3. Calculates xG for each shot
 * 
 * @param {Object} match - The match object from the backend
 * @returns {Array} - Array of transformed actions ready for frontend use
 */
export const transformMatchActions = (match) => {
  if (!match) return [];
  
  // Find the "Full Match" period or use the first period as fallback
  // This is based on the requirement to default to full match period
  const fullMatchPeriod = match.periods.find(p => p.type === "Full Match") || match.periods[0];
  
  // Transform each action to match frontend component expectations
  return (fullMatchPeriod?.actions || []).map(action => ({
    type: action.type,
    x: action.x,
    y: action.y,
    shotType: action.shot_type,    // Convert from snake_case to camelCase
    header: action.is_header,      // Convert from snake_case to camelCase
    team: action.team,
    assist: action.assist,
    xG: calculateXG({              // Calculate expected goals for each shot
      type: action.type,
      header: action.is_header,
      x: action.x,
      y: action.y,
      shotType: action.shot_type,
      team: action.team
    })
  }));
}; 