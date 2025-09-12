import React, { useState } from "react";
import { TextField, Button, Box, Typography, Paper, Grid } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { DialogActions } from "@mui/material";
import { Category } from "./sampleData";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
} from "../../../../modules/components/common/formsLabels/detailLabels";

import { Col, Modal, Row } from "react-bootstrap";
import { GlobalLabel } from "../../../../modules/components/common/label/LabelCategory";
import { useIntl } from "react-intl";
import {
  AddUpdateServiceCategory,
  AddUpdateServiceFormDetails,
} from "../../../../modules/services/adminSlice";
//import { iconList } from './iconList';
import { useAppDispatch } from "../../../../../store";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  ServiceCategoryCrudModel,
  ServiceCategoryModel,
} from "../../../../models/global/serviceModel";
import { toast } from "react-toastify";
import { FontAwsomeIcons } from "../../../../helper/_constant/servicerequest.contant";

// Modify the component interface to accept onClose prop
interface CategoryFormProps {
  onClose: () => void;
  onSubmit: () => void;
  initialData?: ServiceCategoryCrudModel | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 0);
  const [name, setName] = useState(initialData?.categoryNameAr || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [selectedIcon, setSelectedIcon] = useState(
    initialData?.categoryIconName || ""
  );
  const [categoryColor, setCategoryColor] = useState(
    initialData?.categoryColor || "#b48f53"
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true); // Default to active
  const intl = useIntl();
  const dispatch = useAppDispatch();
  // Validation error states
  const [errors, setErrors] = useState<{ name?: string; icon?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    let validationErrors: { name?: string; icon?: string } = {};

    if (!name.trim()) {
      validationErrors.name = "اسم الفئة مطلوب";
    }

    if (!selectedIcon) {
      validationErrors.icon = "يرجى اختيار أيقونة";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    let formDataObject: ServiceCategoryCrudModel = {
      categoryId: categoryId,
      categoryNameAr: name,
      categoryNameEn: name,
      categoryIconName: selectedIcon,
      categoryColor: categoryColor, // Use the selected color
      isActive: isActive, // Send as boolean
      description: description,
    };
    
    const result = await dispatch(
      AddUpdateServiceCategory({ formDataObject })
    ).then(unwrapResult);

    if (result.statusCode === 200) {
      switch (result.data.status) {
        case "Created":
          onSubmit();
          setName("");
          setDescription("");
          setSelectedIcon("");
          setCategoryColor("#b48f53");
          setErrors({});

          if (onClose) {
            onClose();
          }
          toast.success(
            intl.formatMessage({ id: "CATEGORY.UPDATED.SUCCESSFULLY" })
          );
          break;
        case "Updated":
          onSubmit();
          setName("");
          setDescription("");
          setSelectedIcon("");
          setCategoryColor("#b48f53");
          setErrors({});

          if (onClose) {
            onClose();
          }
          toast.success(
            intl.formatMessage({ id: "CATEGORY.UPDATED.SUCCESSFULLY" })
          );
          break;
        case "Duplicate":
          toast.error(intl.formatMessage({ id: "LABEL.CATEGORYNAMEEXISTS" }));
          break;
        case "NotFound":
          toast.error(intl.formatMessage({ id: "MESSAGE.ERROR.MESSAGE" }));
          break;
        default:
          break;
      }

      return true; // Success
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (MuiIcons as any)[iconName];
    return IconComponent ? <IconComponent fontSize="small" /> : null;
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      noValidate
    >
      {/* Category Name Field */}
      {/* {JSON.stringify(initialData)} */}
      <Row className="mb-4 px-4">
        <Col className={"col-2"}>
          <GlobalLabel
            required
            value={intl.formatMessage({ id: "LABEL.CATEGORYNAME" })}
          />
        </Col>
        <Col className={"col-10 align-self-center"}>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={`form-control form-control-solid input5 lbl-txt-medium-2 p-2`}
            placeholder={intl.formatMessage({ id: "LABEL.CATEGORYNAME" })}
            maxLength={250}
          />
          {errors.name && (
            <Typography sx={{ color: "error.main", fontSize: "0.8rem" }}>
              {errors.name}
            </Typography>
          )}
        </Col>
      </Row>

      {/* Description Field */}
      <Row className="mb-4 px-4">
        <Col className={"col-2"}>
          <GlobalLabel
            value={intl.formatMessage({ id: "LABEL.CATEGORYDESCRIPTION" })}
          />
        </Col>
        <Col className={"col-10 align-self-center"}>
          <textarea
            id="category-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={intl.formatMessage({
              id: "LABEL.CATEGORYDESCRIPTION",
            })}
            maxLength={1500}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 16,
              borderRadius: 4,
              border: "1px solid #ccc",
              marginTop: 4,
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </Col>
      </Row>

      <Row className="mb-4 px-4">
        <Col className={"col-2"}>
          <GlobalLabel
            required
            value={intl.formatMessage({ id: "LABEL.CATEGORYICON" })}
          />
        </Col>
        <Col className={"col-10 align-self-center"}>
          {/* {"selectedIcon==> " + selectedIcon} */}
          <Grid container spacing={1}>
            {FontAwsomeIcons.map((iconName) => {
              const isSelected = selectedIcon === iconName.label;
              return (
                <Grid item xs={1} key={iconName.label}>
                  <Box
                    onClick={() => {
                      setSelectedIcon(iconName.label);
                      if (errors.icon) {
                        setErrors((prev) => ({ ...prev, icon: undefined }));
                      }
                    }}
                    sx={{
                      border: isSelected
                        ? "2px solid #b48f53"
                        : "1px solid #ccc",
                      borderRadius: 2,
                      p: "8px 4px 8px 4px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#dfcfb6" : "transparent",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* {renderIcon(iconName.label)} */}
                    <input
                      type="radio"
                      name="options"
                      className="d-none"
                      value={iconName.value}
                      checked={selectedIcon == iconName.value}
                      // onChange={() => setSelectIcon(options.value)}
                    />
                    <span>
                      <i className={`fa fa-light fa-xl ${iconName.icon}`} />
                    </span>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {errors.icon && (
            <Typography
              className="pt-3"
              sx={{ color: "error.main", fontSize: "0.8rem" }}
            >
              {errors.icon}
            </Typography>
          )}
        </Col>
      </Row>

      {/* Category Color Field */}
      <Row className="mb-4 px-4">
        <Col className={"col-2"}>
          <GlobalLabel
            required
            value={intl.formatMessage({ id: "LABEL.CATEGORYCOLOR" })}
          />
        </Col>
        <Col className={"col-10 align-self-center"}>
          <div className="d-flex align-items-center">
            <input
              type="color"
              id="category-color"
              name="categoryColor"
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              className="form-control form-control-color p-1"
              style={{
                width: "60px",
                height: "40px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            />
            {/* <span style={{ fontSize: '14px', color: '#666' }}>
                            {categoryColor}
                        </span> */}
          </div>
        </Col>
      </Row>

      {/* IsActive Field */}
      <Row className="mb-4 px-4">
        <Col className={"col-2"}>
          <GlobalLabel
            required
            value={intl.formatMessage({ id: "LABEL.CATEGORYACTIVE" })}
          />
        </Col>
        <Col className={"col-10 align-self-center"}>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="category-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {/* <label className="form-check-label" htmlFor="category-active">
              {isActive ? "نشط" : "غير نشط"}
            </label> */}
          </div>
        </Col>
      </Row>

      <Modal.Footer className="mx-0 px-0 py-0 pt-4">
        <button type="submit" className="btn MOD_btn btn-create w-10 pl-5 mx-3">
          <BtnLabeltxtMedium2 text={"BUTTON.LABEL.SAVE"} />
        </button>
        <button
          type="button"
          className="btn MOD_btn btn-cancel w-10 pl-5 mx-3"
          onClick={() => {
            onClose();
          }}
        >
          <BtnLabelCanceltxtMedium2 text={"BUTTON.LABEL.CANCEL"} />
        </button>
      </Modal.Footer>
    </Box>
  );
};

export default CategoryForm;
