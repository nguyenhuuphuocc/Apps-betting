const DATA = {
  asOf: "May 5, 2026, 12:00 PM CT",
  slateDate: "2026-05-05",
  defaultBankroll: 1000,
  teams: {
    CLE: {
      name: "Cleveland Cavaliers",
      abbr: "CLE",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
      record: "52-30",
      last10: "6-4",
      homeAway: "Road: 22-19 est.",
      offense: 119.21,
      defense: 115.49,
      net: 3.72,
      pace: 99.8,
      turnovers: 13.7,
      form: [8, -5, 11, 6, -4, 12, 7, -3, 9, 10],
      profile: "Top-10 offense, shot creation through Mitchell and Harden, weaker defensive baseline than Detroit."
    },
    DET: {
      name: "Detroit Pistons",
      abbr: "DET",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
      record: "60-22",
      last10: "7-3",
      homeAway: "Home: 32-9",
      offense: 117.7,
      defense: 110.1,
      net: 7.6,
      pace: 99.3,
      turnovers: 14.4,
      form: [14, 6, -3, 11, 8, -2, 10, -5, 22, 12],
      profile: "Elite defense, pressure plus rim size, stronger home profile and rebounding pressure."
    },
    LAL: {
      name: "Los Angeles Lakers",
      abbr: "LAL",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
      record: "53-29",
      last10: "6-4",
      homeAway: "Road: 24-17 est.",
      offense: 118.24,
      defense: 116.57,
      net: 1.66,
      pace: 99.0,
      turnovers: 14.1,
      form: [9, -11, 7, 4, -38, 6, -5, 10, 3, 11],
      profile: "High-end shot creation when healthy, but Luka Doncic absence lowers half-court ceiling."
    },
    OKC: {
      name: "Oklahoma City Thunder",
      abbr: "OKC",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
      record: "64-18",
      last10: "7-3",
      homeAway: "Home: 34-8",
      offense: 118.73,
      defense: 107.78,
      net: 10.94,
      pace: 99.3,
      turnovers: 12.4,
      form: [18, 9, 21, 14, 43, 8, -12, 15, 11, 7],
      profile: "Best net rating in the league, historically strong defense, deepest guard pressure."
    },
    PHI: {
      name: "Philadelphia 76ers",
      abbr: "PHI",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
      record: "Round 2",
      last10: "Market watch",
      homeAway: "Road Game 2",
      offense: 115.4,
      defense: 113.8,
      net: 1.6,
      pace: 98.5,
      turnovers: 13.9,
      form: [-6, 8, -9, 12, 7, -4, 11, 13, -3, 9],
      profile: "Future slate placeholder: update once Game 2 odds and injury reports are posted."
    },
    NYK: {
      name: "New York Knicks",
      abbr: "NYK",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
      record: "Round 2",
      last10: "Market watch",
      homeAway: "Home Game 2",
      offense: 116.8,
      defense: 112.7,
      net: 4.1,
      pace: 97.6,
      turnovers: 12.9,
      form: [9, 5, -7, 18, 11, -2, 29, 7, 10, -4],
      profile: "Home-court playoff profile with slower tempo; wait for posted series price before staking."
    },
    MIN: {
      name: "Minnesota Timberwolves",
      abbr: "MIN",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
      record: "Round 2",
      last10: "Market watch",
      homeAway: "Road Game 2",
      offense: 116.1,
      defense: 111.8,
      net: 4.3,
      pace: 98.2,
      turnovers: 13.4,
      form: [5, -8, 12, 3, 14, -6, 11, 8, -2, 10],
      profile: "Anthony Edwards injury/rest context needs confirmation before props or sides."
    },
    SAS: {
      name: "San Antonio Spurs",
      abbr: "SAS",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
      record: "Round 2",
      last10: "Market watch",
      homeAway: "Home Game 2",
      offense: 119.65,
      defense: 111.4,
      net: 8.24,
      pace: 100.1,
      turnovers: 13.0,
      form: [16, 8, -4, 21, 7, 12, -3, 15, 9, 11],
      profile: "Strong season-long net rating and Wembanyama rim protection; market pending."
    },
    ARS: {
      name: "Arsenal",
      abbr: "ARS",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
      record: "UCL semifinal",
      last10: "Strong home form",
      homeAway: "Home",
      offense: 2.0,
      defense: 0.8,
      net: 1.2,
      pace: 58,
      turnovers: 0,
      form: [1, 2, 0, 3, 1, -1, 2, 0, 3, 1],
      profile: "Home leg after 1-1 first leg; injuries and game-state pressure favor lower tempo."
    },
    ATM: {
      name: "Atletico Madrid",
      abbr: "ATM",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png",
      record: "UCL semifinal",
      last10: "Compact away setup",
      homeAway: "Away",
      offense: 1.6,
      defense: 1.0,
      net: 0.6,
      pace: 54,
      turnovers: 0,
      form: [0, 1, 1, -1, 2, 0, 1, 1, -2, 0],
      profile: "Simeone knockout setup; cards and low-event stretches are live."
    },
    BAY: {
      name: "Bayern Munich",
      abbr: "BAY",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
      record: "UCL semifinal",
      last10: "Chasing aggregate",
      homeAway: "Home",
      offense: 2.4,
      defense: 1.2,
      net: 1.2,
      pace: 63,
      turnovers: 0,
      form: [3, 2, -1, 4, 1, 0, 2, 3, -1, 0],
      profile: "Down 5-4 on aggregate; win probability higher than qualification probability."
    },
    PSG: {
      name: "Paris Saint-Germain",
      abbr: "PSG",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
      record: "UCL semifinal",
      last10: "Aggregate lead",
      homeAway: "Away",
      offense: 2.3,
      defense: 1.1,
      net: 1.2,
      pace: 62,
      turnovers: 0,
      form: [2, 1, 3, 0, 2, 4, 1, -1, 5, 0],
      profile: "First-leg 5-4 lead changes incentives; protect transition while still dangerous on counters."
    },
    LIV: {
      name: "Liverpool",
      abbr: "LIV",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
      record: "Premier League",
      last10: "Top-four race",
      homeAway: "Home",
      offense: 2.1,
      defense: 1.1,
      net: 1.0,
      pace: 61,
      turnovers: 0,
      form: [2, -1, 1, 3, 0, 2, -2, 1, 2, 0],
      profile: "Favored at Anfield, but Chelsea chance creation keeps draw risk meaningful."
    },
    CHE: {
      name: "Chelsea",
      abbr: "CHE",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
      record: "Premier League",
      last10: "European race",
      homeAway: "Away",
      offense: 1.7,
      defense: 1.3,
      net: 0.4,
      pace: 59,
      turnovers: 0,
      form: [1, 0, -1, 2, 1, -2, 0, 3, 1, -1],
      profile: "Underdog with transition threat; BTTS markets may be more useful than 1X2."
    },
    MCI: {
      name: "Manchester City",
      abbr: "MCI",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
      record: "Premier League",
      last10: "Fixture congestion",
      homeAway: "Home",
      offense: 2.2,
      defense: 1.0,
      net: 1.2,
      pace: 64,
      turnovers: 0,
      form: [2, 2, 1, 0, 3, -1, 2, 1, 0, 2],
      profile: "Multiple upcoming fixtures; lineup rotation makes early markets fragile."
    },
    BRE: {
      name: "Brentford",
      abbr: "BRE",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/337.png",
      record: "Premier League",
      last10: "Mid-table",
      homeAway: "Away",
      offense: 1.4,
      defense: 1.5,
      net: -0.1,
      pace: 57,
      turnovers: 0,
      form: [-1, 1, 0, -2, 2, 1, -1, 0, 1, -1],
      profile: "Dog profile; wait for team news."
    },
    NFO: {
      name: "Nottingham Forest",
      abbr: "NFO",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/393.png",
      record: "Premier League",
      last10: "Home dog",
      homeAway: "Home",
      offense: 1.2,
      defense: 1.6,
      net: -0.4,
      pace: 55,
      turnovers: 0,
      form: [-2, 0, 1, -1, -1, 2, 0, -2, 1, -1],
      profile: "Home underdog; price needed before any draw/no-bet decision."
    },
    NEW: {
      name: "Newcastle United",
      abbr: "NEW",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png",
      record: "Premier League",
      last10: "European race",
      homeAway: "Away",
      offense: 1.8,
      defense: 1.2,
      net: 0.6,
      pace: 60,
      turnovers: 0,
      form: [1, 2, -1, 1, 0, 2, -2, 1, 1, 0],
      profile: "Better side on paper, but away price matters."
    },
    WHU: {
      name: "West Ham United",
      abbr: "WHU",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/371.png",
      record: "Premier League",
      last10: "Home fixture",
      homeAway: "Home",
      offense: 1.3,
      defense: 1.6,
      net: -0.3,
      pace: 56,
      turnovers: 0,
      form: [-1, 0, -2, 1, 1, -1, 0, -1, 2, -2],
      profile: "Home underdog versus Arsenal; monitor Arsenal rest after UCL."
    },
    TOT: {
      name: "Tottenham Hotspur",
      abbr: "TOT",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png",
      record: "Premier League",
      last10: "Home favorite",
      homeAway: "Home",
      offense: 1.9,
      defense: 1.5,
      net: 0.4,
      pace: 65,
      turnovers: 0,
      form: [2, -1, 3, -2, 1, 0, 2, -1, 1, 2],
      profile: "High-event profile; totals depend heavily on team news."
    },
    LEE: {
      name: "Leeds United",
      abbr: "LEE",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/341.png",
      record: "Premier League",
      last10: "Away dog",
      homeAway: "Away",
      offense: 1.1,
      defense: 1.7,
      net: -0.6,
      pace: 58,
      turnovers: 0,
      form: [-2, -1, 0, 1, -1, -3, 2, 0, -1, -2],
      profile: "Avoid unless inflated dog or under price appears."
    },
    CRY: {
      name: "Crystal Palace",
      abbr: "CRY",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/384.png",
      record: "Premier League",
      last10: "Rescheduled fixture",
      homeAway: "Away",
      offense: 1.2,
      defense: 1.4,
      net: -0.2,
      pace: 56,
      turnovers: 0,
      form: [0, -1, 1, 0, -2, 1, 0, -1, 2, -1],
      profile: "Rescheduled Man City match; rotation uncertainty is the main risk."
    }
  },
  games: [
    {
      id: "cle-det",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-05",
      time: "7:00 PM ET",
      venue: "Little Caesars Arena",
      away: "CLE",
      home: "DET",
      currentOdds: {
        awayMl: 130,
        homeMl: -155,
        awaySpread: { line: 3.5, odds: -115 },
        homeSpread: { line: -3.5, odds: 100 },
        total: { line: 214.5, overOdds: -110, underOdds: -110 }
      },
      openingOdds: {
        awayMl: 130,
        homeMl: -155,
        awaySpread: { line: 3.5, odds: -115 },
        homeSpread: { line: -3.5, odds: 100 },
        total: { line: 213.5, overOdds: -110, underOdds: -110 }
      },
      model: {
        awayWin: 42,
        homeWin: 58,
        winner: "DET",
        score: "DET 108, CLE 104",
        range: "DET 106-112, CLE 101-108",
        spreadLean: "CLE +3.5 is fair, no real edge",
        totalLean: "Under 214.5",
        confidence: 5.9
      },
      situational: [
        "Both teams won Game 7 on May 3, so neither side owns a meaningful rest advantage.",
        "Detroit owns the stronger regular-season defensive profile and home split.",
        "Cleveland's shot creation keeps the underdog live, but the market already prices the tight spread."
      ],
      matchup: [
        "DET size and pressure vs CLE frontcourt rebounding",
        "CLE perimeter creation vs DET turnover pressure",
        "Game 1 tempo likely slower after both clubs played elimination games"
      ],
      bestBetId: "allen-u-reb"
    },
    {
      id: "lal-okc",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-05",
      time: "8:30 PM ET",
      venue: "Paycom Center",
      away: "LAL",
      home: "OKC",
      currentOdds: {
        awayMl: 750,
        homeMl: -1100,
        awaySpread: { line: 16, odds: -110 },
        homeSpread: { line: -16, odds: -110 },
        total: { line: 213.5, overOdds: -110, underOdds: -110 }
      },
      openingOdds: {
        awayMl: 660,
        homeMl: -952,
        awaySpread: { line: 14.5, odds: -105 },
        homeSpread: { line: -14.5, odds: -116 },
        total: { line: 213.5, overOdds: -116, underOdds: -111 }
      },
      model: {
        awayWin: 9,
        homeWin: 91,
        winner: "OKC",
        score: "OKC 113, LAL 96",
        range: "OKC 110-120, LAL 91-101",
        spreadLean: "OKC -16 is priced correctly after move",
        totalLean: "Under 213.5",
        confidence: 6.4
      },
      situational: [
        "Oklahoma City has a major rest and home-court edge entering Game 1.",
        "Luka Doncic is listed out, which removes the Lakers' highest-usage creator.",
        "Jalen Williams absence matters for OKC scoring depth, but the defensive floor remains elite."
      ],
      matchup: [
        "OKC ball pressure vs LAL turnover risk",
        "Thunder rim defense vs Lakers paint efficiency",
        "Lakers need LeBron/Reaves efficiency plus variance from three"
      ],
      bestBetId: "lal-okc-under"
    },
    {
      id: "phi-nyk-g2",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-06",
      time: "7:00 PM ET",
      venue: "Madison Square Garden",
      away: "PHI",
      home: "NYK",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 43,
        homeWin: 57,
        winner: "NYK",
        score: "NYK 109, PHI 104",
        range: "NYK 105-113, PHI 100-108",
        spreadLean: "Wait for Game 1 result and injury report",
        totalLean: "No bet until opener posts",
        confidence: 4.8
      },
      situational: [
        "Game 2 of the Knicks-76ers series is scheduled for Wednesday, May 6.",
        "Lineup and injury updates should drive pricing more than regular-season power ratings.",
        "No stake until books post a stable side, total, and player-prop board."
      ],
      matchup: [
        "NYK home-court edge",
        "PHI underdog variance",
        "Playoff tempo watch"
      ],
      bestBetId: null
    },
    {
      id: "min-sas-g2",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-06",
      time: "9:30 PM ET",
      venue: "AT&T Center",
      away: "MIN",
      home: "SAS",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 41,
        homeWin: 59,
        winner: "SAS",
        score: "SAS 112, MIN 106",
        range: "SAS 108-116, MIN 101-110",
        spreadLean: "Wait for Edwards status and Game 1 result",
        totalLean: "No bet until opener posts",
        confidence: 4.9
      },
      situational: [
        "Game 2 is scheduled in San Antonio on Wednesday, May 6.",
        "Minnesota's perimeter health is a major swing factor.",
        "San Antonio's rim protection profile makes Wolves props status-sensitive."
      ],
      matchup: [
        "Wembanyama rim deterrence",
        "MIN wing defense",
        "Injury-driven prop volatility"
      ],
      bestBetId: null
    },
    {
      id: "cle-det-g2",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-07",
      time: "7:00 PM ET",
      venue: "Little Caesars Arena",
      away: "CLE",
      home: "DET",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 43,
        homeWin: 57,
        winner: "DET",
        score: "DET 107, CLE 104",
        range: "DET 103-112, CLE 100-108",
        spreadLean: "Reprice after Game 1",
        totalLean: "Under remains watchlist if total reopens 214+",
        confidence: 4.7
      },
      situational: [
        "Game 2 returns to Detroit on Thursday, May 7.",
        "The best edge may shift after Game 1 reveals rotation and whistle patterns.",
        "Avoid doubling exposure to the same matchup before seeing Game 1 results."
      ],
      matchup: [
        "Series adjustment spot",
        "DET home court",
        "CLE guard creation"
      ],
      bestBetId: null
    },
    {
      id: "lal-okc-g2",
      sport: "NBA",
      league: "NBA Playoffs",
      date: "2026-05-07",
      time: "9:30 PM ET",
      venue: "Paycom Center",
      away: "LAL",
      home: "OKC",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 11,
        homeWin: 89,
        winner: "OKC",
        score: "OKC 112, LAL 98",
        range: "OKC 108-119, LAL 92-103",
        spreadLean: "Wait for Doncic status",
        totalLean: "Under watchlist if LAL remains short-handed",
        confidence: 5.0
      },
      situational: [
        "Game 2 is scheduled Thursday, May 7 in Oklahoma City.",
        "Doncic availability is the single biggest pricing variable.",
        "If the Game 1 spread cashes easily, expect tax on OKC in Game 2."
      ],
      matchup: [
        "LAL injury sensitivity",
        "OKC pressure defense",
        "Blowout-minute risk"
      ],
      bestBetId: null
    },
    {
      id: "ars-atm",
      sport: "Soccer",
      league: "UEFA Champions League",
      date: "2026-05-05",
      time: "3:00 PM ET",
      venue: "Emirates Stadium",
      away: "ATM",
      home: "ARS",
      currentOdds: {
        awayMl: 450,
        homeMl: -161,
        drawMl: 290,
        total: { line: 2.5, overOdds: -114, underOdds: -122 }
      },
      openingOdds: {
        awayMl: 425,
        homeMl: -160,
        drawMl: 295,
        total: { line: 2.5, overOdds: -110, underOdds: -118 }
      },
      model: {
        awayWin: 20,
        draw: 27,
        homeWin: 53,
        winner: "ARS",
        score: "ARS 1, ATM 0",
        range: "ARS 0-2, ATM 0-1",
        spreadLean: "Arsenal win is fair, not cheap",
        totalLean: "Under 2.5",
        confidence: 6.1
      },
      situational: [
        "Second leg starts level on aggregate after the 1-1 first leg.",
        "Arsenal injuries plus Atletico's compact away game point toward lower-event phases.",
        "Three-way home price is expensive, so total is cleaner than side."
      ],
      matchup: [
        "Atletico low block",
        "Arsenal set pieces",
        "Cards and stoppages"
      ],
      bestBetId: "ars-atm-under"
    },
    {
      id: "bay-psg",
      sport: "Soccer",
      league: "UEFA Champions League",
      date: "2026-05-06",
      time: "3:00 PM ET",
      venue: "Allianz Arena",
      away: "PSG",
      home: "BAY",
      currentOdds: {
        awayMl: 320,
        homeMl: -145,
        drawMl: 400,
        total: { line: 4.5, overOdds: 138, underOdds: -163 }
      },
      openingOdds: {
        awayMl: 295,
        homeMl: -150,
        drawMl: 395,
        total: { line: 4.5, overOdds: 132, underOdds: -155 }
      },
      model: {
        awayWin: 23,
        draw: 24,
        homeWin: 53,
        winner: "BAY",
        score: "BAY 2, PSG 1",
        range: "BAY 1-3, PSG 1-2",
        spreadLean: "Bayern to win in 90 is fair",
        totalLean: "Under 4.5",
        confidence: 6.0
      },
      situational: [
        "PSG carry a 5-4 aggregate lead into Munich.",
        "Bayern must chase the tie, but the market overreacted to the nine-goal first leg.",
        "Under 4.5 can still win with a 3-1 or 2-2 game script."
      ],
      matchup: [
        "Bayern home pressure",
        "PSG transition threat",
        "Aggregate state"
      ],
      bestBetId: "bay-psg-under45"
    },
    {
      id: "liv-che",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-09",
      time: "7:30 AM ET",
      venue: "Anfield",
      away: "CHE",
      home: "LIV",
      currentOdds: {
        awayMl: 270,
        homeMl: -112,
        drawMl: 300,
        total: { line: 3.5, overOdds: 120, underOdds: -140 }
      },
      openingOdds: {
        awayMl: 281,
        homeMl: -110,
        drawMl: 300,
        total: { line: 3.25, overOdds: -110, underOdds: -110 }
      },
      model: {
        awayWin: 25,
        draw: 26,
        homeWin: 49,
        winner: "LIV",
        score: "LIV 2, CHE 1",
        range: "LIV 1-3, CHE 0-2",
        spreadLean: "Liverpool ML is slightly expensive",
        totalLean: "Under 3.5",
        confidence: 5.8
      },
      situational: [
        "Saturday early kickoff lowers pace and may favor measured first-half game state.",
        "Liverpool are favored, but the draw is a real enough outcome to avoid 1X2 chalk.",
        "Under 3.5 has better protection than under 2.5 in a high-talent matchup."
      ],
      matchup: [
        "Liverpool pressure",
        "Chelsea counters",
        "Top-four incentives"
      ],
      bestBetId: "liv-che-under35"
    },
    {
      id: "mci-bre",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-09",
      time: "12:30 PM ET",
      venue: "Etihad Stadium",
      away: "BRE",
      home: "MCI",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 14,
        draw: 20,
        homeWin: 66,
        winner: "MCI",
        score: "MCI 2, BRE 0",
        range: "MCI 1-3, BRE 0-1",
        spreadLean: "Wait for lineup rotation",
        totalLean: "No bet until market posts",
        confidence: 4.6
      },
      situational: [
        "City have multiple fixtures in quick succession, including a rescheduled Palace match.",
        "Rotation and FA Cup final prep can distort a normal home-favorite model.",
        "No bet until XI and price confirm."
      ],
      matchup: ["City possession", "Brentford set pieces", "Rotation risk"],
      bestBetId: null
    },
    {
      id: "nfo-new",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-10",
      time: "9:00 AM ET",
      venue: "The City Ground",
      away: "NEW",
      home: "NFO",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 44,
        draw: 27,
        homeWin: 29,
        winner: "NEW",
        score: "NEW 1, NFO 1",
        range: "NFO 0-2, NEW 1-2",
        spreadLean: "Newcastle draw-no-bet watchlist",
        totalLean: "Under watchlist",
        confidence: 4.5
      },
      situational: [
        "Newcastle are the stronger side, but away fixtures late in the season can be trap spots.",
        "Forest home urgency can increase draw probability.",
        "Prefer draw-no-bet to full-time result if price is reasonable."
      ],
      matchup: ["Newcastle quality edge", "Forest home urgency", "Draw risk"],
      bestBetId: null
    },
    {
      id: "whu-ars",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-10",
      time: "11:30 AM ET",
      venue: "London Stadium",
      away: "ARS",
      home: "WHU",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 58,
        draw: 24,
        homeWin: 18,
        winner: "ARS",
        score: "ARS 2, WHU 1",
        range: "WHU 0-2, ARS 1-3",
        spreadLean: "Arsenal price depends on UCL minutes",
        totalLean: "No bet until team news",
        confidence: 4.7
      },
      situational: [
        "Arsenal's Champions League result and rotation plan materially change this game.",
        "West Ham can become live if Arsenal qualify and emotionally exhale.",
        "Hold fire until lineups and market movement settle."
      ],
      matchup: ["Arsenal rest spot", "West Ham set pieces", "Motivation swing"],
      bestBetId: null
    },
    {
      id: "tot-lee",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-11",
      time: "3:00 PM ET",
      venue: "Tottenham Hotspur Stadium",
      away: "LEE",
      home: "TOT",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 18,
        draw: 23,
        homeWin: 59,
        winner: "TOT",
        score: "TOT 2, LEE 1",
        range: "TOT 1-3, LEE 0-2",
        spreadLean: "Tottenham ML watchlist",
        totalLean: "Over watchlist only if 2.5 is plus money",
        confidence: 4.6
      },
      situational: [
        "Tottenham profiles as the better side but defensive volatility keeps props/totals live.",
        "Leeds away defensive issues create favorite lean but not an automatic bet.",
        "No market, no stake."
      ],
      matchup: ["Tottenham tempo", "Leeds defensive pressure", "Total volatility"],
      bestBetId: null
    },
    {
      id: "mci-cry",
      sport: "Soccer",
      league: "Premier League",
      date: "2026-05-13",
      time: "3:00 PM ET",
      venue: "Etihad Stadium",
      away: "CRY",
      home: "MCI",
      currentOdds: null,
      openingOdds: null,
      marketStatus: "Market pending",
      model: {
        awayWin: 13,
        draw: 19,
        homeWin: 68,
        winner: "MCI",
        score: "MCI 2, CRY 0",
        range: "MCI 1-3, CRY 0-1",
        spreadLean: "Avoid early City tax",
        totalLean: "Under watchlist if rotated XI",
        confidence: 4.4
      },
      situational: [
        "This is a rescheduled fixture before City's FA Cup final weekend.",
        "Rotation and motivation are more important than raw table rating.",
        "Avoid laying a big early number before lineup context."
      ],
      matchup: ["City possession", "Palace counter shape", "FA Cup lookahead"],
      bestBetId: null
    }
  ],
  predictions: [
    {
      id: "det-ml",
      gameId: "cle-det",
      type: "Moneyline",
      pick: "Detroit Pistons ML",
      odds: -155,
      modelProbability: 58,
      confidence: 5.3,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Detroit is the projected winner, but the price implies about 60.8%, above this model's 58%."
    },
    {
      id: "cle-spread",
      gameId: "cle-det",
      type: "Spread",
      pick: "Cleveland Cavaliers +3.5",
      odds: -115,
      modelProbability: 52,
      confidence: 5.1,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Small underdog cushion, but -115 juice removes the edge."
    },
    {
      id: "cle-det-under",
      gameId: "cle-det",
      type: "Total",
      pick: "Cavaliers/Pistons under 214.5",
      odds: -110,
      modelProbability: 53.5,
      confidence: 5.6,
      risk: "Medium",
      units: 0,
      recommendation: "Lean",
      reason: "Short rest, Game 1 pace, and Detroit's defensive profile point slightly under the number."
    },
    {
      id: "allen-u-reb",
      gameId: "cle-det",
      type: "Player prop",
      pick: "Jarrett Allen under 7.5 rebounds",
      odds: 100,
      modelProbability: 55,
      confidence: 6.4,
      risk: "Medium",
      units: 0.75,
      recommendation: "Bet",
      reason: "Detroit's Duren/Thompson size, Allen's recent knee context, and +100 pricing create the cleanest CLE-DET edge."
    },
    {
      id: "cade-ast",
      gameId: "cle-det",
      type: "Player prop",
      pick: "Cade Cunningham over 8.5 assists",
      odds: -120,
      modelProbability: 54,
      confidence: 5.2,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Role supports the over, but Cleveland can switch creators into scorer mode and the price is thin."
    },
    {
      id: "det-sgp",
      gameId: "cle-det",
      type: "Same-game parlay",
      pick: "DET ML + under 214.5 + Cade 8+ assists",
      odds: 390,
      modelProbability: 21.5,
      confidence: 3.8,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "Positive theoretical correlation, but parlay hold and injury-rest uncertainty make it a discipline pass."
    },
    {
      id: "okc-ml",
      gameId: "lal-okc",
      type: "Moneyline",
      pick: "Oklahoma City Thunder ML",
      odds: -1100,
      modelProbability: 91,
      confidence: 7.2,
      risk: "Low",
      units: 0,
      recommendation: "Avoid",
      reason: "Likely winner is not the same thing as value; -1100 is too expensive versus the model."
    },
    {
      id: "okc-spread",
      gameId: "lal-okc",
      type: "Spread",
      pick: "Oklahoma City Thunder -16",
      odds: -110,
      modelProbability: 52,
      confidence: 5.4,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "The opener moved from -14.5 to -16, so much of the injury edge is already priced in."
    },
    {
      id: "lal-okc-under",
      gameId: "lal-okc",
      type: "Total",
      pick: "Lakers/Thunder under 213.5",
      odds: -110,
      modelProbability: 55,
      confidence: 6.2,
      risk: "Medium",
      units: 0.75,
      recommendation: "Bet",
      reason: "Doncic out lowers LAL creation, OKC defense can suppress rim efficiency, and Jalen Williams out trims OKC scoring depth."
    },
    {
      id: "chet-blocks",
      gameId: "lal-okc",
      type: "Player prop",
      pick: "Chet Holmgren over 1.5 blocks",
      odds: -185,
      modelProbability: 69,
      confidence: 6.5,
      risk: "Medium",
      units: 0,
      recommendation: "Lean",
      reason: "Lakers' creation without Doncic leans more downhill, but -185 juice keeps this below staking threshold."
    },
    {
      id: "reaves-points",
      gameId: "lal-okc",
      type: "Player prop",
      pick: "Austin Reaves over 21.5 points",
      odds: -105,
      modelProbability: 51,
      confidence: 4.9,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "Usage rises with Doncic out, but OKC has the perimeter bodies to force inefficient volume."
    },
    {
      id: "hartenstein-ast",
      gameId: "lal-okc",
      type: "Player prop",
      pick: "Isaiah Hartenstein over 2.5 assists",
      odds: -125,
      modelProbability: 53,
      confidence: 4.8,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Passing role is real, but the implied probability is higher than the model edge."
    },
    {
      id: "okc-sgp",
      gameId: "lal-okc",
      type: "Same-game parlay",
      pick: "OKC win + under 213.5 + Chet 2+ blocks",
      odds: 240,
      modelProbability: 26,
      confidence: 4.2,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "Legs fit the game script, but implied probability and parlay hold are not attractive enough."
    },
    {
      id: "ars-atm-under",
      gameId: "ars-atm",
      type: "Total",
      pick: "Arsenal/Atletico Madrid under 2.5 goals",
      odds: -122,
      modelProbability: 57,
      confidence: 6.1,
      risk: "Medium",
      units: 0.5,
      recommendation: "Bet",
      reason: "Level aggregate state, Atletico away structure, Arsenal injuries, and semifinal caution support a lower-event script."
    },
    {
      id: "ars-ml",
      gameId: "ars-atm",
      type: "Moneyline",
      pick: "Arsenal 3-way moneyline",
      odds: -161,
      modelProbability: 53,
      confidence: 5.3,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Arsenal are the projected winner, but the implied probability is too high once draw risk is included."
    },
    {
      id: "atm-draw",
      gameId: "ars-atm",
      type: "Moneyline",
      pick: "Arsenal vs Atletico draw",
      odds: 290,
      modelProbability: 27,
      confidence: 4.9,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "The draw is live tactically, but the edge is too thin for a high-variance three-way outcome."
    },
    {
      id: "bay-psg-under45",
      gameId: "bay-psg",
      type: "Total",
      pick: "Bayern Munich/PSG under 4.5 goals",
      odds: -163,
      modelProbability: 66,
      confidence: 6.0,
      risk: "Medium",
      units: 0.5,
      recommendation: "Bet",
      reason: "The first-leg 5-4 score inflates public over bias; under 4.5 still survives most normal chase-game outcomes."
    },
    {
      id: "bay-ml",
      gameId: "bay-psg",
      type: "Moneyline",
      pick: "Bayern Munich 3-way moneyline",
      odds: -145,
      modelProbability: 53,
      confidence: 5.4,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Bayern can win the match and still fail to qualify, but the three-way price is not enough above model."
    },
    {
      id: "psg-advance-sgp",
      gameId: "bay-psg",
      type: "Same-game parlay",
      pick: "Bayern win + PSG team goal",
      odds: 210,
      modelProbability: 31,
      confidence: 4.4,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "The script is plausible, but correlated parlay hold and aggregate-state chaos make it a pass."
    },
    {
      id: "liv-che-under35",
      gameId: "liv-che",
      type: "Total",
      pick: "Liverpool/Chelsea under 3.5 goals",
      odds: -140,
      modelProbability: 62,
      confidence: 5.8,
      risk: "Medium",
      units: 0.5,
      recommendation: "Bet",
      reason: "Under 3.5 gives room for a 2-1 Liverpool win while avoiding expensive 1X2 chalk."
    },
    {
      id: "liv-ml",
      gameId: "liv-che",
      type: "Moneyline",
      pick: "Liverpool 3-way moneyline",
      odds: -112,
      modelProbability: 49,
      confidence: 5.0,
      risk: "Medium",
      units: 0,
      recommendation: "Avoid",
      reason: "Liverpool are favored, but draw risk and Chelsea counter threat keep model probability below implied price."
    },
    {
      id: "liv-che-draw",
      gameId: "liv-che",
      type: "Moneyline",
      pick: "Liverpool/Chelsea draw",
      odds: 300,
      modelProbability: 26,
      confidence: 4.7,
      risk: "High",
      units: 0,
      recommendation: "Avoid",
      reason: "Draw price is close to fair, not a strong enough edge for a high-variance soccer result market."
    }
  ],
  players: [
    {
      id: "donovan-mitchell",
      team: "CLE",
      gameId: "cle-det",
      name: "Donovan Mitchell",
      position: "G",
      status: "Available",
      points: 27.9,
      rebounds: 4.5,
      assists: 5.7,
      last5: { points: 30.2, rebounds: 5.6, assists: 5.4 },
      minutes: [35, 37, 36, 38, 37],
      trend: { points: [28, 30, 25, 34, 34], rebounds: [5, 7, 4, 6, 6], assists: [6, 5, 7, 4, 5] },
      usage: 31.2,
      splits: "48.3 / 36.4 / 86.5",
      advanced: "TS 61.0%, high shot diet",
      plusMinus: "+4.8 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Points 27.5",
      propPick: "No bet",
      propReason: "Detroit can load help without conceding clean rim attempts."
    },
    {
      id: "james-harden",
      team: "CLE",
      gameId: "cle-det",
      name: "James Harden",
      position: "G",
      status: "Available",
      points: 20.5,
      rebounds: 4.8,
      assists: 7.7,
      last5: { points: 21.8, rebounds: 5.0, assists: 8.0 },
      minutes: [34, 35, 33, 36, 34],
      trend: { points: [18, 24, 22, 17, 28], rebounds: [5, 4, 6, 5, 5], assists: [9, 7, 8, 8, 8] },
      usage: 25.1,
      splits: "46.6 / 43.5 / 84.0",
      advanced: "A/T 2.41, spacing lift",
      plusMinus: "+3.6 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Assists 7.5",
      propPick: "No bet",
      propReason: "Detroit pressure can turn assists into late-clock isolations."
    },
    {
      id: "evan-mobley",
      team: "CLE",
      gameId: "cle-det",
      name: "Evan Mobley",
      position: "F/C",
      status: "Available",
      points: 18.2,
      rebounds: 9.0,
      assists: 3.6,
      last5: { points: 20.0, rebounds: 8.2, assists: 3.4 },
      minutes: [33, 34, 32, 35, 33],
      trend: { points: [18, 25, 17, 21, 19], rebounds: [8, 8, 10, 7, 8], assists: [4, 2, 5, 3, 3] },
      usage: 22.4,
      splits: "Efficient paint scoring",
      advanced: "Strong defensive EPM profile",
      plusMinus: "+5.2 est.",
      consistency: "High",
      matchup: "Neutral",
      prop: "Rebounds 8.5",
      propPick: "Lean over",
      propReason: "Minutes secure, but Duren lowers ceiling on offensive glass."
    },
    {
      id: "jarrett-allen",
      team: "CLE",
      gameId: "cle-det",
      name: "Jarrett Allen",
      position: "C",
      status: "Monitor",
      points: 13.5,
      rebounds: 9.7,
      assists: 1.9,
      last5: { points: 12.6, rebounds: 7.4, assists: 1.8 },
      minutes: [28, 29, 27, 31, 28],
      trend: { points: [10, 12, 14, 11, 16], rebounds: [7, 8, 6, 7, 9], assists: [1, 2, 1, 3, 2] },
      usage: 15.8,
      splits: "High FG, low spacing",
      advanced: "Rim-runner volatility",
      plusMinus: "+2.7 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Rebounds 7.5",
      propPick: "Under",
      propReason: "Detroit size and Allen knee/rhythm context make the under playable at plus money."
    },
    {
      id: "cade-cunningham",
      team: "DET",
      gameId: "cle-det",
      name: "Cade Cunningham",
      position: "G",
      status: "Available",
      points: 24.2,
      rebounds: 5.5,
      assists: 9.8,
      last5: { points: 32.4, rebounds: 6.0, assists: 10.6 },
      minutes: [39, 41, 38, 42, 40],
      trend: { points: [28, 35, 31, 36, 32], rebounds: [5, 7, 4, 6, 8], assists: [9, 12, 10, 10, 12] },
      usage: 30.5,
      splits: "46.3 / 34.4 / 81.2",
      advanced: "TS 56.4%, high creation load",
      plusMinus: "+8.1 est.",
      consistency: "High",
      matchup: "Neutral",
      prop: "Assists 8.5",
      propPick: "Lean over",
      propReason: "Potential assists remain high, but short rest and scoring load add variance."
    },
    {
      id: "jalen-duren",
      team: "DET",
      gameId: "cle-det",
      name: "Jalen Duren",
      position: "C",
      status: "Available",
      points: 19.5,
      rebounds: 10.5,
      assists: 2.0,
      last5: { points: 20.8, rebounds: 11.8, assists: 2.2 },
      minutes: [31, 30, 29, 33, 32],
      trend: { points: [18, 24, 17, 22, 23], rebounds: [9, 13, 10, 14, 13], assists: [2, 2, 3, 1, 3] },
      usage: 20.1,
      splits: "65.0 / 0.0 / 74.7",
      advanced: "Elite rim efficiency",
      plusMinus: "+6.9 est.",
      consistency: "High",
      matchup: "Neutral",
      prop: "Rebounds 10.5",
      propPick: "No bet",
      propReason: "Strong profile, but Allen/Mobley make the price-sensitive over less clean."
    },
    {
      id: "tobias-harris",
      team: "DET",
      gameId: "cle-det",
      name: "Tobias Harris",
      position: "F",
      status: "Available",
      points: 13.1,
      rebounds: 5.1,
      assists: 2.5,
      last5: { points: 17.4, rebounds: 5.8, assists: 2.4 },
      minutes: [29, 31, 28, 33, 34],
      trend: { points: [12, 14, 16, 15, 30], rebounds: [4, 5, 6, 4, 10], assists: [2, 3, 2, 1, 4] },
      usage: 18.0,
      splits: "46.4 / 35.6 / 86.5",
      advanced: "Low turnover wing usage",
      plusMinus: "+3.5 est.",
      consistency: "Medium",
      matchup: "Neutral",
      prop: "Points 13.5",
      propPick: "No bet",
      propReason: "Game 7 spike creates inflated attention, but role is stable enough to avoid fading blindly."
    },
    {
      id: "ausar-thompson",
      team: "DET",
      gameId: "cle-det",
      name: "Ausar Thompson",
      position: "G/F",
      status: "Available",
      points: 9.9,
      rebounds: 5.7,
      assists: 3.1,
      last5: { points: 10.2, rebounds: 6.2, assists: 3.4 },
      minutes: [27, 29, 26, 30, 31],
      trend: { points: [8, 12, 9, 10, 12], rebounds: [5, 6, 7, 6, 7], assists: [4, 2, 4, 3, 4] },
      usage: 14.7,
      splits: "52.5 / 25.0 / 57.1",
      advanced: "Elite stocks, low shooting gravity",
      plusMinus: "+5.1 est.",
      consistency: "Medium",
      matchup: "Neutral",
      prop: "Steals 1.5",
      propPick: "Lean over",
      propReason: "Cleveland guard usage creates steal chances, but stocks props are high variance."
    },
    {
      id: "luka-doncic",
      team: "LAL",
      gameId: "lal-okc",
      name: "Luka Doncic",
      position: "G",
      status: "Out",
      points: 33.5,
      rebounds: 7.7,
      assists: 8.3,
      last5: { points: 31.8, rebounds: 7.4, assists: 8.6 },
      minutes: [36, 37, 35, 0, 0],
      trend: { points: [35, 28, 32, 0, 0], rebounds: [8, 7, 7, 0, 0], assists: [10, 9, 7, 0, 0] },
      usage: 38.0,
      splits: "47.6 / 36.6 / 78.0",
      advanced: "TS 61.6%, league-high usage",
      plusMinus: "+2.9 est.",
      consistency: "High",
      matchup: "Out",
      prop: "All props",
      propPick: "No bet",
      propReason: "Listed out for Game 1."
    },
    {
      id: "lebron-james",
      team: "LAL",
      gameId: "lal-okc",
      name: "LeBron James",
      position: "F",
      status: "Available",
      points: 20.8,
      rebounds: 6.1,
      assists: 7.1,
      last5: { points: 23.6, rebounds: 7.4, assists: 8.2 },
      minutes: [37, 39, 38, 41, 40],
      trend: { points: [22, 26, 19, 28, 23], rebounds: [6, 9, 7, 8, 7], assists: [9, 7, 8, 10, 7] },
      usage: 25.4,
      splits: "51.2 / 30.9 / 73.8",
      advanced: "High assist load with Luka out",
      plusMinus: "+2.4 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Assists 7.5",
      propPick: "No bet",
      propReason: "Likely on-ball usage, but OKC can deny easy kickout rhythm."
    },
    {
      id: "austin-reaves",
      team: "LAL",
      gameId: "lal-okc",
      name: "Austin Reaves",
      position: "G",
      status: "Available",
      points: 23.3,
      rebounds: 4.7,
      assists: 5.5,
      last5: { points: 19.0, rebounds: 3.6, assists: 8.4 },
      minutes: [37, 38, 36, 39, 36],
      trend: { points: [18, 22, 16, 25, 14], rebounds: [4, 3, 5, 3, 3], assists: [8, 9, 7, 10, 8] },
      usage: 25.8,
      splits: "49.0 / 36.0 / 87.1",
      advanced: "TS 64.1%, role expands",
      plusMinus: "+1.5 est.",
      consistency: "Medium",
      matchup: "Very difficult",
      prop: "Points 21.5",
      propPick: "No bet",
      propReason: "Volume should rise, but OKC guard pressure lowers shot quality."
    },
    {
      id: "deandre-ayton",
      team: "LAL",
      gameId: "lal-okc",
      name: "Deandre Ayton",
      position: "C",
      status: "Available",
      points: 12.4,
      rebounds: 8.1,
      assists: 0.8,
      last5: { points: 11.6, rebounds: 7.2, assists: 1.0 },
      minutes: [27, 25, 29, 19, 28],
      trend: { points: [12, 14, 9, 13, 10], rebounds: [8, 9, 6, 4, 9], assists: [1, 0, 2, 1, 1] },
      usage: 16.1,
      splits: "67.2 / 0.0 / 63.4",
      advanced: "Dependent on assisted rim looks",
      plusMinus: "-0.6 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Rebounds 8.5",
      propPick: "Lean under",
      propReason: "OKC spacing and two-big options can pull him away from easy boards."
    },
    {
      id: "shai-gilgeous-alexander",
      team: "OKC",
      gameId: "lal-okc",
      name: "Shai Gilgeous-Alexander",
      position: "G",
      status: "Available",
      points: 31.1,
      rebounds: 4.3,
      assists: 6.6,
      last5: { points: 34.0, rebounds: 4.8, assists: 7.2 },
      minutes: [33, 32, 34, 31, 33],
      trend: { points: [30, 38, 42, 29, 31], rebounds: [4, 5, 5, 4, 6], assists: [7, 8, 8, 6, 7] },
      usage: 33.2,
      splits: "55.3 / 38.6 / 87.9",
      advanced: "TS 66.5%, elite rim/FT efficiency",
      plusMinus: "+11.6 est.",
      consistency: "High",
      matchup: "Favorable",
      prop: "Points 31.5",
      propPick: "No bet",
      propReason: "Matchup is favorable, but blowout risk can cap fourth-quarter minutes."
    },
    {
      id: "chet-holmgren",
      team: "OKC",
      gameId: "lal-okc",
      name: "Chet Holmgren",
      position: "F/C",
      status: "Available",
      points: 17.1,
      rebounds: 8.9,
      assists: 1.7,
      last5: { points: 18.8, rebounds: 9.6, assists: 2.0 },
      minutes: [29, 30, 31, 28, 30],
      trend: { points: [17, 20, 18, 15, 24], rebounds: [9, 10, 11, 8, 10], assists: [2, 1, 3, 1, 3] },
      usage: 22.0,
      splits: "55.7 / 36.2 / 79.2",
      advanced: "1.9 BPG, TS 64.6%",
      plusMinus: "+9.4 est.",
      consistency: "High",
      matchup: "Favorable",
      prop: "Blocks 1.5",
      propPick: "Over",
      propReason: "Lakers' Luka-less shot profile should send more attempts into his help zones."
    },
    {
      id: "jalen-williams",
      team: "OKC",
      gameId: "lal-okc",
      name: "Jalen Williams",
      position: "G/F",
      status: "Out",
      points: 17.1,
      rebounds: 4.6,
      assists: 5.5,
      last5: { points: 0, rebounds: 0, assists: 0 },
      minutes: [0, 0, 0, 0, 0],
      trend: { points: [0, 0, 0, 0, 0], rebounds: [0, 0, 0, 0, 0], assists: [0, 0, 0, 0, 0] },
      usage: 24.0,
      splits: "48.4 / 29.9 / 83.7",
      advanced: "Secondary creator unavailable",
      plusMinus: "+6.2 est.",
      consistency: "Out",
      matchup: "Out",
      prop: "All props",
      propPick: "No bet",
      propReason: "Reported out while rehabbing hamstring injury."
    },
    {
      id: "isaiah-hartenstein",
      team: "OKC",
      gameId: "lal-okc",
      name: "Isaiah Hartenstein",
      position: "C",
      status: "Available",
      points: 9.4,
      rebounds: 9.2,
      assists: 3.5,
      last5: { points: 9.6, rebounds: 9.8, assists: 3.0 },
      minutes: [24, 25, 23, 26, 24],
      trend: { points: [8, 10, 11, 9, 10], rebounds: [10, 9, 11, 8, 11], assists: [3, 2, 4, 3, 3] },
      usage: 13.3,
      splits: "62.2 / 0.0 / 61.0",
      advanced: "Connector big, rebound rate lift",
      plusMinus: "+5.9 est.",
      consistency: "Medium",
      matchup: "Neutral",
      prop: "Assists 2.5",
      propPick: "No bet",
      propReason: "Price is too expensive for the projected hit rate."
    },
    {
      id: "bukayo-saka",
      team: "ARS",
      gameId: "ars-atm",
      name: "Bukayo Saka",
      position: "RW",
      status: "Available",
      points: 0.42,
      rebounds: 2.4,
      assists: 2.2,
      last5: { points: 0.6, rebounds: 2.8, assists: 2.4 },
      minutes: [84, 90, 78, 86, 90],
      trend: { points: [0, 1, 0, 1, 1], rebounds: [2, 3, 2, 4, 3], assists: [2, 3, 1, 3, 3] },
      usage: 24.5,
      splits: "High set-piece share",
      advanced: "Primary shot creator",
      plusMinus: "+0.42 xG+xA/90 est.",
      consistency: "High",
      matchup: "Difficult",
      prop: "Shot on target 0.5",
      propPick: "Lean over",
      propReason: "Arsenal should funnel late chances through the right side, but Atletico's block raises variance."
    },
    {
      id: "julian-alvarez",
      team: "ATM",
      gameId: "ars-atm",
      name: "Julian Alvarez",
      position: "F",
      status: "Available",
      points: 0.55,
      rebounds: 2.1,
      assists: 1.3,
      last5: { points: 0.6, rebounds: 2.2, assists: 1.4 },
      minutes: [89, 90, 88, 90, 90],
      trend: { points: [1, 0, 1, 0, 1], rebounds: [3, 1, 2, 2, 3], assists: [1, 2, 1, 1, 2] },
      usage: 28.0,
      splits: "Penalty + transition threat",
      advanced: "Goal/assist every 80 UCL minutes cited by Covers",
      plusMinus: "+0.48 xG+xA/90 est.",
      consistency: "Medium",
      matchup: "Difficult",
      prop: "Goal contribution",
      propPick: "No bet",
      propReason: "Elite role, but expected low total makes anytime markets thin."
    },
    {
      id: "harry-kane",
      team: "BAY",
      gameId: "bay-psg",
      name: "Harry Kane",
      position: "F",
      status: "Available",
      points: 0.78,
      rebounds: 3.1,
      assists: 1.6,
      last5: { points: 0.8, rebounds: 3.4, assists: 1.8 },
      minutes: [90, 85, 90, 72, 88],
      trend: { points: [1, 1, 0, 1, 1], rebounds: [3, 4, 2, 5, 3], assists: [2, 1, 2, 1, 3] },
      usage: 31.0,
      splits: "Penalty + central target",
      advanced: "High xG focal point",
      plusMinus: "+0.65 xG+xA/90 est.",
      consistency: "High",
      matchup: "Favorable",
      prop: "Anytime scorer",
      propPick: "Lean over if plus money",
      propReason: "Bayern need goals, but the dashboard's cleaner edge is still under 4.5."
    },
    {
      id: "khvicha-kvaratskhelia",
      team: "PSG",
      gameId: "bay-psg",
      name: "Khvicha Kvaratskhelia",
      position: "LW",
      status: "Available",
      points: 0.45,
      rebounds: 2.9,
      assists: 2.1,
      last5: { points: 0.6, rebounds: 3.2, assists: 2.2 },
      minutes: [82, 87, 90, 79, 88],
      trend: { points: [0, 1, 1, 0, 1], rebounds: [3, 4, 2, 3, 4], assists: [2, 2, 3, 1, 3] },
      usage: 27.0,
      splits: "Left-channel transition",
      advanced: "Counterattack pressure valve",
      plusMinus: "+0.52 xG+xA/90 est.",
      consistency: "Medium",
      matchup: "Neutral",
      prop: "Shots 2.5",
      propPick: "No bet",
      propReason: "PSG may spend long stretches protecting aggregate lead."
    },
    {
      id: "mohamed-salah",
      team: "LIV",
      gameId: "liv-che",
      name: "Mohamed Salah",
      position: "RW",
      status: "Available",
      points: 0.62,
      rebounds: 3.3,
      assists: 2.0,
      last5: { points: 0.6, rebounds: 3.0, assists: 2.2 },
      minutes: [88, 90, 84, 90, 86],
      trend: { points: [1, 0, 1, 0, 1], rebounds: [4, 3, 2, 3, 3], assists: [2, 3, 1, 2, 3] },
      usage: 30.0,
      splits: "Penalty + right-side volume",
      advanced: "Primary Liverpool finisher",
      plusMinus: "+0.60 xG+xA/90 est.",
      consistency: "High",
      matchup: "Neutral",
      prop: "Shot on target 0.5",
      propPick: "Lean over",
      propReason: "Anfield favorite script supports volume, but under 3.5 is the lower-risk position."
    },
    {
      id: "cole-palmer",
      team: "CHE",
      gameId: "liv-che",
      name: "Cole Palmer",
      position: "AM",
      status: "Available",
      points: 0.50,
      rebounds: 2.5,
      assists: 2.8,
      last5: { points: 0.4, rebounds: 2.4, assists: 3.0 },
      minutes: [90, 88, 90, 84, 90],
      trend: { points: [0, 1, 0, 1, 0], rebounds: [2, 3, 2, 2, 3], assists: [3, 2, 4, 3, 3] },
      usage: 29.0,
      splits: "Chance creator + penalties",
      advanced: "Chelsea high-value touch hub",
      plusMinus: "+0.55 xG+xA/90 est.",
      consistency: "High",
      matchup: "Difficult",
      prop: "Goal contribution",
      propPick: "No bet",
      propReason: "Role is strong, but Liverpool home pressure can cap Chelsea possession."
    }
  ],
  history: [
    {
      title: "Cavaliers at Pistons",
      items: [
        "Detroit finished 60-22 with a top-three defensive profile and 32-9 home record.",
        "Cleveland won at Detroit 116-95 on Oct. 27, but roster form and postseason context have shifted.",
        "Both teams survived Game 7 on May 3, increasing late-game fatigue risk and making totals more attractive than sides.",
        "Cade Cunningham posted 32 points and 12 assists in Game 7 against Orlando."
      ]
    },
    {
      title: "Lakers at Thunder",
      items: [
        "Oklahoma City finished 64-18 with the league's best net rating and a 34-8 home mark.",
        "NBA.com noted the Thunder beat the Lakers by 29.3 points per game in the regular-season series.",
        "The Lakers' Apr. 2 trip to Oklahoma City ended 139-96, a 43-point loss.",
        "Luka Doncic is out for Game 1, while Jalen Williams is also unavailable for Oklahoma City."
      ]
    },
    {
      title: "Learning From Similar Spots",
      items: [
        "Huge favorites are often correct winners and bad prices at the same time.",
        "After injury-driven spread moves, the remaining edge usually moves to derivative markets and totals.",
        "Game 1 playoff totals can benefit from slower pacing, but late foul sequences make thin unders risky.",
        "Props with plus-money and matchup support are preferred over laying large moneyline juice."
      ]
    },
    {
      title: "Upcoming NBA Watchlist",
      items: [
        "76ers-Knicks and Timberwolves-Spurs Game 2s are scheduled for Wednesday, May 6.",
        "Cavaliers-Pistons Game 2 and Lakers-Thunder Game 2 are scheduled for Thursday, May 7.",
        "Future playoff games are listed as market pending until odds, injuries, and Game 1 outcomes are known.",
        "Avoid pre-betting stale priors before each series reveals adjustment patterns."
      ]
    },
    {
      title: "Soccer Slate Notes",
      items: [
        "Arsenal-Atletico Madrid and Bayern-PSG are Champions League semifinal second legs on May 5-6.",
        "Liverpool-Chelsea, Man City-Brentford, Nottingham Forest-Newcastle, West Ham-Arsenal, Tottenham-Leeds, and Man City-Palace are included as Premier League upcoming games.",
        "Soccer three-way moneylines carry draw risk; the dashboard favors totals when side prices are overtaxed.",
        "Lineups, aggregate state, and fixture congestion drive soccer staking more than season power ratings alone."
      ]
    }
  ],
  betLedger: [
    { date: "Apr 22", type: "Total", confidence: 6.2, units: 0.7, result: 0.64 },
    { date: "Apr 24", type: "Spread", confidence: 5.8, units: 0.5, result: -0.5 },
    { date: "Apr 26", type: "Player prop", confidence: 6.5, units: 0.8, result: 0.73 },
    { date: "Apr 28", type: "Moneyline", confidence: 5.1, units: 0.4, result: -0.4 },
    { date: "Apr 30", type: "Player prop", confidence: 6.8, units: 0.8, result: 0.76 },
    { date: "May 1", type: "Total", confidence: 5.5, units: 0.5, result: -0.5 },
    { date: "May 3", type: "Spread", confidence: 6.1, units: 0.7, result: 0.64 }
  ],
  backtestBets: [
    {
      date: "2026-04-08",
      sport: "NBA",
      league: "NBA",
      betType: "Total",
      pick: "Heat/Bulls under 221.5",
      odds: -110,
      modelProbability: 55.7,
      confidence: 6.1,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-09",
      sport: "Soccer",
      league: "Premier League",
      betType: "Total",
      pick: "Brighton/Fulham under 3.5 goals",
      odds: -145,
      modelProbability: 63,
      confidence: 5.9,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-10",
      sport: "NBA",
      league: "NBA",
      betType: "Player prop",
      pick: "Jalen Brunson over 7.5 assists",
      odds: 105,
      modelProbability: 52.4,
      confidence: 5.8,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-11",
      sport: "NBA",
      league: "NBA",
      betType: "Spread",
      pick: "Nuggets -4.5",
      odds: -108,
      modelProbability: 54.2,
      confidence: 6.0,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-12",
      sport: "Soccer",
      league: "UEFA Champions League",
      betType: "Moneyline",
      pick: "Barcelona 3-way moneyline",
      odds: -120,
      modelProbability: 52,
      confidence: 5.5,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-13",
      sport: "NBA",
      league: "NBA",
      betType: "Total",
      pick: "Celtics/Magic under 216.5",
      odds: -112,
      modelProbability: 56.5,
      confidence: 6.3,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-14",
      sport: "NBA",
      league: "NBA",
      betType: "Moneyline",
      pick: "Knicks ML",
      odds: -165,
      modelProbability: 59.8,
      confidence: 5.6,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-15",
      sport: "Soccer",
      league: "Premier League",
      betType: "Total",
      pick: "Chelsea/Everton over 2.5 goals",
      odds: -102,
      modelProbability: 54.5,
      confidence: 5.7,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-16",
      sport: "NBA",
      league: "NBA",
      betType: "Player prop",
      pick: "Anthony Edwards under 31.5 points",
      odds: -115,
      modelProbability: 57.4,
      confidence: 6.7,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-17",
      sport: "Soccer",
      league: "Premier League",
      betType: "Spread",
      pick: "Arsenal -0.75 Asian handicap",
      odds: -105,
      modelProbability: 53.2,
      confidence: 5.4,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-18",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Player prop",
      pick: "Chet Holmgren over 1.5 blocks",
      odds: -155,
      modelProbability: 65,
      confidence: 6.4,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-19",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Total",
      pick: "Lakers/Thunder under 214.5",
      odds: -110,
      modelProbability: 55.1,
      confidence: 6.2,
      stakeUnits: 0.75,
      result: "loss"
    },
    {
      date: "2026-04-20",
      sport: "Soccer",
      league: "UEFA Champions League",
      betType: "Total",
      pick: "Atletico/Inter under 2.5 goals",
      odds: -118,
      modelProbability: 58.6,
      confidence: 6.1,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-21",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Spread",
      pick: "Pistons -2.5",
      odds: -112,
      modelProbability: 55.4,
      confidence: 6.3,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-22",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Same-game parlay",
      pick: "Knicks ML + under 218.5",
      odds: 235,
      modelProbability: 32,
      confidence: 4.8,
      stakeUnits: 0.25,
      result: "loss"
    },
    {
      date: "2026-04-23",
      sport: "Soccer",
      league: "Premier League",
      betType: "Total",
      pick: "Liverpool/Tottenham under 3.5 goals",
      odds: -135,
      modelProbability: 61.5,
      confidence: 6.0,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-24",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Player prop",
      pick: "Jarrett Allen under 8.5 rebounds",
      odds: 100,
      modelProbability: 54.8,
      confidence: 6.2,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-04-25",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Moneyline",
      pick: "Thunder ML",
      odds: -850,
      modelProbability: 90,
      confidence: 7.1,
      stakeUnits: 0.25,
      result: "win"
    },
    {
      date: "2026-04-26",
      sport: "Soccer",
      league: "Premier League",
      betType: "Moneyline",
      pick: "Newcastle draw-no-bet",
      odds: -125,
      modelProbability: 58.2,
      confidence: 5.6,
      stakeUnits: 0.5,
      result: "push"
    },
    {
      date: "2026-04-27",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Total",
      pick: "Cavaliers/Pistons under 215.5",
      odds: -108,
      modelProbability: 54.1,
      confidence: 5.8,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-28",
      sport: "Soccer",
      league: "UEFA Champions League",
      betType: "Total",
      pick: "PSG/Bayern over 3.5 goals",
      odds: 115,
      modelProbability: 49.8,
      confidence: 5.2,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-04-29",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Player prop",
      pick: "Austin Reaves under 23.5 points",
      odds: -110,
      modelProbability: 56,
      confidence: 6.0,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-04-30",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Spread",
      pick: "Timberwolves +4.5",
      odds: -110,
      modelProbability: 55.3,
      confidence: 6.2,
      stakeUnits: 0.75,
      result: "win"
    },
    {
      date: "2026-05-01",
      sport: "Soccer",
      league: "Premier League",
      betType: "Total",
      pick: "Man City/Wolves under 4.5 goals",
      odds: -160,
      modelProbability: 67,
      confidence: 6.4,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-05-02",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Player prop",
      pick: "Cade Cunningham over 8.5 assists",
      odds: -118,
      modelProbability: 55,
      confidence: 5.7,
      stakeUnits: 0.5,
      result: "win"
    },
    {
      date: "2026-05-03",
      sport: "Soccer",
      league: "Premier League",
      betType: "Total",
      pick: "Arsenal/Bournemouth under 3.5 goals",
      odds: -130,
      modelProbability: 60.2,
      confidence: 5.9,
      stakeUnits: 0.5,
      result: "loss"
    },
    {
      date: "2026-05-04",
      sport: "NBA",
      league: "NBA Playoffs",
      betType: "Total",
      pick: "Knicks/76ers under 217.5",
      odds: -110,
      modelProbability: 55.6,
      confidence: 6.0,
      stakeUnits: 0.75,
      result: "win"
    }
  ]
};

const state = {
  charts: {},
  filters: {
    sport: "all",
    league: "all",
    team: "all",
    player: "all",
    betType: "all",
    risk: "all",
    confidence: 1,
    date: DATA.slateDate,
    location: "all",
    injury: "all",
    positiveEvOnly: false
  },
  bankroll: {
    starting: DATA.defaultBankroll,
    current: DATA.defaultBankroll,
    lossStreak: 0,
    maxExposure: 3
  },
  backtest: {
    sport: "all",
    strategy: "all-positive",
    minConfidence: 5.5,
    minEdge: 2,
    maxUnit: 1,
    bankroll: DATA.defaultBankroll,
    customRows: null
  },
  tracker: {
    bets: [],
    lastSaved: null
  }
};

const STORAGE_KEY = "professionalSportsBettingDashboard.v1";

function americanToDecimal(odds) {
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / Math.abs(odds);
}

function impliedProbability(odds) {
  return odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
}

function evPercent(probability, odds) {
  const decimal = americanToDecimal(odds);
  const p = probability / 100;
  return (p * (decimal - 1) - (1 - p)) * 100;
}

function formatOdds(odds) {
  if (odds === null || odds === undefined) return "TBD";
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function pct(value, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function getGame(id) {
  return DATA.games.find((game) => game.id === id);
}

function getTeam(abbr) {
  return DATA.teams[abbr];
}

function getPrediction(id) {
  return DATA.predictions.find((prediction) => prediction.id === id);
}

function riskClass(risk) {
  return `risk-${risk.toLowerCase()}`;
}

function statusClass(status) {
  if (status === "Available") return "status-available";
  if (status === "Out") return "status-out";
  return "status-monitor";
}

function evClass(value) {
  return value >= 0 ? "ev-positive" : "ev-negative";
}

function safeLocalStorage() {
  try {
    const key = `${STORAGE_KEY}.test`;
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function loadSavedState() {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    if (!saved) return;

    if (saved.filters) state.filters = { ...state.filters, ...saved.filters };
    if (saved.bankroll) state.bankroll = { ...state.bankroll, ...saved.bankroll };
    if (saved.backtest) state.backtest = { ...state.backtest, ...saved.backtest };
    if (saved.tracker) {
      state.tracker = {
        bets: Array.isArray(saved.tracker.bets) ? saved.tracker.bets : [],
        lastSaved: saved.tracker.lastSaved || saved.savedAt || null
      };
    }
  } catch (error) {
    console.warn("Saved dashboard state could not be loaded.", error);
  }
}

function persistDashboard() {
  const storage = safeLocalStorage();
  const savedAt = new Date().toISOString();
  state.tracker.lastSaved = savedAt;

  if (storage) {
    const payload = {
      version: 1,
      savedAt,
      filters: state.filters,
      bankroll: state.bankroll,
      backtest: state.backtest,
      tracker: state.tracker
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  updateSaveStatus(storage ? savedAt : null);
}

function updateSaveStatus(savedAt = state.tracker.lastSaved) {
  const element = document.getElementById("liveSaveStatus");
  if (!element) return;

  if (!savedAt) {
    element.textContent = "Auto-save unavailable";
    element.classList.add("save-warning");
    return;
  }

  const time = new Date(savedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
  element.textContent = `Saved locally ${time}`;
  element.classList.remove("save-warning");
}

function adjustedUnits(units) {
  if (!units) return 0;
  if (state.bankroll.lossStreak >= 7) return 0;
  if (state.bankroll.lossStreak >= 3) return units * 0.5;
  return units;
}

function recommendationIsPlayable(prediction) {
  return prediction.units > 0 && evPercent(prediction.modelProbability, prediction.odds) > 0;
}

function hydrateFilters() {
  const sportFilter = document.getElementById("sportFilter");
  const leagueFilter = document.getElementById("leagueFilter");
  const teamFilter = document.getElementById("teamFilter");
  const playerFilter = document.getElementById("playerFilter");
  const betTypeFilter = document.getElementById("betTypeFilter");
  const riskFilter = document.getElementById("riskFilter");

  const sports = [...new Set(DATA.games.map((game) => game.sport))].sort();
  sportFilter.innerHTML = [
    `<option value="all">All sports</option>`,
    ...sports.map((sport) => `<option value="${sport}">${sport}</option>`)
  ].join("");

  const leagues = [...new Set(DATA.games.map((game) => game.league))].sort();
  leagueFilter.innerHTML = [
    `<option value="all">All leagues</option>`,
    ...leagues.map((league) => `<option value="${league}">${league}</option>`)
  ].join("");

  teamFilter.innerHTML = [
    `<option value="all">All teams</option>`,
    ...Object.values(DATA.teams)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((team) => `<option value="${team.abbr}">${team.name}</option>`)
  ].join("");

  playerFilter.innerHTML = [
    `<option value="all">All players</option>`,
    ...DATA.players
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((player) => `<option value="${player.id}">${player.name}</option>`)
  ].join("");

  const betTypes = [...new Set(DATA.predictions.map((prediction) => prediction.type))];
  betTypeFilter.innerHTML = [
    `<option value="all">All bet types</option>`,
    ...betTypes.map((type) => `<option value="${type}">${type}</option>`)
  ].join("");

  riskFilter.innerHTML = [
    `<option value="all">All risk levels</option>`,
    `<option value="Low">Low</option>`,
    `<option value="Medium">Medium</option>`,
    `<option value="High">High</option>`
  ].join("");
}

function bindEvents() {
  const map = {
    sportFilter: "sport",
    leagueFilter: "league",
    teamFilter: "team",
    playerFilter: "player",
    betTypeFilter: "betType",
    riskFilter: "risk",
    confidenceFilter: "confidence",
    dateFilter: "date",
    locationFilter: "location",
    injuryFilter: "injury"
  };

  Object.entries(map).forEach(([id, key]) => {
    document.getElementById(id).addEventListener("input", (event) => {
      state.filters[key] = key === "confidence" ? Number(event.target.value) : event.target.value;
      document.getElementById("confidenceValue").textContent = Number(
        state.filters.confidence
      ).toFixed(1);
      render();
    });
  });

  document.getElementById("positiveEvOnly").addEventListener("change", (event) => {
    state.filters.positiveEvOnly = event.target.checked;
    render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.filters = {
      sport: "all",
      league: "all",
      team: "all",
      player: "all",
      betType: "all",
      risk: "all",
      confidence: 1,
      date: DATA.slateDate,
      location: "all",
      injury: "all",
      positiveEvOnly: false
    };
    syncFilterControls();
    render();
  });

  document.getElementById("printView").addEventListener("click", () => window.print());

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.target);
      window.history.replaceState(null, "", `#${button.dataset.target}`);
    });
  });

  window.addEventListener("hashchange", () => {
    activateTab(window.location.hash.replace("#", "") || "mainDashboard");
  });

  ["startingBankroll", "currentBankroll", "lossStreak", "maxExposure"].forEach((id) => {
    document.getElementById(id).addEventListener("input", () => {
      state.bankroll = {
        starting: Number(document.getElementById("startingBankroll").value || 0),
        current: Number(document.getElementById("currentBankroll").value || 0),
        lossStreak: Number(document.getElementById("lossStreak").value || 0),
        maxExposure: Number(document.getElementById("maxExposure").value || 0)
      };
      render();
    });
  });

  const backtestMap = {
    backtestSport: "sport",
    backtestStrategy: "strategy",
    backtestConfidence: "minConfidence",
    backtestEdge: "minEdge",
    backtestMaxUnit: "maxUnit",
    backtestBankroll: "bankroll"
  };

  Object.entries(backtestMap).forEach(([id, key]) => {
    document.getElementById(id).addEventListener("input", (event) => {
      const value = ["minConfidence", "minEdge", "maxUnit", "bankroll"].includes(key)
        ? Number(event.target.value || 0)
        : event.target.value;
      state.backtest[key] = value;
      syncBacktestOutputs();
      render();
    });
  });

  document.getElementById("loadBacktestCsv").addEventListener("click", () => {
    const status = document.getElementById("backtestCsvStatus");
    try {
      const rows = parseBacktestCsv(document.getElementById("backtestCsv").value);
      state.backtest.customRows = rows;
      status.textContent = `Loaded ${rows.length} closed bets`;
      status.className = "status-ok";
      render();
    } catch (error) {
      status.textContent = error.message;
      status.className = "status-error";
    }
  });

  document.getElementById("resetBacktestCsv").addEventListener("click", () => {
    state.backtest.customRows = null;
    document.getElementById("backtestCsv").value = "";
    const status = document.getElementById("backtestCsvStatus");
    status.textContent = trackerBacktestRows().length ? "Tracked ledger restored" : "Sample ledger restored";
    status.className = "status-ok";
    render();
  });

  document.getElementById("trackerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    addTrackedBetFromForm();
  });

  document.getElementById("clearTrackerForm").addEventListener("click", () => {
    resetTrackerForm();
    document.getElementById("trackerFormStatus").textContent = "Form cleared";
  });

  document.getElementById("openTrackerRows").addEventListener("click", handleTrackerAction);
  document.getElementById("settledTrackerRows").addEventListener("click", handleTrackerAction);

  document.getElementById("exportTrackerCsv").addEventListener("click", () => {
    document.getElementById("trackerCsv").value = trackerCsv();
    document.getElementById("trackerCsvStatus").textContent = `Exported ${state.tracker.bets.length} bets`;
  });

  document.getElementById("importTrackerCsv").addEventListener("click", () => {
    const status = document.getElementById("trackerCsvStatus");
    try {
      const rows = parseTrackerCsv(document.getElementById("trackerCsv").value);
      state.tracker.bets = rows;
      status.textContent = `Imported ${rows.length} bets`;
      render();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  document.getElementById("clearTrackerLedger").addEventListener("click", () => {
    if (!state.tracker.bets.length) return;
    if (!window.confirm("Clear every tracked bet saved in this browser?")) return;
    state.tracker.bets = [];
    document.getElementById("trackerCsvStatus").textContent = "Tracker ledger cleared";
    render();
  });
}

function syncFilterControls() {
  document.getElementById("sportFilter").value = state.filters.sport;
  document.getElementById("leagueFilter").value = state.filters.league;
  document.getElementById("teamFilter").value = state.filters.team;
  document.getElementById("playerFilter").value = state.filters.player;
  document.getElementById("betTypeFilter").value = state.filters.betType;
  document.getElementById("riskFilter").value = state.filters.risk;
  document.getElementById("confidenceFilter").value = state.filters.confidence;
  document.getElementById("confidenceValue").textContent = Number(state.filters.confidence).toFixed(1);
  document.getElementById("dateFilter").value = state.filters.date;
  document.getElementById("locationFilter").value = state.filters.location;
  document.getElementById("injuryFilter").value = state.filters.injury;
  document.getElementById("positiveEvOnly").checked = state.filters.positiveEvOnly;
}

function syncBankrollControls() {
  document.getElementById("startingBankroll").value = state.bankroll.starting;
  document.getElementById("currentBankroll").value = state.bankroll.current;
  document.getElementById("lossStreak").value = state.bankroll.lossStreak;
  document.getElementById("maxExposure").value = state.bankroll.maxExposure;
}

function syncBacktestControls() {
  document.getElementById("backtestSport").value = state.backtest.sport;
  document.getElementById("backtestStrategy").value = state.backtest.strategy;
  document.getElementById("backtestConfidence").value = state.backtest.minConfidence;
  document.getElementById("backtestEdge").value = state.backtest.minEdge;
  document.getElementById("backtestMaxUnit").value = state.backtest.maxUnit;
  document.getElementById("backtestBankroll").value = state.backtest.bankroll;
  syncBacktestOutputs();
}

function activateTab(targetId) {
  const target = document.getElementById(targetId);
  const button = document.querySelector(`.tab-button[data-target="${targetId}"]`);
  if (!target || !button) return;

  document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".dashboard-section").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  target.classList.add("active");
  renderCharts();
  window.scrollTo(0, 0);
}

function syncBacktestOutputs() {
  document.getElementById("backtestConfidenceValue").textContent =
    Number(state.backtest.minConfidence).toFixed(1);
  document.getElementById("backtestEdgeValue").textContent = `${Number(state.backtest.minEdge).toFixed(1)}%`;
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function parseBacktestCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Paste at least one closed bet row.");
  }

  const defaultHeaders = [
    "date",
    "sport",
    "league",
    "type",
    "pick",
    "odds",
    "probability",
    "confidence",
    "stake",
    "result"
  ];
  const firstRow = splitCsvLine(lines[0]).map((value) => value.toLowerCase());
  const hasHeader =
    firstRow.includes("date") &&
    firstRow.some((value) => ["odds", "probability", "prob", "modelprobability"].includes(value));
  const headers = hasHeader ? firstRow : defaultHeaders;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows = dataLines.map((line, rowIndex) => {
    const values = splitCsvLine(line);
    const raw = headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
    return normalizeBacktestRow(raw, rowIndex + 1);
  });

  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeBacktestRow(raw, rowNumber = 0) {
  const odds = Number(raw.odds);
  const modelProbability = Number(raw.probability ?? raw.prob ?? raw.modelprobability ?? raw.modelProbability ?? raw.model);
  const confidence = Number(raw.confidence);
  const stakeUnits = Number(raw.stake ?? raw.units ?? raw.stakeUnits ?? 0.5);
  const resultText = String(raw.result ?? raw.outcome ?? "").trim().toLowerCase();
  const profitUnits = Number(raw.profit ?? raw.profitUnits ?? raw.pl ?? raw["p/l"]);
  const result = Number.isFinite(Number(resultText)) ? "settled" : resultText;

  if (!raw.date || !raw.pick || !Number.isFinite(odds) || !Number.isFinite(modelProbability)) {
    throw new Error(`CSV row ${rowNumber} is missing date, pick, odds, or probability.`);
  }

  if (!Number.isFinite(confidence) || !Number.isFinite(stakeUnits) || stakeUnits <= 0) {
    throw new Error(`CSV row ${rowNumber} needs numeric confidence and stake values.`);
  }

  if (!["win", "loss", "push", "settled"].includes(result) && !Number.isFinite(profitUnits)) {
    throw new Error(`CSV row ${rowNumber} result must be win, loss, push, or a numeric P/L.`);
  }

  return {
    date: raw.date,
    sport: raw.sport || "NBA",
    league: raw.league || "Custom",
    betType: raw.bettype || raw.betType || raw.type || "Total",
    pick: raw.pick,
    odds,
    modelProbability,
    confidence,
    stakeUnits,
    result,
    profitUnits: Number.isFinite(profitUnits) ? profitUnits : Number(resultText)
  };
}

function normalizeTrackedRow(raw, rowNumber = 0) {
  const odds = Number(raw.odds);
  const modelProbability = Number(raw.probability ?? raw.prob ?? raw.modelprobability ?? raw.modelProbability ?? raw.model);
  const confidence = Number(raw.confidence);
  const stakeUnits = Number(raw.stake ?? raw.units ?? raw.stakeUnits ?? 0.5);
  const status = String(raw.status ?? raw.result ?? "Open").trim();
  const normalizedStatus = ["open", "win", "loss", "push"].includes(status.toLowerCase())
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "Open";

  if (!raw.date || !raw.pick || !Number.isFinite(odds) || !Number.isFinite(modelProbability)) {
    throw new Error(`Tracker row ${rowNumber} is missing date, pick, odds, or probability.`);
  }

  if (!Number.isFinite(confidence) || !Number.isFinite(stakeUnits) || stakeUnits <= 0) {
    throw new Error(`Tracker row ${rowNumber} needs numeric confidence and stake values.`);
  }

  return {
    id: raw.id || `tracked-${Date.now()}-${rowNumber}-${Math.random().toString(16).slice(2)}`,
    date: raw.date,
    sport: raw.sport || "NBA",
    league: raw.league || "Custom",
    betType: raw.bettype || raw.betType || raw.type || "Total",
    pick: raw.pick,
    odds,
    modelProbability,
    confidence,
    risk: raw.risk || "Medium",
    stakeUnits,
    status: normalizedStatus
  };
}

function parseTrackerCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Paste at least one tracker row.");
  }

  const defaultHeaders = [
    "date",
    "sport",
    "league",
    "type",
    "pick",
    "odds",
    "probability",
    "confidence",
    "stake",
    "status"
  ];
  const firstRow = splitCsvLine(lines[0]).map((value) => value.toLowerCase());
  const hasHeader =
    firstRow.includes("date") &&
    firstRow.some((value) => ["odds", "probability", "prob", "modelprobability"].includes(value));
  const headers = hasHeader ? firstRow : defaultHeaders;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line, rowIndex) => {
      const values = splitCsvLine(line);
      const raw = headers.reduce((acc, header, index) => {
        acc[header] = values[index] ?? "";
        return acc;
      }, {});
      return normalizeTrackedRow(raw, rowIndex + 1);
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function trackerCsv() {
  const headers = [
    "date",
    "sport",
    "league",
    "type",
    "pick",
    "odds",
    "probability",
    "confidence",
    "stake",
    "status"
  ];
  const rows = state.tracker.bets.map((bet) => [
    bet.date,
    bet.sport,
    bet.league,
    bet.betType,
    bet.pick,
    bet.odds,
    bet.modelProbability,
    bet.confidence,
    bet.stakeUnits,
    bet.status
  ]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function trackerProfit(row) {
  if (row.status === "Win") return row.stakeUnits * (americanToDecimal(row.odds) - 1);
  if (row.status === "Loss") return -row.stakeUnits;
  return 0;
}

function trackerBacktestRows() {
  return state.tracker.bets
    .filter((bet) => bet.status !== "Open")
    .map((bet) => ({
      date: bet.date,
      sport: bet.sport,
      league: bet.league,
      betType: bet.betType,
      pick: bet.pick,
      odds: bet.odds,
      modelProbability: bet.modelProbability,
      confidence: bet.confidence,
      stakeUnits: bet.stakeUnits,
      result: bet.status.toLowerCase()
    }));
}

function performanceLedger() {
  const tracked = state.tracker.bets
    .filter((bet) => bet.status !== "Open")
    .map((bet) => ({
      date: bet.date,
      type: bet.betType,
      confidence: bet.confidence,
      units: bet.stakeUnits,
      result: trackerProfit(bet)
    }));
  return tracked.length ? tracked : DATA.betLedger;
}

function trackedBetFromForm() {
  return normalizeTrackedRow({
    id: `tracked-${Date.now()}`,
    date: document.getElementById("trackerDate").value,
    sport: document.getElementById("trackerSport").value,
    league: document.getElementById("trackerLeague").value,
    betType: document.getElementById("trackerBetType").value,
    pick: document.getElementById("trackerPick").value.trim(),
    odds: document.getElementById("trackerOdds").value,
    probability: document.getElementById("trackerProbability").value,
    confidence: document.getElementById("trackerConfidence").value,
    risk: document.getElementById("trackerRisk").value,
    stake: document.getElementById("trackerStake").value,
    status: document.getElementById("trackerStatus").value
  });
}

function addTrackedBetFromForm() {
  const status = document.getElementById("trackerFormStatus");
  try {
    const bet = trackedBetFromForm();
    state.tracker.bets.push(bet);
    state.tracker.bets.sort((a, b) => a.date.localeCompare(b.date));
    status.textContent = `${bet.status} bet added`;
    resetTrackerForm({ keepContext: true });
    render();
  } catch (error) {
    status.textContent = error.message;
  }
}

function resetTrackerForm(options = {}) {
  const keep = options.keepContext;
  const date = keep ? document.getElementById("trackerDate").value : DATA.slateDate;
  const sport = keep ? document.getElementById("trackerSport").value : "NBA";
  const league = keep ? document.getElementById("trackerLeague").value : "NBA Playoffs";

  document.getElementById("trackerDate").value = date;
  document.getElementById("trackerSport").value = sport;
  document.getElementById("trackerLeague").value = league;
  document.getElementById("trackerBetType").value = "Total";
  document.getElementById("trackerPick").value = "";
  document.getElementById("trackerOdds").value = -110;
  document.getElementById("trackerProbability").value = 55;
  document.getElementById("trackerConfidence").value = 5.5;
  document.getElementById("trackerRisk").value = "Medium";
  document.getElementById("trackerStake").value = 0.5;
  document.getElementById("trackerStatus").value = "Open";
}

function handleTrackerAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const bet = state.tracker.bets.find((item) => item.id === button.dataset.id);
  if (!bet && button.dataset.action !== "delete") return;

  if (button.dataset.action === "delete") {
    state.tracker.bets = state.tracker.bets.filter((item) => item.id !== button.dataset.id);
  } else if (button.dataset.action === "open") {
    bet.status = "Open";
  } else if (["Win", "Loss", "Push"].includes(button.dataset.action)) {
    bet.status = button.dataset.action;
  }

  render();
}

function trackerMetrics() {
  const open = state.tracker.bets.filter((bet) => bet.status === "Open");
  const settled = state.tracker.bets.filter((bet) => bet.status !== "Open");
  const wins = settled.filter((bet) => bet.status === "Win").length;
  const losses = settled.filter((bet) => bet.status === "Loss").length;
  const pushes = settled.filter((bet) => bet.status === "Push").length;
  const decided = wins + losses;
  const openRisk = open.reduce((sum, bet) => sum + bet.stakeUnits, 0);
  const settledUnits = settled.reduce((sum, bet) => sum + trackerProfit(bet), 0);
  const totalStaked = settled.reduce((sum, bet) => sum + bet.stakeUnits, 0);
  const startingUnit = state.bankroll.starting * 0.01;

  return {
    open,
    settled,
    wins,
    losses,
    pushes,
    openRisk,
    settledUnits,
    totalStaked,
    hitRate: decided ? (wins / decided) * 100 : 0,
    roi: totalStaked ? (settledUnits / totalStaked) * 100 : 0,
    liveBankroll: state.bankroll.starting + settledUnits * startingUnit
  };
}

function backtestSourceRows() {
  if (state.backtest.customRows) return state.backtest.customRows;
  const tracked = trackerBacktestRows();
  return tracked.length ? tracked : DATA.backtestBets;
}

function backtestEdge(row) {
  return evPercent(row.modelProbability, row.odds);
}

function backtestStake(row) {
  const stake = Number(row.stakeUnits ?? row.units ?? 0);
  const maxUnit = Number(state.backtest.maxUnit || stake);
  return Math.max(0, Math.min(stake, maxUnit));
}

function backtestProfit(row) {
  const stake = backtestStake(row);
  const rawStake = Number(row.stakeUnits ?? row.units ?? stake);

  if (Number.isFinite(row.profitUnits)) {
    return rawStake > 0 ? row.profitUnits * (stake / rawStake) : row.profitUnits;
  }

  if (row.result === "win") return stake * (americanToDecimal(row.odds) - 1);
  if (row.result === "loss") return -stake;
  return 0;
}

function filteredBacktestRows() {
  return backtestSourceRows()
    .filter((row) => {
      const edge = backtestEdge(row);
      const type = row.betType || row.type;
      if (state.backtest.sport !== "all" && row.sport !== state.backtest.sport) return false;
      if (row.confidence < state.backtest.minConfidence) return false;
      if (edge < state.backtest.minEdge) return false;
      if (state.backtest.strategy === "all-positive" && edge <= 0) return false;
      if (state.backtest.strategy === "totals" && type !== "Total") return false;
      if (state.backtest.strategy === "props" && type !== "Player prop") return false;
      if (state.backtest.strategy === "high-confidence" && row.confidence < 7) return false;
      return true;
    })
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

function backtestMetrics(rows) {
  let runningUnits = 0;
  let peakUnits = 0;
  let maxDrawdown = 0;
  let totalStaked = 0;
  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let edgeTotal = 0;
  let oddsTotal = 0;

  const timeline = rows.map((row) => {
    const profit = backtestProfit(row);
    const stake = backtestStake(row);
    const edge = backtestEdge(row);
    const outcome = row.result === "settled" ? (profit > 0 ? "win" : profit < 0 ? "loss" : "push") : row.result;

    runningUnits += profit;
    peakUnits = Math.max(peakUnits, runningUnits);
    maxDrawdown = Math.min(maxDrawdown, runningUnits - peakUnits);
    totalStaked += stake;
    edgeTotal += edge;
    oddsTotal += row.odds;

    if (outcome === "win") wins += 1;
    if (outcome === "loss") losses += 1;
    if (outcome === "push") pushes += 1;

    return {
      ...row,
      edge,
      stake,
      profit,
      outcome,
      runningUnits
    };
  });

  const decided = wins + losses;
  const units = timeline.reduce((sum, row) => sum + row.profit, 0);

  return {
    timeline,
    count: rows.length,
    wins,
    losses,
    pushes,
    totalStaked,
    units,
    roi: totalStaked ? (units / totalStaked) * 100 : 0,
    hitRate: decided ? (wins / decided) * 100 : 0,
    avgEdge: rows.length ? edgeTotal / rows.length : 0,
    avgOdds: rows.length ? oddsTotal / rows.length : 0,
    maxDrawdown
  };
}

function filteredGames() {
  return DATA.games.filter((game) => {
    if (state.filters.date && game.date < state.filters.date) return false;
    if (state.filters.sport !== "all" && game.sport !== state.filters.sport) return false;
    if (state.filters.league !== "all" && game.league !== state.filters.league) return false;
    if (state.filters.team !== "all" && ![game.away, game.home].includes(state.filters.team)) {
      return false;
    }
    if (state.filters.location === "home" && state.filters.team !== "all" && game.home !== state.filters.team) {
      return false;
    }
    if (state.filters.location === "away" && state.filters.team !== "all" && game.away !== state.filters.team) {
      return false;
    }
    return true;
  });
}

function filteredPredictions() {
  const games = new Set(filteredGames().map((game) => game.id));
  return DATA.predictions.filter((prediction) => {
    if (!games.has(prediction.gameId)) return false;
    if (state.filters.betType !== "all" && prediction.type !== state.filters.betType) return false;
    if (state.filters.risk !== "all" && prediction.risk !== state.filters.risk) return false;
    if (prediction.confidence < state.filters.confidence) return false;
    if (state.filters.positiveEvOnly && evPercent(prediction.modelProbability, prediction.odds) <= 0) return false;
    return true;
  });
}

function filteredPlayers() {
  const games = new Set(filteredGames().map((game) => game.id));
  return DATA.players.filter((player) => {
    if (!games.has(player.gameId)) return false;
    if (state.filters.team !== "all" && player.team !== state.filters.team) return false;
    if (state.filters.player !== "all" && player.id !== state.filters.player) return false;
    if (state.filters.injury !== "all") {
      const status = player.status === "Out" ? "out" : player.status === "Available" ? "available" : "monitor";
      if (status !== state.filters.injury) return false;
    }
    return true;
  });
}

function renderSummary() {
  const predictions = DATA.predictions.filter(recommendationIsPlayable);
  const totalUnits = predictions.reduce((sum, prediction) => sum + adjustedUnits(prediction.units), 0);
  const highestEdge = Math.max(...DATA.predictions.map((prediction) => evPercent(prediction.modelProbability, prediction.odds)));
  const unit = state.bankroll.current * 0.01;

  document.getElementById("gameCount").textContent = filteredGames().length;
  document.getElementById("recommendedCount").textContent = predictions.length;
  document.getElementById("totalExposure").textContent = `${totalUnits.toFixed(2)}u`;
  document.getElementById("highestEdge").textContent = pct(highestEdge, 1);
  document.getElementById("sidebarBankroll").textContent = money(state.bankroll.current);
  document.getElementById("unitValue").textContent = money(unit);
  document.getElementById("asOfStamp").textContent = `Data as of ${DATA.asOf}`;
}

function renderGames() {
  const container = document.getElementById("gameCards");
  const games = filteredGames();

  if (!games.length) {
    container.innerHTML = `<div class="empty-state">No games match the active filters.</div>`;
    return;
  }

  container.innerHTML = games
    .map((game) => {
      const away = getTeam(game.away);
      const home = getTeam(game.home);
      const bestBet = getPrediction(game.bestBetId);
      return `
        <article class="game-card">
          <div class="game-card-header">
            <div class="matchup-title">
              <span>${away.abbr} at ${home.abbr}</span>
              <span class="tag">${game.sport}</span>
              <span class="tag">${game.league}</span>
              <span class="tag">${formatDateLabel(game.date)}</span>
              <span class="tag">${game.time}</span>
            </div>
            <div class="team-logo-row">
              <img src="${away.logo}" alt="${away.name} logo" />
              <img src="${home.logo}" alt="${home.name} logo" />
            </div>
          </div>
          <div class="game-card-body">
            <div class="team-lines">
              ${teamLine(away, game.model.awayWin)}
              <div class="prob-bar" aria-label="${away.name} win probability">
                <div class="prob-fill" style="width:${game.model.awayWin}%"></div>
              </div>
              ${game.model.draw !== undefined ? drawLine(game.model.draw) : ""}
              ${teamLine(home, game.model.homeWin)}
              <div class="prob-bar" aria-label="${home.name} win probability">
                <div class="prob-fill" style="width:${game.model.homeWin}%"></div>
              </div>
            </div>
            <div class="metric-grid">
              ${marketMetrics(game, away, home)}
            </div>
            <div class="tag-row">
              ${game.matchup.map((item) => `<span class="tag">${item}</span>`).join("")}
            </div>
            ${bestBetBlock(game, bestBet)}
          </div>
        </article>
      `;
    })
    .join("");
}

function formatDateLabel(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function marketMetrics(game, away, home) {
  if (!game.currentOdds) {
    return `
      <div class="metric"><span class="metric-label">Market</span><strong>${game.marketStatus || "Pending"}</strong></div>
      <div class="metric"><span class="metric-label">Side</span><strong>${game.model.spreadLean}</strong></div>
      <div class="metric"><span class="metric-label">Total</span><strong>${game.model.totalLean}</strong></div>
      <div class="metric"><span class="metric-label">Model score</span><strong>${game.model.score}</strong></div>
    `;
  }

  if (game.sport === "Soccer") {
    return `
      <div class="metric"><span class="metric-label">3-way ML</span><strong>${home.abbr} ${formatOdds(game.currentOdds.homeMl)} / Draw ${formatOdds(game.currentOdds.drawMl)} / ${away.abbr} ${formatOdds(game.currentOdds.awayMl)}</strong></div>
      <div class="metric"><span class="metric-label">Total goals</span><strong>${game.currentOdds.total.line} O ${formatOdds(game.currentOdds.total.overOdds)} / U ${formatOdds(game.currentOdds.total.underOdds)}</strong></div>
      <div class="metric"><span class="metric-label">Model lean</span><strong>${game.model.totalLean}</strong></div>
      <div class="metric"><span class="metric-label">Model score</span><strong>${game.model.score}</strong></div>
    `;
  }

  return `
    <div class="metric"><span class="metric-label">Moneyline</span><strong>${away.abbr} ${formatOdds(game.currentOdds.awayMl)} / ${home.abbr} ${formatOdds(game.currentOdds.homeMl)}</strong></div>
    <div class="metric"><span class="metric-label">Spread</span><strong>${away.abbr} +${game.currentOdds.awaySpread.line} / ${home.abbr} ${game.currentOdds.homeSpread.line}</strong></div>
    <div class="metric"><span class="metric-label">Total</span><strong>${game.currentOdds.total.line}</strong></div>
    <div class="metric"><span class="metric-label">Model score</span><strong>${game.model.score}</strong></div>
  `;
}

function bestBetBlock(game, bestBet) {
  if (!bestBet) {
    return `
      <div class="best-bet-block pending">
        <span class="metric-label">Best bet suggestion</span>
        <strong>No bet yet</strong>
        <span class="reason-text">${game.marketStatus || "Future market pending"}: wait for odds, injury/team news, and line movement before risking bankroll.</span>
      </div>
    `;
  }

  const ev = evPercent(bestBet.modelProbability, bestBet.odds);
  return `
    <div class="best-bet-block">
      <span class="metric-label">Best bet suggestion</span>
      <strong>${bestBet.pick} (${formatOdds(bestBet.odds)})</strong>
      <span class="reason-text">${pct(bestBet.modelProbability)} probability, ${pct(ev)} EV, ${bestBet.confidence}/10 confidence, ${adjustedUnits(bestBet.units).toFixed(2)}u.</span>
    </div>
  `;
}

function drawLine(probability) {
  return `
    <div class="team-line draw-line">
      <div class="draw-icon">X</div>
      <div>
        <strong>Draw</strong>
        <small>Soccer three-way market outcome</small>
      </div>
      <span class="win-chip">${probability}%</span>
    </div>
    <div class="prob-bar" aria-label="Draw probability">
      <div class="prob-fill draw-fill" style="width:${probability}%"></div>
    </div>
  `;
}

function teamLine(team, probability) {
  return `
    <div class="team-line">
      <img src="${team.logo}" alt="${team.name} logo" />
      <div>
        <strong>${team.name}</strong>
        <small>${team.record} | ${team.last10} L10 | ${team.homeAway}</small>
      </div>
      <span class="win-chip">${probability}%</span>
    </div>
  `;
}

function renderPlayers() {
  const container = document.getElementById("playerCards");
  const players = filteredPlayers();

  if (!players.length) {
    container.innerHTML = `<div class="empty-state">No players match the active filters.</div>`;
    return;
  }

  container.innerHTML = players
    .map((player) => {
      const team = getTeam(player.team);
      const game = getGame(player.gameId);
      const labels =
        game && game.sport === "Soccer"
          ? { a: "G/90", b: "SH", c: "CH" }
          : { a: "PTS", b: "REB", c: "AST" };
      return `
        <article class="player-card">
          <div class="player-head">
            <div class="player-name">
              <strong>${player.name}</strong>
              <span>${team.abbr} ${player.position}</span>
            </div>
            <img src="${team.logo}" alt="${team.name} logo" />
          </div>
          <div class="stat-row">
            <div><span>${labels.a}</span><strong>${player.points}</strong></div>
            <div><span>${labels.b}</span><strong>${player.rebounds}</strong></div>
            <div><span>${labels.c}</span><strong>${player.assists}</strong></div>
          </div>
          <div class="player-meta">
            <div><span class="metric-label">Last 5</span><strong>${player.last5.points}/${player.last5.rebounds}/${player.last5.assists}</strong></div>
            <div><span class="metric-label">Usage</span><strong>${player.usage}%</strong></div>
            <div><span class="metric-label">Splits</span><strong>${player.splits}</strong></div>
            <div><span class="metric-label">Matchup</span><strong>${player.matchup}</strong></div>
          </div>
          <div class="tag-row">
            <span class="status-pill ${statusClass(player.status)}">${player.status}</span>
            <span class="tag">${player.consistency} consistency</span>
            <span class="tag">${player.advanced}</span>
          </div>
          <div class="prop-call">
            <span class="metric-label">Prop prediction</span>
            <strong>${player.prop}: ${player.propPick}</strong>
            <span class="reason-text">${player.propReason}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPredictions() {
  const container = document.getElementById("predictionRows");
  const predictions = filteredPredictions();

  if (!predictions.length) {
    container.innerHTML = `<tr><td colspan="8">No predictions match the active filters.</td></tr>`;
    return;
  }

  container.innerHTML = predictions
    .map((prediction) => {
      const ev = evPercent(prediction.modelProbability, prediction.odds);
      const unit = adjustedUnits(prediction.units);
      return `
        <tr>
          <td><strong>${prediction.pick}</strong><span class="tag">${prediction.type}</span></td>
          <td>${formatOdds(prediction.odds)}</td>
          <td>${pct(prediction.modelProbability)}<br /><span class="reason-text">Implied ${pct(impliedProbability(prediction.odds) * 100)}</span></td>
          <td><span class="ev-pill ${evClass(ev)}">${pct(ev)}</span></td>
          <td>${prediction.confidence}/10</td>
          <td><span class="risk-pill ${riskClass(prediction.risk)}">${prediction.risk}</span></td>
          <td>${unit ? `${unit.toFixed(2)}u` : "No bet"}</td>
          <td>${prediction.reason}</td>
        </tr>
      `;
    })
    .join("");
}

function renderHistory() {
  const container = document.getElementById("historyCards");
  container.innerHTML = DATA.history
    .map(
      (block) => `
        <article class="history-card">
          <h4>${block.title}</h4>
          <ul>
            ${block.items.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderBankroll() {
  const container = document.getElementById("bankrollStats");
  const unitValue = state.bankroll.current * 0.01;
  const playable = DATA.predictions.filter(recommendationIsPlayable);
  const adjusted = playable.map((prediction) => ({ ...prediction, adjustedUnits: adjustedUnits(prediction.units) }));
  const totalUnits = adjusted.reduce((sum, prediction) => sum + prediction.adjustedUnits, 0);
  const totalRisk = totalUnits * unitValue;
  const roi = ((state.bankroll.current - state.bankroll.starting) / state.bankroll.starting) * 100 || 0;
  const ledger = performanceLedger();
  const ledgerWins = ledger.filter((bet) => bet.result > 0).length;
  const ledgerLosses = ledger.filter((bet) => bet.result < 0).length;
  const ledgerWinRate = ledgerWins + ledgerLosses ? (ledgerWins / (ledgerWins + ledgerLosses)) * 100 : 0;
  const unitsWon = ledger.reduce((sum, bet) => sum + bet.result, 0);
  const exposureCap = state.bankroll.current * (state.bankroll.maxExposure / 100);
  const streakNote =
    state.bankroll.lossStreak >= 7
      ? "Pause betting"
      : state.bankroll.lossStreak >= 3
        ? "Half-size mode"
        : "Normal sizing";

  container.innerHTML = [
    ["1 unit", money(unitValue)],
    ["Today exposure", `${totalUnits.toFixed(2)}u / ${money(totalRisk)}`],
    ["Exposure cap", `${state.bankroll.maxExposure}% / ${money(exposureCap)}`],
    ["ROI", pct(roi)],
    ["Tracked win rate", pct(ledgerWinRate)],
    ["Units won/lost", `${unitsWon >= 0 ? "+" : ""}${unitsWon.toFixed(2)}u`],
    ["Sizing mode", streakNote],
    ["Best type", "Player props"],
    ["Worst type", "Moneyline juice"]
  ]
    .map(
      ([label, value]) => `
        <div class="bankroll-stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

function renderTracker() {
  const stats = trackerMetrics();
  const unitValue = state.bankroll.current * 0.01;
  const statsContainer = document.getElementById("trackerStats");
  const openRows = document.getElementById("openTrackerRows");
  const settledRows = document.getElementById("settledTrackerRows");

  statsContainer.innerHTML = [
    ["Tracked bets", state.tracker.bets.length],
    ["Open exposure", `${stats.openRisk.toFixed(2)}u / ${money(stats.openRisk * unitValue)}`],
    ["Settled record", `${stats.wins}-${stats.losses}-${stats.pushes}`],
    ["Hit rate", pct(stats.hitRate)],
    ["Units won/lost", `${stats.settledUnits >= 0 ? "+" : ""}${stats.settledUnits.toFixed(2)}u`],
    ["Tracker ROI", pct(stats.roi)],
    ["Live bankroll", money(stats.liveBankroll)],
    ["Backtest source", stats.settled.length ? "Tracked ledger" : "Sample ledger"],
    ["Storage", "Auto-saved"]
  ]
    .map(
      ([label, value]) => `
        <div class="bankroll-stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");

  openRows.innerHTML = stats.open.length
    ? stats.open
        .map((bet) => {
          const edge = evPercent(bet.modelProbability, bet.odds);
          return `
            <tr>
              <td>${bet.date}</td>
              <td><strong>${bet.pick}</strong><span class="tag">${bet.sport} / ${bet.betType}</span></td>
              <td>${formatOdds(bet.odds)}</td>
              <td>${pct(bet.modelProbability)}<br /><span class="reason-text">${bet.confidence}/10 confidence</span></td>
              <td>${bet.stakeUnits.toFixed(2)}u</td>
              <td><span class="ev-pill ${evClass(edge)}">${pct(edge)}</span></td>
              <td>
                <div class="row-actions">
                  <button type="button" data-action="Win" data-id="${bet.id}">Win</button>
                  <button type="button" data-action="Loss" data-id="${bet.id}">Loss</button>
                  <button type="button" data-action="Push" data-id="${bet.id}">Push</button>
                  <button type="button" data-action="delete" data-id="${bet.id}">Delete</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7">No open bets yet. Add a bet above to start tracking exposure.</td></tr>`;

  settledRows.innerHTML = stats.settled.length
    ? stats.settled
        .slice()
        .reverse()
        .map((bet) => {
          const profit = trackerProfit(bet);
          return `
            <tr>
              <td>${bet.date}</td>
              <td><strong>${bet.pick}</strong><span class="tag">${bet.sport} / ${bet.betType}</span></td>
              <td>${formatOdds(bet.odds)}</td>
              <td>${bet.status}</td>
              <td><span class="ev-pill ${evClass(profit)}">${profit >= 0 ? "+" : ""}${profit.toFixed(2)}u</span></td>
              <td>${bet.confidence}/10</td>
              <td>
                <div class="row-actions">
                  <button type="button" data-action="open" data-id="${bet.id}">Reopen</button>
                  <button type="button" data-action="delete" data-id="${bet.id}">Delete</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7">No settled bets yet. Settled bets will feed the bankroll and backtest dashboards.</td></tr>`;
}

function renderBacktest() {
  const rows = filteredBacktestRows();
  const metrics = backtestMetrics(rows);
  const statsContainer = document.getElementById("backtestStats");
  const table = document.getElementById("backtestRows");
  const verdict = document.getElementById("backtestVerdict");
  const unitValue = state.backtest.bankroll * 0.01;
  const sourceLabel = state.backtest.customRows
    ? "Custom CSV"
    : trackerBacktestRows().length
      ? "Tracked ledger"
      : "Sample ledger";

  statsContainer.innerHTML = [
    ["Source", sourceLabel],
    ["Closed bets", metrics.count],
    ["Record", `${metrics.wins}-${metrics.losses}-${metrics.pushes}`],
    ["Hit rate", pct(metrics.hitRate)],
    ["Units", `${metrics.units >= 0 ? "+" : ""}${metrics.units.toFixed(2)}u`],
    ["ROI", pct(metrics.roi)],
    ["Max drawdown", `${metrics.maxDrawdown.toFixed(2)}u`],
    ["Avg edge", pct(metrics.avgEdge)],
    ["Dollar P/L", money(metrics.units * unitValue)]
  ]
    .map(
      ([label, value]) => `
        <div class="bankroll-stat">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");

  if (!rows.length) {
    table.innerHTML = `<tr><td colspan="8">No closed bets match this backtest setup.</td></tr>`;
    verdict.className = "verdict-card neutral";
    verdict.innerHTML = `
      <h4>No Qualified Sample</h4>
      <p>Lower the confidence or EV filter, switch strategy type, or paste a larger historical ledger.</p>
    `;
    return;
  }

  const verdictType =
    metrics.count < 20
      ? "neutral"
      : metrics.roi > 3 && metrics.avgEdge > 1.5 && metrics.maxDrawdown > -4
        ? "positive"
        : metrics.roi < 0 || metrics.maxDrawdown <= -5
          ? "negative"
          : "neutral";
  const verdictTitle =
    verdictType === "positive"
      ? "Pass With Caution"
      : verdictType === "negative"
        ? "Do Not Scale Yet"
        : "More Sample Needed";
  const verdictReason =
    verdictType === "positive"
      ? "This setup is profitable in the closed sample with controlled drawdown, but it still needs ongoing tracking before increasing unit size."
      : verdictType === "negative"
        ? "The filtered strategy failed the risk screen. Reduce exposure, inspect losing bet types, and avoid using it for live staking."
        : "The result is directionally useful, but the sample is too small or too close to breakeven for a confident strategy verdict.";

  verdict.className = `verdict-card ${verdictType}`;
  verdict.innerHTML = `
    <h4>${verdictTitle}</h4>
    <p>${verdictReason}</p>
    <div class="tag-row">
      <span class="tag">${metrics.count} bets</span>
      <span class="tag">${pct(metrics.roi)} ROI</span>
      <span class="tag">${metrics.maxDrawdown.toFixed(2)}u max DD</span>
      <span class="tag">${pct(metrics.avgEdge)} avg edge</span>
    </div>
  `;

  table.innerHTML = metrics.timeline
    .map(
      (row) => `
        <tr>
          <td>${row.date}</td>
          <td><strong>${row.pick}</strong><span class="tag">${row.sport} / ${row.betType}</span></td>
          <td>${formatOdds(row.odds)}</td>
          <td>${pct(row.modelProbability)}<br /><span class="reason-text">${row.confidence}/10 confidence</span></td>
          <td><span class="ev-pill ${evClass(row.edge)}">${pct(row.edge)}</span></td>
          <td>${row.stake.toFixed(2)}u</td>
          <td>${row.outcome}</td>
          <td><span class="ev-pill ${evClass(row.profit)}">${row.profit >= 0 ? "+" : ""}${row.profit.toFixed(2)}u</span></td>
        </tr>
      `
    )
    .join("");
}

function renderFinalPicks() {
  const unitValue = state.bankroll.current * 0.01;
  const bestContainer = document.getElementById("bestBets");
  const avoidContainer = document.getElementById("avoidBets");
  const playable = DATA.predictions
    .filter(recommendationIsPlayable)
    .sort((a, b) => evPercent(b.modelProbability, b.odds) - evPercent(a.modelProbability, a.odds));
  const avoids = DATA.predictions
    .filter((prediction) => prediction.recommendation === "Avoid")
    .sort((a, b) => {
      const aPriority = a.type === "Moneyline" ? 0 : a.type === "Spread" ? 1 : 2;
      const bPriority = b.type === "Moneyline" ? 0 : b.type === "Spread" ? 1 : 2;
      return aPriority - bPriority;
    })
    .slice(0, 5);

  bestContainer.innerHTML = playable.length
    ? playable
        .map((prediction) => {
          const ev = evPercent(prediction.modelProbability, prediction.odds);
          const units = adjustedUnits(prediction.units);
          return `
            <article class="pick-item">
              <div class="pick-item-header">
                <strong>${prediction.pick}</strong>
                <span class="ev-pill ${evClass(ev)}">${pct(ev)} EV</span>
              </div>
              <div class="pick-meta">
                <span class="tag">${formatOdds(prediction.odds)}</span>
                <span class="tag">${prediction.confidence}/10 confidence</span>
                <span class="risk-pill ${riskClass(prediction.risk)}">${prediction.risk}</span>
                <span class="tag">${units.toFixed(2)}u / ${money(units * unitValue)}</span>
              </div>
              <span class="reason-text">${prediction.reason}</span>
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state">No positive-EV bets clear the sizing rules. No bets recommended.</div>`;

  avoidContainer.innerHTML = avoids
    .map((prediction) => {
      const ev = evPercent(prediction.modelProbability, prediction.odds);
      return `
        <article class="pick-item">
          <div class="pick-item-header">
            <strong>${prediction.pick}</strong>
            <span class="ev-pill ${evClass(ev)}">${pct(ev)} EV</span>
          </div>
          <div class="pick-meta">
            <span class="tag">${formatOdds(prediction.odds)}</span>
            <span class="risk-pill ${riskClass(prediction.risk)}">${prediction.risk}</span>
          </div>
          <span class="reason-text">${prediction.reason}</span>
        </article>
      `;
    })
    .join("");
}

function chartOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { boxWidth: 10, usePointStyle: true } },
      tooltip: { intersect: false, mode: "index" }
    },
    scales: {
      x: { grid: { color: "rgba(148, 163, 184, 0.18)" } },
      y: { grid: { color: "rgba(148, 163, 184, 0.18)" } }
    },
    ...extra
  };
}

function replaceChart(id, config) {
  if (state.charts[id]) state.charts[id].destroy();
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  state.charts[id] = new Chart(canvas, config);
}

function renderCharts() {
  renderWinProbChart();
  renderTeamFormChart();
  renderPlayerTrendCharts();
  renderOddsMovementChart();
  renderConfidenceChart();
  renderProfitChart();
  renderBetTypeChart();
  renderUnitChart();
  renderBacktestCharts();
}

function renderWinProbChart() {
  const games = filteredGames();
  replaceChart("winProbChart", {
    type: "bar",
    data: {
      labels: games.map((game) => `${game.away} at ${game.home}`),
      datasets: [
        {
          label: "Away win %",
          data: games.map((game) => game.model.awayWin),
          backgroundColor: "#2563eb"
        },
        {
          label: "Home win %",
          data: games.map((game) => game.model.homeWin),
          backgroundColor: "#0f766e"
        }
      ]
    },
    options: chartOptions({ scales: { y: { min: 0, max: 100 } } })
  });
}

function renderTeamFormChart() {
  const teams = [...new Set(filteredGames().flatMap((game) => [game.away, game.home]))].slice(0, 8);
  replaceChart("teamFormChart", {
    type: "line",
    data: {
      labels: ["G-10", "G-9", "G-8", "G-7", "G-6", "G-5", "G-4", "G-3", "G-2", "G-1"],
      datasets: teams.map((team, index) => ({
        label: team,
        data: getTeam(team).form,
        borderColor: ["#0f766e", "#2563eb", "#b45309", "#7c3aed"][index % 4],
        backgroundColor: "transparent",
        tension: 0.35
      }))
    },
    options: chartOptions()
  });
}

function renderPlayerTrendCharts() {
  const player = filteredPlayers()[0] || DATA.players[0];
  document.getElementById("playerTrendName").textContent = player.name;
  replaceChart("playerTrendChart", {
    type: "line",
    data: {
      labels: ["G-5", "G-4", "G-3", "G-2", "G-1"],
      datasets: [
        { label: "Points", data: player.trend.points, borderColor: "#2563eb", tension: 0.35 },
        { label: "Rebounds", data: player.trend.rebounds, borderColor: "#0f766e", tension: 0.35 },
        { label: "Assists", data: player.trend.assists, borderColor: "#b45309", tension: 0.35 }
      ]
    },
    options: chartOptions()
  });

  replaceChart("minutesTrendChart", {
    type: "bar",
    data: {
      labels: ["G-5", "G-4", "G-3", "G-2", "G-1"],
      datasets: [{ label: player.name, data: player.minutes, backgroundColor: "#0f766e" }]
    },
    options: chartOptions()
  });
}

function renderOddsMovementChart() {
  const games = filteredGames().filter((game) => game.currentOdds);
  replaceChart("oddsMovementChart", {
    type: "bar",
    data: {
      labels: games.map((game) => `${game.away} at ${game.home}`),
      datasets: [
        {
          label: "Opening total",
          data: games.map((game) => game.openingOdds?.total?.line ?? null),
          backgroundColor: "#94a3b8"
        },
        {
          label: "Current total",
          data: games.map((game) => game.currentOdds?.total?.line ?? null),
          backgroundColor: "#0f766e"
        },
        {
          label: "Home win implied %",
          data: games.map((game) => Number((impliedProbability(game.currentOdds.homeMl) * 100).toFixed(1))),
          backgroundColor: "#2563eb",
          yAxisID: "y1"
        }
      ]
    },
    options: chartOptions({
      scales: {
        y: { position: "left", beginAtZero: true },
        y1: { position: "right", min: 0, max: 100, grid: { drawOnChartArea: false } }
      }
    })
  });
}

function renderConfidenceChart() {
  const ledger = performanceLedger();
  replaceChart("confidenceChart", {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Past tracked bets",
          data: ledger.map((bet) => ({ x: bet.confidence, y: bet.result })),
          backgroundColor: ledger.map((bet) => (bet.result >= 0 ? "#15803d" : "#b91c1c"))
        }
      ]
    },
    options: chartOptions({
      scales: {
        x: { min: 1, max: 10, title: { display: true, text: "Confidence" } },
        y: { title: { display: true, text: "Units won/lost" } }
      }
    })
  });
}

function renderProfitChart() {
  let running = 0;
  const ledger = performanceLedger();
  replaceChart("profitChart", {
    type: "line",
    data: {
      labels: ledger.map((bet) => bet.date),
      datasets: [
        {
          label: "Cumulative units",
          data: ledger.map((bet) => {
            running += bet.result;
            return Number(running.toFixed(2));
          }),
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.12)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: chartOptions()
  });
}

function renderBetTypeChart() {
  const totals = performanceLedger().reduce((acc, bet) => {
    acc[bet.type] = (acc[bet.type] || 0) + bet.result;
    return acc;
  }, {});
  replaceChart("betTypeChart", {
    type: "bar",
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          label: "Units",
          data: Object.values(totals).map((value) => Number(value.toFixed(2))),
          backgroundColor: Object.values(totals).map((value) => (value >= 0 ? "#15803d" : "#b91c1c"))
        }
      ]
    },
    options: chartOptions()
  });
}

function renderUnitChart() {
  const playable = DATA.predictions.filter(recommendationIsPlayable);
  replaceChart("unitChart", {
    type: "doughnut",
    data: {
      labels: playable.map((prediction) => prediction.pick),
      datasets: [
        {
          label: "Units",
          data: playable.map((prediction) => adjustedUnits(prediction.units)),
          backgroundColor: ["#0f766e", "#2563eb", "#b45309", "#7c3aed"]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true } }
      }
    }
  });
}

function renderBacktestCharts() {
  const metrics = backtestMetrics(filteredBacktestRows());

  replaceChart("backtestEquityChart", {
    type: "line",
    data: {
      labels: metrics.timeline.map((row) => row.date),
      datasets: [
        {
          label: "Cumulative units",
          data: metrics.timeline.map((row) => Number(row.runningUnits.toFixed(2))),
          borderColor: "#0f766e",
          backgroundColor: "rgba(15, 118, 110, 0.14)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: chartOptions()
  });

  const typeTotals = metrics.timeline.reduce((acc, row) => {
    acc[row.betType] = (acc[row.betType] || 0) + row.profit;
    return acc;
  }, {});

  replaceChart("backtestTypeChart", {
    type: "bar",
    data: {
      labels: Object.keys(typeTotals),
      datasets: [
        {
          label: "Units",
          data: Object.values(typeTotals).map((value) => Number(value.toFixed(2))),
          backgroundColor: Object.values(typeTotals).map((value) => (value >= 0 ? "#15803d" : "#b91c1c"))
        }
      ]
    },
    options: chartOptions()
  });

  const bins = [
    { label: "45-50", min: 45, max: 50 },
    { label: "50-55", min: 50, max: 55 },
    { label: "55-60", min: 55, max: 60 },
    { label: "60-65", min: 60, max: 65 },
    { label: "65+", min: 65, max: 101 }
  ];
  const calibration = bins.map((bin) => {
    const rows = metrics.timeline.filter(
      (row) => row.modelProbability >= bin.min && row.modelProbability < bin.max && row.outcome !== "push"
    );
    const wins = rows.filter((row) => row.outcome === "win").length;
    return {
      label: bin.label,
      actual: rows.length ? (wins / rows.length) * 100 : null,
      model: rows.length
        ? rows.reduce((sum, row) => sum + row.modelProbability, 0) / rows.length
        : null
    };
  });

  replaceChart("backtestCalibrationChart", {
    type: "bar",
    data: {
      labels: calibration.map((bucket) => bucket.label),
      datasets: [
        {
          label: "Actual hit rate",
          data: calibration.map((bucket) => (bucket.actual === null ? null : Number(bucket.actual.toFixed(1)))),
          backgroundColor: "#0f766e"
        },
        {
          label: "Avg model probability",
          data: calibration.map((bucket) => (bucket.model === null ? null : Number(bucket.model.toFixed(1)))),
          backgroundColor: "#2563eb"
        }
      ]
    },
    options: chartOptions({ scales: { y: { min: 0, max: 100 } } })
  });
}

function render() {
  renderSummary();
  renderGames();
  renderPlayers();
  renderPredictions();
  renderHistory();
  renderBankroll();
  renderTracker();
  renderBacktest();
  renderFinalPicks();
  renderCharts();
  persistDashboard();
  if (window.lucide) window.lucide.createIcons();
}

loadSavedState();
hydrateFilters();
bindEvents();
syncFilterControls();
syncBankrollControls();
syncBacktestControls();
render();
activateTab(window.location.hash.replace("#", "") || "mainDashboard");
window.addEventListener("load", () => {
  activateTab(window.location.hash.replace("#", "") || "mainDashboard");
});
