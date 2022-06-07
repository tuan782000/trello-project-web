import React, { useEffect, useState, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { cloneDeep } from 'lodash'

import './Column.scss'
import { mapOrder } from 'ultilities/sorts'

import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import { MODAL_ACTION_CONFIRM } from 'ultilities/constants'
import { saveContentAfterPressEnter, selectAllInlineText } from 'ultilities/contentEditable'
import { createNewCard, updateColumn } from 'actions/ApiCall'

function Column(props) {
  const { column, onCardDrop, onUpdateColumnState } = props
  const cards = mapOrder(column.cards, column.cardOrder, '_id')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

  const [columnTitle, setColumnsTitle] = useState('')
  const handleColumnTitleChange = (e) => setColumnsTitle(e.target.value)

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const newCardTextareaRef = useRef(null)

  const [newCardTitle, setNewCardTitle] = useState('')
  const onNewCardTitleChange = (e) => setNewCardTitle(e.target.value)

  useEffect(() => {
    setColumnsTitle(column.title)
  }, [column.title])

  useEffect(() => {
    if (newCardTextareaRef && newCardTextareaRef.current) {
      newCardTextareaRef.current.focus()
      newCardTextareaRef.current.select()
    }
  }, [openNewCardForm])
  // Remove Column
  const onConfirmModalAction = (type) => {
    if (type === MODAL_ACTION_CONFIRM) {
      //remove Column
      const newColumn = {
        ...column,
        _destroy:true
      }
      // Call api update column
      updateColumn(newColumn._id, newColumn).then(updatedColumn => {
        onUpdateColumnState(updatedColumn)
      })
    }
    toggleShowConfirmModal()
  }
  //Update column title
  const handleColumnTitleBlur = () => {
    if (columnTitle !== column.title) {
      const newColumn = {
        ...column,
        title: columnTitle
      }
    }
  }

  const addNewCard = () => {
    if (!newCardTitle) {
      newCardTextareaRef.current.focus()
      return
    }

    const newCardToAdd = {
      boardId: column.boardId,
      columnId: column._id,
      title: newCardTitle.trim()
    }
    //Call API
    createNewCard(newCardToAdd).then(card => {
      let newColumn = cloneDeep(column)
      newColumn.cards.push(card)
      newColumn.cardOrder.push(card._id)

      onUpdateColumnState(newColumn)
      setNewCardTitle('')
      toggleOpenNewCardForm()
    })

  }

  return (
    <div className='column'>
      <header className="column-drag-handle">
        <div className="column-title">
          <Form.Control
            size="sm"
            type="text"
            className="trungquandev-content-editable"
            value={columnTitle}
            onChange={handleColumnTitleChange}
            onBlur={handleColumnTitleBlur}
            onKeyDown={saveContentAfterPressEnter}
            onClick={selectAllInlineText}
            onMouseDown={e => e.preventDefault()}
            spellCheck="false"
          />
        </div>
        <div className="column-dropdown-actions">
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic" size ="sm" className="dropdown-btn"/>

            <Dropdown.Menu>
              <Dropdown.Item onClick={toggleOpenNewCardForm}>Add Card...</Dropdown.Item>
              <Dropdown.Item onClick={toggleShowConfirmModal}>Remove Column</Dropdown.Item>
              <Dropdown.Item>Move all card in this column (beta)...</Dropdown.Item>
              <Dropdown.Item>Archive all card in this column (beta)...</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

      </header>
      <div className="card-list">
        <Container
          orientation='vertical'
          groupName="tuannguyendev-columns"
          onDrop={ dropResult => onCardDrop(column._id, dropResult) }
          getChildPayload={index => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'card-drop-preview'
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards.map((card, index) => (
            <Draggable key={index}>
              <Card card={card} />
            </Draggable>
          ))}
        </Container>
        {openNewCardForm &&
        <div className="add-new-card-area">
          <Form.Control
            size="sm"
            as="textarea"
            rows="3"
            placeholder="Enter a title for this card..."
            className="textarea-enter-new-card"
            ref={newCardTextareaRef}
            value={newCardTitle}
            onChange={onNewCardTitleChange}
            onKeyDown={event => (event.key === 'Enter') && addNewCard()}
          />
        </div>
        }
      </div>
      <footer>
        {openNewCardForm &&
        <div className="add-new-card-actions">
          <Button variant="success" size="sm" onClick={addNewCard}>Add Card</Button>
          <span className="cancel-icon" onClick={toggleOpenNewCardForm}>
            <i className="fa fa-trash icon"/>
          </span>
        </div>
        }
        {!openNewCardForm &&
        <div className="footer-actions" onClick={toggleOpenNewCardForm}>
          <i className="fa fa-plus icon"/>  Add another card
        </div>
        }
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        onAction={onConfirmModalAction}
        title = "Remove column"
        content = {`Are you sure You want to remove <strong>${column.title}</strong>. <br/>All related card will also be remove! `}
      />
    </div>
  )
}

export default Column