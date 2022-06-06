import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import {
  Container as BootstrapContainer,
  Row, Col, Form, Button, NavItem
} from 'react-bootstrap'
import { isEmpty } from 'lodash'

import './BoardContent.scss'

import Column from 'components/Column/Column'
import { mapOrder } from 'ultilities/sorts'
import { applyDrag } from 'ultilities/dragDrop'
import { fetchBoardDetails} from 'actions/ApiCall'

function BoardContent() {
  const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const newColumnInputRef = useRef(null)

  const [newColumnTitle, setNewColumnTitle] = useState('')
  const onNewColumnTitleChange = (e) => setNewColumnTitle(e.target.value)


  useEffect(() => {
    const boardId = '629cf015973610228c951182'
    fetchBoardDetails(boardId).then(board => {
      setBoard(board)
      setColumns(mapOrder(board.columns, board.columnOrder, '_id'))
    })
  }, [])

  useEffect(() => {
    if (newColumnInputRef && newColumnInputRef.current) {
      newColumnInputRef.current.focus()
      newColumnInputRef.current.select()
    }
  }, [openNewColumnForm])

  if (isEmpty(board)) {
    return <div className="not-found" style={{ 'padding': '10px', 'color': 'white' }}>Board not found!</div>
  }

  const onColumnDrop = (dropResult) => {
    let newColumns = [...columns]
    newColumns = applyDrag(newColumns, dropResult)

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map( c => c._id)
    newBoard.columns = newColumns
    console.log(newBoard)

    setColumns(newColumns)
    setBoard(newBoard)

  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      let newColumns = [...columns]

      let currentColumn = newColumns.find(c => c._id === columnId )
      currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      currentColumn.cardOrder = currentColumn.cards.map(i => i._id)

      setColumns(newColumns)

    }
  }


  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumnInputRef.current.focus()
      return
    }

    const newColumnToAdd = {
      id: Math.random().toString(36).substr(2, 5), //5 random characters , will remove when
      boardId: board._id,
      title: newColumnTitle.trim(),
      cardOrder: [],
      cards: []
    }

    let newColumns = [...columns]
    newColumns.push(newColumnToAdd)

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map( c => c._id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)
    setNewColumnTitle('')
    toggleOpenNewColumnForm()
  }

  const onUpdateColumn = (newColumnToUpdate) => {
    const columnIdToUpdate = newColumnToUpdate._id
    let newColumns = [...columns]
    const columnIndexToUpdate = newColumns.findIndex(i => i._id === columnIdToUpdate)
    if (newColumnToUpdate._destroy) {
      // remove column
      newColumns.splice(columnIndexToUpdate, 1)
    } else {
      // update column info
      console.log(newColumnToUpdate)
      newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate)
    }

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map( c => c._id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)
  }

  return (
    <div className='board-content'>
      <Container
        orientation="horizontal"
        onDrop={ onColumnDrop }
        dragHandleSelector=".column-drag-handle"
        getChildPayload={index => columns[index]}
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'column-drop-preview'
        }}
      >
        {columns.map((column, index) => (
          <Draggable key={index}>
            <Column
              column={column}
              onCardDrop={onCardDrop}
              onUpdateColumn={onUpdateColumn}
            />
          </Draggable>
        ))}
      </Container>

      <BootstrapContainer className="trungquandev-trello-container">
        {!openNewColumnForm &&
        <Row>
          <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
            <i className="fa fa-plus icon"/>  Add another card
          </Col>
        </Row>
        }
        {openNewColumnForm &&
        <Row>
          <Col className="enter-new-column">
            <Form.Control
              size="sm"
              type="text"
              placeholder="Enter column title..."
              className="input-enter-new-column"
              ref={newColumnInputRef}
              value={newColumnTitle}
              onChange={onNewColumnTitleChange}
              onKeyDown={event => (event.key === 'Enter') && addNewColumn()}
            />
            <Button variant="success" size="sm" onClick={addNewColumn}>Add Column</Button>
            <span className="cancel-icon" onClick={toggleOpenNewColumnForm}>
              <i className="fa fa-trash icon"/>
            </span>
          </Col>
        </Row>
        }
      </BootstrapContainer>
    </div>
  )
}

export default BoardContent