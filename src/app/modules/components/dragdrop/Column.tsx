import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Field } from "./Field";
import { RestrictedFieldItem, ColumnOneFieldItem } from "./DragDropComponent";
import { Droppable } from "react-beautiful-dnd";
import { FieldMasterModel } from "../../../models/global/fieldMasterModel";
import {
  DetailLabels,
  InfoLabels,
  LabelTextSemibold2,
} from "../common/formsLabels/detailLabels";
import { FormTypes } from "../dynamicFields/utils/types";

const Container = styled.div`
  margin: 8px 0;
  border-radius: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  padding: 8px;
`;

interface FieldListProps {
  isDraggingOver: boolean;
  innerRef: any;
  columnId?: string;
}

const StyledFieldList = styled.div<FieldListProps>`
  padding: 8px;
  transition: background-color 0.2s ease;
  flex-grow: 1;
  min-height: 800px;
  display: flex;
  flex-direction: column;
  background-color: ${(props) =>
    props.isDraggingOver && props.columnId === "2" ? "#FFF" : "transparent"};
  border-radius: 8px;
`;

const FieldList: React.FC<FieldListProps> = (props) => {
  return <StyledFieldList ref={props.innerRef} {...props} />;
};

interface ColumnProps {
  column: {
    title: string;
    id: string;
    showRequiredCheckbox: boolean;
  };
  fields: FieldMasterModel[];
  toggleCheckbox: (id: number, required: boolean) => void;
  restrictedFieldIds: number[];
  readOnly?: boolean;
  onEditField?: (field: FieldMasterModel) => void;
}
export const Column: React.FC<ColumnProps> = (props) => {
  if (props.readOnly) {
    return (
      <Container>
        <div>
          {props.fields.map((item: any, index) => {
            const isRestricted = props.restrictedFieldIds.includes(
              item.fieldId
            );
            const key =
              item.fieldTypeId && item.fieldTypeId == FormTypes.linebreak && item.guid
                ? item.guid
                : item.fieldId;

            if (isRestricted && props.column.id === "2") {
              return (
                <RestrictedFieldItem key={item.fieldId}>
                  <LabelTextSemibold2 text={item.fieldLabelAr ?? ""} />
                  <br />
                  <InfoLabels text={item.fieldTypeName ?? ""} />
                </RestrictedFieldItem>
              );
            } else if (props.column.id === "1") {
              // Always use ColumnOneFieldItem for column 1, regardless of readOnly
              return (
                <ColumnOneFieldItem key={key}>
                  <LabelTextSemibold2 text={item.fieldLabelAr ?? ""} />
                  <br />
                  <InfoLabels text={item.fieldTypeName ?? ""} />
                </ColumnOneFieldItem>
              );
            } else {
              return (
                <Field
                  key={key}
                  field={item}
                  index={index}
                  showRequiredCheckbox={
                    props.column.showRequiredCheckbox &&
                    !props.restrictedFieldIds.includes(item.fieldId)
                  }
                  toggleCheckbox={props.toggleCheckbox}
                  isDragDisabled={true}
                  readOnly={true}
                  onEditField={props.onEditField}
                />
              );
            }
          })}
        </div>
      </Container>
    );
  }
  return (
    <Container>
      <Droppable droppableId={props.column.id} type="TASK">
        {(provided, snapshot) => (
          <FieldList
            innerRef={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
            columnId={props.column.id}
          >
            {props.fields.map((item: any, index) => {
              const isRestricted = props.restrictedFieldIds.includes(
                item.fieldId
              );
              const key =
                item.fieldTypeId && item.fieldTypeId == FormTypes.linebreak && item.guid
                  ? item.guid
                  : item.fieldId;
              if (isRestricted && props.column.id === "2") {
                // Render restricted fields in column 2 with dark style, not draggable
                return (
                  <RestrictedFieldItem key={item.fieldId}>
                    <LabelTextSemibold2 text={item.fieldLabelAr ?? ""} />
                    <br />
                    <InfoLabels customClassName="lbl-grey-txt-medium-2" text={item.fieldTypeName ?? ""} />
                  </RestrictedFieldItem>
                );
              } else {
                return (
                  <Field
                    key={key}
                    field={item}
                    index={index}
                    showRequiredCheckbox={
                      props.column.showRequiredCheckbox &&
                      !props.restrictedFieldIds.includes(item.fieldId)
                    }
                    toggleCheckbox={props.toggleCheckbox}
                    isDragDisabled={isRestricted || !!props.readOnly}
                    readOnly={props.readOnly}
                    onEditField={props.onEditField}
                  />
                );
              }
            })}
            {provided.fieldLabelAr}
          </FieldList>
        )}
      </Droppable>
    </Container>
  );
};
