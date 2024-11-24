export function getStatsFromActions(actions) {
    const teamStats = {
        totalShots: 0,
        onTarget: 0,
        blocked: 0,
        offTarget: 0,
        assists: 0,
        dribbles: 0,
        xG: 0
    };
    
    const opponentStats = {
        totalShots: 0,
        onTarget: 0,
        blocked: 0,
        offTarget: 0,
        assists: 0,
        dribbles: 0,
        xG: 0
    };

    actions.forEach(action => {
        const stats = action.team === 'team' ? teamStats : opponentStats;
        
        stats.totalShots++;
        
        if(action.shot_type === 'on-target') stats.onTarget++;
        if(action.shot_type === 'blocked') stats.blocked++;
        if(action.shot_type === 'off-target') stats.offTarget++;
        
        if(action.xG) stats.xG += action.xG;
        
        if(action.assist) {
            if(action.assist.type === 'assist') stats.assists++;
            if(action.assist.type === 'dribble') stats.dribbles++;
        }
    });

    return [
        {"Statistic": "Total Shots", "Your Team": teamStats.totalShots, "Opponent": opponentStats.totalShots},
        {"Statistic": "On Target", "Your Team": teamStats.onTarget, "Opponent": opponentStats.onTarget},
        {"Statistic": "Blocked", "Your Team": teamStats.blocked, "Opponent": opponentStats.blocked},
        {"Statistic": "Off Target", "Your Team": teamStats.offTarget, "Opponent": opponentStats.offTarget},
        {"Statistic": "Assists", "Your Team": teamStats.assists, "Opponent": opponentStats.assists},
        {"Statistic": "Dribbles", "Your Team": teamStats.dribbles, "Opponent": opponentStats.dribbles},
        {"Statistic": "Expected Goals", "Your Team": teamStats.xG.toFixed(2), "Opponent": opponentStats.xG.toFixed(2)}
    ];
}
