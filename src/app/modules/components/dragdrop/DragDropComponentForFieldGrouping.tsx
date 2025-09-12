import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { FieldGroupMappingModel } from '../../../models/global/FieldGroupMappingModel';
import DeleteIcon from '@mui/icons-material/Delete';
import { useIntl } from 'react-intl';
import { HeaderLabels, InfoLabels } from '../common/formsLabels/detailLabels';

const Container = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  
`;

const Title = styled.h4`
  padding: 8px 12px;
  margin: 0;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ItemsList = styled.div`
  padding: 8px; 
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
`;

const DraggableItem = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  background-color: ${props => props.isDragging ? '#e6f7ff' : '#fff'};
  border: 1px solid ${props => props.isDragging ? '#40a9ff' : '#d9d9d9'};
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #40a9ff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    cursor: grabbing;
  }
`;

const ItemText = styled.span`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fff2f0;
  }

  &:active {
    background-color: #ffd8d6;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-style: italic;
`;

const MaxItemsWarning = styled.div`
  padding: 4px 8px;
  // background-color: #fff7e6;
  // border: 1px solid #ffd591;
  border-radius: 4px;
  color: #DC2626 !important;
  font-size: 12px;
  margin-bottom: 8px;
`;

type Props = {
  items: FieldGroupMappingModel[];
  onItemsChange: (items: FieldGroupMappingModel[]) => void;
  maxItems?: number;
  title?: string;
  readOnly?: boolean;
};

export default function DragDropComponentForFieldGrouping({
  items,
  onItemsChange,
  maxItems = 5,
  title = "Selected Fields",
  readOnly = false
}: Props) {
  const [localItems, setLocalItems] = useState<FieldGroupMappingModel[]>(items);
  const intl = useIntl();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = (result: any) => {
    if (readOnly) return;

    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const newItems = Array.from(localItems);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (readOnly) return;

    const newItems = localItems.filter((_, index) => index !== indexToRemove);
    setLocalItems(newItems);
    onItemsChange(newItems);
  };

  const isAtMaxCapacity = localItems.length >= maxItems;

  return (
    <Container>
      <Title>
        {intl.formatMessage({ id: 'FIELD.GROUPING.SELECTED.FIELDS' })} ({localItems.length}/{maxItems})
      </Title>

      {isAtMaxCapacity && (
        <MaxItemsWarning>
          <InfoLabels text={intl.formatMessage({ id: 'FIELD.GROUPING.MAXIMUM.WARNING' }).replaceAll('(X)', maxItems.toString())} style={{color: '#DC2626'}} />
        </MaxItemsWarning>
      )}

      <ItemsList>
        {localItems.length === 0 ? (
          <EmptyState>
            <InfoLabels text={intl.formatMessage({ id: 'FIELD.GROUPING.NO.FIELDS.SELECTED' }).replaceAll('{X}', maxItems.toString())} isI18nKey={true} />
          </EmptyState>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="field-grouping-list">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {localItems.map((item, index) => (
                    <Draggable
                      key={`${item.componentFieldId}-${index}`}
                      draggableId={`${item.componentFieldId}-${index}`}
                      index={index}
                      isDragDisabled={readOnly}
                    >
                      {(provided, snapshot) => (
                        <DraggableItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        >
                          <ItemText>{item.fieldLabel}</ItemText>
                          {!readOnly && (
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(index);
                              }}
                              title={intl.formatMessage({ id: 'FIELD.GROUPING.REMOVE.FIELD' })}
                            >
                              <DeleteIcon fontSize="small" style={{ color: '#b7945a', visibility: 'visible' }} />
                            </DeleteButton>
                          )}
                        </DraggableItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </ItemsList>
    </Container>
  );
}
