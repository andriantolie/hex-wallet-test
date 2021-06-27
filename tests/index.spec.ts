//********************************************************************************
// Part 2 : Tests
//
// * Describe your process to tests some of the functions and properties above
// * It can either be code, or just commented explanations on the testing procedure
//   (what, how, ..)
//********************************************************************************

import Coin from '../src/coin';
import Wallet from '../src/wallet';

describe('Wallet Test Suite', () => {

  let walletA: Wallet;
  let walletB: Wallet;
  let walletC: Wallet;

  beforeEach(() => {
    walletA = new Wallet(1, 10, 100, 1000, 10000);
    walletB = new Wallet(1, 2, 3, 4, 5);
    walletC =  new Wallet(19, 40, 60, 80, 100);
  })

  it('checks for total available coin', () => {
    expect(walletA.available()).toEqual(11111);
    expect(walletB.available()).toEqual(15);
    expect(walletC.available()).toEqual(299);
  })

  it('adds new coin', () => {
    walletA.add(new Coin(100000))
    expect(walletA.available()).toEqual(111111);
  })

  it('distributes coins', () => {
    const buckets = walletA.distribution(2).buckets;
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      switch(i) {
        case 0: {
          expect(bucket[0].getValue()).toEqual(1);
          break;
        }
        case 3: {
          expect(bucket[0].getValue()).toEqual(10);
          break;
        }
        case 6: {
          expect(bucket[0].getValue()).toEqual(100);
          break;
        }
        case 9: {
          expect(bucket[0].getValue()).toEqual(1000);
          break;
        }
        case 13: {
          expect(bucket[0].getValue()).toEqual(10000);
          break;
        }
        default: {
          expect(bucket.length).toEqual(0);
        }
      }
    }
  })

  it('spends coins', () => {
    const amountToSpend = 200;
    {
      const spentCoins = walletA.spend(amountToSpend);
      expect(spentCoins.length).toEqual(1)
      expect(spentCoins[0].getValue()).toEqual(1000)
      expect(walletA.available()).toEqual(10111)
    }

    expect(() => {
      walletB.spend(amountToSpend)
    }).toThrowError();

    {
      const spentCoins = walletC.spend(amountToSpend);
      expect(spentCoins.length).toEqual(3)
      expect(spentCoins[0].getValue()).toEqual(100)
      expect(spentCoins[1].getValue()).toEqual(60)
      expect(spentCoins[2].getValue()).toEqual(40)
      expect(walletC.available()).toEqual(99)
    }
  })

  it('reserves coins', () => {
    const amountToReserve = 200;
    {
      let reservationHandle = walletA.reserve(amountToReserve);
      expect(reservationHandle.getCoins().length).toEqual(1)
      expect(reservationHandle.getCoins()[0].getValue()).toEqual(1000)
      expect(walletA.available()).toEqual(10111)

      walletA.reservationCancel(reservationHandle)
      expect(walletA.available()).toEqual(11111)
      expect(reservationHandle.getCoins().length).toEqual(0)

      reservationHandle = walletA.reserve(amountToReserve);
      walletA.reservationSpend(reservationHandle)
      expect(reservationHandle.getCoins().length).toEqual(0)
      expect(walletA.available()).toEqual(10111)
    }

    expect(() => {
      walletB.spend(amountToReserve)
    }).toThrowError();

    {
      let reservationHandle = walletC.reserve(amountToReserve);
      expect(reservationHandle.getCoins().length).toEqual(3)
      expect(reservationHandle.getCoins()[0].getValue()).toEqual(100)
      expect(reservationHandle.getCoins()[1].getValue()).toEqual(60)
      expect(reservationHandle.getCoins()[2].getValue()).toEqual(40)
      expect(walletC.available()).toEqual(99)

      walletC.reservationCancel(reservationHandle)
      expect(walletC.available()).toEqual(299)
      expect(reservationHandle.getCoins().length).toEqual(0)

      reservationHandle = walletC.reserve(amountToReserve);
      walletC.reservationSpend(reservationHandle)
      expect(reservationHandle.getCoins().length).toEqual(0)
      expect(walletC.available()).toEqual(99)
    }
  })
});