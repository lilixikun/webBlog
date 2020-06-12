function minCoinChange(coins, amount) {
    const cache = []; // {1} 
    const makeChange = (value) => { // {2} 
        if (!value) { // {3} 
            return [];
        }
        if (cache[value]) { // {4} 
            return cache[value];
        }
        let min = [];
        let newMin;
        let newAmount;
        for (let i = 0; i < coins.length; i++) { // {5} 
            const coin = coins[i];
            newAmount = value - coin; // {6} 
            if (newAmount >= 0) {
                newMin = makeChange(newAmount); // {7} 
            }
            if (
                newAmount >= 0 && // {8} 
                (newMin.length < min.length - 1 || !min.length) && // {9} 
                (newMin.length || !newAmount) // {10} 
            ) {
                min = [coin].concat(newMin); // {11} 
                console.log('new Min ' + min + ' for ' + amount);
            }

        }
        return (cache[value] = min); // {12} 
    };
    return makeChange(amount); // {13} 
}
console.log(minCoinChange([1, 5, 10, 25], 36));