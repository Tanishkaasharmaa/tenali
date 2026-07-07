/**
 * server/transferScenarios.js
 *
 * Parametric template-based learning transfer scenarios for:
 *   - Percentages ('percent')
 *   - Ratio & Proportion ('ratio')
 *   - Fraction Addition ('fractionadd')
 */

function gcd(a, b) {
  return b ? gcd(b, a % b) : Math.abs(a);
}

function simplifyFraction(num, den) {
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  if (sDen === 1) return String(sNum);
  return `${sNum}/${sDen}`;
}

const percentScenarios = [
  {
    scenarioId: 'pct-transfer-001',
    context: 'shopping',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const names = ['Arjun', 'Priya', 'Meena', 'Ravi', 'Ananya'];
      const items = ['shirt', 'laptop bag', 'pair of shoes', 'watch', 'schoolbag'];
      const prices = [500, 800, 1200, 1500, 2000, 2500, 3000];
      const discounts = [10, 15, 20, 25, 30];
      const gsts = [5, 12, 18];

      const name = names[Math.floor(Math.random() * names.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const price = prices[Math.floor(Math.random() * prices.length)];
      const discount = discounts[Math.floor(Math.random() * discounts.length)];
      const gst = gsts[Math.floor(Math.random() * gsts.length)];

      const vars = { name, item, price, discount, gst };
      const res = evaluatePct001(vars);

      return {
        scenarioId: 'pct-transfer-001',
        context: 'shopping',
        prompt: `${name} wants to buy a ${item} priced at ₹${price}. The store offers a ${discount}% discount. After the discount, ${gst}% GST is applied. What is the final price?`,
        variables: vars,
        hints: [
          'Break this into steps: first find the discounted price, then apply the GST to that discounted price.',
          `The discount is ${discount}% of ₹${price} (which is ₹${res.discountAmt}). The discounted price is ₹${price} - ₹${res.discountAmt} = ₹${res.discountedDisplay}. Now find the GST.`,
          `The GST is ${gst}% of ₹${res.discountedDisplay} (which is ₹${res.gstAmt}). Add this to the discounted price to get the final answer.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct001(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct001(vars);
      return `Step 1: Find ${vars.discount}% discount on ₹${vars.price} → ₹${res.discountAmt}\n` +
             `Step 2: Subtract discount → ₹${vars.price} - ₹${res.discountAmt} = ₹${res.discountedDisplay}\n` +
             `Step 3: Find ${vars.gst}% GST on ₹${res.discountedDisplay} → ₹${res.gstAmt}\n` +
             `Step 4: Add GST → ₹${res.discountedDisplay} + ₹${res.gstAmt} = ₹${res.answer}`;
    },
    transferMapping: "The word 'discount' means computing a percentage and subtracting. 'GST' (Goods & Services Tax) means computing a percentage and adding to the discounted price."
  },
  {
    scenarioId: 'pct-transfer-002',
    context: 'sports',
    transferLevel: 2,
    icon: '🏏',
    generate: () => {
      const teams = ['India', 'Australia', 'England', 'South Africa', 'New Zealand'];
      const targets = [200, 240, 250, 300, 320];
      const oversList = [10, 20, 30];
      const rates = [4.5, 5, 5.5, 6, 6.5];

      const team = teams[Math.floor(Math.random() * teams.length)];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const overs = oversList[Math.floor(Math.random() * oversList.length)];
      const rate = rates[Math.floor(Math.random() * rates.length)];

      const vars = { team, target, overs, rate };
      const res = evaluatePct002(vars);

      return {
        scenarioId: 'pct-transfer-002',
        context: 'sports',
        prompt: `The ${team} cricket team needs to score ${target} runs to win. In the first ${overs} overs, they score at a rate of ${rate} runs per over. What percentage of the target runs have they already scored?`,
        variables: vars,
        hints: [
          'First calculate the total runs scored in the first few overs by multiplying the run rate by the number of overs.',
          `They scored ${overs} × ${rate} = ${res.runs} runs. Now, find what percentage ${res.runs} is of ${target}.`,
          `Calculate (${res.runs} / ${target}) × 100 to get the percentage.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct002(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct002(vars);
      return `Step 1: Calculate runs scored → ${vars.overs} overs × ${vars.rate} runs/over = ${res.runs} runs\n` +
             `Step 2: Find percentage of target runs → (${res.runs} / ${vars.target}) × 100 = ${res.answer}%`;
    },
    transferMapping: "A 'run rate' is the average number of runs scored per over. To find what percentage 'a' is of 'b', compute (a / b) × 100."
  },
  {
    scenarioId: 'pct-transfer-003',
    context: 'cooking',
    transferLevel: 3,
    icon: '🍕',
    generate: () => {
      const dishes = ['Kheer', 'Halwa', 'Gulab Jamun', 'Biryani'];
      const servingsList = [4, 5, 8];
      const scalingOptions = {
        4: [6, 8, 10],
        5: [8, 10, 12],
        8: [10, 12, 16]
      };
      const sugars = [100, 150, 200, 250, 300];

      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const servings = servingsList[Math.floor(Math.random() * servingsList.length)];
      const nextServingsList = scalingOptions[servings];
      const newServings = nextServingsList[Math.floor(Math.random() * nextServingsList.length)];
      const sugar = sugars[Math.floor(Math.random() * sugars.length)];

      const vars = { dish, servings, newServings, sugar };
      const res = evaluatePct003(vars);

      return {
        scenarioId: 'pct-transfer-003',
        context: 'cooking',
        prompt: `A recipe for ${dish} serves ${servings} people and requires ${sugar}g of sugar. If you want to make the dish for ${newServings} people, by what percentage must you increase the amount of sugar?`,
        variables: vars,
        hints: [
          `Notice that the amount of sugar (${sugar}g) is a distractor! The sugar increase percentage is identical to the servings increase percentage.`,
          `Calculate the percentage increase in servings from ${servings} to ${newServings}.`,
          `The formula is: ((New Servings - Original Servings) / Original Servings) × 100.`
        ]
      };
    },
    evaluate: (vars) => evaluatePct003(vars).answer,
    explanation: (vars) => {
      const res = evaluatePct003(vars);
      return `Step 1: Identify that the sugar amount (${vars.sugar}g) is scaled proportionally with servings, so the percentage increase of sugar matches the servings increase.\n` +
             `Step 2: Servings increase = ${vars.newServings} - ${vars.servings} = ${res.diff}\n` +
             `Step 3: Percentage increase = (${res.diff} / ${vars.servings}) × 100 = ${res.answer}%`;
    },
    transferMapping: "When scaling quantities proportionally, the percentage change of any single ingredient (like sugar) is equal to the percentage change of the scale (servings). The formula for percentage change is: (change / original) × 100."
  }
];

const ratioScenarios = [
  {
    scenarioId: 'ratio-transfer-001',
    context: 'travel',
    transferLevel: 2,
    icon: '🚂',
    generate: () => {
      const scales = [1, 2, 5];
      const distances = [10, 50, 100, 150, 200];
      const mapDists = [3, 5, 8, 12, 15];

      const scale = scales[Math.floor(Math.random() * scales.length)];
      const distance = distances[Math.floor(Math.random() * distances.length)];
      const mapDist = mapDists[Math.floor(Math.random() * mapDists.length)];

      const vars = { scale, distance, mapDist };
      const res = evaluateRatio001(vars);

      return {
        scenarioId: 'ratio-transfer-001',
        context: 'travel',
        prompt: `On a map of India, ${scale} cm represents ${distance} km in real life. If two cities are ${mapDist} cm apart on the map, what is the actual distance between them in km?`,
        variables: vars,
        hints: [
          `This is a ratio problem. The scale ratio is map distance : actual distance = ${scale} : ${distance}.`,
          `For 1 cm on the map, the actual distance is ${distance} / ${scale} = ${distance / scale} km.`,
          `Multiply the 1-cm distance by the map distance (${mapDist} cm) to get the answer.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio001(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio001(vars);
      return `Step 1: Establish the scale ratio → ${vars.scale} cm : ${vars.distance} km\n` +
             `Step 2: Find the distance represented by 1 cm → ${vars.distance} / ${vars.scale} = ${res.unitDist} km\n` +
             `Step 3: Multiply by the map distance → ${vars.mapDist} cm × ${res.unitDist} km/cm = ${res.answer} km`;
    },
    transferMapping: "A map scale is a ratio of map distance to real-world distance. If a:b represents the scale, and you have map distance c, the real-world distance is c × (b / a)."
  },
  {
    scenarioId: 'ratio-transfer-002',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const lemonWaterPairs = [
        { juice: 1, water: 4 },
        { juice: 1, water: 5 },
        { juice: 1, water: 6 },
        { juice: 2, water: 5 },
        { juice: 2, water: 7 }
      ];
      const juiceUseds = [50, 100, 150, 200, 250];

      const pair = lemonWaterPairs[Math.floor(Math.random() * lemonWaterPairs.length)];
      const juiceUsed = juiceUseds[Math.floor(Math.random() * juiceUseds.length)];

      const vars = { juice: pair.juice, water: pair.water, juiceUsed };
      const res = evaluateRatio002(vars);

      return {
        scenarioId: 'ratio-transfer-002',
        context: 'cooking',
        prompt: `To make a jug of lemonade, the ratio of lemon juice to water is ${pair.juice}:${pair.water}. If you use ${juiceUsed} ml of lemon juice, how much water in ml should you add to keep the same ratio?`,
        variables: vars,
        hints: [
          `The parts ratio is juice : water = ${pair.juice} : ${pair.water}.`,
          `Calculate how many times larger the juice used (${juiceUsed} ml) is than the ratio part (${pair.juice}).`,
          `Multiply that scaling factor by the water ratio part (${pair.water}) to find the water needed.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio002(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio002(vars);
      return `Step 1: Set up the proportion → juice / water = ${vars.juice} / ${vars.water}\n` +
             `Step 2: Find the scaling multiplier → ${vars.juiceUsed} ml / ${vars.juice} = ${res.scale}\n` +
             `Step 3: Calculate water required → ${vars.water} parts × ${res.scale} ml/part = ${res.answer} ml`;
    },
    transferMapping: "Ratios define proportional relationships. If the ratio is a:b, then juice/water = a/b. When juice becomes J, water becomes J × (b / a) to preserve the ratio."
  },
  {
    scenarioId: 'ratio-transfer-003',
    context: 'shopping',
    transferLevel: 3,
    icon: '🛒',
    generate: () => {
      const totals = [500, 600, 800, 1000, 1200, 1500];
      const ratios = [
        { r1: 2, r2: 3 }, // sum 5
        { r1: 1, r2: 4 }, // sum 5
        { r1: 3, r2: 5 }, // sum 8
        { r1: 1, r2: 5 }  // sum 6
      ];

      // Pick a total and find a ratio that divides it perfectly
      let total, r1, r2;
      for (let attempt = 0; attempt < 50; attempt++) {
        total = totals[Math.floor(Math.random() * totals.length)];
        const pair = ratios[Math.floor(Math.random() * ratios.length)];
        if (total % (pair.r1 + pair.r2) === 0) {
          r1 = pair.r1;
          r2 = pair.r2;
          break;
        }
      }
      if (!r1) { total = 1000; r1 = 2; r2 = 3; } // Fallback

      const vars = { total, r1, r2 };
      const res = evaluateRatio003(vars);

      return {
        scenarioId: 'ratio-transfer-003',
        context: 'shopping',
        prompt: `Ravi and Priya divide their pocket money of ₹${total} in the ratio ${r1}:${r2}. How much more money does Priya get than Ravi, given that Priya gets the larger share?`,
        variables: vars,
        hints: [
          `First find the value of one part in the ratio. The total ratio parts sum up to ${r1} + ${r2} = ${r1 + r2} parts.`,
          `One ratio part is worth ₹${total} / ${r1 + r2} = ₹${total / (r1 + r2)}.`,
          `Calculate the difference in parts between Priya and Ravi (${r2} - ${r1} = ${r2 - r1} parts), and multiply it by the value of one part.`
        ]
      };
    },
    evaluate: (vars) => evaluateRatio003(vars).answer,
    explanation: (vars) => {
      const res = evaluateRatio003(vars);
      return `Step 1: Find total ratio parts → ${vars.r1} + ${vars.r2} = ${res.partsSum}\n` +
             `Step 2: Find the value of 1 ratio part → ₹${vars.total} / ${res.partsSum} = ₹${res.unitValue}\n` +
             `Step 3: Find Ravi's share → ${vars.r1} parts × ₹${res.unitValue} = ₹${res.share1}\n` +
             `Step 4: Find Priya's share → ${vars.r2} parts × ₹${res.unitValue} = ₹${res.share2}\n` +
             `Step 5: Find the difference → ₹${res.share2} - ₹${res.share1} = ₹${res.answer}`;
    },
    transferMapping: "To divide an amount in ratio a:b, calculate the sum of parts (a + b). Each part is worth Total / (a + b). The difference between the shares is (b - a) × part value."
  }
];

const fractionaddScenarios = [
  {
    scenarioId: 'frac-transfer-001',
    context: 'pocketmoney',
    transferLevel: 2,
    icon: '🛒',
    generate: () => {
      const options = [
        { f1n: 1, f1d: 3, f2n: 1, f2d: 4 }, // sum 7/12, rem 5/12
        { f1n: 1, f1d: 4, f2n: 1, f2d: 5 }, // sum 9/20, rem 11/20
        { f1n: 1, f1d: 3, f2n: 2, f2d: 5 }, // sum 11/15, rem 4/15
        { f1n: 1, f1d: 4, f2n: 1, f2d: 3 }, // sum 7/12, rem 5/12
        { f1n: 1, f1d: 2, f2n: 1, f2d: 5 }  // sum 7/10, rem 3/10
      ];
      const opt = options[Math.floor(Math.random() * options.length)];
      const vars = { f1n: opt.f1n, f1d: opt.f1d, f2n: opt.f2n, f2d: opt.f2d };
      const res = evaluateFrac001(vars);

      return {
        scenarioId: 'frac-transfer-001',
        context: 'pocketmoney',
        prompt: `Arjun spends ${opt.f1n}/${opt.f1d} of his pocket money on books and ${opt.f2n}/${opt.f2d} on snacks. What fraction of his pocket money does he have left?`,
        variables: vars,
        hints: [
          `First add the two fractions together to find the total fraction spent: ${opt.f1n}/${opt.f1d} + ${opt.f2n}/${opt.f2d}.`,
          `Find a common denominator to add the fractions. For example, the common denominator for ${opt.f1d} and ${opt.f2d} is ${res.lcm}.`,
          `Subtract the sum of the spent fractions from the whole pocket money (which is represented by 1).`
        ]
      };
    },
    evaluate: (vars) => evaluateFrac001(vars).answer,
    explanation: (vars) => {
      const res = evaluateFrac001(vars);
      return `Step 1: Find the fraction spent in total → ${vars.f1n}/${vars.f1d} + ${vars.f2n}/${vars.f2d}\n` +
             `        = ${res.spentNum}/${res.lcm}\n` +
             `Step 2: Subtract from the whole (1) → 1 - ${res.spentNum}/${res.lcm} = ${res.lcm}/${res.lcm} - ${res.spentNum}/${res.lcm} = ${res.answer}`;
    },
    transferMapping: "Fraction addition allows you to find a combined share of a whole. Subtracting a fraction from 1 represents finding the remaining fraction of a whole resource."
  },
  {
    scenarioId: 'frac-transfer-002',
    context: 'cooking',
    transferLevel: 2,
    icon: '🍕',
    generate: () => {
      const options = [
        { f1n: 1, f1d: 4, f2n: 1, f2d: 3 }, // sum 7/12
        { f1n: 1, f1d: 4, f2n: 2, f2d: 5 }, // sum 13/20
        { f1n: 1, f1d: 3, f2n: 2, f2d: 5 }, // sum 11/15
        { f1n: 2, f1d: 5, f2n: 1, f2d: 3 }, // sum 11/15
        { f1n: 1, f1d: 6, f2n: 1, f2d: 4 }  // sum 5/12
      ];
      const opt = options[Math.floor(Math.random() * options.length)];
      const vars = { f1n: opt.f1n, f1d: opt.f1d, f2n: opt.f2n, f2d: opt.f2d };
      const res = evaluateFrac002(vars);

      return {
        scenarioId: 'frac-transfer-002',
        context: 'cooking',
        prompt: `Meena ate ${opt.f1n}/${opt.f1d} of a pizza, and Rahul ate ${opt.f2n}/${opt.f2d} of the same pizza. What fraction of the pizza was eaten in total?`,
        variables: vars,
        hints: [
          `To find the total fraction of pizza eaten, add the two fractions: ${opt.f1n}/${opt.f1d} + ${opt.f2n}/${opt.f2d}.`,
          `Find a common denominator (LCM of ${opt.f1d} and ${opt.f2d} is ${res.lcm}).`,
          `Convert both fractions to have this common denominator, then add the numerators.`
        ]
      };
    },
    evaluate: (vars) => evaluateFrac002(vars).answer,
    explanation: (vars) => {
      const res = evaluateFrac002(vars);
      return `Step 1: Add Meena and Rahul's fractions → ${vars.f1n}/${vars.f1d} + ${vars.f2n}/${vars.f2d}\n` +
             `Step 2: Find common denominator → LCM of ${vars.f1d} and ${vars.f2d} is ${res.lcm}\n` +
             `Step 3: Convert and sum → ${res.v1n}/${res.lcm} + ${res.v2n}/${res.lcm} = ${res.answer}`;
    },
    transferMapping: "Adding fractions finds the combined total when sharing a resource. Always convert the fractions to a common denominator before adding."
  }
];

// Helper evaluation functions to ensure correct values and steps are computed
function evaluatePct001(vars) {
  const discountAmt = Math.round(vars.price * (vars.discount / 100) * 100) / 100;
  const discounted = vars.price - discountAmt;
  const discountedDisplay = Math.round(discounted * 100) / 100;
  const gstAmt = Math.round(discounted * (vars.gst / 100) * 100) / 100;
  const final = discounted + gstAmt;
  const answer = Math.round(final * 100) / 100;

  return { discountAmt, discountedDisplay, gstAmt, answer };
}

function evaluatePct002(vars) {
  const runs = vars.overs * vars.rate;
  const answer = Math.round(((runs / vars.target) * 100) * 100) / 100;
  return { runs, answer };
}

function evaluatePct003(vars) {
  const diff = vars.newServings - vars.servings;
  const answer = Math.round(((diff / vars.servings) * 100) * 100) / 100;
  return { diff, answer };
}

function evaluateRatio001(vars) {
  const unitDist = vars.distance / vars.scale;
  const answer = Math.round((vars.mapDist * unitDist) * 100) / 100;
  return { unitDist, answer };
}

function evaluateRatio002(vars) {
  const scale = vars.juiceUsed / vars.juice;
  const answer = Math.round((vars.water * scale) * 100) / 100;
  return { scale, answer };
}

function evaluateRatio003(vars) {
  const partsSum = vars.r1 + vars.r2;
  const unitValue = vars.total / partsSum;
  const share1 = vars.r1 * unitValue;
  const share2 = vars.r2 * unitValue;
  const answer = share2 - share1;
  return { partsSum, unitValue, share1, share2, answer };
}

function evaluateFrac001(vars) {
  const lcm = (vars.f1d * vars.f2d) / gcd(vars.f1d, vars.f2d);
  const spentNum = vars.f1n * (lcm / vars.f1d) + vars.f2n * (lcm / vars.f2d);
  const answerNum = lcm - spentNum;
  const answer = simplifyFraction(answerNum, lcm);
  return { lcm, spentNum, answerNum, answer };
}

function evaluateFrac002(vars) {
  const lcm = (vars.f1d * vars.f2d) / gcd(vars.f1d, vars.f2d);
  const v1n = vars.f1n * (lcm / vars.f1d);
  const v2n = vars.f2n * (lcm / vars.f2d);
  const answerNum = v1n + v2n;
  const answer = simplifyFraction(answerNum, lcm);
  return { lcm, v1n, v2n, answerNum, answer };
}

module.exports = {
  percent: percentScenarios,
  ratio: ratioScenarios,
  fractionadd: fractionaddScenarios,
  simplifyFraction
};
