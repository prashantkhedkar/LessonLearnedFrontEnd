import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { StepIconProps } from "@mui/material/StepIcon";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { AdminFormDynamicTemplate } from "../../../pages/admin/new-services/service-components/AdminFormDynamicTemplate";
import { ServiceRequestForm } from "../../../pages/admin/new-services/service-components/ServiceRequestForm";
import { visuallyHidden } from "@mui/utils";
import { useLang } from "../../../../_metronic/i18n/Metronici18n";
import { useAppDispatch } from "../../../../store";
import {
  CheckIfEntityExistsForService,
  DeleteServiceEntityFieldMappings,
  GetServiceEntitiesMaster,
  GetStepperEntitiesByServiceId,
  UpdateServiceFormDetails,
} from "../../services/adminSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { writeToBrowserConsole } from "../../utils/common";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AccountBalanceOutlined } from "@mui/icons-material";
import {
  BtnLabelCanceltxtMedium2,
  BtnLabeltxtMedium2,
  HeaderLabels,
  LabelTextSemibold2,
} from "../common/formsLabels/detailLabels";
import { useIntl } from "react-intl";
import { ManageWorkflow } from "../../../pages/admin/workflowSetting/ManageWorkflow";
import { ServiceStatus } from "../../../helper/_constant/serviceStatus";
import { toast } from "react-toastify";
import { EntityType } from "../../../helper/_constant/entity.constant";
import { ServiceEntitiesMaster } from "../../../models/global/serviceModel";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Modal } from "react-bootstrap";
import ConfirmDeleteModal from "../confirmDialog/ConfirmDeleteModal";
import ConfirmPublishModal from "../confirmDialog/ConfirmPublishModal";
import ConfirmDialogModal from "../confirmDialog/ConfirmDialogModal";
interface ServiceEntityUI extends ServiceEntitiesMaster {
  icon?: React.ReactNode;
}

type StepData = {
  label: string;
  content: (ref: React.Ref<any>) => React.ReactNode;
  icon?: React.ReactNode;
  entityId: number;
  entityKey?: string;
};

type props = {
  serviceId: number;
  readOnly: boolean;
  statusId: number;
  isPublish: boolean;
  currentTabView: string;
};

type StepCompletion = { entityId: number; completed: boolean };

const StepperComponent: React.FC<props> = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [serviceId, setServiceId] = useState<number>(props.serviceId);
  const [readOnly, setReadOnly] = useState<boolean>(props.readOnly);
  const [statusId, setStatusId] = useState<number>(props.statusId);
  const [isPublishMode, setIsPublishMode] = useState<boolean>(props.isPublish);   // In publish mode, disable all interactions except publish button
  const [currentTabView, setCurrentTabView] = useState<string>(props.currentTabView);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const lang = useLang();
  const [justCreatedService, setJustCreatedService] = useState(false);
  const [entityTypes, setEntityTypes] = useState<ServiceEntityUI[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formRef = useRef<any>(null);
  const intl = useIntl();
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultEntityIcons: Record<number, React.ReactNode> = {
    [EntityType.RequestingUnit]: <PersonIcon />,
    [EntityType.FulFilmentUnit]: <AssignmentTurnedInIcon />,
    [EntityType.AccountingUnit]: <AccountBalanceOutlined />,
    [EntityType.SecurityUnit]: <SecurityIcon />,
    [EntityType.DelegationUnit]: <SupervisorAccountIcon />,
    [EntityType.SupportingUnit]: <SupportAgentIcon />,
  };

  useEffect(() => {
    const fetchExistingSteps = async () => {
      if (serviceId > 0 && justCreatedService == false) {
        try {
          dispatch(GetStepperEntitiesByServiceId({ serviceId }))
            .then(unwrapResult)
            .then((originalPromiseResult) => {
              if (originalPromiseResult.statusCode === 200) {
                const response = originalPromiseResult.data;

                const mappedSteps = [
                  {
                    label: intl.formatMessage({ id: "LABEL.SERVICEDETAILS" }),
                    content: (ref) => (
                      <ServiceRequestForm
                        ref={ref}
                        onSuccess={
                          serviceId === 0
                            ? handleOnAfterServiceCreation
                            : handleFormSuccess
                        }
                        serviceId={serviceId}
                        readOnly={readOnly || isPublishMode}
                      />
                    ),
                    icon: <InfoIcon />,
                    entityId: 0,
                  },
                  ...response.map((entity: any) => ({
                    label:
                      lang === "ar" ? entity.entityNameAr : entity.entityNameEn,
                    content: getComponentForEntityType(entity.entityId),
                    icon: defaultEntityIcons[entity.entityId] || <InfoIcon />,
                    entityId: entity.entityId,
                    entityKey: entity.entityNameEn,
                  })),
                ];

                setSteps(mappedSteps);

                // Update completedSteps for existing service
                // First step (Service Details) is always completed
                const initialCompleted = mappedSteps.map(
                  (step, idx) => idx === 0
                );
                // For other steps, check if entity exists for service
                Promise.all(
                  mappedSteps.map(async (step, idx) => {
                    if (idx === 0)
                      return { entityId: step.entityId, completed: true };
                    try {
                      const result = await dispatch(
                        CheckIfEntityExistsForService({
                          serviceId,
                          entityId: step.entityId,
                        })
                      ).then(unwrapResult);
                      if (result.statusCode === 200) {
                        return {
                          entityId: step.entityId,
                          completed: result.data === true,
                        };
                      }
                    } catch { }
                    return { entityId: step.entityId, completed: false };
                  })
                ).then((results) => {
                  setCompletedSteps(results);
                });
              }
            })
            .catch((ex) => {
              writeToBrowserConsole(ex);
            });
        } catch (ex) { }
      }
    };

    fetchExistingSteps();
  }, [serviceId]);

  useEffect(() => {
    const fetchEntityTypeLookup = async () => {
      try {
        dispatch(GetServiceEntitiesMaster())
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const response = originalPromiseResult.data;
              const enhancedEntityTypes: ServiceEntityUI[] = response.map(
                (entity: ServiceEntitiesMaster) => {
                  const icon = defaultEntityIcons[entity.entityId] || (
                    <InfoIcon />
                  );
                  return {
                    ...entity,
                    icon,
                    isMultiselectUnit: entity.isMultiselectUnit ?? false, // Map API property to UI model
                  };
                }
              );
              setEntityTypes(enhancedEntityTypes);

              // Always ensure Service Details, Requesting Unit, Fulfilment Unit are first (if isDefault=1 and isActive)
              const requestingUnit = enhancedEntityTypes.find(
                (e) =>
                  e.entityId === EntityType.RequestingUnit &&
                  e.isDefault &&
                  e.isActive
              );
              const fulfilmentUnit = enhancedEntityTypes.find(
                (e) =>
                  e.entityId === EntityType.FulFilmentUnit &&
                  e.isDefault &&
                  e.isActive
              );
              let defaultSteps: StepData[] = [
                {
                  label: intl.formatMessage({ id: "LABEL.SERVICEDETAILS" }),
                  content: (ref) => (
                    <ServiceRequestForm
                      ref={ref}
                      onSuccess={
                        serviceId === 0
                          ? handleOnAfterServiceCreation
                          : handleFormSuccess
                      }
                      serviceId={serviceId}
                      readOnly={readOnly || isPublishMode}
                    />
                  ),
                  icon: <InfoIcon />,
                  entityId: 0,
                },
              ];
              if (requestingUnit) {
                defaultSteps.push({
                  label:
                    lang === "ar"
                      ? requestingUnit.entityNameAr
                      : requestingUnit.entityNameEn,
                  content: getComponentForEntityType(requestingUnit.entityId),
                  icon: requestingUnit.icon,
                  entityId: requestingUnit.entityId,
                  entityKey: requestingUnit.entityNameEn,
                });
              }
              if (fulfilmentUnit) {
                defaultSteps.push({
                  label:
                    lang === "ar"
                      ? fulfilmentUnit.entityNameAr
                      : fulfilmentUnit.entityNameEn,
                  content: getComponentForEntityType(fulfilmentUnit.entityId),
                  icon: fulfilmentUnit.icon,
                  entityId: fulfilmentUnit.entityId,
                  entityKey: fulfilmentUnit.entityNameEn,
                });
              }

              // Add any other default entities (isDefault, isActive, not Requesting or Fulfilment)
              const otherDefaultEntities = enhancedEntityTypes
                .filter(
                  (entity) =>
                    entity.isDefault &&
                    entity.isActive &&
                    entity.entityId !== EntityType.RequestingUnit &&
                    entity.entityId !== EntityType.FulFilmentUnit
                )
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((entity) => ({
                  label:
                    lang === "ar" ? entity.entityNameAr : entity.entityNameEn,
                  content: getComponentForEntityType(entity.entityId),
                  icon: entity.icon,
                  entityId: entity.entityId,
                  entityKey: entity.entityNameEn,
                }));

              // If steps already exist (e.g. after fetchExistingSteps), preserve any user-added steps after the first three
              setSteps((prev) => {
                // Remove any steps for RequestingUnit or FulfilmentUnit or Service Details from prev
                const filteredPrev = prev.filter(
                  (s) =>
                    s.entityId !== 0 &&
                    s.entityId !== EntityType.RequestingUnit &&
                    s.entityId !== EntityType.FulFilmentUnit
                );
                return [
                  ...defaultSteps,
                  ...filteredPrev.filter(
                    (s) =>
                      !otherDefaultEntities.some(
                        (o) => o.entityId === s.entityId
                      )
                  ),
                  ...otherDefaultEntities,
                ];
              });
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });
      } catch (e) { }
    };

    fetchEntityTypeLookup();
  }, [serviceId]);

  const [steps, setSteps] = useState<StepData[]>([]);

  const [completedSteps, setCompletedSteps] = useState<StepCompletion[]>([]);

  // Centralized function to update completion status
  const updateCompletionStatus = useCallback(
    (entityId: number, completed: boolean) => {
      setCompletedSteps((prev) => {
        const exists = prev.find((s) => s.entityId === entityId);
        if (exists) {
          if (exists.completed === completed) return prev; // No change needed
          return prev.map((s) =>
            s.entityId === entityId ? { ...s, completed } : s
          );
        } else {
          return [...prev, { entityId, completed }];
        }
      });
    },
    []
  );

  useEffect(() => {
    if (serviceId === 0) {
      setSteps([
        {
          label: intl.formatMessage({ id: "LABEL.SERVICEDETAILS" }),
          content: (ref) => (
            <ServiceRequestForm
              ref={ref}
              onSuccess={
                serviceId === 0
                  ? handleOnAfterServiceCreation
                  : handleFormSuccess
              }
              serviceId={serviceId}
              readOnly={readOnly || isPublishMode}
            />
          ),
          icon: <InfoIcon />,
          entityId: 0,
        },
      ]);
    }
  }, [serviceId]);

  // Track if step was advanced by goToNextStep
  const stepAdvancedRef = React.useRef(false);
  const goToNextStep = React.useCallback(() => {
    // Mark the current step as completed
    const currentEntityId = steps[activeStep]?.entityId;
    if (typeof currentEntityId === "number") {
      updateCompletionStatus(currentEntityId, true);
    }

    // If on Fulfilment Unit and it's the last step, go to settings
    if (
      steps[activeStep]?.entityId === EntityType.FulFilmentUnit &&
      steps.findIndex((s) => s.entityId === EntityType.FulFilmentUnit) ===
      steps.length - 1
    ) {
      stepAdvancedRef.current = true;
      setActiveStep(steps.length);
      return;
    }

    // If on the last dynamic step, move to add-settings step and show settings
    if (activeStep === steps.length - 1) {
      stepAdvancedRef.current = true;
      setActiveStep(steps.length); // This will activate the add-settings step
      return;
    }

    stepAdvancedRef.current = true;
    setActiveStep((prev) => prev + 1);
  }, [activeStep, steps, updateCompletionStatus]);

  const handleFormSuccess = useCallback(() => {
    const currentEntityId = steps[activeStep]?.entityId;
    if (typeof currentEntityId === "number") {
      updateCompletionStatus(currentEntityId, true);
    }
  }, [steps, activeStep, updateCompletionStatus]);

  const getAdminFormStep = React.useCallback(
    (entityId: number) => (ref: React.Ref<any>) => {
      return (
        <AdminFormDynamicTemplate
          key={`admin-form-step-${entityId}-${serviceId}`}
          ref={ref}
          entityId={entityId}
          serviceId={serviceId}
          onSuccess={handleFormSuccess}
          readOnly={readOnly || isPublishMode}
        />
      );
    },
    [serviceId, handleFormSuccess, readOnly, isPublishMode]
  );

  // Only update completedSteps locally on save, do not call CheckIfEntityExistsForService here
  const handleOnAfterServiceCreation = async (id: number) => {
    if (typeof id === "number" && serviceId === 0) {
      setServiceId(id);
      // Mark Service Details as completed
      updateCompletionStatus(0, true);
      setJustCreatedService(true);
    } else {
      navigate("/admin-dashboard");
    }
  };

  const getComponentForEntityType = (
    entityId: number
  ): ((ref: React.Ref<any>) => React.ReactNode) => {
    switch (entityId) {
      default:
        return getAdminFormStep(entityId);
    }
  };

  // Ensure completedSteps always matches the current steps by entityId, not by index
  // This effect only runs to add missing steps, not to modify existing completion status
  useEffect(() => {
    setCompletedSteps((prev) => {
      // Find steps that are missing from completedSteps
      const missingSteps = steps.filter(
        (step) => !prev.find((p) => p.entityId === step.entityId)
      );

      if (missingSteps.length === 0) {
        return prev; // No missing steps, no changes needed
      }

      // Add missing steps with default completion status
      const newSteps = missingSteps.map((step) => ({
        entityId: step.entityId,
        completed: serviceId > 0 && step.entityId === 0 ? true : false,
      }));

      return [...prev, ...newSteps];
    });
  }, [steps, serviceId]);

  useEffect(() => {
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) => {
        if (idx === 0) {
          return {
            ...step,
            content: (ref) => (
              <ServiceRequestForm
                ref={ref}
                onSuccess={
                  serviceId === 0
                    ? handleOnAfterServiceCreation
                    : handleFormSuccess
                }
                serviceId={serviceId}
                readOnly={readOnly || isPublishMode}
              />
            ),
          };
        } else {
          switch (step.entityId) {
            case EntityType.RequestingUnit:
              return {
                ...step,
                content: getAdminFormStep(step.entityId),
              };
            default:
              return {
                ...step,
                content: getAdminFormStep(step.entityId),
              };
          }
        }
      })
    );
  }, [serviceId]);

  // CustomStepIcon now inside StepperComponent to access steps
  const CustomStepIcon: React.FC<
    StepIconProps & {
      lastStep?: boolean;
      stepIndex?: number;
      isActive: boolean;
    }
  > = (props) => {
    const { icon, lastStep, active, completed, stepIndex, isActive } = props;
    if (lastStep) {
      return (
        <AddIcon
          className="stepper-new"
          style={{ fontSize: 30, color: active ? "#dfcfb6" : "#dfcfb6" }}
        />
      );
    }

    // Use stepIndex instead of icon for correct mapping
    const step = typeof stepIndex === "number" ? steps[stepIndex] : undefined;

    // Enhance: highlight current and previous step
    let iconColor = "#dfcfb6";
    let stepbgColor = "#FFF";
    let borderColor = "1px solid #B7945A";
    if (isActive) {
      iconColor = "#FFF";
      stepbgColor = "#DFCFB6";
      borderColor = "1px solid #dfcfb6";
    }
    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "2px",
        }}
      >
        <span
          className="lbl-steps-semibold-1"
          style={{
            color: iconColor,
            backgroundColor: stepbgColor,
            border: borderColor,
            padding: "5px 12px",
            borderRadius: "1000px",
            width: "35px",
            height: "35px",
          }}
        >
          {stepIndex}
        </span>
      </span>
    );
  };

  // Extracted StepItem for maintainability and accessibility
  const StepItem: React.FC<{
    step: StepData;
    index: number;
    isActive: boolean;
    isCompleted: boolean;
    onClick: () => void;
    onDelete?: () => void;
    isDeletable?: boolean;
    disabled?: boolean;
  }> = ({
    step,
    index,
    isActive,
    isCompleted,
    onClick,
    onDelete,
    isDeletable,
    disabled,
  }) => {
      // Prevent delete for steps with isDefault true
      const entityType = entityTypes.find((et) => et.entityId === step.entityId);
      const isDefault = entityType?.isDefault === true;
      const showDelete = isDeletable && !isDefault;
      // Enhance: highlight label for current and previous step
      let labelColor: string | undefined = undefined;
      let labelFontWeight: number | undefined = undefined;
      if (isActive || activeStep - 1 === index) {
        labelColor = "var(--bs-app-sidebar-light-menu-link-bg-color-active)";
        labelFontWeight = 700;
      } else if (isCompleted) {
        //labelColor = "green";
        labelColor = "var(--bs-app-sidebar-light-menu-link-bg-color-active)";
        labelFontWeight = 600;
      }
      return (
        <Step
          onClick={onClick}
          aria-current={isActive ? "step" : undefined}
          aria-disabled={isActive ? undefined : false}
          tabIndex={0}
          sx={{ cursor: "pointer" }}
        >
          <StepLabel
            StepIconComponent={(props) => (
              <CustomStepIcon
                {...props}
                stepIndex={index + 1}
                isActive={isActive}
              />
            )}
            sx={{
              ".MuiStepLabel-label": {
                fontFamily: "FrutigerLTArabic-Bold_2",
                textAlign: "center",
              },
              ".MuiStepLabel-label:not(.Mui-error)": {},
              ".MuiStepIcon-root.Mui-completed, .MuiStepIcon-root.Mui-active": {
                border: "none",
              },
            }}
          >
            <LabelTextSemibold2 text={step.label} />
            {showDelete && onDelete && (
              <Tooltip title="Remove Step">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove ${step.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </StepLabel>
        </Step>
      );
    };

  // Helper: show warning for incomplete default units
  const showDefaultUnitsWarning = () => {
    Swal.fire({
      icon: "warning",
      title: intl.formatMessage({ id: "LABEL.STEPS.VALIDATION.MESSAGE1" }),
      text: intl.formatMessage({ id: "LABEL.STEPS.VALIDATION.MESSAGE2" }),
    });
  };

  // Unified function to check if all default unit steps are completed
  const isDefaultUnitsStepsCompleted = () => {
    // Get all default, active entityIds (excluding Service Details, which is entityId 0)
    const defaultUnitEntityIds = entityTypes
      .filter(
        (entity) => entity.isDefault && entity.isActive && entity.entityId > 0
      )
      .map((entity) => entity.entityId);
    // For each, check if completedSteps has completed: true
    return defaultUnitEntityIds.every((entityId) => {
      const found = completedSteps.find((s) => s.entityId === entityId);
      return found?.completed === true;
    });
  };

  // Check if current step is ready for settings navigation
  const canNavigateToSettings = () => {
    // If no steps exist, can navigate
    if (steps.length === 0) return true;

    // Check if we're on the last step and it's completed
    const lastStepIndex = steps.length - 1;
    if (activeStep === lastStepIndex) {
      const currentStepEntityId = steps[activeStep]?.entityId;
      const currentStepCompleted = completedSteps.find(
        (s) => s.entityId === currentStepEntityId
      )?.completed;
      return currentStepCompleted === true;
    }

    // If not on last step, all default units must be completed
    return isDefaultUnitsStepsCompleted();
  };

  const handleAddUnit = () => {
    // Prevent adding new steps if not all default units are completed
    if (!isDefaultUnitsStepsCompleted()) {
      showDefaultUnitsWarning();
      return;
    }
    if (selectedUnitId !== null) {
      const entityType = entityTypes.find((l) => l.entityId === selectedUnitId);
      if (entityType) {
        setSteps((prev) => {
          const newSteps = [
            ...prev,
            {
              label:
                lang === "ar"
                  ? entityType.entityNameAr
                  : entityType.entityNameEn,
              content: getComponentForEntityType(entityType.entityId),
              icon: entityType.icon,
              entityId: entityType.entityId,
              entityKey: entityType.entityNameEn,
            },
          ];
          // Move to the newly added step
          setTimeout(() => {
            setActiveStep(newSteps.length - 1);
          }, 0);
          return newSteps;
        });
        setSelectedUnitId(null);
        setOpenDialog(false);
      }
    }
  };

  // Compute available units for the dropdown (exclude already added)
  const addedEntityIds = new Set(steps.map((step) => step.entityId));

  // Use unified helper for default units completion
  const availableEntityTypes = entityTypes.filter(
    (entity) =>
      entity.entityId > 0 &&
      !addedEntityIds.has(entity.entityId) &&
      entity.isActive &&
      isDefaultUnitsStepsCompleted() // Only allow if all default units are completed
  );

  const handleRemoveStep = async (entityIdToRemove: number) => {
    // Common CSS for alerts component
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn MOD_btn btn-create w-10 pl-5 mx-3 text-center',
        cancelButton: 'btn MOD_btn btn-cancel w-10 text-center',
        title: 'popup-confirmation-alert text-centers',
        input: 'sweetalert-input-style'
      },
      buttonsStyling: false
    });

    const result = await swalWithBootstrapButtons.fire({
      icon: "warning",
      text: intl.formatMessage({ id: "DELETE.STEPPER" }),
      showCancelButton: true,
      cancelButtonText: intl.formatMessage({ id: "BUTTON.LABEL.CANCEL" }),
      confirmButtonText: intl.formatMessage({ id: "LABEL.OK" }),
    });

    if (result.isConfirmed) {
      const stepCompleted =
        completedSteps.find((s) => s.entityId === entityIdToRemove)
          ?.completed === true;

      if (!stepCompleted) {
        // For newly added steps that are not yet completed, just remove from state
        setSteps((prev) =>
          prev.filter((step) => step.entityId !== entityIdToRemove)
        );

        // Remove the deleted step from completedSteps as well
        setCompletedSteps((prev) =>
          prev.filter((s) => s.entityId !== entityIdToRemove)
        );

        // Adjust activeStep if needed
        setActiveStep((prev) => {
          const removedIndex = steps.findIndex(
            (step) => step.entityId === entityIdToRemove
          );
          if (prev === removedIndex) return 0;
          if (prev > removedIndex) return prev - 1;
          return prev;
        });
        dispatch(
          DeleteServiceEntityFieldMappings({
            serviceId: serviceId,
            entityId: entityIdToRemove,
          })
        )        
      } else {
        dispatch(
          DeleteServiceEntityFieldMappings({
            serviceId: serviceId,
            entityId: entityIdToRemove,
          })
        )
          .then(unwrapResult)
          .then((originalPromiseResult) => {
            if (originalPromiseResult.statusCode === 200) {
              const response: boolean = originalPromiseResult.data;

              if (response) {
                setSteps((prev) =>
                  prev.filter((step) => step.entityId !== entityIdToRemove)
                );

                // Remove the deleted step from completedSteps as well
                setCompletedSteps((prev) =>
                  prev.filter((s) => s.entityId !== entityIdToRemove)
                );

                // Adjust activeStep if needed
                setActiveStep((prev) => {
                  const removedIndex = steps.findIndex(
                    (step) => step.entityId === entityIdToRemove
                  );
                  if (prev === removedIndex) return 0;
                  if (prev > removedIndex) return prev - 1;
                  return prev;
                });
              }
            }
          })
          .catch((rejectedValueOrSerializedError) => {
            writeToBrowserConsole(rejectedValueOrSerializedError);
          });
      }
    }
  };

  useEffect(() => {
    if (!justCreatedService) return;

    const requestFormIndex = steps.findIndex(
      (step) => step.entityId === EntityType.RequestingUnit
    );
    if (requestFormIndex > 0) {
      setActiveStep(requestFormIndex);
    } else if (steps.length > 1) {
      setActiveStep(1);
    } else {
      navigate("/admin-dashboard");
    }
  }, [justCreatedService]);

  const StepContent = steps[activeStep]?.content;

  const isSettingsStep = activeStep === steps.length;

  // Ref for SettingsStep
  const settingsStepRef = React.useRef<any>(null);
  const renderSettingsStep = () => {
    if (isSettingsStep && serviceId > 0) {
      return (
        <ManageWorkflow
          ref={settingsStepRef}
          serviceId={serviceId}
          readOnly={readOnly || isPublishMode}
        />
      );
    }
    return null;
  };

  const updateServiceFormStatus = () => {
    var newStatusId = ServiceStatus.Draft;

    if (statusId === ServiceStatus.Draft || statusId === ServiceStatus.Inactive) {
      newStatusId = ServiceStatus.Active;
    } else {
      newStatusId = ServiceStatus.Inactive;
    }

    const formDataObject = {
      serviceId: serviceId,
      statusId: newStatusId,
    };
    dispatch(UpdateServiceFormDetails({ formDataObject }))
      .then(unwrapResult)
      .then((originalPromiseResult) => {
        if (originalPromiseResult.statusCode === 200) {
          if (originalPromiseResult.data === true) {
            toast.success(intl.formatMessage({ id: "MESSAGE.SAVE.SUCCESS" }));
            navigate("/admin-dashboard", { state: { currentTabView: currentTabView } });
          } else {
            toast.warn(intl.formatMessage({ id: "ONGOING.REQUEST.PUBLISHED.MESSAGE.SAVE.FAILED" }));
          }
        }
      })
      .catch((rejectedValueOrSerializedError) => {
        writeToBrowserConsole(rejectedValueOrSerializedError);
      });
  };

  const handlePublishToggle = () => {
    updateServiceFormStatus();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="row">
        <div className="col-lg-12 col-md-12 col-sm-12 pxr24 user-form-container-for-card">
          <div className={`card card-flush MOD-Card user-form-mod-card`}>
            <div className="card-body border-top MOD-Cardbody-inner-pages">
              <Box sx={{ width: "100%", p: 4 }}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    margin: "1rem 0",
                    cursor: "default",
                    "& .MuiStepLabel-root": {
                      padding: "0 1rem",
                    },
                    ".MuiStepConnector-line": {
                      borderTopWidth: "2px",
                      borderColor: "#B7945A",
                    },
                    ".MuiStepConnector-root": {
                      top: "15px",
                      color: "#B7945A",
                    },
                  }}
                  aria-label="Workflow Steps"
                >
                  {steps.map((step, index) => {
                    // Determine which steps are default units (excluding Service Details)
                    const defaultUnitEntityIds = entityTypes
                      .filter(
                        (entity) =>
                          entity.isDefault &&
                          entity.isActive &&
                          entity.entityId > 0
                      )
                      .map((entity) => entity.entityId);
                    // For navigation: only allow navigation to a step if all previous default unit steps are completed
                    let canNavigate = false;
                    if (index === 0) {
                      canNavigate = true;
                    } else {
                      // Do not allow navigation to next step if first step (entityId=0) is not completed
                      const firstStepCompleted =
                        completedSteps.find((c) => c.entityId === 0)
                          ?.completed === true;
                      if (!firstStepCompleted) {
                        canNavigate = false;
                      } else {
                        // For default units, require all previous default units to be completed
                        const prevDefaultUnitIndexes = steps
                          .slice(0, index)
                          .filter((s) =>
                            defaultUnitEntityIds.includes(s.entityId)
                          );
                        const prevDefaultUnitCompleted =
                          prevDefaultUnitIndexes.every((s) => {
                            const found = completedSteps.find(
                              (c) => c.entityId === s.entityId
                            );
                            return found?.completed === true;
                          });
                        // For non-default units, require all default units to be completed
                        if (defaultUnitEntityIds.includes(step.entityId)) {
                          canNavigate = prevDefaultUnitCompleted;
                        } else {
                          canNavigate = isDefaultUnitsStepsCompleted();
                        }
                      }
                    }
                    return (
                      <StepItem
                        key={index}
                        step={step}
                        index={index}
                        isActive={activeStep === index && !isSettingsStep}
                        isCompleted={activeStep > index}
                        onClick={async () => {
                          if (canNavigate) {
                            // In publish mode, allow navigation but don't update completedSteps
                            if (isPublishMode) {
                              setActiveStep(index);
                              return;
                            }

                            // Normal mode - call API to check if entity exists for this step and update completedSteps
                            if (
                              serviceId > 0 &&
                              typeof step.entityId === "number"
                            ) {
                              try {
                                const result = await dispatch(
                                  CheckIfEntityExistsForService({
                                    serviceId,
                                    entityId: step.entityId,
                                  })
                                ).then(unwrapResult);
                                if (result.statusCode === 200) {
                                  updateCompletionStatus(
                                    step.entityId,
                                    result.data === true
                                  );
                                }
                              } catch { }
                            }
                            setActiveStep(index);
                          }
                        }}
                        onDelete={
                          step.entityId > 1
                            ? () => handleRemoveStep(step.entityId)
                            : undefined
                        }
                        isDeletable={
                          step.entityId > 1 &&
                          index > 2 &&
                          !readOnly &&
                          !isPublishMode
                        }
                        disabled={!canNavigate}
                      />
                    );
                  })}

                  {!readOnly && !isPublishMode && (
                    <Step
                      id="add-unit"
                      key="add-unit"
                      onClick={() => {
                        // Only allow adding after all default units and last step are completed
                        const lastStep = steps[steps.length - 1];
                        const lastStepCompleted =
                          lastStep &&
                          completedSteps.find(
                            (s) => s.entityId === lastStep.entityId
                          )?.completed;
                        if (
                          !isDefaultUnitsStepsCompleted() ||
                          !lastStepCompleted
                        ) {
                          showDefaultUnitsWarning();
                          return;
                        }
                        if (availableEntityTypes.length > 0)
                          setOpenDialog(true);
                      }}
                      tabIndex={
                        availableEntityTypes.length === 0 ||
                          !isDefaultUnitsStepsCompleted() ||
                          !(
                            steps.length === 0 ||
                            completedSteps.find(
                              (s) =>
                                s.entityId === steps[steps.length - 1]?.entityId
                            )?.completed
                          )
                          ? -1
                          : 0
                      }
                      sx={{
                        "& .MuiStepLabel-root": {
                          padding: "0 1rem",
                        },
                        cursor:
                          !isDefaultUnitsStepsCompleted() ||
                            !(
                              steps.length === 0 ||
                              completedSteps.find(
                                (s) =>
                                  s.entityId === steps[steps.length - 1]?.entityId
                              )?.completed
                            )
                            ? "not-allowed"
                            : "pointer",
                        "& .MuiStepConnector-root":
                          lang === "ar"
                            ? {
                              right: "calc(-50% + 20px)",
                              left: "calc(50% + 20px)",
                            }
                            : {},
                      }}
                    >
                      <StepLabel
                        StepIconComponent={(props) => (
                          <CustomStepIcon
                            isActive={false}
                            {...props}
                            lastStep
                            active={true}
                          />
                        )}
                        aria-label="Add New Step"
                        sx={{
                          cursor:
                            !isDefaultUnitsStepsCompleted() ||
                              !(
                                steps.length === 0 ||
                                completedSteps.find(
                                  (s) =>
                                    s.entityId ===
                                    steps[steps.length - 1]?.entityId
                                )?.completed
                              )
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <span
                          style={
                            availableEntityTypes.length === 0 ||
                              !isDefaultUnitsStepsCompleted() ||
                              !(
                                steps.length === 0 ||
                                completedSteps.find(
                                  (s) =>
                                    s.entityId ===
                                    steps[steps.length - 1]?.entityId
                                )?.completed
                              )
                              ? {
                                font: "var(--title-semibold-2)",
                                color:
                                  "var(--primary-4, #B7945A) !important;",
                              }
                              : {
                                font: "var(--title-semibold-2)",
                              }
                          }
                        >
                          {intl.formatMessage({ id: "LABEL.STEPS.ADDNEW" })}
                        </span>
                        {(availableEntityTypes.length === 0 ||
                          !isDefaultUnitsStepsCompleted() ||
                          !(
                            steps.length === 0 ||
                            completedSteps.find(
                              (s) =>
                                s.entityId === steps[steps.length - 1]?.entityId
                            )?.completed
                          )) && (
                            <span style={{ ...visuallyHidden }}>
                              {isDefaultUnitsStepsCompleted()
                                ? !(
                                  steps.length === 0 ||
                                  completedSteps.find(
                                    (s) =>
                                      s.entityId ===
                                      steps[steps.length - 1]?.entityId
                                  )?.completed
                                )
                                  ? intl.formatMessage({
                                    id: "STEPPER.COMPLETE.LAST.STEPS",
                                  })
                                  : intl.formatMessage({
                                    id: "STEPPER.NO.UNITS.TO.ADD",
                                  })
                                : intl.formatMessage({
                                  id: "STEPPER.COMPLETE.PENDING.STEPS",
                                })}
                            </span>
                          )}
                      </StepLabel>
                    </Step>
                  )}

                  {/* Settings step - always visible, but disabled navigation in publish mode except to settings */}
                  <Step
                    id="add-settings"
                    key="add-settings"
                    onClick={() => {
                      // In publish mode, allow navigation to settings step directly
                      if (isPublishMode) {
                        if (serviceId > 0) {
                          setActiveStep(steps.length);
                        }
                        return;
                      }

                      // Normal mode - only allow settings after all default units are completed
                      if (!isDefaultUnitsStepsCompleted()) {
                        showDefaultUnitsWarning();
                        return;
                      }
                      if (serviceId > 0) {
                        // Check if ready to navigate to settings
                        if (canNavigateToSettings()) {
                          setActiveStep(steps.length);
                        } else {
                          Swal.fire({
                            icon: "warning",
                            title: intl.formatMessage({
                              id: "STEPPER.COMPLETE.CURRENT.STEP",
                            }),
                            text: intl.formatMessage({
                              id: "STEPPER.SAVE.BEFORE.PROCEED",
                            }),
                          });
                        }
                      }
                    }}
                    aria-disabled={
                      serviceId === 0 ||
                      (!isPublishMode && !isDefaultUnitsStepsCompleted())
                    }
                    tabIndex={
                      serviceId === 0 ||
                        (!isPublishMode && !isDefaultUnitsStepsCompleted())
                        ? -1
                        : 0
                    }
                    sx={{
                      "& .MuiStepLabel-root": {
                        padding: "0 1rem",
                      },
                      ".MuiStepLabel-label": {
                        fontFamily: "FrutigerLTArabic-Bold_2",
                        textAlign: "center",
                      },
                      ".MuiStepLabel-label:not(.Mui-error)": {},
                      ".MuiStepIcon-root.Mui-completed, .MuiStepIcon-root.Mui-active":
                      {
                        border: "none",
                      },
                      cursor:
                        serviceId === 0 ||
                          (!isPublishMode && !isDefaultUnitsStepsCompleted())
                          ? "not-allowed"
                          : "pointer",
                      "& .MuiStepConnector-root":
                        lang === "ar"
                          ? {
                            right: "calc(-50% + 20px)",
                            left: "calc(50% + 20px)",
                          }
                          : {},
                    }}
                  >
                    <StepLabel
                      StepIconComponent={(props) => (
                        <SettingsIcon
                          className="stepper-new"
                          style={{ fontSize: 30, color: "#dfcfb6" }}
                        />
                      )}
                      aria-label="Settings Step"
                      sx={{
                        cursor:
                          serviceId === 0 ||
                            (!isPublishMode && !isDefaultUnitsStepsCompleted())
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <span
                        style={
                          serviceId === 0 ||
                            (!isPublishMode && !isDefaultUnitsStepsCompleted())
                            ? { color: "#aaa" }
                            : {}
                        }
                      >
                        {intl.formatMessage({ id: "LABEL.STEPPER.SETTING" })}
                      </span>
                    </StepLabel>
                  </Step>
                </Stepper>

                <Box mt={4}>
                  {isSettingsStep ? (
                    renderSettingsStep()
                  ) : StepContent ? (
                    <React.Fragment key={activeStep}>
                      {StepContent(formRef)}{" "}
                    </React.Fragment>
                  ) : null}
                </Box>

                <Box mt={2}>
                  <div
                    className="stepper-bottom-btns-container"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: "16px",
                      width: "100%",
                      marginTop: "2rem",
                    }}
                  >
                    {/* Cancel Button */}
                    {
                      <button
                        type="button"
                        id="kt_modal_new_target_cancel"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={() =>
                          navigate("/admin-dashboard", {
                            state: { currentTabView: currentTabView },
                          })
                        }
                      // disabled={isPublishMode}
                      >
                        {!readOnly && (
                          <BtnLabelCanceltxtMedium2
                            customClassName="MOD_btn2_Label"
                            isI18nKey={true}
                            text={"BUTTON.LABEL.CANCEL"}
                          />
                        )}
                        {readOnly && (
                          <BtnLabelCanceltxtMedium2
                            customClassName="MOD_btn2_Label"
                            isI18nKey={true}
                            text={"BUTTON.LABEL.CLOSE"}
                          />
                        )}
                      </button>
                    }

                    {/* Save as Draft Button */}
                    {!readOnly && !isSettingsStep && (
                      <button
                        type="button"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={async () => {
                          if (formRef.current?.saveAsDraft) {
                            try {
                              if (
                                formRef.current?.validate &&
                                typeof formRef.current.validate === "function"
                              ) {
                                const isValid = formRef.current.validate();
                                if (!isValid) {
                                  return;
                                }
                              }
                              const saveResult =
                                await formRef.current.saveAsDraft();
                              if (saveResult) {
                                // setTimeout(() => {
                                //   navigate("/admin-dashboard", {
                                //     state: {
                                //       currentTabView:
                                //         statusId == ServiceStatus.Inactive ||
                                //           statusId == ServiceStatus.Active
                                //           ? "submitted-view"
                                //           : currentTabView,
                                //     },
                                //   });
                                // }, 500);
                              }
                            } catch (error) {
                              console.error("Save as draft failed:", error);
                            }
                          } else {
                            navigate("/admin-dashboard", {
                              state: { currentTabView: "draft-view" },
                            });
                          }
                        }}
                        aria-label="Save"
                        disabled={isPublishMode}
                      >
                        <BtnLabeltxtMedium2
                          customClassName="MOD_btn2_Label"
                          isI18nKey={true}
                          text={"BUTTON.LABEL.SAVE"}
                        />
                      </button>
                    )}

                    {/* Preview Button */}
                    {!readOnly &&
                      !isSettingsStep &&
                      steps[activeStep] &&
                      typeof steps[activeStep].entityId === "number" &&
                      steps[activeStep].entityId > 0 && (
                        <button
                          type="button"
                          className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                          style={{ minWidth: 120 }}
                          onClick={() => {
                            if (
                              formRef.current &&
                              typeof formRef.current.togglePreviewMode ===
                              "function"
                            ) {
                              formRef.current.togglePreviewMode();
                            }
                          }}
                          aria-label="Preview"
                          disabled={isPublishMode}
                        >
                          <BtnLabeltxtMedium2
                            customClassName="MOD_btn2_Label"
                            isI18nKey={true}
                            text={"BUTTON.LABEL.PREVIEW"}
                          />
                        </button>
                      )}

                    {/* Settings Step: Save & Publish/Unpublish */}
                    {(!readOnly || isPublishMode) && isSettingsStep && (
                      <>
                        <button
                          id="save-button"
                          type="button"
                          aria-label="Save Settings"
                          className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                          style={{ minWidth: 120 }}
                          disabled={isPublishMode}
                          onClick={async () => {
                            if (settingsStepRef.current?.submit()) {
                              try {
                                // setTimeout(() => {
                                //   navigate("/admin-dashboard", {
                                //     state: {
                                //       currentTabView:
                                //         statusId == ServiceStatus.Inactive ||
                                //           statusId == ServiceStatus.Active
                                //           ? "submitted-view"
                                //           : currentTabView,
                                //     },
                                //   });
                                // }, 500);
                              } catch (ex) {
                                // Optionally handle error
                              }
                            }
                          }}
                        >
                          <BtnLabeltxtMedium2
                            customClassName="MOD_btn2_Label"
                            isI18nKey={true}
                            text={"BUTTON.LABEL.SAVE"}
                          />
                        </button>
                        <button
                          id="publish-button"
                          type="button"
                          className="btn MOD_btn btn-create stepper-bottom-btn"
                          style={{ minWidth: 120 }}
                          onClick={async () => {
                            if (
                              statusId === ServiceStatus.Draft ||
                              statusId === ServiceStatus.Inactive
                            ) {
                              if (settingsStepRef.current?.submit) {
                                try {
                                  const isValid = await settingsStepRef.current.submit();
                                  if (isValid) {
                                    setShowConfirm(true);
                                    //updateServiceFormStatus(ServiceStatus.Active);
                                  } else {
                                    return;
                                  }
                                } catch (ex) { }
                              } else {
                                setShowConfirm(true);
                                //updateServiceFormStatus(ServiceStatus.Active);
                              }
                            } else if (statusId === ServiceStatus.Active) {
                              setShowConfirm(true);
                              //updateServiceFormStatus(ServiceStatus.Inactive);
                            } else if (statusId === ServiceStatus.Inactive) {
                              setShowConfirm(true);
                              //updateServiceFormStatus(ServiceStatus.Active);
                            }
                          }}
                          aria-label={
                            statusId === ServiceStatus.Active
                              ? intl.formatMessage({ id: "LABEL.UNPUBLISH" })
                              : intl.formatMessage({ id: "LABEL.PUBLISH" })
                          }
                        >
                          <BtnLabeltxtMedium2
                            text={
                              statusId === ServiceStatus.Active
                                ? intl.formatMessage({ id: "LABEL.UNPUBLISH" })
                                : intl.formatMessage({ id: "LABEL.PUBLISH" })
                            }
                          />
                        </button>
                      </>
                    )}

                    {/* Back Button */}
                    {!readOnly && activeStep !== 0 && (
                      <button
                        type="button"
                        id="kt_modal_new_target_submit"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={() => {
                          if (isSettingsStep) {
                            setActiveStep(steps.length - 1);
                          } else {
                            setActiveStep((prev) => Math.max(prev - 1, 0));
                          }
                        }}
                        disabled={activeStep === 0 || isPublishMode}
                      >
                        <BtnLabeltxtMedium2
                          customClassName="MOD_btn2_Label"
                          isI18nKey={true}
                          text={"BUTTON.LABEL.BACK"}
                        />
                        <ArrowForwardIosIcon
                          style={{ marginLeft: "4px", fontSize: "18px" }}
                        ></ArrowForwardIosIcon>
                      </button>
                    )}

                    {/* Next Button */}
                    {!readOnly && !isSettingsStep && (
                      <button
                        type="button"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={async () => {
                          if (readOnly) {
                            setActiveStep((prev) =>
                              Math.min(prev + 1, steps.length - 1)
                            );
                            return;
                          }
                          if (formRef.current) {
                            // Validate if available
                            if (
                              typeof formRef.current.validate === "function"
                            ) {
                              const isValid = await formRef.current.validate();
                              if (!isValid) {
                                return;
                              }
                            }
                            // Submit if available
                            if (typeof formRef.current.submit === "function") {
                              const submitResult =
                                await formRef.current.submit();
                              if (submitResult === false) {
                                return;
                              }
                              if (serviceId > 0) {
                                goToNextStep();
                              }
                              return;
                            }
                          }

                          setActiveStep((prev) => {
                            const nextStep = Math.min(
                              prev + 1,
                              steps.length - 1
                            );
                            if (nextStep === steps.length - 1) {
                              return steps.length;
                            }
                            return nextStep;
                          });
                        }}
                        aria-label="Next"
                        disabled={isPublishMode}
                      >
                        <BtnLabeltxtMedium2
                          customClassName="MOD_btn2_Label"
                          isI18nKey={true}
                          text={"BUTTON.LABEL.NEXT"}
                        />
                        <ArrowBackIosIcon
                          style={{ marginLeft: "4px", fontSize: "18px" }}
                        ></ArrowBackIosIcon>
                      </button>
                    )}

                    {/* Readonly/Publish Mode Back Button */}
                    {(readOnly || isPublishMode) && activeStep !== 0 && (
                      <button
                        type="button"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={() => {
                          if (isSettingsStep) {
                            setActiveStep(steps.length - 1);
                          } else {
                            setActiveStep((prev) => Math.max(prev - 1, 0));
                          }
                        }}
                        aria-label="Back"
                      >
                        <BtnLabeltxtMedium2
                          customClassName="MOD_btn2_Label"
                          isI18nKey={true}
                          text={"BUTTON.LABEL.BACK"}
                        />
                        <ArrowForwardIosIcon
                          style={{ marginLeft: "4px", fontSize: "18px" }}
                        ></ArrowForwardIosIcon>
                      </button>
                    )}

                    {/* Readonly/Publish Mode Next Button */}
                    {(readOnly || isPublishMode) && (
                      <button
                        type="button"
                        className="btn MOD_btn2 btn-cancel stepper-bottom-btn"
                        style={{ minWidth: 120 }}
                        onClick={() => {
                          // Check if trying to navigate to settings step
                          if (activeStep === steps.length - 1) {
                            // Show warning when moving to settings step
                            if (!isDefaultUnitsStepsCompleted()) {
                              showDefaultUnitsWarning();
                              return;
                            }
                            setActiveStep(steps.length); // Go to settings
                          } else if (!isSettingsStep) {
                            // Navigate to next step
                            setActiveStep((prev) =>
                              Math.min(prev + 1, steps.length)
                            );
                          }
                        }}
                        disabled={isSettingsStep}
                        aria-label="Next"
                      >
                        <BtnLabeltxtMedium2
                          customClassName="MOD_btn2_Label"
                          isI18nKey={true}
                          text={"BUTTON.LABEL.NEXT"}
                        />
                        <ArrowBackIosIcon
                          style={{ marginLeft: "4px", fontSize: "18px" }}
                        ></ArrowBackIosIcon>
                      </button>
                    )}
                  </div>
                </Box>

                {/* Dialog for Adding Unit Steps */}
                <Dialog
                  open={openDialog && !isPublishMode}
                  onClose={() => setOpenDialog(false)}
                  aria-labelledby="add-unit-dialog-title"
                >
                  <DialogTitle id="add-unit-dialog-title">
                    {intl.formatMessage({ id: "LABEL.SELECTENTITYADD" })}
                  </DialogTitle>
                  <DialogContent>
                    <FormControl fullWidth margin="dense">
                      <InputLabel id="entity-type-label">
                        {intl.formatMessage({ id: "LABEL.ENTITYTYPE" })}
                      </InputLabel>
                      <Select
                        labelId="entity-type-label"
                        value={selectedUnitId}
                        onChange={(e) =>
                          setSelectedUnitId(e.target.value as number)
                        }
                        label="Entity Type"
                        inputProps={{ "aria-label": "Entity Type" }}
                        disabled={isPublishMode}
                      >
                        {availableEntityTypes.map((entity) => (
                          <MenuItem
                            key={entity.entityId}
                            value={entity.entityId}
                            aria-label={
                              lang === "ar"
                                ? entity.entityNameAr
                                : entity.entityNameEn
                            }
                          >
                            {lang === "ar"
                              ? entity.entityNameAr
                              : entity.entityNameEn}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {availableEntityTypes.length === 0 && (
                      <Box color="error.main" mt={2} fontSize={14}>
                        All units have been added.
                      </Box>
                    )}
                  </DialogContent>
                  <DialogActions>
                    {/* <Button
                      onClick={() => setOpenDialog(false)}
                      aria-label="Cancel Add Unit"
                      disabled={isPublishMode}
                    >
                      Cancel
                    </Button> */}
                    <button
                      type="button"
                      id="kt_modal_new_target_cancel"
                      className="btn MOD_btn btn-cancel stepper-bottom-btn"
                      style={{ minWidth: 120 }}
                      onClick={() => setOpenDialog(false)}
                    >
                      <BtnLabelCanceltxtMedium2
                        isI18nKey={true}
                        text={"BUTTON.LABEL.CANCEL"}
                      />
                    </button>

                    <button
                      type="button"
                      id="kt_modal_new_target_cancel"
                      className="btn MOD_btn btn-create btnSave"
                      onClick={handleAddUnit}
                      disabled={selectedUnitId === null || isPublishMode}
                      aria-label="Add Unit"
                    >
                      {intl.formatMessage({ id: "BUTTON.LABEL.ADDUNIT" })}
                    </button>
                  </DialogActions>
                </Dialog>
              </Box>
            </div>
          </div>
          <Modal
            className="modal-sticky modal-sticky-lg modal-sticky-bottom-right"
            centered
            backdrop="static"
            keyboard={false}
            show={showConfirm}
            size={"sm"}
            onHide={() => setShowConfirm(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <HeaderLabels text={""} />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ConfirmDialogModal
                setShow={setShowConfirm}
                onConfirm={handlePublishToggle}
                labelMessage={(statusId === ServiceStatus.Inactive || statusId === ServiceStatus.Draft) ? "LABEL.PUBLISHCONFIRMATION" : "LABEL.UNPUBLISHCONFIRMATION"}
              ></ConfirmDialogModal>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default StepperComponent;
