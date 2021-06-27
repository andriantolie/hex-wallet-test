import Coin from './coin';
import Distribution from './distribution';
import ReservationHandle from './reservation-handle';

// The Wallet Class
class Wallet {
  private coins: Array<Coin>;

  constructor(...values: number[]) {
    // You are free to change the constructor to match your needs.
    this.coins = [];
    for (let value of values) {
      this.coins.push(new Coin(value));
    }
  }

  //********************************************************************************
  // Part 1 : API
  //********************************************************************************


  //********************************************************************************
  // Part 1.1: return the total amount of coins available in this wallet
  //********************************************************************************
  public available(): number {
    return this.coins.reduce((acc, coin) => acc + coin.getValue(), 0);
  }

  //********************************************************************************
  // Part 1.2: Add coins to this wallet
  //
  // We want the ability to reserve
  //********************************************************************************
  public add(coin: Coin) {
    this.coins.push(coin);
  }

  //********************************************************************************
  // Part 1.3: Distribution of coins
  //
  // We want to be able to categorize the coins scale distribution we have in the wallet.
  //
  // For example, using a scale of 1000, we want to categorize in bucket of the following range:
  //
  // * bucket[0] : 0 .. 999
  // * bucket[1] : 1_000 .. 999_999
  // * bucket[2] : 1_000_000 .. 999_999_999.
  // * bucket[3] : etc
  //
  // Given the following wallet coins: [1_234, 5, 67, 1_000_001] should result in the following:
  // * bucket[0] : [5, 67]
  // * bucket[1] : [1_234]
  // * bucket[2] : [1_000_001]
  //********************************************************************************
  public distribution(scale: number): Distribution {
    let buckets = new Array();
    this.coins.sort((a, b) => a.getValue() - b.getValue());
    // Using Math.log gave me precision error, so I keep track of the scale power manually
    let scalePower = 0;
    let bucketUpperLimit = Math.pow(scale, scalePower + 1) - 1;
    buckets[0] = [];
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      // If the coin doesn't belong to this bucket, since the coins are sorted,
      // we can keep increasing the scale power until we find the right bucket
      while (coin.getValue() > bucketUpperLimit) {
        scalePower++;
        bucketUpperLimit = Math.pow(scale, scalePower + 1) - 1;
        if (!buckets[scalePower]) buckets[scalePower] = [];
      }
      buckets[scalePower].push(coin);
    }
    return new Distribution(buckets);
  }

  //********************************************************************************
  // Part 1.4: Spending from this wallet a specific amount
  //
  // Try to construct a valid result where the sum of coins return are above the requested
  // amount, and try to stay close to the amount as possible. Explain your choice of
  // algorithm.
  //
  // If the requested cannot be satisfied then an error should be return.
  //********************************************************************************
  public spend(amount: number): Array<Coin> {
    const available = this.available();
    if (available < amount) {
      throw new Error('Insufficient funds in the wallet.');
    }
    this.coins.sort((a, b) => a.getValue() - b.getValue());
    let usedCoins = new Array<Coin>();
    let unusedCoins = new Array<Coin>();
    let currentSum = available;
    // Iterate from the largest value available 
    // Assume we use all coins to spent and remove any coin encountered during iteration
    // that can be removed while keeping the sum to be sufficient for the spending
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (currentSum - coin.getValue() >= amount) {
        currentSum -= coin.getValue();
        unusedCoins.push(coin);
      } else {
        usedCoins.push(coin);
      }
    }
    this.coins = unusedCoins;
    return usedCoins;
  }


  //********************************************************************************
  // Part 1.5: Reserving assets
  //
  // In certain cases, it's important to consider that some coins need to be reserved;
  // for example we want to put aside some coins from a wallet while
  // we conduct other verification, so that once we really want to spend, we
  //
  // We need a way to reserve and keep a handle of this reservation; this works very similarly
  // to the previous part (1.4) except that the fund are kept in the wallet and reserved
  // until the user either 'cancel' or 'spend' this reservation.
  //
  // With cancel, the locked coins are returned to the available funds
  // With spend, the locked coins are remove from the wallet and given to the user
  //********************************************************************************
  public reserve(amount: number): ReservationHandle{
    return new ReservationHandle(this.spend(amount));
  }

  public reservationSpend(reservation: ReservationHandle): Array<Coin> {
    return reservation.release();
  }

  public reservationCancel(reservation: ReservationHandle) {
    this.coins = this.coins.concat(reservation.release());
  }
}

export default Wallet;

