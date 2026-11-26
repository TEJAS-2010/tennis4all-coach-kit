import type { BlockKind, Copy, Court, Level } from "@/lib/types";

export type DrillDef = {
  id: string;
  kind: BlockKind;
  courts: Court[] | "any";
  minAge: number;
  maxAge: number;
  levels: Level[] | "any";
  needsRacket: boolean;
  needsBall: boolean;
  needsCones: boolean;
  title: Copy;
  activity: Copy;
  cues: { en: [string, string]; hi: [string, string] };
  safety: Copy;
};

export const catalog: DrillDef[] = [
  {
    id: "warmup-walk",
    kind: "warmup",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Line walk and ready position", hi: "लाइन पर चलो और रेडी पोज़िशन" },
    activity: {
      en: "Walk the edge of the playing area in one direction. On the call of 'ready', stop with feet wider than the shoulders, knees soft, and hands in front. Rackets stay on the ground during the walk.",
      hi: "खेल की जगह के किनारे एक दिशा में चलो। 'रेडी' की आवाज़ पर रुक जाओ: पैर कंधों से चौड़े, घुटने नरम, हाथ आगे। चलते समय रैकेट ज़मीन पर रहें।",
    },
    cues: {
      en: ["Soft knees.", "Stop and look at the coach."],
      hi: ["घुटने नरम रखो।", "रुको और कोच की तरफ देखो।"],
    },
    safety: {
      en: "Walk in one direction so players do not meet head-on.",
      hi: "एक दिशा में चलो, ताकि खिलाड़ी आमने-सामने न टकराएँ।",
    },
  },
  {
    id: "warmup-ball",
    kind: "warmup",
    courts: "any",
    minAge: 4,
    maxAge: 11,
    levels: "any",
    needsRacket: false,
    needsBall: true,
    needsCones: false,
    title: { en: "Ball balanced on the hand", hi: "हाथ पर गेंद का संतुलन" },
    activity: {
      en: "Side-step along a line with a ball balanced on the open palm. If it drops, pick it up and start again. This is not a race.",
      hi: "लाइन पर साइड-स्टेप करो और खुली हथेली पर गेंद संतुलित रखो। गिरे तो उठाकर फिर शुरू करो। यह दौड़ नहीं है।",
    },
    cues: {
      en: ["Eyes on the ball.", "Small steps, quiet feet."],
      hi: ["आँखें गेंद पर।", "छोटे कदम, हल्के पैर।"],
    },
    safety: {
      en: "Give each player space to side-step without crossing a neighbour.",
      hi: "हर खिलाड़ी को इतनी जगह दो कि बगल वाले से न टकराए।",
    },
  },
  {
    id: "bounce-short",
    kind: "drill",
    courts: ["full", "half"],
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Bounce-hit into the short court", hi: "छोटे कोर्ट में बाउंस-हिट" },
    activity: {
      en: "Partners stand across the service boxes, or across a line on a half court. One player drops the ball and hits it after the bounce. The partner catches it and then takes a turn. Count balls that land in the box, not how hard they were hit.",
      hi: "जोड़ीदार सर्विस बॉक्स के आर-पार खड़े हों, या आधे कोर्ट पर एक लाइन के आर-पार। एक खिलाड़ी गेंद छोड़कर बाउंस के बाद मारे। साथी पकड़े, फिर बारी ले। गिनती उन गेंदों की हो जो बॉक्स में गिरें, जोर की नहीं।",
    },
    cues: {
      en: ["Drop, bounce, then hit.", "Side to the target."],
      hi: ["छोड़ो, बाउंस, फिर मारो।", "निशाने की तरफ करवट।"],
    },
    safety: {
      en: "The partner stands beside the flight of the ball, not in front of the racket.",
      hi: "साथी गेंद के रास्ते के बगल में खड़ा हो, रैकेट के सामने नहीं।",
    },
  },
  {
    id: "bounce-wall",
    kind: "drill",
    courts: ["wall"],
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Drop and hit along the channel", hi: "चैनल में छोड़कर मारो" },
    activity: {
      en: "Mark a narrow channel with cones, bags, or a line in the dirt. Drop the ball and hit it along the channel after the bounce. On a wall, aim for the wall and let the ball come back. The next player waits to the side.",
      hi: "कोन, बैग, या मिट्टी की लाइन से एक पतला चैनल बनाओ। गेंद छोड़ो और बाउंस के बाद चैनल में मारो। दीवार हो तो दीवार पर निशाना लगाओ और गेंद को वापस आने दो। अगला खिलाड़ी बगल में इंतज़ार करे।",
    },
    cues: {
      en: ["Aim down the channel.", "One ball, then step aside."],
      hi: ["चैनल की तरफ मारो।", "एक गेंद, फिर बगल में हटो।"],
    },
    safety: {
      en: "Nobody stands behind the hitter while the racket is moving.",
      hi: "रैकेट चल रहा हो तो कोई हिटर के पीछे न खड़ा हो।",
    },
  },
  {
    id: "feed-line",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "One feed, one hit", hi: "एक फीड, एक हिट" },
    activity: {
      en: "The feeder stands to the side and rolls or underarm-feeds one ball. The hitter sends it into a marked zone, then both walk to the back of the line. One ball in play on each station.",
      hi: "फीडर बगल में खड़ा हो और एक गेंद रोल करे या अंडरआर्म से दे। हिटर उसे निशान वाले हिस्से में भेजे, फिर दोनों लाइन के पीछे चलें। हर स्टेशन पर एक गेंद।",
    },
    cues: {
      en: ["Feed to the racket side.", "Walk back, do not run."],
      hi: ["रैकेट वाली तरफ फीड दो।", "वापस चलकर आओ, दौड़ो नहीं।"],
    },
    safety: {
      en: "The feeder keeps their feet outside the swing.",
      hi: "फीडर अपने पैर स्विंग से बाहर रखे।",
    },
  },
  {
    id: "cone-gate",
    kind: "drill",
    courts: ["full", "half"],
    minAge: 6,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: true,
    title: { en: "Hit through the cone gate", hi: "कोन के गेट से गेंद निकालो" },
    activity: {
      en: "Place two cones as a gate. Players bounce-hit through the gate. Move the gate closer for younger players and a step further for older ones.",
      hi: "दो कोन से एक गेट बनाओ। खिलाड़ी बाउंस-हिट से गेंद गेट में से निकालें। छोटे खिलाड़ियों के लिए गेट पास रखो, बड़े खिलाड़ियों के लिए एक कदम दूर।",
    },
    cues: {
      en: ["Aim for the gap, not the cone.", "A soft ball that goes through counts."],
      hi: ["कोन पर नहीं, बीच की जगह पर निशाना।", "हल्की गेंद जो गेट से निकले, वही गिनती।"],
    },
    safety: {
      en: "Pick cones up only when the coach stops the hitting.",
      hi: "कोन तभी उठाओ जब कोच हिटिंग रोक दे।",
    },
  },
  {
    id: "wall-rally",
    kind: "drill",
    courts: ["wall"],
    minAge: 8,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Wall rally, one bounce", hi: "दीवार पर रैली, एक बाउंस" },
    activity: {
      en: "Stand a few steps from the wall. Drop the ball, hit it into the wall, let it bounce once, and hit again. Count the hits out loud as a group, not as a contest.",
      hi: "दीवार से कुछ कदम दूर खड़े हो। गेंद छोड़ो, दीवार पर मारो, एक बाउंस दो, फिर मारो। हिट की गिनती समूह के साथ ज़ोर से करो, मुकाबले की तरह नहीं।",
    },
    cues: {
      en: ["Hit the same spot on the wall.", "Let it bounce before you swing again."],
      hi: ["दीवार पर एक ही जगह मारो।", "फिर स्विंग से पहले बाउंस होने दो।"],
    },
    safety: {
      en: "The next player waits two big steps to the side, never behind the racket.",
      hi: "अगला खिलाड़ी दो बड़े कदम बगल में इंतज़ार करे, रैकेट के पीछे कभी नहीं।",
    },
  },
  {
    id: "serve-box",
    kind: "drill",
    courts: ["full", "half"],
    minAge: 8,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Underarm serve into the box", hi: "बॉक्स में अंडरआर्म सर्व" },
    activity: {
      en: "From the service line, step in and use an underarm serve into the service box. Ten tries, then switch with the feeder. Keep the ball low over the net, or over a line of cones if the net is missing.",
      hi: "सर्विस लाइन से एक कदम आगे बढ़ो और अंडरआर्म सर्व सर्विस बॉक्स में मारो। दस कोशिशें, फिर फीडर से बदलो। गेंद को नेट के ऊपर नीचा रखो। नेट न हो तो कोन की लाइन के ऊपर से।",
    },
    cues: {
      en: ["Ball in the hand, then a gentle underarm swing.", "Land it in the box."],
      hi: ["गेंद हाथ में, फिर हल्का अंडरआर्म स्विंग।", "उसे बॉक्स में उतारो।"],
    },
    safety: {
      en: "Stop at ten serves so the shoulder does not get sore.",
      hi: "दस सर्व पर रुक जाओ, ताकि कंधा दर्द न करे।",
    },
  },
  {
    id: "rally-four",
    kind: "drill",
    courts: ["full"],
    minAge: 11,
    maxAge: 18,
    levels: ["developing", "intermediate"],
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Four-ball crosscourt rally", hi: "चार गेंद की क्रॉसकोर्ट रैली" },
    activity: {
      en: "Start on the service line, not the baseline, unless the players already rally from further back. Play four balls crosscourt with an underarm start, then rest and let the next pair in.",
      hi: "बेसलाइन पर नहीं, सर्विस लाइन से शुरू करो, जब तक खिलाड़ी पीछे से रैली करना न जानते हों। अंडरआर्म शुरू करके चार गेंद क्रॉसकोर्ट खेलो, फिर आराम करो और अगली जोड़ी को जगह दो।",
    },
    cues: {
      en: ["Crosscourt first.", "Recover to the middle after each ball."],
      hi: ["पहले क्रॉसकोर्ट।", "हर गेंद के बाद बीच में लौटो।"],
    },
    safety: {
      en: "Four balls, then a rest. Do not keep a tired pair on court.",
      hi: "चार गेंद, फिर आराम। थकी जोड़ी को कोर्ट पर मत रखो।",
    },
  },
  {
    id: "approach-touch",
    kind: "drill",
    courts: ["full", "half"],
    minAge: 12,
    maxAge: 18,
    levels: ["developing", "intermediate"],
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Hit, then walk in and touch", hi: "मारो, फिर चलकर छुओ" },
    activity: {
      en: "The hitter plays one controlled ball, then walks forward to touch a cone or the service line, and walks back. The feeder sends the next ball only when the hitter is ready.",
      hi: "हिटर एक नियंत्रित गेंद मारे, फिर चलकर कोन या सर्विस लाइन छुए, और वापस चले। फीडर अगली गेंद तभी दे जब हिटर तैयार हो।",
    },
    cues: {
      en: ["Play the ball, then walk.", "Split your feet before the feed."],
      hi: ["गेंद खेलो, फिर चलो।", "फीड से पहले पैर तैयार करो।"],
    },
    safety: {
      en: "Walking only. The feeder waits until the hitter has stopped.",
      hi: "सिर्फ चलना। फीडर तब तक रुके जब तक हिटर रुक न जाए।",
    },
  },
  {
    id: "grip-swing",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: false,
    needsCones: false,
    title: { en: "Grip, ready, slow swing", hi: "ग्रिप, रेडी, धीमा स्विंग" },
    activity: {
      en: "Handshake grip. From a ready position, turn the shoulders and make one slow swing, then freeze. No ball. Say 'ready' before each swing.",
      hi: "हैंडशेक ग्रिप। रेडी पोज़िशन से कंधे घुमाओ और एक धीमा स्विंग करो, फिर रुक जाओ। गेंद नहीं। हर स्विंग से पहले 'रेडी' कहो।",
    },
    cues: {
      en: ["Racket head below the wrist at the start.", "Freeze at the end of the swing."],
      hi: ["शुरुआत में रैकेट का सिर कलाई से नीचे।", "स्विंग के अंत में रुक जाओ।"],
    },
    safety: {
      en: "Check the gap on both sides before anyone swings.",
      hi: "स्विंग से पहले दोनों तरफ की जगह देख लो।",
    },
  },
  {
    id: "throw-catch",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 14,
    levels: "any",
    needsRacket: false,
    needsBall: true,
    needsCones: false,
    title: { en: "Throw, bounce, catch", hi: "फेंको, बाउंस, पकड़ो" },
    activity: {
      en: "In pairs, throw underarm so the ball bounces once before the partner catches it. Step with the front foot. This station needs no racket.",
      hi: "जोड़ी में अंडरआर्म फेंको, ताकि गेंद एक बार बाउंस होकर साथी के पास पहुँचे। आगे वाला पैर बढ़ाओ। इस स्टेशन पर रैकेट नहीं चाहिए।",
    },
    cues: {
      en: ["Throw to the hands, not at the face.", "Move your feet to the ball."],
      hi: ["हाथों की तरफ फेंको, चेहरे पर नहीं।", "गेंद की तरफ पैर बढ़ाओ।"],
    },
    safety: {
      en: "Underarm throws only, with a gap between pairs.",
      hi: "सिर्फ अंडरआर्म थ्रो, और जोड़ियों के बीच जगह।",
    },
  },
  {
    id: "cone-feet",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: true,
    title: { en: "Cone side-steps", hi: "कोन पर साइड-स्टेप" },
    activity: {
      en: "Side-step through the cones, touch each one with a hand, and stay low. Walk back to the start. This station needs no racket.",
      hi: "कोन के बीच साइड-स्टेप करो, हर कोन को हाथ से छुओ, और नीचे रहो। शुरू की जगह पर चलकर लौटो। इस स्टेशन पर रैकेट नहीं चाहिए।",
    },
    cues: {
      en: ["Stay low like a ready position.", "Walk the way back."],
      hi: ["रेडी पोज़िशन की तरह नीचे रहो।", "वापसी चलकर करो।"],
    },
    safety: {
      en: "One player in each cone lane at a time.",
      hi: "हर कोन लेन में एक समय में एक खिलाड़ी।",
    },
  },
  {
    id: "shadow",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Ready, turn, swing", hi: "रेडी, घूमो, स्विंग" },
    activity: {
      en: "No ball. From ready position, turn the shoulders and make a slow swing with an open palm, then freeze. The coach stands where every player can be seen.",
      hi: "गेंद नहीं। रेडी पोज़िशन से कंधे घुमाओ और खुली हथेली से धीमा स्विंग करो, फिर रुक जाओ। कोच वहाँ खड़ा हो जहाँ हर खिलाड़ी दिखे।",
    },
    cues: {
      en: ["Say ready before you swing.", "Keep the free hand up for balance."],
      hi: ["स्विंग से पहले रेडी कहो।", "संतुलन के लिए दूसरा हाथ ऊपर रखो।"],
    },
    safety: {
      en: "Empty hands only, with room to turn without touching a neighbour.",
      hi: "खाली हाथ, और इतनी जगह कि घूमते समय बगल वाले को न छुओ।",
    },
  },
  {
    id: "follow-hand",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Follow the coach's hand", hi: "कोच के हाथ के पीछे चलो" },
    activity: {
      en: "The coach points left, right, or forward. Players side-step or take two steps that way, then return to ready position. Keep the group facing the coach.",
      hi: "कोच बाएँ, दाएँ, या आगे इशारा करे। खिलाड़ी उस तरफ साइड-स्टेप या दो कदम लें, फिर रेडी पोज़िशन पर आएँ। समूह कोच की तरफ देखता रहे।",
    },
    cues: {
      en: ["Watch the hand, not your feet.", "Stop in a ready position."],
      hi: ["पैर नहीं, हाथ देखो।", "रेडी पोज़िशन में रुको।"],
    },
    safety: {
      en: "Point only as far as the group can move without leaving the playing area.",
      hi: "इशारा उतनी ही दूर तक करो जितना समूह खेल की जगह के अंदर रहकर कर सके।",
    },
  },
  {
    id: "balance",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 12,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Balance and freeze", hi: "संतुलन और रुकना" },
    activity: {
      en: "Stand on one foot for a slow count of five, then the other foot. Put the foot down as soon as balance goes. This is not a contest.",
      hi: "एक पैर पर धीरे-धीरे पाँच तक गिनो, फिर दूसरे पैर पर। संतुलन जाए तो पैर नीचे रख दो। यह मुकाबला नहीं है।",
    },
    cues: {
      en: ["Eyes forward.", "Put the foot down rather than fall."],
      hi: ["आँखें आगे।", "गिरने से अच्छा है पैर रख दो।"],
    },
    safety: {
      en: "Arms out for balance, and a clear space around each player.",
      hi: "संतुलन के लिए बाँहें बाहर, और हर खिलाड़ी के चारों तरफ जगह।",
    },
  },
  {
    id: "ready-call",
    kind: "drill",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Call and ready", hi: "आवाज़ और रेडी" },
    activity: {
      en: "Players stand in ready position. The coach calls a number. The group calls it back and does that many small hops, then freezes. Keep the hops on the spot.",
      hi: "खिलाड़ी रेडी पोज़िशन में खड़े हों। कोच एक नंबर बोले। समूह उसे दोहराए और उतनी छोटी उछाल करे, फिर रुक जाए। उछाल अपनी जगह पर रहें।",
    },
    cues: {
      en: ["Land quietly.", "Freeze when the number is done."],
      hi: ["हल्के से उतरो।", "नंबर पूरा हो तो रुक जाओ।"],
    },
    safety: {
      en: "Hops stay on the spot. No travelling across the court.",
      hi: "उछाल अपनी जगह पर। कोर्ट पार करके नहीं।",
    },
  },
  {
    id: "team-points",
    kind: "game",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Team points, nobody goes out", hi: "टीम पॉइंट, कोई बाहर नहीं" },
    activity: {
      en: "The group scores together. One point when a ball lands in the zone. Nobody is knocked out. At five points, swap feeders and hitters. Waiting stations can score a point for a clean catch or a clean cone run.",
      hi: "समूह साथ में अंक बनाए। गेंद निशान में गिरे तो एक अंक। कोई बाहर नहीं होता। पाँच अंक पर फीडर और हिटर बदलो। इंतज़ार वाले स्टेशन साफ कैच या साफ कोन रन पर अंक ले सकते हैं।",
    },
    cues: {
      en: ["We score as a team.", "A miss is just the next try."],
      hi: ["अंक पूरी टीम के हैं।", "चूक हो तो अगली कोशिश।"],
    },
    safety: {
      en: "Keep every player in the game. Do not send anyone to sit out as a punishment.",
      hi: "हर खिलाड़ी खेल में रहे। सज़ा के तौर पर किसी को बाहर मत बैठाओ।",
    },
  },
  {
    id: "wall-count",
    kind: "game",
    courts: ["wall"],
    minAge: 6,
    maxAge: 18,
    levels: "any",
    needsRacket: true,
    needsBall: true,
    needsCones: false,
    title: { en: "Shared wall count", hi: "दीवार पर साझी गिनती" },
    activity: {
      en: "Each hitter adds to one shared count against the wall or down the channel. A miss does not remove anyone. The next player tries to add one more. Celebrate the group total.",
      hi: "हर हिटर दीवार या चैनल पर एक साझी गिनती बढ़ाए। चूक से कोई बाहर नहीं होता। अगला खिलाड़ी एक और जोड़ने की कोशिश करे। समूह के कुल अंक का जश्न मनाओ।",
    },
    cues: {
      en: ["Add one for the group.", "Step aside so the next player has room."],
      hi: ["समूह के लिए एक जोड़ो।", "बगल में हटो, ताकि अगले के पास जगह हो।"],
    },
    safety: {
      en: "Stop the rally before anyone steps into the path of the ball.",
      hi: "रैली रोक दो इससे पहले कि कोई गेंद के रास्ते में आए।",
    },
  },
  {
    id: "together-game",
    kind: "game",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "How many ready positions together", hi: "साथ में कितनी रेडी पोज़िशन" },
    activity: {
      en: "The coach counts slowly to ten. On each number the group makes one ready position and one slow swing with empty hands, then freezes. The score is how many the whole group can do together.",
      hi: "कोच धीरे-धीरे दस तक गिने। हर नंबर पर समूह एक रेडी पोज़िशन और खाली हाथ से एक धीमा स्विंग करे, फिर रुके। अंक यह है कि पूरा समूह साथ में कितने कर पाया।",
    },
    cues: {
      en: ["Stay with the count.", "The group score matters, not one player."],
      hi: ["गिनती के साथ चलो।", "अंक समूह के हैं, एक खिलाड़ी के नहीं।"],
    },
    safety: {
      en: "Empty hands, and enough space to swing without touching anyone.",
      hi: "खाली हाथ, और इतनी जगह कि स्विंग में किसी को न छुओ।",
    },
  },
  {
    id: "cooldown",
    kind: "cooldown",
    courts: "any",
    minAge: 4,
    maxAge: 18,
    levels: "any",
    needsRacket: false,
    needsBall: false,
    needsCones: false,
    title: { en: "Walk, stretch, pack the kit", hi: "चलो, स्ट्रेच, किट समेटो" },
    activity: {
      en: "Walk for a minute. Stretch the calf and the shoulder. Pick up every ball and cone. Put rackets in one pile with the heads the same way. Each player names one thing that got easier today.",
      hi: "एक मिनट चलो। पिंडली और कंधे की स्ट्रेच करो। हर गेंद और कोन उठाओ। रैकेट एक ढेर में रखो, सिर एक ही तरफ। हर खिलाड़ी एक बात बताए जो आज आसान हुई।",
    },
    cues: {
      en: ["Walk, do not flop down yet.", "Leave the court clearer than you found it."],
      hi: ["चलो, अभी बैठ मत जाओ।", "कोर्ट को जैसा मिला था उससे साफ छोड़ो।"],
    },
    safety: {
      en: "Count the balls and rackets before anyone leaves.",
      hi: "किसी के जाने से पहले गेंद और रैकेट गिन लो।",
    },
  },
];
