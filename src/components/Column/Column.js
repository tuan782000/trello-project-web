import React, { useCallback, useEffect, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Dropdown, Form } from 'react-bootstrap'

import './Column.scss'
import { mapOrder } from 'ultilities/sorts'

import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import { MODAL_ACTION_CONFIRM } from 'ultilities/constants'
import {saveContentAfterPressEnter, selectAllInlineText} from 'ultilities/contentEditable'

function Column(props) {
  const { column, onCardDrop, onUpdateColumn } = props
  const cards = mapOrder(column.cards, column.cardOrder, 'id')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal)

  const [columnTitle, setColumnsTitle] = useState('')
  const handleColumnTitleChange = useCallback((e) => setColumnsTitle(e.target.value), [

  ])

  useEffect(() => {
    setColumnsTitle(column.title)
  }, [column.title])

  const onConfirmModalAction = (type) => {
    console.log(type)
    if (type === MODAL_ACTION_CONFIRM) {
      //remove Column
      const newColumn = {
        ...column,
        _destroy:true
      }
      onUpdateColumn(newColumn)
    }
    toggleShowConfirmModal()
  }

  const handleColumnTitleBlur = () => {
    console.log(columnTitle)
    const newColumn = {
      ...column,
      title: columnTitle
    }
    onUpdateColumn(newColumn)
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
              <Dropdown.Item>Add Card...</Dropdown.Item>
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
          onDrop={ dropResult => onCardDrop(column.id, dropResult) }
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
      </div>
      <footer>
        <div className="footer-actions">
          <i className="fa fa-plus icon"/>  Add another card
        </div>

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