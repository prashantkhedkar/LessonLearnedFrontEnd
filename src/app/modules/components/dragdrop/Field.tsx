import React from "react";
import styled from "styled-components";
import { Draggable } from "react-beautiful-dnd";
import { Checkbox } from "@mui/material";
import { FieldMasterModel } from "../../../models/global/fieldMasterModel";
import {
  DetailLabels,
  DetailLabelsText5,
  HeaderLabels,
  InfoLabels,
  LabelSemibold2,
  LabelTextSemibold1,
  LabelTextSemibold2,
} from "../common/formsLabels/detailLabels";
import { Col, Row } from "react-bootstrap";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { FormTypes } from "../dynamicFields/utils/types";
import { FieldMasterEnum } from "../../../helper/_constant/FieldMasterConstants";

interface ContainerProps {
  isDragDisabled: boolean;
  isDragging: boolean;
  ref: any;
}

const Container = styled.div<ContainerProps>`
  border: 1px solid lightgrey;
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.85;
  transition: background-color 0.2s ease, cursor 0.2s ease;
  background-color: ${(props) =>
    props.isDragDisabled ? "white" : props.isDragging ? "lightgreen" : "white"};
  cursor: ${(props) =>
    props.isDragDisabled ? "default" : props.isDragging ? "grabbing" : "grab"};
`;

interface FieldProps {
  field: FieldMasterModel;
  index: number;
  showRequiredCheckbox: boolean;
  toggleCheckbox: (id: number, required: boolean) => void;
  isDragDisabled: boolean;
  readOnly?: boolean;
  onEditField?: (field: FieldMasterModel) => void;
}
export const Field: React.FC<FieldProps> = (props) => {
  // Always use the field's isRequired value from props to stay in sync with initialData
  const checkboxChecked = props.field.isRequired || false;
  const lang = useLang();


  const checkValidation = () => {
    

    return props.field.fieldTypeId == FormTypes.selectrooms;
  }

  if (props.isDragDisabled) {
    // Render static field (not draggable)
    return (
      <Container isDragDisabled={true} isDragging={false} ref={null}>
        <Row>
          <Col>
            <LabelTextSemibold2 text={((lang == "en") ? props.field.fieldLabel : props.field.fieldLabelAr) ?? ""} customClassName="mb-1" />
            <br />
            <InfoLabels text={props.field.fieldTypeName ?? ""} />
          </Col>
          <Col>
            {props.showRequiredCheckbox &&
              !(props.field.entityId && (props.field.fieldTypeId == FormTypes.linebreak || props.field.fieldTypeId == FormTypes.fieldgrouping || props.field.fieldTypeId == FormTypes.selectrooms)) ? (
              <div className="d-flex justify-content-end align-items-center">
                {props.onEditField && !props.readOnly && props.field.fieldTypeId !== FormTypes.fieldgrouping && props.field.fieldId !== FieldMasterEnum.FieldMasterSelectRoom && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => props.onEditField!(props.field)}
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: 'transparent',
                      color: '#B7945A'
                    }}
                    title="Edit Field"
                  >
                    <i className="fa fa-edit" style={{ fontSize: '17px' }}></i>
                  </button>
                )}
                {
                  props.field.fieldTypeId != FormTypes.selectrooms &&
                  <Checkbox
                    tabIndex={-1}
                    disableRipple
                    disabled={props.readOnly}
                    sx={{
                      "& .MuiSvgIcon-root": { border: "1px" },
                      "& .Mui-checked": {
                        color: "#B7945A",
                      },
                    }}
                    className="px-3 py-0"
                    checked={checkboxChecked}
                    onChange={(e) => {
                      props.toggleCheckbox(props.field.fieldId!, e.target.checked);
                    }}
                  />
                }
              </div>
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
  const draggableId = props.field.entityId && props.field.fieldTypeId == FormTypes.linebreak && props.field.guid
    ? props.field.guid
    : props.field.fieldId!.toString();

  return (
    <Draggable
      draggableId={draggableId}
      index={props.index}
      isDragDisabled={props.isDragDisabled}
    >
      {(provided, snapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
          isDragDisabled={props.isDragDisabled}
          style={{
            //color: "#1F2937",
            backgroundColor: snapshot.isDragDisabled
              ? "red"
              : snapshot.isDragging
                ? "var(--bs-app-sidebar-light-menu-link-bg-color-active)"
                : "white",
            color: snapshot.isDragging ? "var(--shadow-2, #FFF)" : "#1F2937",
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            ...provided.draggableProps.style,
          }}
        >
          <Row>
            <Col>
              <LabelTextSemibold2 text={((lang == "en") ? props.field.fieldLabel : props.field.fieldLabelAr) ?? ""} customClassName="mb-1" />
              <br />
              <InfoLabels text={props.field.fieldTypeName ?? ""} />
            </Col>
            <Col>
              {props.showRequiredCheckbox &&
                !(props.field.entityId && (props.field.fieldTypeId == FormTypes.linebreak || props.field.fieldTypeId == FormTypes.fieldgrouping || props.field.fieldTypeId == FormTypes.selectrooms)) ? (
                <div className="d-flex justify-content-end align-items-center">
                  {props.onEditField && !props.readOnly && props.field.fieldTypeId !== FormTypes.fieldgrouping && props.field.fieldId !== FieldMasterEnum.FieldMasterSelectRoom && (
                    <button
                      type="button"
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onEditField!(props.field);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        color: '#B7945A'
                      }}
                      title="Edit Field"
                    >
                      <i className="fa fa-edit" style={{ fontSize: '17px' }}></i>
                    </button>
                  )}
                  {
                    props.field.fieldTypeId != FormTypes.selectrooms &&
                    <Checkbox
                      tabIndex={-1}
                      disableRipple
                      disabled={props.readOnly}
                      sx={{
                        "& .MuiSvgIcon-root": { border: "1px" },
                        "& .Mui-checked": {
                          color: "#B7945A",
                        },
                      }}
                      className="px-3"
                      checked={checkboxChecked}
                      onChange={(e) => {
                        props.toggleCheckbox(
                          props.field.fieldId!,
                          e.target.checked
                        );
                      }}
                    />
                  }
                </div>
              ) : (
                <></>
              )}
            </Col>
          </Row>
        </Container>
      )}
    </Draggable>
  );
};
