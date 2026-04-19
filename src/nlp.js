const categoryRules = {
  "Food & Dining": {
    keywords: ["zomato","swiggy","restaurant","cafe","food","lunch","dinner","breakfast","pizza","burger","hotel","dhaba","tea","coffee","chai","biryani","mess","canteen","grocery","vegetables","fruits","milk","bread","eggs"],
    patterns: [/food/i, /eat/i, /meal/i, /kitchen/i, /bakery/i]
  },
  "Transportation": {
    keywords: ["uber","ola","rapido","bus","metro","auto","petrol","diesel","fuel","train","flight","cab","taxi","parking","toll","bike","car service","rto"],
    patterns: [/transport/i, /travel fare/i, /commute/i]
  },
  "Entertainment": {
    keywords: ["netflix","hotstar","amazon prime","youtube","bookmyshow","cinema","movie","concert","spotify","gaming","playstation","xbox","pvr","inox","multiplex"],
    patterns: [/entertainment/i, /subscription/i, /streaming/i]
  },
  "Education": {
    keywords: ["college","university","school","tuition","course","udemy","coursera","books","stationery","exam","fee","library","workshop","training"],
    patterns: [/education/i, /learning/i, /class/i]
  },
  "Healthcare": {
    keywords: ["hospital","clinic","doctor","pharmacy","medicine","apollo","fortis","medplus","lab","test","dental","optical","health","insurance premium"],
    patterns: [/medical/i, /health/i, /prescription/i]
  },
  "Shopping": {
    keywords: ["amazon","flipkart","myntra","ajio","meesho","nykaa","clothes","shoes","shirt","jeans","dress","mobile","laptop","electronics","mall","market","reliance","dmart","bigbasket"],
    patterns: [/shopping/i, /purchase/i, /order/i]
  },
  "Utilities": {
    keywords: ["electricity","water","wifi","internet","airtel","jio","vodafone","bsnl","gas","lpg","bill","maintenance","society","recharge","dth","cable"],
    patterns: [/utility/i, /bill/i, /charge/i]
  },
  "Rent": {
    keywords: ["rent","landlord","house","flat","pg","accommodation","deposit","lease","room"],
    patterns: [/rent/i, /housing/i]
  },
  "Personal Care": {
    keywords: ["salon","barber","haircut","spa","gym","fitness","yoga","beauty","makeup","cosmetics","grooming"],
    patterns: [/personal care/i, /grooming/i]
  },
  "Travel": {
    keywords: ["irctc","makemytrip","goibibo","oyo","hotel booking","holiday","tour","trip","vacation","airport","luggage"],
    patterns: [/travel/i, /trip/i, /vacation/i]
  },
  "Investment": {
    keywords: ["gold","silver","mutual fund","sip","stocks","zerodha","groww","nse","bse","fd","fixed deposit","rd","recurring"],
    patterns: [/invest/i, /portfolio/i]
  },
  "Income": {
    keywords: ["salary","stipend","freelance","payment received","credit","bonus","reward","cashback","refund","dividend","interest earned"],
    patterns: [/salary/i, /income/i, /earned/i]
  }
};

function categorizeTransaction(description) {
  if (!description) return { category: "Miscellaneous", confidence: 0, isAI: false };
  const desc = description.toLowerCase();
  let bestCategory = "Miscellaneous";
  let bestScore = 0;
  
  for (const [category, rules] of Object.entries(categoryRules)) {
    let score = 0;
    for (const keyword of rules.keywords) {
      if (desc.includes(keyword)) score += 10;
    }
    for (const pattern of rules.patterns) {
      if (pattern.test(desc)) score += 5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  if (bestScore === 0) return { category: "Miscellaneous", confidence: 0, isAI: false };
  const confidence = Math.min(95, 60 + bestScore * 2);
  return { category: bestCategory, confidence, isAI: true };
}
