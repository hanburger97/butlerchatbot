export const stripeAmount = (amount) => {
  amount = Number(amount)
  return Math.round(amount * 100)
}

