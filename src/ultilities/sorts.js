/**
 * Created by tuannguyen's author on 02/26/2021
 * ---
 * Order an array of objects based on another array order
 * ---
 *
 */
export const mapOrder = (array, order, key) => {
  if (!array || !order || !key) {return []}

  array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]))
  return array
}