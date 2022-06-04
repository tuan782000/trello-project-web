/**
 * Created by tuannguyen's author on 02/26/2021
 * ---
 *
 */
//onKeyDown
export const saveContentAfterPressEnter = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.target.blur()
  }
}

// Select all input value when click
export const selectAllInlineText = (e) => {
  e.target.focus()
  e.target.select()
}
