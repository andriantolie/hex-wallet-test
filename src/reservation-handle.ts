import Coin from './coin';

class ReservationHandle {
  private coins: Array<Coin>;

  constructor(coins: Array<Coin>) {
    this.coins = coins;
  }

  public getCoins() {
    return this.coins;
  }

  public release() {
    const coins  = this.coins;
    this.coins = [];
    return coins;
  }
}

export default ReservationHandle;
