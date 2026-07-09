import { useEffect, useState, useRef } from 'react'
import './LinearAlgebraApp.css'

const API = import.meta.env.VITE_API_BASE_URL || ''

function textMatches(input, keywords) {
  const t = (input || '').toLowerCase().trim()
  return keywords.some(k => t.includes(k.toLowerCase()))
}

const MISSIONS = [
  // Mission 1
  {
    id: 1, emoji: '\uD83D\uDCB0', title: 'Piggy Bank Detectives',
    story: "Ram's pocket money is twice Lakshman's. They save everything. Plot their weekly savings (R, L) and spot the pattern!",
    goal: 'Understand direct proportion - points lie on a line through the origin.',
    ggbType: 'graphing',
    answerType: 'mcq',
    prompt: 'What pattern do you observe in the points (R, L)?',
    options: [
      'They lie on a straight line through the origin',
      'They are scattered randomly',
      'They form a curve',
      'They are all on the x-axis'
    ],
    correct: 0,
    explanation: "Since Ram = 2 x Lakshman, points are (2L,L) = t(2,1). All scalar multiples lie on the same line through the origin!",
    ggbHint: 'Type coordinates like (10,20) and (20,40). Then type: Line((0,0),(10,20)).',
    ggbSteps: [
      'Click in the Input bar at bottom.',
      'Type: (10,20) and press Enter.',
      'Type: (20,40) and press Enter.',
      'Type: Line((0,0),(10,20)) and press Enter.',
      'Both points lie on same line through origin!'
    ],
    quiz: [
      { q: "If Ram's savings = 3x Lakshman's, points (L,R) will be...", options: ['On a line through origin', 'On a curve', 'Random', 'All on y-axis'], correct: 0 },
      { q: 'For (6,3), the ratio R:L is...', options: ['2:1', '1:2', '3:1', '1:1'], correct: 0 },
      { q: 'Will (4,2) lie on same line?', options: ['Yes', 'No', 'Only if double', 'Cannot say'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDE95', title: 'Taxi Fare', story: 'Base Rs25 + Rs12/km. Total=12x+25', question: 'Y-intercept?', answer: '25' },
      { emoji: '\uD83D\uDCF1', title: 'Phone Plan', story: 'Rs199/mo + Rs1/min. Total=199+1x', question: 'Slope?', answer: '1' },
      { emoji: '\uD83C\uDFAC', title: 'Netflix', story: 'Rs149 + Rs50/screen', question: 'Total for 2 screens?', answer: '249' },
      { emoji: '\u26FD', title: 'Fuel Cost', story: 'Rs105/litre. Cost=105x', question: 'Why through origin?', answer: 'no base cost' },
      { emoji: '\uD83D\uDCE6', title: 'Shipping', story: 'Rs40 + Rs20/kg', question: 'Cost for 3kg?', answer: '100' },
      { emoji: '\u26A1', title: 'Electricity', story: 'Rs200 + Rs8/unit', question: 'Fixed charge?', answer: '200' },
      { emoji: '\uD83C\uDF33', title: 'Tree Growth', story: '50cm + 20cm/yr', question: 'Height after 5yr?', answer: '150' },
      { emoji: '\uD83C\uDF70', title: 'Bakery', story: 'Rs500 + Rs200/kg cake', question: 'Type of function?', answer: 'linear' },
      { emoji: '\u2708\uFE0F', title: 'Flight', story: 'Rs2500 + Rs5/km', question: 'Distance for Rs3500?', answer: '200' },
    ],
    solveExplanation: 'Ram = 2xLakshman. Points are (2L,L)=L(2,1). Scalar multiples lie on a line through the origin.'
  },
  // Mission 2
  {
    id: 2, emoji: '\uD83D\uDDFA\uFE0F', title: 'Treasure Map',
    story: 'Atul at (0,0). Walk: right 2, up 1 (Bala). right 1, up 1 (Chetan). right 1, up 1 (Divya). Are B,C,D on a line?',
    goal: 'Plot consecutive points and check collinearity.',
    ggbType: 'graphing',
    answerType: 'mcq',
    prompt: 'Are Bala, Chetan and Divya on a straight line?',
    options: [
      'Yes - on line y = x - 1',
      'Yes - on line y = x + 1',
      'No - not collinear',
      'Yes - on line y = 2x'
    ],
    correct: 0,
    explanation: 'B=(2,1), C=(3,2), D=(4,3). Slope=(2-1)/(3-2)=1. Eqn: y-1=1(x-2) so y=x-1. All collinear!',
    ggbHint: 'Plot points using coordinates. Then type: Line((2,1),(3,2)).',
    ggbSteps: [
      'Type: (0,0) - Atul house (A)',
      'From A: right 2, up 1 -> (2,1) = Bala',
      'From B: right 1, up 1 -> (3,2) = Chetan',
      'From C: right 1, up 1 -> (4,3) = Divya',
      'Type: Line((2,1),(3,2)). Does (4,3) lie on it?'
    ],
    quiz: [
      { q: 'What is slope of line containing B,C,D?', options: ['1', '2', '0.5', '-1'], correct: 0 },
      { q: 'Equation of this line?', options: ['y = x - 1', 'y = x + 1', 'y = 2x', 'y = -x + 3'], correct: 0 },
      { q: 'Next house in pattern?', options: ['(5,4)', '(4,5)', '(5,3)', '(6,4)'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDCCD', title: 'GPS Path', story: 'GPS tracks waypoints. If collinear, walking straight!', question: 'What does collinear mean?', answer: 'on same line' },
      { emoji: '\uD83D\uDCD0', title: 'Architecture', story: 'Architects check column center alignment.', question: 'Why?', answer: 'alignment' },
      { emoji: '\uD83D\uDE86', title: 'Railway Tracks', story: 'Sleepers must be collinear for smooth travel.', question: 'What if not?', answer: 'derailment' },
    ],
    solveExplanation: 'B=(2,1), C=(3,2), D=(4,3). Slope=1. All satisfy y=x-1 -> collinear!'
  },
  // Mission 3
  {
    id: 3, emoji: '\uD83C\uDFAF', title: 'Darts at the Origin',
    story: 'Plot y=x, y=2x, y=10x. They all hit the bullseye (0,0)! Why?',
    goal: 'Why lines of form y=ax always pass through origin.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Why do all lines of form y = ax pass through the origin?',
    options: null,
    correct: null,
    expectedKeywords: ['origin', '(0,0)', 'zero', 'no constant', 'b=0', 'intercept is zero'],
    explanation: 'When x=0, y=a*0=0 for ANY a. So (0,0) is always on the line!',
    ggbHint: 'Type each equation. Look at y when x=0.',
    ggbSteps: [
      'Type: y = x and press Enter.',
      'Type: y = 2x and press Enter.',
      'Type: y = 10x and press Enter.',
      'Click on (0,0) - all 3 lines pass through it!',
      'Now type: y = -5x. Does it also pass through (0,0)?'
    ],
    quiz: [
      { q: 'Does y = -3x pass through the origin?', options: ['Yes', 'No'], correct: 0 },
      { q: 'Does y = 0.5x + 0 pass through origin?', options: ['Yes', 'No'], correct: 0 },
      { q: 'What about y = x + 1?', options: ['No - constant 1 shifts it up', 'Yes', 'Only when x=1', 'Never'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDCB0', title: 'Simple Interest', story: 'Interest = Rate x Principal. Principal=0 -> Interest=0!', question: 'Through origin?', answer: 'yes' },
      { emoji: '\uD83D\uDED2', title: 'Unit Pricing', story: 'Cost = Price x Quantity. Zero qty -> zero cost.', question: 'Through origin?', answer: 'yes' },
      { emoji: '\uD83C\uDFC3', title: 'Distance', story: 'Distance = Speed x Time. At t=0, d=0.', question: 'Slope?', answer: 'speed' },
      { emoji: '\uD83D\uDCA7', title: 'Water Flow', story: 'Volume = Rate x Time. At t=0, empty tank.', question: 'Through origin?', answer: 'yes' },
    ],
    solveExplanation: 'When x=0, y=a(0)=0. So (0,0) satisfies the equation for any a. The origin is always on y=ax!'
  },
  // Mission 4
  {
    id: 4, emoji: '\uD83E\uDDF1', title: 'The Brick Wall',
    story: 'Plot y = 2x + 1. Try to make it pass through origin. Can you? Why not?',
    goal: 'Understand how the constant term shifts the line off the origin.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Why does y = 2x + 1 NOT pass through the origin?',
    options: null,
    correct: null,
    expectedKeywords: ['constant', 'intercept', 'b=1', 'b = 1', '+1', 'when x=0', 'y=1', 'y equals 1', 'shift', 'not zero'],
    explanation: 'When x=0, y = 2(0) + 1 = 1, not 0. So (0,0) is NOT on the line. The +1 shifts the line up by 1.',
    ggbHint: 'Type the equation. Then type (0,0) and see if the line passes through it.',
    ggbSteps: [
      'Type: y = 2x + 1 and press Enter.',
      'Type: (0,0) and press Enter - this is the origin.',
      'Does the line pass through (0,0)? No!',
      'Type: y = 2x and compare. What is different?',
      'The +1 shifts the whole line UP by 1 unit!'
    ],
    quiz: [
      { q: 'What is y when x=0 for y=2x+1?', options: ['1', '0', '2', '-1'], correct: 0 },
      { q: 'Where does y=2x+1 cross the y-axis?', options: ['(0,1)', '(0,0)', '(1,0)', '(0,2)'], correct: 0 },
      { q: 'If we remove the +1, does y=2x pass through origin?', options: ['Yes', 'No', 'Only at x=0', 'Never'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDE95', title: 'Taxi Fare', story: 'Base fare Rs25 + Rs12/km. At x=0, fare=Rs25!', question: 'Y-intercept?', answer: '25' },
      { emoji: '\uD83D\uDCF1', title: 'Phone Plan', story: 'Rs199 + Rs1/min. At x=0, total=199.', question: 'Intercept value?', answer: '199' },
      { emoji: '\u26A1', title: 'Electricity', story: 'Rs200 fixed + Rs8/unit.', question: 'Intercept value?', answer: '200' },
      { emoji: '\uD83C\uDF33', title: 'Tree Height', story: 'Sapling 50cm + 20cm/yr. At year 0, 50cm.', question: 'Through origin?', answer: 'no' },
    ],
    solveExplanation: 'When x=0, y=2(0)+1=1. The constant term is the y-intercept - where the line meets the y-axis.'
  },
  // Mission 5
  {
    id: 5, emoji: '\uD83C\uDFAE', title: 'Game Controller',
    story: 'Create sliders for a and b. Watch the line y = ax + b dance as you drag!',
    goal: 'Explore how slope (a) and intercept (b) change the line visually.',
    ggbType: 'graphing',
    answerType: 'mcq',
    prompt: 'If you increase the slope a, what happens to the line?',
    options: [
      'The line gets steeper',
      'The line shifts up',
      'The line shifts right',
      'The line gets flatter'
    ],
    correct: 0,
    explanation: 'The slope a controls steepness. Larger a = steeper line. The intercept b controls vertical position.',
    ggbHint: 'Create sliders for a and b, then type y = a*x + b.',
    ggbSteps: [
      'Click the Slider tool (look for it in toolbar).',
      'Create slider named a with min=-5, max=5, step=0.1',
      'Create slider named b with min=-5, max=5, step=0.1',
      'Type: y = a*x + b in the Input bar.',
      'Drag the sliders and watch the line!'
    ],
    quiz: [
      { q: 'What does slider a control?', options: ['Slope/steepness', 'Height/position', 'Both', 'Neither'], correct: 0 },
      { q: 'If b=0, where does the line pass?', options: ['Through origin', 'Above origin', 'Below origin', 'Nowhere'], correct: 0 },
      { q: 'If you set a=0 and b=3, what do you get?', options: ['Horizontal line at y=3', 'Vertical line at x=3', 'Line through origin', 'A curve'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83C\uDFC3', title: 'Running Speed', story: 'Slope=speed, intercept=starting distance ahead.', question: 'What does slope represent?', answer: 'speed' },
      { emoji: '\uD83D\uDCB5', title: 'Savings', story: 'Slope=save per week, intercept=initial savings.', question: 'Intercept =?', answer: 'initial savings' }
    ],
    solveExplanation: 'Slope a = steepness. Intercept b = where line crosses y-axis. Together they define every line!'
  },
  // Mission 6
  {
    id: 6, emoji: '\uD83E\uDD1D', title: 'Meeting Point',
    story: 'Plot 2x+3y=7 and 3x+4y=10. Where do they meet? This is our first MATRIX problem!',
    goal: 'Connect simultaneous equations to matrix form.',
    ggbType: 'graphing',
    answerType: 'mcq',
    prompt: 'What does the intersection point of the two lines represent?',
    options: [
      'The solution (x,y) that satisfies both equations',
      'The x-intercept of line 1',
      'The y-intercept of line 2',
      'The origin'
    ],
    correct: 0,
    explanation: 'The intersection gives (x,y) that works for BOTH equations. This is exactly the matrix equation Ax=b!',
    ggbHint: 'Type both equations. Use Intersect tool to find where they cross.',
    ggbSteps: [
      'Type: 2x + 3y = 7 in Input bar and press Enter.',
      'Type: 3x + 4y = 10 and press Enter.',
      'Click the Intersect tool (two curves crossing icon).',
      'Click on line 1, then click on line 2.',
      'What point does GeoGebra show?'
    ],
    quiz: [
      { q: 'The matrix for 2x+3y=7, 3x+4y=10 is...', options: ['[[2,3],[3,4]]', '[[2,3],[4,3]]', '[[7,10],[3,4]]', '[[1,0],[0,1]]'], correct: 0 },
      { q: 'What is the solution (x,y)?', options: ['x=2,y=1', 'x=1,y=2', 'x=3,y=1', 'x=2,y=2'], correct: 1 },
      { q: 'How many solutions does this system have?', options: ['Exactly one', 'Infinite', 'None', 'Two'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDE9C', title: 'Supply-Demand', story: 'Supply: p=2q+1, Demand: p=-3q+20. Intersection = equilibrium!', question: 'What does intersection represent?', answer: 'equilibrium price' },
      { emoji: '\uD83C\uDFE2', title: 'Break-even', story: 'Cost: C=100+20x, Revenue: R=50x. Break-even = intersection.', question: 'Break-even x?', answer: '3.33' },
      { emoji: '\uD83C\uDFD7\uFE0F', title: 'Construction', story: 'Two beams intersect. Need coordinates for support.', question: 'What math finds this?', answer: 'simultaneous equations' },
    ],
    solveExplanation: 'The matrix [[2,3],[3,4]] times vector [x,y] equals vector [7,10]. Intersection solves Ax=b!'
  },
  // Mission 7
  {
    id: 7, emoji: '\uD83D\uDD31', title: 'Time Machine',
    story: 'f(x)=3x+2. If f(a)=17, can you find a? Is it unique? Can you REVERSE any function?',
    goal: 'Understand invertible functions - one input gives one output, and vice versa.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'Find \u03b1 such that f(\u03b1) = 17 for f(x)=3x+2',
    correct: 5,
    tolerance: 0,
    explanation: '3a+2=17 -> 3a=15 -> a=5. Unique! f is invertible because it is one-to-one.',
    ggbHint: 'Type f(x)=3x+2. Then type f(5). Try changing the input.',
    ggbSteps: [
      'Type: f(x) = 3x + 2 and press Enter.',
      'Type: f(5) and press Enter. See what GeoGebra gives.',
      'Now try: Solve(3x+2=17) and press Enter.',
      'GeoGebra shows x=5. That is the unique answer!'
    ],
    quiz: [
      { q: 'Is f(x)=3x+2 invertible? Why?', options: ['Yes - each x gives unique y', 'No - multiple x give same y', 'Yes - it is always positive', 'No - it is not a function'], correct: 0 },
      { q: 'What is the inverse function f\u207b\u00b9(y)?', options: ['(y-2)/3', 'y/3 - 2', '3y+2', 'y-2'], correct: 0 },
      { q: 'If f(a)=17, what is a?', options: ['5', '3', '7', '2'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDCC8', title: 'Temperature', story: 'Celsius to Fahrenheit: F=1.8C+32. Invert to get C from F!', question: 'Inverse function gives?', answer: 'Celsius' },
      { emoji: '\uD83D\uDCB0', title: 'Currency', story: 'USD to INR: INR=83xUSD. Inverse: USD=INR/83.', question: 'What does inverse do?', answer: 'reverse conversion' },
      { emoji: '\uD83C\uDFE0', title: 'Tax Calculation', story: 'Tax: T=0.3xIncome. Inverse tells income from tax paid.', question: 'Inverse =?', answer: 'Income = T/0.3' },
    ],
    solveExplanation: '3a+2=17 -> 3a=15 -> a=5. Each x has exactly one y (and vice versa) => invertible!'
  },
  // Mission 8
  {
    id: 8, emoji: '\uD83C\uDFA2', title: 'Parabola Slide',
    story: 'f(x)=x\u00b2-10. What is f(5)? Slide along the parabola and find out!',
    goal: 'Evaluate a function by tracing along its curve in GeoGebra.',
    ggbType: 'graphing',
    answerType: 'num',
    prompt: 'f(x) = x\u00b2 - 10. What is f(5)?',
    correct: 15,
    tolerance: 0,
    explanation: 'f(5) = 5\u00b2 - 10 = 25 - 10 = 15. The point (5,15) lies on the parabola.',
    ggbHint: 'Type f(x)=x^2-10. Then type f(5). Trace along the curve!',
    ggbSteps: [
      'Type: f(x) = x^2 - 10 and press Enter.',
      'Type: (5, f(5)) and press Enter.',
      'GeoGebra plots the point (5,15)!',
      'Click and drag on the curve - watch y change as x moves.'
    ],
    quiz: [
      { q: 'What is f(0) for f(x)=x\u00b2-10?', options: ['-10', '0', '10', '-5'], correct: 0 },
      { q: 'What is f(-5)?', options: ['15', '-10', '25', '-35'], correct: 0 },
      { q: 'Is f(x)=x\u00b2-10 invertible?', options: ['No - two x give same y', 'Yes - it is a function', 'Yes - it is always positive', 'No - it is not a function'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83C\uDFB0', title: 'Projectile', story: 'Height of ball: h(t)= -5t\u00b2 + 20t. h(2) gives height at t=2s.', question: 'What is height at t=2?', answer: '20' },
      { emoji: '\uD83C\uDFAF', title: 'Profit Curve', story: 'Profit: P(x)= -x\u00b2 + 100x. P(30) = profit at 30 units.', question: 'P(30) =?', answer: '2100' },
      { emoji: '\uD83C\uDF0A', title: 'Tide Height', story: 'Tide: h(t)= 2sin(t) + 5. h(3) = tide height at hour 3.', question: 'What kind of function?', answer: 'trigonometric' },
    ],
    solveExplanation: 'f(5) = 25 - 10 = 15. The point (5,15) is on the parabola. Simple substitution!'
  },
  // Mission 9
  {
    id: 9, emoji: '\uD83C\uDFAF', title: 'Hit the Target',
    story: 'f(x)=x\u00b2-10. f(a)=54. Find a. Can there be TWO answers?',
    goal: 'Discover that inverse of parabola is not a function - two inputs give same output.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find value(s) of a such that f(a) = 54 for f(x)=x\u00b2-10',
    expectedKeywords: ['8', '-8', '\u00b18', 'plus minus 8', '\u00B1', '8 and -8', 'two'],
    explanation: 'a\u00b2 - 10 = 54 -> a\u00b2 = 64 -> a = 8 or a = -8. TWO values! Not invertible.',
    ggbHint: 'Type: Solve(x^2 - 10 = 54). GeoGebra shows two solutions!',
    ggbSteps: [
      'Type: f(x) = x^2 - 10 and press Enter.',
      'Type: y = 54 and press Enter (horizontal line).',
      'Find intersection of f(x) and y=54 using Intersect tool.',
      'How many intersection points? TWO! Both are answers.'
    ],
    quiz: [
      { q: 'How many values of a satisfy f(a)=54?', options: ['2', '1', '0', 'Infinite'], correct: 0 },
      { q: 'What are the two values?', options: ['8 and -8', '8 and 8', '-8 and -10', '10 and -10'], correct: 0 },
      { q: 'Why are there two answers?', options: ['Parabola is symmetric', 'Function is linear', '54 is a perfect square', 'f is invertible'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDCE1', title: 'Signal Strength', story: 'Signal = d\u00b2 - 10. Two positions give same signal strength!', question: 'Why two positions?', answer: 'symmetric' },
      { emoji: '\uD83C\uDFC8', title: 'Projectile Height', story: 'Ball reaches same height twice - going up and coming down.', question: 'Two solutions mean?', answer: 'going up and down' },
    ],
    solveExplanation: 'a\u00b2 = 64 -> a = 8 or a = -8. The parabola is symmetric, so two x give same y.'
  },
  // Mission 10
  {
    id: 10, emoji: '\uD83C\uDFAA', title: 'Roller Coaster',
    story: 'g(x) = x\u00b3 - x\u00b2 - 10x + 2. If g(x) = -22, find x. A cubic can be wild!',
    goal: 'Solve a cubic equation - multiple solutions possible.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Solve g(x) = -22 for g(x) = x\u00b3 - x\u00b2 - 10x + 2',
    expectedKeywords: ['-4', 'x = -4', 'one solution', 'x=-4'],
    explanation: 'x\u00b3 - x\u00b2 - 10x + 2 = -22 -> x\u00b3 - x\u00b2 - 10x + 24 = 0 -> (x+4)(x-2)(x-3) = 0. So x = -4, 2, or 3',
    ggbHint: 'Type: Solve(x^3 - x^2 - 10x + 2 = -22). How many solutions?',
    ggbSteps: [
      'Type: g(x) = x^3 - x^2 - 10x + 2 and press Enter.',
      'Type: y = -22 and press Enter (horizontal line).',
      'Use Intersect tool to find where g(x) and y=-22 meet.',
      'Count the intersections!'
    ],
    quiz: [
      { q: 'How many intersection points does the cubic have with y=-22?', options: ['3', '1', '2', '0'], correct: 0 },
      { q: 'Can a cubic have more solutions than a quadratic?', options: ['Yes - higher degree, more solutions', 'No - they are same', 'Only if no constant term', 'Only if positive'], correct: 0 },
    ],
    realLife: [
      { emoji: '\uD83C\uDFAE', title: 'Video Game Physics', story: 'Character jump follows cubic path. Same height at 3 different times!', question: 'How many solutions possible?', answer: 'up to 3' },
      { emoji: '\uD83D\uDCC9', title: 'Stock Market', story: 'Stock price as cubic function. Same price at 3 different days.', question: 'Why multiple?', answer: 'cubic shape' },
    ],
    solveExplanation: 'Cubic can have up to 3 real solutions. g(x) = -22 gives x = -4, 2, or 3.'
  },
  // Mission 11
  {
    id: 11, emoji: '\uD83D\uDE80', title: 'Dimensional Portal',
    story: 'What are R, R\u00b2, and R\u00b3? A point lives in different dimensions!',
    goal: 'Understand dimensional spaces - 1D line, 2D plane, 3D space.',
    ggbType: 'graphing',
    answerType: 'mcq',
    prompt: 'A point needs 2 coordinates in R\u00b2. What does this mean?',
    options: [
      '2D plane - every point is (x,y)',
      '1D line - every point is (x)',
      '3D space - every point is (x,y,z)',
      '4D space - every point is (x,y,z,w)'
    ],
    correct: 0,
    explanation: 'R = 1D number line (one coordinate). R\u00b2 = 2D plane (two coordinates). R\u00b3 = 3D space (three coordinates).',
    ggbHint: 'Plot a point in 2D (R\u00b2) with (x,y). GeoGebra shows both axes.',
    ggbSteps: [
      'Type: (2,3) and press Enter - a point in R\u00b2.',
      'Type: (0,0) - the origin in R\u00b2.',
      'Notice you need TWO numbers to describe any location.',
      'In R (1D), you would need ONE number. In R\u00b3, THREE numbers!'
    ],
    quiz: [
      { q: 'R = ?', options: ['1D number line', '2D plane', '3D space', 'Set of functions'], correct: 0 },
      { q: 'How many coordinates for a point in R\u00b3?', options: ['3', '2', '1', '4'], correct: 0 },
      { q: 'The origin in R\u00b2 is...', options: ['(0,0)', '(0)', '(0,0,0)', '(1,1)'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83C\uDF0D', title: 'GPS Coordinates', story: 'Latitude, longitude = point in R\u00b2 on Earth surface.', question: 'What space?', answer: 'R\u00b2' },
      { emoji: '\uD83D\uDCF1', title: 'Phone Location', story: 'Lat, Lon, Altitude = point in R\u00b3.', question: 'Third coordinate?', answer: 'altitude' },
      { emoji: '\uD83C\uDFB5', title: 'Sound Waves', story: 'Frequency, amplitude, time = R\u00b3.', question: 'How many dimensions?', answer: '3' },
    ],
    solveExplanation: 'R = 1D, R\u00b2 = 2D, R\u00b3 = 3D. Higher dimensions = more coordinates to describe position!'
  },
  // Mission 12
  {
    id: 12, emoji: '\uD83C\uDF00', title: 'Transformation Machine',
    story: '\u03c6(x,y) = (2x+3y, 3x+4y). This IS a matrix! Write it as a 2x2 matrix.',
    goal: 'See a function as a matrix transformation.',
    ggbType: 'geometry',
    answerType: 'mcq',
    prompt: 'What matrix represents \u03c6(x,y) = (2x+3y, 3x+4y)?',
    options: [
      '[[2,3],[3,4]]',
      '[[2,3],[4,3]]',
      '[[3,2],[4,3]]',
      '[[2,4],[3,3]]'
    ],
    correct: 0,
    explanation: '\u03c6(x,y) = (2x+3y, 3x+4y). The coefficient matrix is [[2,3],[3,4]]. First row gives x\u2019, second gives y\u2019.',
    ggbHint: 'Plot a vector, then apply the transformation. GeoGebra can do matrix multiplication!',
    ggbSteps: [
      'Type: M = {{2,3},{3,4}} and press Enter.',
      'Type: v = (1,2) and press Enter.',
      'Type: M*v and press Enter.',
      'GeoGebra shows the transformed vector!'
    ],
    quiz: [
      { q: 'What is \u03c6(1,0)?', options: ['(2,3)', '(3,4)', '(1,0)', '(0,0)'], correct: 0 },
      { q: 'What is \u03c6(0,1)?', options: ['(3,4)', '(2,3)', '(0,1)', '(1,0)'], correct: 0 },
      { q: 'Why study matrices as functions?', options: ['Unified framework for transformations', 'They are easier to compute', 'They look nice', 'No reason'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDDA5', title: 'Image Processing', story: 'Each pixel (r,g,b) transformed by a matrix for filters!', question: 'What does matrix do?', answer: 'transforms colors' },
      { emoji: '\uD83C\uDFA8', title: 'Computer Graphics', story: 'Rotate, scale, shear objects using 3x3 matrices.', question: 'What transformation?', answer: 'rotate' },
      { emoji: '\uD83E\uDD16', title: 'AI/ML', story: 'Neural network layers are just matrix multiplications!', question: 'Layers =?', answer: 'matrix transforms' },
    ],
    solveExplanation: '\u03c6(x,y) = (2x+3y, 3x+4y). First row coefficients: [2,3]. Second row: [3,4]. Matrix = [[2,3],[3,4]]!'
  },
  // Mission 13
  {
    id: 13, emoji: '\uD83E\uDDE9', title: 'Jigsaw Puzzle',
    story: 'Can you REVERSE the transformation? If \u03c6(x,y) = (2x+3y, 3x+4y), can you always find (x,y) from the output?',
    goal: 'Check if a matrix is invertible by checking if its determinant is non-zero.',
    ggbType: 'geometry',
    answerType: 'mcq',
    prompt: 'Is the transformation \u03c6 invertible? (determinant = 2*4 - 3*3 = -1)',
    options: [
      'Yes - determinant = -1, non-zero so invertible',
      'No - determinant = -1, negative so not invertible',
      'Yes - determinant = 1',
      'No - determinant = 0'
    ],
    correct: 0,
    explanation: 'det = 2*4 - 3*3 = 8 - 9 = -1. Non-zero determinant means the matrix is invertible!',
    ggbHint: 'Compute the determinant in GeoGebra. Then try to invert the matrix.',
    ggbSteps: [
      'Type: M = {{2,3},{3,4}} and press Enter.',
      'Type: Determinant(M) and press Enter. Result = -1',
      'Type: M^(-1) and press Enter. This is the inverse!',
      'A non-zero determinant means you can reverse the transformation.'
    ],
    quiz: [
      { q: 'What is det([[1,2],[2,4]])?', options: ['0', '1', '-2', '4'], correct: 0 },
      { q: 'A zero determinant means...', options: ['Not invertible (information lost)', 'Perfectly invertible', 'Determinant is infinite', 'Matrix is identity'], correct: 0 },
      { q: 'Why is inverse important?', options: ['Solves Ax=b by x=A\u207b\u00b9b', 'Makes matrix bigger', 'Changes dimension', 'No practical use'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83C\uDFC8', title: 'Robotics', story: 'Robot arm needs to reverse its transformation to find joint angles from position.', question: 'What does inverse give?', answer: 'joint angles' },
      { emoji: '\uD83D\uDCCA', title: 'Data Analysis', story: 'PCA uses eigenvectors to compress data. Invert to reconstruct.', question: 'Compression needs?', answer: 'invertibility' },
    ],
    solveExplanation: 'det = ad - bc = 2*4 - 3*3 = -1. Non-zero => invertible. A\u207b\u00b9 exists!'
  },
  // Mission 14
  {
    id: 14, emoji: '\uD83D\uDC7B', title: 'The Vanishing Act',
    story: 'Matrix [[1,2],[2,4]] has determinant ZERO. Which vectors VANISH (map to origin)?',
    goal: 'Find the null space / kernel of a non-invertible matrix.',
    ggbType: 'graphing',
    answerType: 'text',
    prompt: 'Find a non-zero vector (x,y) such that [[1,2],[2,4]]*(x,y) = (0,0)',
    expectedKeywords: ['2,-1', '2, -1', '(2,-1)', '(2, -1)', '(-2,1)', '(-2, 1)', 'x=-2y', 'x=2y', 't(2,-1)'],
    explanation: 'x+2y=0 and 2x+4y=0. Both say x=-2y. So (x,y) = t*(-2,1). All vectors on this line map to origin!',
    ggbHint: 'Type M={{1,2},{2,4}}. Det(M) is 0. Find v such that M*v=(0,0).',
    ggbSteps: [
      'Type: M = {{1,2},{2,4}} and press Enter.',
      'Type: Determinant(M) - it is ZERO!',
      'Type: v = (2, -1) and press Enter.',
      'Type: M*v and press Enter. Result: (0,0)!',
      'These vectors form the KERNEL or NULL SPACE.'
    ],
    quiz: [
      { q: 'What does det=0 mean?', options: ['Matrix is singular - info lost', 'Matrix is perfect', 'Determinant is undefined', 'Matrix is identity'], correct: 0 },
      { q: 'The set of vectors mapping to origin is called...', options: ['Kernel/Null space', 'Range/Image', 'Column space', 'Row space'], correct: 0 },
      { q: 'How many vectors map to origin?', options: ['Infinite (a whole line)', 'Only the zero vector', 'Exactly one', 'Two'], correct: 0 }
    ],
    realLife: [
      { emoji: '\uD83D\uDCF7', title: 'Image Blur', story: 'Blurry image = original passed through singular matrix. Info lost!', question: 'Can we perfectly restore?', answer: 'no - info lost' },
      { emoji: '\uD83D\uDD0A', title: 'Audio Compression', story: 'Lossy compression = singular transform. Some info vanishes.', question: 'What vanishes?', answer: 'null space info' },
      { emoji: '\uD83D\uDCE6', title: 'Network Routing', story: 'Some traffic patterns cancel out at a node (kernel).', question: 'What does kernel represent?', answer: 'vanishing flows' },
    ],
    solveExplanation: 'det=0 -> singular. [[1,2],[2,4]]*(x,y)=(0,0) -> x+2y=0 -> x=-2y. Line of vectors map to origin!'
  },
];

/* ── GeoGebra embed component ──────────────────────── */
function GGBEmbed({ missionId, ggbType }) {
  const [ggbFailed, setGgbFailed] = useState(false);
  const wrapRef = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const el = wrapRef.current;
    if (!el) return;
    const containerId = 'ggb-c-' + missionId + '-' + Date.now();

    const tryInject = () => {
      if (!window.GGBApplet || cancelled) { setGgbFailed(true); return; }
      const rect = el.getBoundingClientRect();
      const w = Math.max(rect.width - 2, 300);
      const h = Math.max(rect.height - 2, 300);
      const params = {
        appName: ggbType || 'graphing',
        width: Math.round(w),
        height: Math.round(h),
        showToolBar: true,
        showMenuBar: false,
        showAlgebraInput: true,
        enableRightClick: false,
        language: 'en',
        borderColor: '#2c2622',
        id: containerId,
      };
      try {
        const applet = new window.GGBApplet(params);
        applet.inject(containerId);
        readyRef.current = true;
      } catch (e) {
        if (!cancelled) setGgbFailed(true);
      }
    };

    const inner = document.createElement('div');
    inner.id = containerId;
    inner.style.width = '100%';
    inner.style.height = '100%';
    el.innerHTML = '';
    el.appendChild(inner);

    const timer = setTimeout(tryInject, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [missionId]);

  return (
    <div className="la-ggb-wrap" ref={wrapRef}>
      {ggbFailed && (
        <div className="fallback-message">
          <p>GeoGebra could not load. Try refreshing or work on paper!</p>
        </div>
      )}
    </div>
  );
}

/* ── LinearAlgebraApp component ────────────────────── */
function LinearAlgebraApp({ onBack }) {
  const [currentMission, setCurrentMission] = useState(1);
  const [phase, setPhase] = useState('intro');
  const [skillLevel, setSkillLevel] = useState(null);
  const [showSteps, setShowSteps] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [solvedMissions, setSolvedMissions] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('la_solved') || '[]'); } catch { return []; }
  });
  const [selectedRL, setSelectedRL] = useState(null);
  const [rlAnswer, setRlAnswer] = useState('');
  const [rlFeedback, setRlFeedback] = useState(null);

  const mission = MISSIONS.find(m => m.id === currentMission) || MISSIONS[0];
  const isLastMission = currentMission >= 14;
  const moduleComplete = solvedMissions.length >= 14;

  useEffect(() => {
    try { sessionStorage.setItem('la_solved', JSON.stringify([...new Set(solvedMissions)])); } catch {}
  }, [solvedMissions]);

  const markSolved = (id) => {
    setSolvedMissions(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const checkAnswer = () => {
    const m = mission;
    const input = answer.trim();
    let correct = false;
    let msg = '';

    if (m.answerType === 'mcq') {
      correct = parseInt(input, 10) === m.correct;
      msg = correct ? 'Correct!' : 'Not quite. Look at what GeoGebra shows.';
    } else if (m.answerType === 'num') {
      const val = parseFloat(input);
      if (isNaN(val)) { setFeedback({ correct: false, message: 'Please enter a number!', detail: '' }); setAttempts(a => a + 1); return; }
      const tol = m.tolerance !== undefined ? m.tolerance : 0.001;
      correct = Math.abs(val - m.correct) < tol;
      msg = correct ? 'Correct!' : 'Not right. Try again using GeoGebra.';
    } else if (m.answerType === 'text') {
      correct = textMatches(input, m.expectedKeywords || []);
      msg = correct ? 'Correct! Your understanding is right.' : 'Not quite. Try exploring in GeoGebra more.';
    }

    setAttempts(a => a + 1);
    setFeedback({ correct, message: msg, detail: m.explanation || '' });
    if (correct) markSolved(m.id);
  };

  const startSkillCheck = () => setPhase('skill');
  const startPlay = () => {
    const hideAll = skillLevel === 'perfect';
    setPhase('play'); setFeedback(null); setAnswer(''); setAttempts(0);
    setShowHint(false); setShowAnswer(false); setShowSteps(!hideAll);
    setSelectedRL(null); setRlAnswer(''); setRlFeedback(null);
    setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false);
  };
  const startQuiz = () => { setPhase('quiz'); setQuizAnswers({}); setQuizSubmitted(false); setQuizPassed(false); };
  const nextMission = () => { if (currentMission < 14) { setCurrentMission(c => c + 1); setPhase('intro'); } };
  const selectQuizOption = (qi, oi) => setQuizAnswers(prev => ({ ...prev, [qi]: oi }));

  const submitQuiz = () => {
    const qs = mission.quiz || [];
    let allCorrect = qs.every((q, i) => quizAnswers[i] === q.correct);
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
  };

  const handleRLSelect = (idx) => { setSelectedRL(idx); setRlAnswer(''); setRlFeedback(null); };

  const guidancePanel = () => {
    if (phase !== 'play' || !mission) return null;
    const showDetailed = (skillLevel === 'new' && showSteps) || (attempts >= 2 && showSteps);
    return (
      <div>
        <button className="la-guidance-toggle" onClick={() => setShowSteps(!showSteps)}>
          {showSteps ? 'Hide steps' : 'Show steps'}
        </button>
        {showSteps && mission.ggbSteps && (
          <div className="la-guidance">
            {mission.ggbSteps.map((step, i) => <div key={i} className="la-guidance-step">{step}</div>)}
          </div>
        )}
        {showHint && <div className="la-guidance-hint"><strong>Hint: </strong>{mission.ggbHint}</div>}
        {showAnswer && <div className="la-guidance" style={{ borderLeftColor: 'var(--la-accent)' }}><strong>Explanation: </strong>{mission.solveExplanation}</div>}
      </div>
    );
  };

  const actionButtons = () => (
    <div className="la-action-row">
      <button className="la-action-btn" onClick={() => setShowHint(!showHint)}>{showHint ? 'Hide hint' : 'What do I do?'}</button>
      <button className="la-action-btn" onClick={() => setShowSteps(!showSteps)}>{showSteps ? 'Hide steps' : 'Show me!'}</button>
      <button className="la-action-btn" onClick={() => { setShowAnswer(!showAnswer); setShowSteps(true); }}>{showAnswer ? 'Hide answer' : 'Give up'}</button>
    </div>
  );

  const answerArea = () => {
    if (!mission) return null;
    if (mission.answerType === 'mcq') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-mcq-grid">
            {mission.options.map((opt, i) => (
              <button key={i} className={'la-mcq-option' + (answer === String(i) ? ' selected' : '')} onClick={() => setAnswer(String(i))}>{opt}</button>
            ))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="la-check-btn" onClick={checkAnswer} disabled={answer === ''}>Check</button>
          </div>
        </div>
      );
    }
    if (mission.answerType === 'num') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-input-row">
            <input className="la-num-input" type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Enter number" autoFocus />
            <button className="la-check-btn" onClick={checkAnswer} disabled={!answer.trim()}>Check</button>
          </div>
        </div>
      );
    }
    if (mission.answerType === 'text') {
      return (
        <div className="la-answer-area">
          <div className="la-question-prompt">{mission.prompt}</div>
          <div className="la-input-row">
            <input className="la-text-input" type="text" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type your answer..." autoFocus />
            <button className="la-check-btn" onClick={checkAnswer} disabled={!answer.trim()}>Check</button>
          </div>
        </div>
      );
    }
    return null;
  };

  const feedbackArea = () => {
    if (!feedback) return null;
    return (
      <div className={'la-feedback ' + (feedback.correct ? 'correct' : 'wrong')}>
        <div className="la-feedback-message">{feedback.message}</div>
        {feedback.detail && <div className="la-feedback-detail">{feedback.detail}</div>}
      </div>
    );
  };

  const quizSection = () => {
    const qs = mission.quiz || [];
    const allAnswered = qs.every((_, i) => quizAnswers[i] !== undefined);
    return (
      <div className="la-quiz-section">
        <div className="la-quiz-title">Quick Test</div>
        {qs.map((q, i) => {
          const selected = quizAnswers[i];
          const isCorrect = quizSubmitted && selected === q.correct;
          const isWrong = quizSubmitted && selected !== undefined && selected !== q.correct;
          return (
            <div key={i} className="la-quiz-question">
              <div className="la-quiz-q-text">{q.q}</div>
              <div className="la-quiz-options">
                {q.options.map((o, oi) => {
                  let cls = 'la-quiz-opt';
                  if (selected === oi) cls += ' selected';
                  if (isCorrect && oi === q.correct) cls += ' correct';
                  if (isWrong && oi === selected) cls += ' wrong';
                  return <button key={oi} className={cls} onClick={() => !quizSubmitted && selectQuizOption(i, oi)} disabled={quizSubmitted}>{o}</button>;
                })}
              </div>
              {quizSubmitted && <div className={'la-quiz-result ' + (isCorrect ? 'pass' : 'fail')}>{isCorrect ? 'Correct!' : isWrong ? 'Wrong' : ''}</div>}
            </div>
          );
        })}
        {!quizSubmitted && <button className="la-quiz-next-btn" onClick={submitQuiz} disabled={!allAnswered}>Submit Quiz</button>}
        {quizSubmitted && (
          <div>
            <div className={'la-quiz-result ' + (quizPassed ? 'pass' : 'fail')}>{quizPassed ? 'All correct!' : 'Some wrong. Try again!'}</div>
            {quizPassed && <button className="la-quiz-next-btn" onClick={nextMission}>{isLastMission ? 'Finish Module' : 'Next Mission'}</button>}
            {!quizPassed && <button className="la-quiz-next-btn" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>Retry Quiz</button>}
          </div>
        )}
      </div>
    );
  };

  const realLifeSection = () => {
    const rls = mission.realLife || [];
    const rl = selectedRL !== null ? rls[selectedRL] : null;
    return (
      <div className="la-reallife">
        <div className="la-reallife-title">Real-Life Applications</div>
        {selectedRL === null ? (
          <div className="la-reallife-grid">
            {rls.map((rlItem, i) => (
              <button key={i} className="la-reallife-card" onClick={() => handleRLSelect(i)}>
                <span className="rl-emoji">{rlItem.emoji}</span>
                <span className="rl-title">{rlItem.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="la-reallife-expanded">
            <button className="rl-back-btn" onClick={() => { setSelectedRL(null); setRlFeedback(null); setRlAnswer(''); }}>&larr; Back to gallery</button>
            <div className="rl-emoji-large">{rl.emoji}</div>
            <div className="rl-story">{rl.story}</div>
            <div className="rl-puzzle-box">
              <div className="rl-question"><strong>Your turn:</strong> {rl.question}</div>
              <div className="rl-input-area">
                <input className="la-text-input" type="text" value={rlAnswer}
                  onChange={e => setRlAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{ flex: 1, minWidth: 150 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && rlAnswer.trim()) {
                      const exp = (rl.answer || '').toLowerCase().trim();
                      const got = rlAnswer.toLowerCase().trim();
                      setRlFeedback(got.includes(exp) || got === exp ? '✓ Correct! Well done!' : '✗ Not quite. Try again!');
                    }
                  }} />
                <button className="la-check-btn" onClick={() => {
                  const exp = (rl.answer || '').toLowerCase().trim();
                  const got = rlAnswer.toLowerCase().trim();
                  setRlFeedback(got.includes(exp) || got === exp ? '✓ Correct! Well done!' : '✗ Not quite. Try again!');
                }} disabled={!rlAnswer.trim()}>Check</button>
              </div>
              {rlFeedback && (
                <div className={'rl-feedback ' + (rlFeedback.startsWith('✓') ? 'correct' : 'wrong')}>
                  {rlFeedback}
                </div>
              )}
              {rlFeedback && rlFeedback.startsWith('✓') && (
                <div className="rl-done">Great! You understand how this concept applies in real life!</div>
              )}
              {rlFeedback && rlFeedback.startsWith('✗') && (
                <div className="rl-hint">Hint: Look at the graph above and think about what changes in this scenario!</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (moduleComplete) {
    const pct = Math.round((solvedMissions.length / 14) * 100);
    return (
      <div className="la-module">
        <button className="la-back" onClick={onBack}>&larr; Home</button>
        <div className="la-complete">
          <h2>Module 1 Complete!</h2>
          <div className="big-score">{solvedMissions.length}/14</div>
          <p>You mastered Linear Algebra Module 1 - Linear Relations!</p>
          <p>Score: {pct}%</p>
          <div className="teaser">Module 2 - Vector Spaces & Subspaces: Coming Soon!</div>
          <button className="la-quiz-next-btn" onClick={onBack} style={{ marginTop: 16, maxWidth: 300, margin: '16px auto 0' }}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="la-module">
      <button className="la-back" onClick={onBack}>&larr; Home</button>
      <div className="la-header">
        <span className="la-module-pill">Module 1 - Linear Relations</span>
        <h1>{mission.emoji} {mission.title}</h1>
        <p>Mission {currentMission} of 14</p>
      </div>

      <div className="la-progress">
        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => (
          <div key={i} className={'la-progress-dot' + (solvedMissions.includes(i) ? ' solved' : '') + (i === currentMission ? ' active' : '') + (i > currentMission ? ' locked' : '')} title={'Mission ' + i}>
            {solvedMissions.includes(i) ? '\u2713' : i}
          </div>
        ))}
      </div>

      {phase === 'intro' && (
        <div className="la-mission">
          <div className="la-mission-goal"><strong>Your Mission:</strong> {mission.goal}</div>
          <p style={{ lineHeight: 1.6, color: 'var(--la-text-soft)', marginBottom: 14 }}>{mission.story}</p>
          <button className="la-quiz-next-btn" onClick={startSkillCheck} style={{ maxWidth: 250, margin: '0 auto' }}>Accept Mission</button>
        </div>
      )}

      {phase === 'skill' && (
        <div className="la-mission">
          <p style={{ marginBottom: 10, fontWeight: 500 }}>How comfortable are you with GeoGebra?</p>
          <div className="la-skill-check">
            <button className={'la-skill-btn' + (skillLevel === 'new' ? ' selected' : '')} onClick={() => setSkillLevel('new')}>Show me the ropes</button>
            <button className={'la-skill-btn' + (skillLevel === 'little' ? ' selected' : '')} onClick={() => setSkillLevel('little')}>I know some things</button>
            <button className={'la-skill-btn' + (skillLevel === 'perfect' ? ' selected' : '')} onClick={() => setSkillLevel('perfect')}>Let me cook - no hints</button>
          </div>
          <button className="la-check-btn" onClick={startPlay} disabled={!skillLevel} style={{ width: '100%', marginTop: 8 }}>Start Exploring</button>
        </div>
      )}

      {phase === 'play' && (
        <div className="la-mission">
          <GGBEmbed missionId={currentMission} ggbType={mission.ggbType} />
          <div className="la-question-prompt" style={{ fontSize:'1rem', margin:'12px 0 10px', lineHeight:1.5, fontWeight:600 }}>{mission.prompt}</div>
          {actionButtons()}
          {guidancePanel()}
          {answerArea()}
          {feedbackArea()}
          {feedback && feedback.correct && !quizSubmitted && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button className="la-quiz-next-btn" onClick={startQuiz} style={{ maxWidth: 300, margin: '0 auto' }}>Take the Quick Test</button>
            </div>
          )}
        </div>
      )}

      {phase === 'quiz' && (
        <div className="la-mission">
          {quizSection()}
        </div>
      )}

      {phase === 'quiz' && quizSubmitted && quizPassed && (
        <div className="la-mission">
          <div className="la-reallife-title" style={{ textAlign: 'center', marginBottom: 12 }}>Unlocked: Real-Life Applications</div>
          {realLifeSection()}
        </div>
      )}
    </div>
  );
}

export default LinearAlgebraApp;
