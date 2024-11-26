import { test, expect } from 'vitest';

import { getStatsFromActions } from '../../utils/stats';

test('counts total shots correctly', () => {
    const actions = [
        { team: 'team', shot_type: 'on-target', xG: 0.5 },
        { team: 'opponent', shot_type: 'blocked', xG: 0.2 }
    ];
 
    const result = getStatsFromActions(actions);
    expect(result[0]["Your Team"]).toBe(1);
    expect(result[0]["Opponent"]).toBe(1);
 });
